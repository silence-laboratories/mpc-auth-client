// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import chalk from "chalk";
import { mpcAuth } from "../../mpc";
import {  ViemSigner } from "@silencelaboratories/mpc-sdk";
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import { createPublicClient, http } from "viem";
import { signerToSimpleSmartAccount, SmartAccountSigner } from "permissionless/accounts";

export default async function main() {
  try {
    // Initialize the Viem client with MPC authentication
    const client = await ViemSigner.instance(mpcAuth);
    const signer = await client.getViemAccount();

    // Create a public client for Sepolia testnet
    const publicClient = createPublicClient({
      transport: http("https://rpc.ankr.com/eth_sepolia"),
    });
    // Convert the signer to a simple smart account
    
    const simpleAccount = await signerToSimpleSmartAccount(publicClient, {
      signer: signer as SmartAccountSigner, 
      entryPoint: ENTRYPOINT_ADDRESS_V07,
      factoryAddress: "0x91E60e0613810449d098b0b5Ec8b51A0FE8c8985",
    });

    const address = simpleAccount.address;

    console.log(chalk.blue(`SimpleAccount address: ${address}`));
  } catch (error) {
    console.error(error);
  }
}
