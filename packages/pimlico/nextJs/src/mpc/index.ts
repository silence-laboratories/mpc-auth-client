// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import { clearWallet, getWalletId } from "./storage/wallet";
import * as PairingAction from "./actions/pairing";
import * as KeyGenAction from "./actions/keygen";
import * as SignAction from "./actions/sign";
import * as Backup from "./actions/backup";
import { aeadEncrypt, requestEntropy } from "./crypto";
import { fromHexStringToBytes, getAddressFromDistributedKey } from "./utils";
import {
    setSilentShareStorage,
    getSilentShareStorage,
} from "./storage/wallet";
import { PairingSessionData, SignMetadata, StorageData } from "./types";
import { MpcError, MpcErrorCode } from "./error";
import { IP1KeyShare } from "@silencelaboratories/ecdsa-tss";

const TOKEN_LIFE_TIME = 60000;

async function isPaired() {
    try {
        let silentShareStorage = getSilentShareStorage();
        const deviceName = silentShareStorage.pairingData.deviceName;
        return {
            isPaired: true,
            deviceName,
            // Avoid chaning this, have some legacy reference
            isAccountExist:
                silentShareStorage.pairingData.pairingId ===
                    silentShareStorage.newPairingState?.pairingData
                        ?.pairingId &&
                silentShareStorage.newPairingState?.distributedKey,
        };
    } catch {
        return {
            isPaired: false,
            deviceName: null,
        };
    }
}

async function initPairing(walletId: string) {
    let qrCode = await PairingAction.init(walletId);
    return qrCode;
}

async function runStartPairingSession() {
    return await PairingAction.startPairingSession();
}

async function runEndPairingSession(
    pairingSessionData: PairingSessionData,
    currentAccountAddress?: string,
    password?: string,
) {
    const result = await PairingAction.endPairingSession(
        pairingSessionData,
        currentAccountAddress,
        password
    );
    setSilentShareStorage({
        newPairingState: result.newPairingState,
        pairingData: result.newPairingState.pairingData,
    });
    const distributedKey = result.newPairingState.distributedKey;
    return {
        pairingStatus: "paired",
        newAccountAddress: distributedKey
            ? getAddressFromDistributedKey(distributedKey)
            : null,
        deviceName: result.deviceName,
        elapsedTime: result.elapsedTime,
    };
}

async function refreshPairing() {
    let silentShareStorage: StorageData = getSilentShareStorage();
    let pairingData = silentShareStorage.pairingData;
    let result = await PairingAction.refreshToken(pairingData);
    setSilentShareStorage({
        ...silentShareStorage,
        pairingData: result.newPairingData,
    });
    return result.newPairingData;
}

async function getPairingDataAndStorage() {
    let silentShareStorage: StorageData = getSilentShareStorage();
    let pairingData = silentShareStorage.pairingData;
    if (pairingData.tokenExpiration < Date.now() - TOKEN_LIFE_TIME) {
        pairingData = await refreshPairing();
    }
    return { pairingData, silentShareStorage };
}

async function runKeygen() {
    let { pairingData, silentShareStorage } = await getPairingDataAndStorage();
    let x1 = fromHexStringToBytes(await requestEntropy());
    let accountId = 1;
    let result = await KeyGenAction.keygen(pairingData, accountId, x1);
    setSilentShareStorage({
        ...silentShareStorage,
        newPairingState: {
            pairingData: null,
            distributedKey: {
                publicKey: result.publicKey,
                accountId,
                keyShareData: result.keyShareData,
            },
        },
    });
    return {
        distributedKey: {
            publicKey: result.publicKey,
            accountId: accountId,
            keyShareData: result.keyShareData,
        },
        elapsedTime: result.elapsedTime,
    };
}

async function runBackup(password: string) {
    let { pairingData, silentShareStorage } = await getPairingDataAndStorage();
    if (password.length === 0) {
        await Backup.backup(pairingData, "", "");
        return;
    }

    if (
        password &&
        password.length >= 8 &&
        silentShareStorage.newPairingState?.distributedKey
    ) {
        try {
            const encryptedMessage = await aeadEncrypt(
                JSON.stringify(
                    silentShareStorage.newPairingState?.distributedKey
                ),
                password
            );
            await Backup.backup(
                pairingData,
                encryptedMessage,
                getAddressFromDistributedKey(
                    silentShareStorage.newPairingState?.distributedKey
                )
            );
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            } else
                throw new MpcError("unkown-error", MpcErrorCode.UnknownError);
        }
    }
}

async function runSign(
    hashAlg: string,
    message: string,
    messageHashHex: string,
    signMetadata: SignMetadata,
    accountId: number,
    keyShare: IP1KeyShare
) {
    if (messageHashHex.startsWith("0x")) {
        messageHashHex = messageHashHex.slice(2);
    }
    if (message.startsWith("0x")) {
        message = message.slice(2);
    }
    let { pairingData } = await getPairingDataAndStorage();
    let messageHash = fromHexStringToBytes(messageHashHex);
    if (messageHash.length !== 32) {
        throw new MpcError(
            "Invalid length of messageHash, should be 32 bytes",
            MpcErrorCode.InvalidMessageHashLength
        );
    }

    const walletId = getWalletId();

    return await SignAction.sign({
        pairingData,
        keyShare,
        hashAlg,
        message,
        messageHash,
        signMetadata,
        accountId,
        walletId,
    });
}

async function signOut() {
    clearWallet();
}

export {
    initPairing,
    runStartPairingSession,
    runEndPairingSession,
    runKeygen,
    runSign,
    runBackup,
    signOut,
    isPaired,
    refreshPairing,
};
