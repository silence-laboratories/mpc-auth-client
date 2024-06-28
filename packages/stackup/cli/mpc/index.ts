import qrCodeTerm from "qrcode-terminal";

import { StoragePlatform } from "@silencelaboratories/mpc-sdk/lib/cjs/types";
import { MpcSigner } from "@silencelaboratories/mpc-sdk/lib/cjs/domain/signer";
import { MpcAuthenticator } from "@silencelaboratories/mpc-sdk/lib/cjs/domain/authenticator";
import { CliStorage } from "./storage";
import { IP1KeyShare } from "@silencelaboratories/ecdsa-tss";
import { ethers } from "ethers";

const WALLET_ID = "stackup";
const storage = new CliStorage();
export const mpcAuth = new MpcAuthenticator({
  walletId: WALLET_ID,
  storagePlatform: StoragePlatform.CLI, 
  customStorage: storage,
  isDev: process.env.NODE_ENV === "development",
});

export async function generate(): Promise<MpcSigner> {
  const qrCode = await mpcAuth.initPairing();
  qrCodeTerm.generate(
    qrCode,
    {
      small: true,
    },
    function (qrcode: any) {
      console.log(qrcode);
    }
  );

  const pairingSessionData = await mpcAuth.runStartPairingSession();
  await mpcAuth.runEndPairingSession(pairingSessionData);

  const keygenResult = await mpcAuth.runKeygen();
  await mpcAuth.runBackup("demopassword");
  const p1KeyShare: IP1KeyShare = keygenResult.distributedKey.keyShareData;
  if (!p1KeyShare) {
    throw new Error("Failed to generate p1KeyShare");
  }

  const publicKey = p1KeyShare.public_key;
  const address = ethers.utils.computeAddress(`0x04${publicKey}`);
  return new MpcSigner(address, publicKey, p1KeyShare, keygenResult, mpcAuth);
}
