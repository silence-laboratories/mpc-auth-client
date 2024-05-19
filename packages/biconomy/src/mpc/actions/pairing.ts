// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import * as utils from "../utils";
import {
    getTokenEndpoint,
    refreshTokenEndpoint,
    sendMessage,
} from "../transport/firebaseApi";
import _sodium from "libsodium-wrappers-sumo";
import { DistributedKey, PairingData, PairingSessionData } from "../types";
import { MpcError, MpcErrorCode } from "../error";
import { aeadDecrypt } from "../crypto";

export enum PairingRemark {
    WALLET_MISMATCH = "WALLET_MISMATCH",
    NO_BACKUP_DATA_WHILE_REPAIRING = "NO_BACKUP_DATA_WHILE_REPAIRING",
    INVALID_BACKUP_DATA = "INVALID_BACKUP_DATA",
}

export interface PairingDataInit {
    pairingId: string;
    encPair: _sodium.KeyPair;
    signPair: _sodium.KeyPair;
}

let pairingDataInit: PairingDataInit;

export const init = async (walletId: string) => {
    try {
        let pairingId = await utils.randomPairingId();

        await _sodium.ready;
        const encPair = _sodium.crypto_box_keypair();
        const signPair = _sodium.crypto_sign_keypair();

        pairingDataInit = {
            pairingId,
            encPair,
            signPair,
        };

        let qrCode = JSON.stringify({
            walletId,
            pairingId,
            webEncPublicKey: _sodium.to_hex(encPair.publicKey),
            signPublicKey: _sodium.to_hex(signPair.publicKey),
        });

        return qrCode;
    } catch (error) {
        if (error instanceof Error) {
            throw new MpcError(error.message, MpcErrorCode.UnknownError);
        } else throw new MpcError("unkown-error", MpcErrorCode.UnknownError);
    }
};

const sendPairingFirebaseDoc = async (
    token: string,
    pairingId: string,
    pairingObject:
        | { isPaired: boolean }
        | {
              isPaired: boolean;
              pairingRemark: string;
          }
) => {
    await sendMessage(token, "pairing", pairingObject, false, pairingId);
};

const decryptAndDeserializeBackupData = async (
    token: string,
    backupData: string,
    password: string
): Promise<{ distributedKey: DistributedKey; accountAddress: string }> => {
    try {
        const decreptedMessage = await aeadDecrypt(backupData, password);
        const distributedKey = JSON.parse(
            utils.uint8ArrayToUtf8String(decreptedMessage)
        );
        let accountAddress = utils.getAddressFromDistributedKey(distributedKey);
        return {
            distributedKey,
            accountAddress,
        };
    } catch (error) {
        await sendPairingFirebaseDoc(token, pairingDataInit.pairingId, {
            isPaired: false,
            pairingRemark: PairingRemark.INVALID_BACKUP_DATA,
        });
        if (error instanceof MpcError) {
            throw error;
        } else if (error instanceof Error) {
            throw new MpcError(error.message, MpcErrorCode.InvalidBackupData);
        } else
            throw new MpcError(
                "wrong secret key for the given ciphertext",
                MpcErrorCode.InvalidBackupData
            );
    }
};

const validatePairingAccount = async (
    sessionToken: string,
    accountAddress?: string,
    currentAccountAddress?: string
) => {
    if (currentAccountAddress && accountAddress == null) {
        await sendPairingFirebaseDoc(sessionToken, pairingDataInit.pairingId, {
            isPaired: false,
            pairingRemark: PairingRemark.NO_BACKUP_DATA_WHILE_REPAIRING,
        });
    } else if (
        currentAccountAddress &&
        accountAddress &&
        currentAccountAddress !== accountAddress
    ) {
        await sendPairingFirebaseDoc(sessionToken, pairingDataInit.pairingId, {
            isPaired: true,
            pairingRemark: PairingRemark.WALLET_MISMATCH,
        });
    } else
        await sendPairingFirebaseDoc(sessionToken, pairingDataInit.pairingId, {
            isPaired: true,
        });
};

export const startPairingSession = async () => {
    try {
        if (!pairingDataInit) {
            throw new MpcError(
                "Pairing data not initialized",
                MpcErrorCode.PairingNotInitialized
            );
        }

        const pairingId = pairingDataInit.pairingId;
        const signature = _sodium.crypto_sign_detached(
            pairingId,
            pairingDataInit.signPair.privateKey
        );

        const pairingSessionData = await getTokenEndpoint(
            pairingId,
            _sodium.to_hex(signature)
        );
        return pairingSessionData;
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else throw new MpcError("unkown-error", MpcErrorCode.UnknownError);
    }
};

export const endPairingSession = async (
    pairingSessionData: PairingSessionData,
    currentAccountAddress?: string,
    password?: string
) => {
    try {
        const startTime = Date.now();
        const sessionToken = pairingSessionData.token;

        let distributedKey: DistributedKey | undefined;
        let accountAddress: string | undefined;
        if (pairingSessionData.backupData && password) {
            try {
                const backupDataJson = await decryptAndDeserializeBackupData(
                    sessionToken,
                    pairingSessionData.backupData,
                    password
                );
                distributedKey = backupDataJson.distributedKey;
                accountAddress = backupDataJson.accountAddress;
            } catch (error) {
                throw error;
            }
        }

        await validatePairingAccount(
            sessionToken,
            accountAddress,
            currentAccountAddress
        );

        const pairingData: PairingData = {
            pairingId: pairingDataInit.pairingId,
            webEncPublicKey: _sodium.to_hex(pairingDataInit.encPair.publicKey),
            webEncPrivateKey: _sodium.to_hex(
                pairingDataInit.encPair.privateKey
            ),
            webSignPublicKey: _sodium.to_hex(
                pairingDataInit.signPair.publicKey
            ),
            webSignPrivateKey: _sodium.to_hex(
                pairingDataInit.signPair.privateKey
            ),
            appPublicKey: pairingSessionData.appPublicKey,
            token: sessionToken,
            tokenExpiration: pairingSessionData.tokenExpiration,
            deviceName: pairingSessionData.deviceName,
        };
        return {
            newPairingState: {
                pairingData,
                distributedKey: distributedKey ?? null,
            },
            elapsedTime: Date.now() - startTime,
            deviceName: pairingSessionData.deviceName,
        };
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else throw new MpcError("unkown-error", MpcErrorCode.UnknownError);
    }
};

export const refreshToken = async (pairingData: PairingData) => {
    try {
        let startTime = Date.now();
        let signature: Uint8Array;
        signature = _sodium.crypto_sign_detached(
            pairingData.token,
            _sodium.from_hex(pairingData.webSignPrivateKey)
        );

        const data = await refreshTokenEndpoint(
            pairingData.token,
            _sodium.to_hex(signature)
        );
        const newPairingData: PairingData = {
            ...pairingData,
            ...data,
        };
        return {
            newPairingData: newPairingData,
            elapsedTime: Date.now() - startTime,
        };
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else throw new MpcError(`unkown-error`, MpcErrorCode.UnknownError);
    }
};
