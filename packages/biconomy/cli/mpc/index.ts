import { CliStorage } from "./storage";
import qrCodeTerm from "qrcode-terminal";
import {
  MpcAuthenticator,
  MpcSigner,
  WalletId,
  StoragePlatform,
} from "@silencelaboratories/mpc-sdk";
import "dotenv/config";
const storage = new CliStorage();
export const mpcAuth = MpcAuthenticator.instance({
  walletId: WalletId.Biconomy,
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

  await mpcAuth.runKeygen();
  await mpcAuth.runBackup("demopassword");
  const signer = await MpcSigner.instance(mpcAuth);
  return signer;
}
