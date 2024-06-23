// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import { WALLET_STATUS } from "@/constants";
import { MpcError, MpcErrorCode } from "../error";
import { DeviceOS, StorageData } from "../types";
import { clearAccount } from "./account";

const getWalletId = (): string => {
    let walletId = localStorage.getItem("walletId");
    if (walletId === null) {
        throw new MpcError(
            "Wallet id is not found",
            MpcErrorCode.UnknownError
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
    setWalletStatus(WALLET_STATUS.Unpaired);
    clearAccount();
};

/**
 * Save SilentShareStorage
 *
 * @param data obj to save
 */
const setSilentShareStorage = (data: StorageData) => {
    if (data == null) {
        throw new MpcError(
            "Storage data cannot be null",
            MpcErrorCode.InvalidStorageData
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
        throw new MpcError("Wallet is not paired", MpcErrorCode.NotPaired);
    }

    let state = localStorage.getItem(walletId);

    if (!state) {
        throw new MpcError(
            "Wallet failed to fetch state",
            MpcErrorCode.UnknownError
        );
    }

    const jsonObject: StorageData = JSON.parse(state as string);

    return jsonObject;
};

function setWalletStatus(status: WALLET_STATUS) {
    localStorage.setItem("pairingStatus", status);
}

function getWalletStatus(): WALLET_STATUS {
    return (localStorage.getItem("pairingStatus") ?? "Unpaired") as WALLET_STATUS;
}

function setDeviceOS(deviceName: string) {
    const deviceOS = deviceName
          .split(':')[1]
          .split(',')[0]
          .trim() as DeviceOS;
    localStorage.setItem("deviceOS", deviceOS);
}

function getDeviceOS(): DeviceOS {
    return (localStorage.getItem("deviceOS") ?? "ios") as DeviceOS;
}

export {
    isStorageExist,
    clearWallet,
    setSilentShareStorage,
    getSilentShareStorage,
    setWalletStatus,
    getWalletStatus,
    getWalletId,
    setDeviceOS,
    getDeviceOS,
};
