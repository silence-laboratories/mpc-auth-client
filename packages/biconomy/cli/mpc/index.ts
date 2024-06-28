import { MpcAuthenticator } from "@silencelaboratories/mpc-sdk/lib/cjs/index";
import { StoragePlatform } from "@silencelaboratories/mpc-sdk/lib/cjs/types";
import { CliStorage } from "./storage";
import { MpcSigner } from "@silencelaboratories/mpc-sdk/lib/cjs/domain/signer";
import qrCodeTerm from "qrcode-terminal";
import { IP1KeyShare } from "@silencelaboratories/ecdsa-tss";
import { ethers } from "ethers";

const WALLET_ID = "biconomy";
const storage = new CliStorage();
console.log(process.env.NODE_ENV === "development");
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
    await mpcAuth.runEndPairingSession(
      pairingSessionData,
  );

    let keygenResult = await mpcAuth.runKeygen();
    const p1KeyShare: IP1KeyShare = keygenResult.distributedKey.keyShareData;
    if (!p1KeyShare) {
      throw new Error("Failed to generate p1KeyShare");
    }
    await mpcAuth.runBackup("demopassword");
    const publicKey = p1KeyShare.public_key;
    const address = ethers.utils.computeAddress(`0x04${publicKey}`);
    return new MpcSigner(
      address,
      publicKey,
      p1KeyShare,
      keygenResult,
      mpcAuth
    );
  }