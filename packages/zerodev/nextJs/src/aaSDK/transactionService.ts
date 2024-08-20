// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import { MpcAuthenticator, ViemSigner } from "@silencelaboratories/mpc-sdk";
import { createPublicClient, createWalletClient, Hex, http } from "viem";
import {
    ENTRYPOINT_ADDRESS_V07,
    walletClientToSmartAccountSigner,
} from "permissionless";

import { sepolia } from "viem/chains";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import {
    createKernelAccount,
    createKernelAccountClient,
    createZeroDevPaymasterClient,
} from "@zerodev/sdk";

export async function sendTransaction(
    recipientAddress: string,
    amount: string,
    mpcAuth: MpcAuthenticator
) {
    const eoa = mpcAuth.accountManager.getEoa();
    if (!eoa) {
        throw new Error("Eoa not found");
    }
    const client = await ViemSigner.instance(mpcAuth);
    const signer = await client.getViemAccount();
    const publicClient = createPublicClient({
        transport: http("https://rpc.ankr.com/eth_sepolia"),
    });

    const entryPoint = ENTRYPOINT_ADDRESS_V07;

    const walletClient = createWalletClient({
        account: signer,
        chain: sepolia,
        transport: http(
            `https://rpc.zerodev.app/api/v2/bundler/${process.env.API_KEY}`
        ),
    });

    const smartAccountSigner = walletClientToSmartAccountSigner(walletClient);

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

    const requestData = {
        to: recipientAddress as Hex,
        value: convertEtherToWei(amount),
    };

    try {
        const kernelClient = createKernelAccountClient({
            account: account,
            entryPoint,
            chain: sepolia,
            bundlerTransport: http(
                `https://rpc.zerodev.app/api/v2/bundler/${process.env.API_KEY}`
            ),
            middleware: {
                sponsorUserOperation: async ({ userOperation }) => {
                    const paymasterClient = createZeroDevPaymasterClient({
                        chain: sepolia,
                        transport: http(
                            `https://rpc.zerodev.app/api/v2/paymaster/${process.env.API_KEY}`
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
        const txHash = await kernelClient.sendTransaction({
            to: requestData.to,
            value: requestData.value,
        });

        return { txHash };
    } catch (error) {
        console.error("Transaction error:", error);
        return { success: false, error };
    }
}
function convertEtherToWei(etherString: string) {
    const ether = Number(etherString);
    const weiString = (ether * 1e18).toString();
    return BigInt(weiString);
}
