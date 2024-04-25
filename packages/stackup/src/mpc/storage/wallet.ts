// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import { SnapError, SnapErrorCode } from "../error";
import { StorageData, pairingStatusType } from "../types";
import { clearAccount } from "./account";

const getWalletId = (): string => {
    let walletId = localStorage.getItem("walletId");
    if (walletId === null) {
        throw new SnapError(
            "Wallet id is not found",
            SnapErrorCode.UnknownError
        );
    }
    return walletId;
};

/**
 * Function to check if a storage exist
 *
 * @returns true if exists, false otherwise
 */
const isStorageExist = (): boolean => {
    let walletId = getWalletId();
    let data = localStorage.getItem(walletId);
    return data !== null;
};

/**
 * Delete the stored data, if it exists.
 */
const clearWallet = () => {
    let walletId = getWalletId();
    localStorage.removeItem(walletId);
    setPairingStatus("Unpaired");
    clearAccount();
};

/**
 * Save SilentShareStorage
 *
 * @param data obj to save
 */
const saveSilentShareStorage = (data: StorageData) => {
    if (data == null) {
        throw new SnapError(
            "Storage data cannot be null",
            SnapErrorCode.InvalidStorageData
        );
    }
    let walletId = getWalletId();
    localStorage.setItem(walletId, JSON.stringify(data));
};

/**
 * Retrieve SilentShareStorage
 *
 * @returns SilentShareStorage object
 */
const getSilentShareStorage = (): StorageData => {
    let walletId = getWalletId();
    const _isStorageExist = isStorageExist();
    if (!_isStorageExist) {
        throw new SnapError("Wallet is not paired", SnapErrorCode.NotPaired);
    }

    let state = localStorage.getItem(walletId);

    if (!state) {
        throw new SnapError(
            "Wallet failed to fetch state",
            SnapErrorCode.UnknownError
        );
    }

    const jsonObject: StorageData = JSON.parse(state as string);

    return jsonObject;
};

function setPairingStatus(status: pairingStatusType) {
    localStorage.setItem("pairingStatus", status);
}

function getPairingStatus(): pairingStatusType {
    return localStorage.getItem("pairingStatus") as pairingStatusType;
}

export {
    isStorageExist,
    clearWallet,
    saveSilentShareStorage,
    getSilentShareStorage,
    setPairingStatus,
    getPairingStatus,
};
