// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import chalk from "chalk";
import { mpcAuth } from "../../mpc";
import { ViemSigner } from "@silencelaboratories/mpc-sdk";
import {
  Account,
  createPublicClient,
  createWalletClient,
  Hex,
  http,
} from "viem";
import {
  ENTRYPOINT_ADDRESS_V07,
  walletClientToSmartAccountSigner,
} from "permissionless";

import { sepolia } from "viem/chains";
import dotenv from "dotenv";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import {
  createKernelAccount,
  createKernelAccountClient,
  createZeroDevPaymasterClient,
} from "@zerodev/sdk";
dotenv.config();

export default async function main(t: string, amt: string) {
  // Initialize the Viem client with MPC authentication
  const client = await ViemSigner.instance(mpcAuth);
  const signer = await client.getViemAccount();
  const walletClient = createWalletClient({
    account: signer as Account,
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

  const requestData = {
    to: t as Hex,
    value: convertEtherToWei(amt),
  };

  const kernelClient = createKernelAccountClient({
    account: account,
    entryPoint,
    chain: sepolia,
    bundlerTransport: http(
      "https://rpc.zerodev.app/api/v2/bundler/521c47a3-535f-46db-ba5d-e0084aa0eedf"
    ),
    middleware: {
      sponsorUserOperation: async ({ userOperation }) => {
        const paymasterClient = createZeroDevPaymasterClient({
          chain: sepolia,
          transport: http(
            "https://rpc.zerodev.app/api/v2/paymaster/521c47a3-535f-46db-ba5d-e0084aa0eedf"
          ),
          entryPoint,
        });
        return paymasterClient.sponsorUserOperation({
          userOperation,
          entryPoint,
        });
      },
    },
  });

  const userOpHash = await kernelClient.sendUserOperation({
    userOperation: {
      callData: await account.encodeCallData({
        to: requestData.to,
        value: requestData.value,
        data: "0x",
      }),
    },
  });

  console.log(chalk.blue("userOp hash:", userOpHash));
}

function convertEtherToWei(etherString: string) {
  const ether = Number(etherString);
  const weiString = (ether * 1e18).toString();
  return BigInt(weiString);
}
