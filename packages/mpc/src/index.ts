// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import { aeadEncrypt, requestEntropy } from "./crypto";
import { fromHexStringToBytes, getAddressFromPubkey } from "./utils";
import { IStorage } from "./storage/types";
import {
  Options,
  PairingSessionData,
  SignMetadata,
  StorageData,
  StoragePlatform,
} from "./types";
import { MpcError, MpcErrorCode } from "./error";
import { IP1KeyShare } from "@silencelaboratories/ecdsa-tss";
import { LocalStorageManager } from "./storage/localStorage";
import { AccountManager } from "./domain/account";
import * as signer from "./domain/signer";
import { PairingAction } from "./actions/pairing";
import { KeygenAction } from "./actions/keygen";
import { SignAction } from "./actions/sign";
import { BackupAction } from "./actions/backup";
import { HttpClient } from "./transport/firebaseApi";

export class MpcSdk {
  private TOKEN_LIFE_TIME = 60000;
  private storage?: IStorage;
  private walletId: string = "";
  private httpClient: HttpClient;
  private pairingAction: PairingAction;
  private keygenAction: KeygenAction;
  private signAction: SignAction;
  private backupAction: BackupAction;

  accountManager: AccountManager;

  constructor(configs: Options) {
    const {
      storagePlatform = StoragePlatform.Browser,
      customStorage,
      walletId,
      isDev,
    } = configs;

    if (storagePlatform === StoragePlatform.Browser) {
      this.storage = new LocalStorageManager(walletId);
    } else {
      this.storage = customStorage;
    }
    if (!this.storage) {
      throw new MpcError(
        "Storage not initialized",
        MpcErrorCode.StorageNotInitialized
      );
    }
    this.walletId = walletId;
    this.accountManager = new AccountManager(this.storage);
    this.httpClient = new HttpClient(
      isDev
        ? "https://us-central1-mobile-wallet-mm-snap-staging.cloudfunctions.net"
        : "https://us-central1-mobile-wallet-mm-snap.cloudfunctions.net"
    );
    this.pairingAction = new PairingAction(this.httpClient);
    this.keygenAction = new KeygenAction(this.httpClient);
    this.signAction = new SignAction(this.httpClient);
    this.backupAction = new BackupAction(this.httpClient);
  }

  getDeviceOS = () => {
    return this.accountManager.getDeviceOS();
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
    let qrCode = await this.pairingAction.init(walletId);
    return qrCode;
  }

  async runStartPairingSession() {
    return await this.pairingAction.startPairingSession();
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
    const result = await this.pairingAction.endPairingSession(
      pairingSessionData,
      currentAccountAddress,
      password
    );
    const distributedKey = result.newPairingState.distributedKey;

    const eoa = distributedKey
      ? getAddressFromPubkey(distributedKey.publicKey)
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
    let result = await this.pairingAction.refreshToken(pairingData);
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
    let result = await this.keygenAction.keygen(pairingData, accountId, x1);
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
      eoa: getAddressFromPubkey(result.publicKey),
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
      await this.backupAction.backup(pairingData, "", "", this.getWalletId());
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
        await this.backupAction.backup(
          pairingData,
          encryptedMessage,
          getAddressFromPubkey(
            silentShareStorage.newPairingState?.distributedKey.publicKey
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

    return await this.signAction.sign({
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
  }

  private getWalletId(): string {
    if (this.storage instanceof LocalStorageManager) {
      return this.storage.getWalletId();
    } else {
      return this.walletId;
    }
  }
}

export { signer };
