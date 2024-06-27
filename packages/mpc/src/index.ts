// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import * as PairingAction from "./actions/pairing";
import * as KeyGenAction from "./actions/keygen";
import * as SignAction from "./actions/sign";
import * as Backup from "./actions/backup";
import { aeadEncrypt, requestEntropy } from "./crypto";
import { fromHexStringToBytes, getAddressFromDistributedKey } from "./utils";
import { IStorage } from "./storage/types";
import {
  PairingSessionData,
  SignMetadata,
  StorageData,
  StoragePlatform,
} from "./types";
import { MpcError, MpcErrorCode } from "./error";
import { IP1KeyShare } from "@silencelaboratories/ecdsa-tss";
import { LocalStorageManager } from "./storage/browser/storage";
import { AccountManager } from "./storage/browser/account";

export class MpcSdk {
  TOKEN_LIFE_TIME = 60000;
  private storage?: IStorage;
  private walletId: string = "";
  accountManager: AccountManager = new AccountManager();

  constructor(
    walletId: string,
    storagePlatform = StoragePlatform.Browser,
    customStorage?: IStorage
  ) {
    if (storagePlatform === StoragePlatform.Browser) {
      this.storage = new LocalStorageManager(walletId);
    } else {
      this.storage = customStorage;
    }
    this.walletId = walletId;
  }

  setDeviceOS = (deviceName: string) => {
    if (this.storage instanceof LocalStorageManager) {
      this.storage.setDeviceOS(deviceName);
    } else {
      throw new MpcError(
        "Invalid storage platform",
        MpcErrorCode.InvalidStoragePlatform
      );
    }
  };

  getDeviceOS = () => {
    if (this.storage instanceof LocalStorageManager) {
      return this.storage.getDeviceOS();
    } else {
      throw new MpcError(
        "Invalid storage platform",
        MpcErrorCode.InvalidStoragePlatform
      );
    }
  };

  getDistributionKey() {
    if (!this.storage)
      throw new MpcError(
        "Storage not initialized",
        MpcErrorCode.StorageNotInitialized
      );
    let silentShareStorage = this.storage.getStorageData();
    return silentShareStorage.newPairingState?.distributedKey;
  }

  async isPaired() {
    if (!this.storage)
      throw new MpcError(
        "Storage not initialized",
        MpcErrorCode.StorageNotInitialized
      );
    try {
      let silentShareStorage = this.storage.getStorageData();
      const deviceName = silentShareStorage.pairingData.deviceName;
      return {
        isPaired: true,
        deviceName,
        // Avoid chaning this, have some legacy reference
        isAccountExist:
          silentShareStorage.pairingData.pairingId ===
            silentShareStorage.newPairingState?.pairingData?.pairingId &&
          silentShareStorage.newPairingState?.distributedKey,
      };
    } catch {
      return {
        isPaired: false,
        deviceName: null,
      };
    }
  }

  async initPairing() {
    const walletId = this.getWalletId();
    let qrCode = await PairingAction.init(walletId);
    return qrCode;
  }

  async runStartPairingSession() {
    return await PairingAction.startPairingSession();
  }

  async runEndPairingSession(
    pairingSessionData: PairingSessionData,
    currentAccountAddress?: string,
    password?: string
  ) {
    if (!this.storage)
      throw new MpcError(
        "Storage not initialized",
        MpcErrorCode.StorageNotInitialized
      );
    const result = await PairingAction.endPairingSession(
      pairingSessionData,
      currentAccountAddress,
      password
    );
    const distributedKey = result.newPairingState.distributedKey;

    const eoa = distributedKey
      ? getAddressFromDistributedKey(distributedKey)
      : null;

    this.storage.setStorageData({
      newPairingState: result.newPairingState,
      pairingData: result.newPairingState.pairingData,
      eoa,
    });
    
    return {
      pairingStatus: "paired",
      newAccountAddress: eoa,
      deviceName: result.deviceName,
      elapsedTime: result.elapsedTime,
    };
  }

  async refreshPairing() {
    if (!this.storage)
      throw new MpcError(
        "Storage not initialized",
        MpcErrorCode.StorageNotInitialized
      );
    let silentShareStorage: StorageData = this.storage.getStorageData();
    let pairingData = silentShareStorage.pairingData;
    let result = await PairingAction.refreshToken(pairingData);
    this.storage.setStorageData({
      ...silentShareStorage,
      pairingData: result.newPairingData,
    });
    return result.newPairingData;
  }

  async getPairingDataAndStorage() {
    if (!this.storage)
      throw new MpcError(
        "Storage not initialized",
        MpcErrorCode.StorageNotInitialized
      );
    let silentShareStorage: StorageData = this.storage.getStorageData();
    let pairingData = silentShareStorage.pairingData;
    if (pairingData.tokenExpiration < Date.now() - this.TOKEN_LIFE_TIME) {
      pairingData = await this.refreshPairing();
    }
    return { pairingData, silentShareStorage };
  }

  async runKeygen() {
    if (!this.storage)
      throw new MpcError(
        "Storage not initialized",
        MpcErrorCode.StorageNotInitialized
      );
    let { pairingData, silentShareStorage } =
      await this.getPairingDataAndStorage();
    let x1 = fromHexStringToBytes(await requestEntropy());
    let accountId = 1;
    let result = await KeyGenAction.keygen(pairingData, accountId, x1);
    this.storage.setStorageData({
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

  async runBackup(password: string) {
    let { pairingData, silentShareStorage } =
      await this.getPairingDataAndStorage();
    if (password.length === 0) {
      await Backup.backup(pairingData, "", "", this.getWalletId());
      return;
    }

    if (
      password &&
      password.length >= 8 &&
      silentShareStorage.newPairingState?.distributedKey
    ) {
      try {
        const encryptedMessage = await aeadEncrypt(
          JSON.stringify(silentShareStorage.newPairingState?.distributedKey),
          password
        );
        await Backup.backup(
          pairingData,
          encryptedMessage,
          getAddressFromDistributedKey(
            silentShareStorage.newPairingState?.distributedKey
          ),
          this.getWalletId()
        );
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        } else throw new MpcError("unkown-error", MpcErrorCode.UnknownError);
      }
    }
  }

  async runSign(
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
    let { pairingData } = await this.getPairingDataAndStorage();
    let messageHash = fromHexStringToBytes(messageHashHex);
    if (messageHash.length !== 32) {
      throw new MpcError(
        "Invalid length of messageHash, should be 32 bytes",
        MpcErrorCode.InvalidMessageHashLength
      );
    }

    const walletId = this.getWalletId();

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

  async signOut() {
    if (!this.storage)
      throw new MpcError(
        "Storage not initialized",
        MpcErrorCode.StorageNotInitialized
      );
    this.storage.clearStorageData();
    this.accountManager.clearAccount();
  }

  private getWalletId(): string {
    if (this.storage instanceof LocalStorageManager) {
      return this.storage.getWalletId();
    } else {
      return this.walletId;
    }
  }
}
