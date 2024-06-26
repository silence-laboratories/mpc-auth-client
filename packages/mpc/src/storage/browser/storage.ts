// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import { MpcError, MpcErrorCode } from "../../error";
import { DeviceOS, StorageData } from "../../types";
import { IStorage } from "../types";

export class LocalStorageManager implements IStorage {
  constructor(walletId: string) {
    localStorage.setItem("walletId", walletId);
  }

  /**
   * Get wallet id from local storage
   * 
   * @returns walletId
   */
  getWalletId(): string {
    let walletId = localStorage.getItem("walletId");
    if (walletId === null) {
      throw new MpcError("Wallet id is not found", MpcErrorCode.UnknownError);
    }
    return walletId;
  }

  /**
   * Check if a storage exist for the wallet
   *
   * @returns true if exists, false otherwise
   */
  isStorageExist = (): boolean => {
    let walletId = this.getWalletId();
    let data = localStorage.getItem(walletId);
    return data !== null;
  };

  /**
   * Delete the stored data, if it exists.
   */
  clearStorageData = () => {
    let walletId = this.getWalletId();
    localStorage.removeItem(walletId);
  };

  /**
   * Save SilentShareStorage
   *
   * @param data obj to save
   */
  setStorageData = (data: StorageData) => {
    if (data == null) {
      throw new MpcError(
        "Storage data cannot be null",
        MpcErrorCode.InvalidStorageData
      );
    }
    let walletId = this.getWalletId();
    localStorage.setItem(walletId, JSON.stringify(data));
  };

  /**
   * Retrieve SilentShareStorage
   *
   * @returns SilentShareStorage object
   */
  getStorageData = (): StorageData => {
    let walletId = this.getWalletId();
    const _isStorageExist = this.isStorageExist();
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

  /**
   * Set device name
   *
   * @param deviceName
   */
  setDeviceOS = (deviceName: string) => {
    const deviceOS = deviceName.split(":")[1].split(",")[0].trim() as DeviceOS;
    localStorage.setItem("deviceOS", deviceOS);
  };

  /**
   * Get device name
   *
   * @returns device name
   */
  getDeviceOS(): DeviceOS {
    return (localStorage.getItem("deviceOS") ?? "ios") as DeviceOS;
  }
}
