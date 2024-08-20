// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import { sepolia } from "@alchemy/aa-core";

import chalk from "chalk";
import { mpcAuth } from "../../mpc";
import {  MpcSigner } from "@silencelaboratories/mpc-sdk";

import { providers } from "ethers";
import { ethersToAccount } from "./alchemyUtility";
import { createLightAccountAlchemyClient } from "@alchemy/aa-alchemy";

export default async function main() {
  try {
    const provider = new providers.JsonRpcProvider("https://rpc.sepolia.org");
    const client = await MpcSigner.instance(mpcAuth, provider);

    const accountSigner = ethersToAccount(client);
    const smartAccountClient = await createLightAccountAlchemyClient({
        apiKey: process.env.API_KEY,
        chain: sepolia,
        signer: accountSigner,
      });
    const response = smartAccountClient.getAddress();
    console.log(chalk.blue(`SimpleAccount address: ${response}`));
    console.log(chalk.whiteBright("Please deposit some sepolia ETH into the account to avoid transaction failures."));
  } catch (error) {
    console.error(error);
  }
}
