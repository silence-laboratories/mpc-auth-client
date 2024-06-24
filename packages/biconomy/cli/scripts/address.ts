import chalk from "chalk";
import config from "../config.json";
import { SupportedSigner, createSmartAccountClient } from "@biconomy/account";
import { providers } from "ethers";
import { SilentWallet } from "../silentWallet";

export async function getAddress() {

// Initialize Biconomy Smart Account SDK
const provider = new providers.JsonRpcProvider("https://rpc.sepolia.org");
const distributedKey = config.silentSigner.keygenResult.distributedKey;
const address = config.silentSigner.address;
const keyShareData =
  config.silentSigner.keygenResult.distributedKey.keyShareData;

const client = new SilentWallet(
  address,
  distributedKey?.publicKey ?? "",
  keyShareData,
  { distributedKey },
  provider
);

  const biconomySmartAccount = await createSmartAccountClient({
    signer: client as SupportedSigner,
    bundlerUrl: `https://bundler.biconomy.io/api/v2/11155111/${process.env.API_KEY}`,
});

const scwAddress = await biconomySmartAccount.getAccountAddress();


  console.log(chalk.green(`SmartAccount address: ${scwAddress}`));
}
