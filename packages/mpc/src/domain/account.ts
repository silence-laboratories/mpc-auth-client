// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import { BaseError, BaseErrorCode } from "../error";
import type { AccountData, IStorage } from "../storage/types";
import type { DeviceOS } from "../types";

/**
 * Manages account-related operations, interfacing with a storage mechanism to persist and retrieve account data.
 */
export class AccountManager {
  #storage: IStorage;

  /**
   * Creates an instance of AccountManager.
   * @param {IStorage} storage - The storage mechanism for persisting account data.
   */
  constructor(storage: IStorage) {
    this.#storage = storage;
  }

  /**
   * Gets the account address from storage.
   * @returns {string | null} The EOA string if available, otherwise null.
   */
  async getEoa(): Promise<string | null> {
    const storageData = await this.#storage.getStorageData();
    return storageData.eoa;
  }

  /**
   * Sets the smart contract account information in storage.
   * @param {AccountData} walletAccount - The account data to be stored.
   */
  async setSmartContractAccount(walletAccount: AccountData) {
    if (walletAccount && !walletAccount.address) return;
    const storageData = await this.#storage.getStorageData();
    storageData.walletAccount = walletAccount;
    this.#storage.setStorageData(storageData);
  }

  /**
   * Retrieves the smart contract account information from storage.
   * @returns {AccountData | null} The account data if available, otherwise null.
   */
  async getSmartContractAccount(): Promise<AccountData | null> {
    const storageData = await this.#storage.getStorageData();
    return storageData.walletAccount ?? null;
  }

  /**
   * Checks if the password setup is complete.
   * @returns {boolean} True if the password is set, false otherwise.
   */
  async isPasswordReady(): Promise<boolean> {
    return (await this.#storage.getStorageData()).passwordReady ?? false;
  }

  /**
   * Marks the password setup as complete or incomplete in storage.
   * @param {boolean} [isPasswordReady=true] - Indicates whether the password setup is complete.
   */
  async setPasswordReady(isPasswordReady = true) {
    const storageData = await this.#storage.getStorageData();
    storageData.passwordReady = isPasswordReady;
    this.#storage.setStorageData(storageData);
  }

  /**
   * Determines the operating system of the device which is paired with this party.
   * @returns {DeviceOS} The operating system of the device.
   */
  async getPairedDeviceOS(): Promise<DeviceOS> {
    const storageData = await this.#storage.getStorageData();
    if (!storageData.pairingData) {
      throw new BaseError(
        "Pairing data not found",
        BaseErrorCode.StorageFetchFailed
      );
    }
    const deviceName = storageData.pairingData.deviceName;
    try {
      const deviceOS = deviceName
        .split(":")[1]
        .split(",")[0]
        .trim() as DeviceOS;
      return deviceOS ?? "ios";
    } catch (error) {
      return "ios";
    }
  }
}
