import { Presets } from "userop";
// @ts-ignore
import config from "../../config.json";
import { SilentWallet } from "../../silentWallet";
import chalk from "chalk";


export default async function main() {
  

  const simpleAccount = await Presets.Builder.SimpleAccount.init(
    new SilentWallet(config.address,config.public_key,config.p1KeyShare,config.keygenResult),
    config.rpcUrl
  );
  const address = simpleAccount.getSender();

  console.log(chalk.blue(`SimpleAccount address: ${address}`));
}