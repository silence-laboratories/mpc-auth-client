import { getSilentShareStorage } from "@/mpc/storage/wallet";
import * as store from "@/mpc/storage/account";
import { createPublicClient, Hex, http, parseEther } from "viem";
import { createViemAccount } from "@/viemSigner";
import { sepolia } from "viem/chains";
import {
    ENTRYPOINT_ADDRESS_V07,
    createSmartAccountClient,
} from "permissionless";
import {
    createPimlicoBundlerClient,
    createPimlicoPaymasterClient,
} from "permissionless/clients/pimlico";
import {  signerToSimpleSmartAccount } from "permissionless/accounts";

export async function sendTransaction(
    recipientAddress: string,
    amount: string
) {

    const eoa = store.getEoa();
    const keyshards = getSilentShareStorage();
    const distributedKey = keyshards.newPairingState?.distributedKey;
    const accountId = distributedKey?.accountId;
    const keyShareData = distributedKey?.keyShareData ?? null;
    const publicClient = createPublicClient({
        transport: http("https://rpc.ankr.com/eth_sepolia"),
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

    try {
     
        const simpleAccount = await signerToSimpleSmartAccount(publicClient, {
            signer: await createViemAccount(
                        keyShareData,
                        eoa.address as Hex,
                        accountId
                    ), 
            entryPoint: ENTRYPOINT_ADDRESS_V07,
            factoryAddress: "0x91E60e0613810449d098b0b5Ec8b51A0FE8c8985",
        })

        const smartAccountClient = createSmartAccountClient({
            account: simpleAccount,
            entryPoint: ENTRYPOINT_ADDRESS_V07,
            chain: sepolia,
            bundlerTransport: http(`https://api.pimlico.io/v2/sepolia/rpc?apikey=${process.env.API_KEY}`),
            middleware: {
                sponsorUserOperation: paymasterClient.sponsorUserOperation, // optional
                gasPrice: async () => (await pimlicoBundlerClient.getUserOperationGasPrice()).fast, 
            },
        })

        const txHash = await smartAccountClient.sendTransaction({
            to: recipientAddress as Hex,
            value: parseEther(amount),
        });
       
        return {
            success: true,
            transactionHash: txHash,
            userOpHash: txHash,
        };
    } catch (error) {
       
        return {
            success: false,
            error:"error during transaction",
        };
    }
}
