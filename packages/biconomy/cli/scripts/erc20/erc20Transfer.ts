import { ethers, providers } from "ethers";
import chalk from "chalk";
import { SupportedSigner, createSmartAccountClient } from "@biconomy/account";
import { SilentWallet } from "../../silentWallet";
import config from "../../config.json";

export const erc20Transfer = async (to: string, amount: number) => {
  try {
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

    const requestData = {
      to: to,
      value: ethers.utils.parseEther(amount.toString()).toHexString(),
    };

    console.log(chalk.blue("Sending transaction request..."));
    const userOpResponse = await biconomySmartAccount.sendTransaction(requestData);

    console.log(chalk.blue("Waiting for transaction receipt..."));
    const userOpReceipt = await userOpResponse.wait();

    console.log(chalk.blue(`userOp: ${JSON.stringify(userOpReceipt, null, "\t")}`));

    try {
      const { transactionHash } = await userOpResponse.waitForTxHash();
      console.log("Transaction Hash:", transactionHash);
      console.log(chalk.green(`userOp Hash: ${userOpResponse.userOpHash}`));
      const transactionDetails = await userOpResponse.wait();
      console.log(
        chalk.blue(
          `transactionDetails: ${JSON.stringify(transactionDetails, null, "\t")}`
        )
      );
    } catch (e) {
      console.log("Error during transaction processing: ", e);
    }
  } catch (error) {
    console.log(chalk.red("Error initiating transfer: "), error);
  }
};

// Add this function if it is missing
export const erc20TransferPayERC20 = async (to: string, amount: number, token: string) => {
  try {
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

    const requestData = {
      to: to,
      value: ethers.utils.parseEther(amount.toString()).toHexString(),
      token: token,
    };

    console.log(chalk.blue("Sending transaction request..."));
    const userOpResponse = await biconomySmartAccount.sendTransaction(requestData);

    console.log(chalk.blue("Waiting for transaction receipt..."));
    const userOpReceipt = await userOpResponse.wait();

    console.log(chalk.blue(`userOp: ${JSON.stringify(userOpReceipt, null, "\t")}`));

    try {
      const { transactionHash } = await userOpResponse.waitForTxHash();
      console.log("Transaction Hash:", transactionHash);
      console.log(chalk.green(`userOp Hash: ${userOpResponse.userOpHash}`));
      const transactionDetails = await userOpResponse.wait();
      console.log(
        chalk.blue(
          `transactionDetails: ${JSON.stringify(transactionDetails, null, "\t")}`
        )
      );
    } catch (e) {
      console.log("Error during transaction processing: ", e);
    }
  } catch (error) {
    console.log(chalk.red("Error initiating transfer: "), error);
  }
};
