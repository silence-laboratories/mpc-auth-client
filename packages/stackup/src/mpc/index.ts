import { startPairingSession } from "./actions/pairing";
// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import { deleteStorage } from "./storage";
import * as PairingAction from "./actions/pairing";
import * as KeyGenAction from "./actions/keygen";
import * as SignAction from "./actions/sign";
import * as Backup from "./actions/backup";
import { aeadEncrypt, requestEntropy } from "./crypto";
import { fromHexStringToBytes, getAddressFromDistributedKey } from "./utils";
import { saveSilentShareStorage, getSilentShareStorage } from "./storage";
import { PairingSessionData, SignMetadata, StorageData } from "./types";
import { SnapError, SnapErrorCode } from "./error";
import { IP1KeyShare } from "@silencelaboratories/ecdsa-tss";
import { getEoa } from "@/utils/store";

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

async function unpair() {
    deleteStorage();
}

async function initPairing(walletName: string) {
    let qrCode = await PairingAction.init(walletName);
    localStorage.setItem("walletName", walletName);
    return qrCode;
}

async function runStartPairingSession() {
    return await PairingAction.startPairingSession();
}

async function runEndPairingSession(
    pairingSessionData: PairingSessionData,
    password?: string
) {
    const result = await PairingAction.endPairingSession(
        pairingSessionData,
        undefined,
        password
    );
    saveSilentShareStorage({
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

async function runRePairing() {
    let silentShareStorage: StorageData = getSilentShareStorage();
    // const wallets = Object.values(silentShareStorage.wallets);
    // const currentAccount = wallets.length > 0 ? wallets[0] : null;
    // if (!currentAccount) {
    //     throw new SnapError("Not Paired", SnapErrorCode.NotPaired);
    // }
    // const currentAccountAddress = getAddressFromDistributedKey(
    //     currentAccount?.distributedKey
    // );

    const currentAccountAddress = getEoa().address;

    const pairingSessionData = await PairingAction.startPairingSession();
    const result = await PairingAction.endPairingSession(
        pairingSessionData,
        currentAccountAddress
    );

    const distributedKey = result.newPairingState.distributedKey;
    const newAccountAddress = distributedKey
        ? getAddressFromDistributedKey(distributedKey)
        : null;

    if (newAccountAddress === currentAccountAddress) {
        saveSilentShareStorage({
            ...silentShareStorage,
            pairingData: result.newPairingState.pairingData,
        });
    } else {
        saveSilentShareStorage({
            ...silentShareStorage,
            newPairingState: result.newPairingState,
        });
    }

    return {
        pairingStatus: "paired",
        currentAccountAddress: currentAccountAddress
            ? [currentAccountAddress]
            : [],
        newAccountAddress,
        deviceName: result.deviceName,
        elapsedTime: result.elapsedTime,
    };
}

async function refreshPairing() {
    let silentShareStorage: StorageData = getSilentShareStorage();
    let pairingData = silentShareStorage.pairingData;
    let result = await PairingAction.refreshToken(pairingData);
    saveSilentShareStorage({
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
    saveSilentShareStorage({
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

async function runBackup(password: string, isSkip: boolean) {
    let { pairingData, silentShareStorage } = await getPairingDataAndStorage();
    if (isSkip) {
        await Backup.backup(pairingData, "");
        return;
    }
    if (password && password.length >= 8) {
        try {
            const encryptedMessage = await aeadEncrypt(
                JSON.stringify(
                    silentShareStorage.newPairingState?.distributedKey
                ),
                password
            );
            await Backup.backup(pairingData, encryptedMessage);
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            } else
                throw new SnapError("unkown-error", SnapErrorCode.UnknownError);
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
        throw new SnapError(
            "Invalid length of messageHash, should be 32 bytes",
            SnapErrorCode.InvalidMessageHashLength
        );
    }

    return await SignAction.sign(
        pairingData,
        keyShare,
        hashAlg,
        message,
        messageHash,
        signMetadata,
        accountId
    );
}

export {
    initPairing,
    runStartPairingSession,
    runEndPairingSession,
    runKeygen,
    runSign,
    runBackup,
    unpair,
    isPaired,
    refreshPairing,
    runRePairing,
};
