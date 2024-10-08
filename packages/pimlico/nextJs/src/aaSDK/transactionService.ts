// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.
import { MpcAuthenticator, ViemSigner } from "@silencelaboratories/mpc-sdk";
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

    const paymasterClient = createPimlicoPaymasterClient({
        transport: http(
            `https://api.pimlico.io/v2/sepolia/rpc?apikey=${process.env.API_KEY}`
        ),
        entryPoint: ENTRYPOINT_ADDRESS_V07,
    });
    const simpleAccount = await signerToSimpleSmartAccount(publicClient, {
        signer: signer as SmartAccountSigner,
        entryPoint: ENTRYPOINT_ADDRESS_V07,
        factoryAddress: "0x91E60e0613810449d098b0b5Ec8b51A0FE8c8985",
    });

    const pimlicoBundlerClient = createPimlicoBundlerClient({
        transport: http(
            `https://api.pimlico.io/v2/sepolia/rpc?apikey=${process.env.API_KEY}`
        ),
        entryPoint: ENTRYPOINT_ADDRESS_V07,
    });

    const requestData = {
        to: recipientAddress as Hex,
        value: convertEtherToWei(amount),
    };

    try {
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
                    (await pimlicoBundlerClient.getUserOperationGasPrice())
                        .fast,
            },
        });

        const txHash = await smartAccountClient.sendTransaction({
            to: requestData.to,
            value: requestData.value,
            data: "0x123",
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
