// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import { SignMetadata, StorageData } from "../types";
import * as PairingAction from "./actions/pairing";
import { getSilentShareStorage, saveSilentShareStorage } from "./storage";
import { fromHexStringToBytes } from "./utils";
import * as KeyGenAction from "./actions/keygen";
import { IP1KeyShare, randBytes } from "@silencelaboratories/ecdsa-tss";
import { SdkError, ErrorCode } from "../error";
import * as SignAction from "./actions/sign";
import { v4 as uuid } from "uuid";
import { backup } from "./actions/backup";
import config from "../../config.json";
var qrcode = require("qrcode-terminal");

async function initPairing() {
  let qrCode = await PairingAction.init("biconomy");
  qrcode.generate(
    qrCode,
    {
      small: true,
    },
    function (qrcode: any) {
      console.log(qrcode);
    }
  );
  return qrCode;
}
async function runPairing() {
  let result = await PairingAction.getToken();
  await saveSilentShareStorage(result.silentShareStorage);
  return {
    pairing_status: "paired",
    newAccountAddress: config.silentSigner.address,
    device_name: result.deviceName,
    elapsed_time: result.elapsedTime,
  };
}
async function runKeygen() {
  let silentShareStorage: StorageData = await getSilentShareStorage();
  let pairingData = silentShareStorage.pairingData;
  // Refresh token if it is expired
  if (pairingData.tokenExpiration < Date.now() - 60000) {
    pairingData = await refreshPairing();
  }
  let wallets = silentShareStorage.wallets;
  let accountId = Object.keys(wallets).length + 1;
  let x1 = await randBytes(32);
  let result = await KeyGenAction.keygen(pairingData, accountId, x1);
  saveSilentShareStorage({
    ...silentShareStorage,
    accountId: uuid(),
    tempDistributedKey: {
      publicKey: result.publicKey,
      accountId,
      keyShareData: result.keyShareData,
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
async function runBackup() {
  let silentShareStorage: StorageData = await getSilentShareStorage();
  const encryptedMessage = JSON.stringify(
    silentShareStorage.tempDistributedKey
  );
  const address = config.silentSigner.address;
  await backup(silentShareStorage.pairingData, encryptedMessage, address);
}
async function refreshPairing() {
  let silentShareStorage: StorageData = await getSilentShareStorage();
  let pairingData = silentShareStorage.pairingData;
  let result = await PairingAction.refreshToken(pairingData);
  await saveSilentShareStorage({
    ...silentShareStorage,
    pairingData: result.newPairingData,
  });
  return result.newPairingData;
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
  let silentShareStorage = await getSilentShareStorage();
  let pairingData = silentShareStorage.pairingData;
  if (pairingData.tokenExpiration < Date.now() - 60000) {
    pairingData = await refreshPairing();
  }
  let messageHash = fromHexStringToBytes(messageHashHex);
  if (messageHash.length !== 32) {
    throw new SdkError(
      "Invalid length of messageHash, should be 32 bytes",
      ErrorCode.InvalidMessageHashLength
    );
  }
  const walletId = "biconomy";
  return await SignAction.sign(
    pairingData,
    keyShare,
    hashAlg,
    message,
    messageHash,
    signMetadata,
    accountId,
    walletId
  );
}
export {
  initPairing,
  runPairing,
  runKeygen,
  runSign,
  runBackup,
  refreshPairing,
};
