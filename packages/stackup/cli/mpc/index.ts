import qrCodeTerm from "qrcode-terminal";

import { MpcSdk } from "@silencelaboratories/mpc-sdk/lib/cjs/index";
import { StoragePlatform } from "@silencelaboratories/mpc-sdk/lib/cjs/types";
import { CliStorage } from "./storage";
import { MpcSigner } from "@silencelaboratories/mpc-sdk/lib/cjs/domain/signer";
import { IP1KeyShare } from "@silencelaboratories/ecdsa-tss";
import { ethers } from "ethers";

const WALLET_ID = "stackup";
const storage = new CliStorage();
export const mpcSdk = new MpcSdk(WALLET_ID, StoragePlatform.CLI, storage);

export async function generate(): Promise<MpcSigner> {
  const qrCode = await mpcSdk.initPairing();
  qrCodeTerm.generate(
    qrCode,
    {
      small: true,
    },
    function (qrcode: any) {
      console.log(qrcode);
    }
  );

  const pairingSessionData = await mpcSdk.runStartPairingSession();
  await mpcSdk.runEndPairingSession(pairingSessionData);

  const keygenResult = await mpcSdk.runKeygen();
  await mpcSdk.runBackup("demopassword");
  const p1KeyShare: IP1KeyShare = keygenResult.distributedKey.keyShareData;
  if (!p1KeyShare) {
    throw new Error("Failed to generate p1KeyShare");
  }

  const publicKey = p1KeyShare.public_key;
  const address = ethers.utils.computeAddress(`0x04${publicKey}`);
  return new MpcSigner(address, publicKey, p1KeyShare, keygenResult, mpcSdk);
}
