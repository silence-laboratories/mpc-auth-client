// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import {
    walletClientToSmartAccountSigner,
} from "permissionless";
import {  createWalletClient, Hex } from "viem";
import { sepolia } from "viem/chains";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { createKernelAccount } from "@zerodev/sdk";
import chalk from "chalk";
import { mpcAuth } from "../../mpc";
import {  ViemSigner } from "@silencelaboratories/mpc-sdk";
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import { createPublicClient, http } from "viem";

export default async function main() {
  try {
    // Initialize the Viem client with MPC authentication
    const client = await ViemSigner.instance(mpcAuth);
    const signer = await client.getViemAccount();
    const walletClient = createWalletClient({
        account: signer,
        chain: sepolia,
        transport: http(
            `https://rpc.zerodev.app/api/v2/bundler/${process.env.API_KEY}`
        ),
    });
    const smartAccountSigner = walletClientToSmartAccountSigner(walletClient);
    const publicClient = createPublicClient({
        transport: http("https://rpc.ankr.com/eth_sepolia"),
    });
    const entryPoint = ENTRYPOINT_ADDRESS_V07;

    const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
        signer: smartAccountSigner,
        entryPoint,
    });

    const account = await createKernelAccount(publicClient, {
        plugins: {
            sudo: ecdsaValidator,
        },
        entryPoint,
    });

    const response = account.address;
    console.log(chalk.blue(`SimpleAccount address: ${response}`));
  } catch (error) {
    console.error(error);
  }
}
