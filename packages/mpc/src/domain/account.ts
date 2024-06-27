import { IStorage } from "../storage/types";
import { AccountData, DeviceOS } from "../types";

export class AccountManager {
  private storage: IStorage;

  constructor(storage: IStorage) {
    this.storage = storage;
  }

  getEoa(): string | null {
    const storageData = this.storage.getStorageData();
    return storageData.eoa;
  }

  setSmartContractAccount(walletAccount: AccountData) {
    if (!walletAccount.address) return;
    const storageData = this.storage.getStorageData();
    storageData.walletAccount = walletAccount;
    this.storage.setStorageData(storageData);
  }

  getSmartContractAccount(): AccountData | null {
    const storageData = this.storage.getStorageData();
    return storageData.walletAccount ?? null;
  }

  isPasswordReady() {
    return this.storage.getStorageData().passwordReady ?? false;
  }

  setPasswordReady(isPasswordReady = true) {
    const storageData = this.storage.getStorageData();
    storageData.passwordReady = isPasswordReady;
    this.storage.setStorageData(storageData);
  }

  getDeviceOS(): DeviceOS {
    const storageData = this.storage.getStorageData();
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
