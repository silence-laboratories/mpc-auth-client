import { ethers } from "ethers";
import { Presets } from "userop";
// @ts-ignore
import config from "../../config.json";
import { SilentWallet } from "../../silentWallet";


export default async function main() {
  

  const simpleAccount = await Presets.Builder.SimpleAccount.init(
    new SilentWallet(config.address,config.public_key,config.p1KeyShare,config.keygenResult),
    config.rpcUrl
  );
  const address = simpleAccount.getSender();

  console.log(`SimpleAccount address: ${address}`);
}