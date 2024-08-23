// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import chalk from "chalk";
import { mpcAuth } from "../../mpc";
import { ViemSigner } from "@silencelaboratories/mpc-sdk";
import { createPublicClient, Hex, http } from "viem";
import {
  signerToSimpleSmartAccount,
  SmartAccountSigner,
} from "permissionless/accounts";
import {
  createSmartAccountClient,
  ENTRYPOINT_ADDRESS_V07,
} from "permissionless";
import {
  createPimlicoBundlerClient,
  createPimlicoPaymasterClient,
} from "permissionless/clients/pimlico";
import { sepolia } from "viem/chains";
import dotenv from "dotenv";
dotenv.config();

export default async function main(t: string, amt: string) {
  // Initialize the Viem client with MPC authentication
  const client = await ViemSigner.instance(mpcAuth);
  const signer = await client.getViemAccount();
  const eoaAddress = await mpcAuth.accountManager.getEoa();
  console.log(eoaAddress);
  // Create a public client for Sepolia testnet
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http("https://rpc.ankr.com/eth_sepolia"),
  });
  // Convert the signer to a simple smart account

  const simpleAccount = await signerToSimpleSmartAccount(publicClient, {
    signer: signer as SmartAccountSigner,
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    factoryAddress: "0x91E60e0613810449d098b0b5Ec8b51A0FE8c8985",
  });

  const paymasterClient = createPimlicoPaymasterClient({
    transport: http(
      `https://api.pimlico.io/v2/sepolia/rpc?apikey=${process.env.API_KEY}`
    ),
    entryPoint: ENTRYPOINT_ADDRESS_V07,
  });

  const pimlicoBundlerClient = createPimlicoBundlerClient({
    transport: http(
      `https://api.pimlico.io/v2/sepolia/rpc?apikey=${process.env.API_KEY}`
    ),
    entryPoint: ENTRYPOINT_ADDRESS_V07,
  });

  const smartAccountClient = createSmartAccountClient({
    account: simpleAccount,
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    chain: sepolia,
    bundlerTransport: http(
      `https://api.pimlico.io/v2/sepolia/rpc?apikey=${process.env.API_KEY}`
    ),
    middleware: {
      sponsorUserOperation: paymasterClient.sponsorUserOperation, // optional
      gasPrice: async () =>
        (await pimlicoBundlerClient.getUserOperationGasPrice()).fast,
    },
  });

  const requestData = {
    to: t as Hex,
    value: convertEtherToWei(amt),
  };

  const txHash = await smartAccountClient.sendTransaction({
    to: requestData.to,
    value: requestData.value,
    data: "0x1234",
  });

  console.log("Waiting for transaction...");

  console.log(chalk.blue(`UserOpHash: ${txHash}`));
}

function convertEtherToWei(etherString: string) {
  const ether = Number(etherString);
  const weiString = (ether * 1e18).toString();
  return BigInt(weiString);
}
