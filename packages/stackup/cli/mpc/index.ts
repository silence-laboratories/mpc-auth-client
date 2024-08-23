import qrCodeTerm from "qrcode-terminal";

import { CliStorage } from "./storage";
import type { IP1KeyShare } from "@silencelaboratories/ecdsa-tss";
import {
  MpcAuthenticator,
  MpcSigner,
  StoragePlatform,
  WalletId,
} from "@silencelaboratories/mpc-sdk";
import "dotenv/config";

const storage = new CliStorage();
export const mpcAuth = MpcAuthenticator.instance({
  walletId: WalletId.Stackup,
  storagePlatform: StoragePlatform.CLI,
  customStorage: storage,
  isDev: process.env.NEXT_PUBLIC_SDK_MODE === "development",
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
  const signer = await MpcSigner.instance(mpcAuth);
  return signer;
}
