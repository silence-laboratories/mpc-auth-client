// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import { providers } from "ethers";
import { MpcAuthenticator, MpcSigner } from "@silencelaboratories/mpc-sdk";
import { ethersToAccount } from "./alchemyUtility";
import { createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";
import { sepolia } from "@alchemy/aa-core";
import * as viem from "viem";

export async function sendTransaction(
    recipientAddress: string,
    amount: string,
    mpcAuth: MpcAuthenticator
) {
    const eoa = mpcAuth.accountManager.getEoa();
    if (!eoa) {
        throw new Error("Eoa not found");
    }
    const provider = new providers.JsonRpcProvider("https://rpc.sepolia.org");
    const client = await MpcSigner.instance(mpcAuth, provider);
    const accountSigner = ethersToAccount(client);
    const smartAccountClient = await createModularAccountAlchemyClient({
        apiKey: process.env.API_KEY,
        chain: sepolia,
        signer: accountSigner,
    });

    const requestData = {
        to: recipientAddress,
        value: convertEtherToWei(amount),
    };
    try {
        const uo = await smartAccountClient.sendUserOperation({
            uo: {
                target: requestData.to as viem.Hex,
                data: "0x",
                value: requestData.value,
            },
        });

        const transactionHash =
            await smartAccountClient.waitForUserOperationTransaction(uo);
        return { transactionHash };
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
