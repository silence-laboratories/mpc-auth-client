// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import { SnapError, SnapErrorCode } from "./error";
import { StorageData } from "./types";

const getWalletName = (): string => {
    let name = localStorage.getItem("walletName");
    if (name === null) {
        throw new SnapError(
            "Wallet name is not set",
            SnapErrorCode.UnknownError
        );
    }
    return name;
};

/**
 * Function to check if a storage exist
 *
 * @returns true if exists, false otherwise
 */
const isStorageExist = (): boolean => {
    let walletName = getWalletName();
    let data = localStorage.getItem(walletName);
    return data !== null;
};

/**
 * Delete the stored data, if it exists.
 */
const deleteStorage = () => {
    let walletName = getWalletName();
    localStorage.removeItem(walletName);
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
    let walletName = getWalletName();
    localStorage.setItem(walletName, JSON.stringify(data));
};

/**
 * Retrieve SilentShareStorage
 *
 * @returns SilentShareStorage object
 */
const getSilentShareStorage = (): StorageData => {
    let walletName = getWalletName();
    const _isStorageExist = isStorageExist();
    if (!_isStorageExist) {
        throw new SnapError("Wallet is not paired", SnapErrorCode.NotPaired);
    }

    let state = localStorage.getItem(walletName);

    if (!state) {
        throw new SnapError(
            "Wallet failed to fetch state",
            SnapErrorCode.UnknownError
        );
    }

    const jsonObject: StorageData = JSON.parse(state as string);

    return jsonObject;
};

export {
    isStorageExist,
    deleteStorage,
    saveSilentShareStorage,
    getSilentShareStorage,
};
