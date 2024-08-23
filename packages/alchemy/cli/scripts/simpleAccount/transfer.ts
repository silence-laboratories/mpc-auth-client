// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import chalk from "chalk";
import { mpcAuth } from "../../mpc";
import { MpcSigner } from "@silencelaboratories/mpc-sdk";
import { Hex } from "viem";
import { sepolia } from "@alchemy/aa-core";

import dotenv from "dotenv";

import { providers } from "ethers";
import { ethersToAccount } from "./alchemyUtility";
import { createLightAccountAlchemyClient } from "@alchemy/aa-alchemy";
dotenv.config();

export default async function main(t: string, amt: string) {
  const provider = new providers.JsonRpcProvider("https://rpc.sepolia.org");
  const client = await MpcSigner.instance(mpcAuth, provider);

  const accountSigner = ethersToAccount(client);

  const smartAccountClient = await createLightAccountAlchemyClient({
    apiKey: process.env.API_KEY,
    chain: sepolia,
    signer: accountSigner,
  });

  const requestData = {
    to: t as Hex,
    value: convertEtherToWei(amt),
  };

  console.log(chalk.yellow("Sending transaction..."));
  const uo = await smartAccountClient.sendUserOperation({
    uo: {
      target: requestData.to as Hex,
      data: "0x123",
      value: requestData.value,
    },
  });

  const transactionHash =
    await smartAccountClient.waitForUserOperationTransaction(uo);

  console.log(chalk.blue(`Transaction hash: ${transactionHash}`));
}

function convertEtherToWei(etherString: string) {
  const ether = Number(etherString);
  const weiString = (ether * 1e18).toString();
  return BigInt(weiString);
}
