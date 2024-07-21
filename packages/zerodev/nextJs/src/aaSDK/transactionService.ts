import { getSilentShareStorage } from "@/mpc/storage/wallet";
import * as store from "@/mpc/storage/account";
import { createPublicClient, createWalletClient, Hex, http } from "viem";
import { createViemAccount } from "@/viemSigner";
import { sepolia } from "viem/chains";
import {
    ENTRYPOINT_ADDRESS_V07,
    walletClientToSmartAccountSigner,
    bundlerActions,
} from "permissionless";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import {
    createKernelAccount,
    createKernelAccountClient,
    createZeroDevPaymasterClient,
} from "@zerodev/sdk";

export async function sendTransaction(
    recipientAddress: string,
    amount: string
) {
    const requestData = {
        to: recipientAddress,
        amount: convertEtherToWei(amount),
    };

    const eoa = store.getEoa();
    const keyshards = getSilentShareStorage();
    const distributedKey = keyshards.newPairingState?.distributedKey;
    const accountId = distributedKey?.accountId;
    const keyShareData = distributedKey?.keyShareData ?? null;
    console.log("createViemAccount",createViemAccount(
        keyShareData,
        eoa.address as Hex,
        accountId
    ));
    const walletClient = createWalletClient({
        account: await createViemAccount(
            keyShareData,
            eoa.address as Hex,
            accountId
        ),
        chain: sepolia,
        transport: http(
             `https://rpc.zerodev.app/api/v2/bundler/${process.env.API_KEY}`
        ),
    });
    console.log("walletClient",walletClient);

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

    const kernelClient = createKernelAccountClient({
        account: account,
        entryPoint,
        chain: sepolia,
        bundlerTransport: http(`https://rpc.zerodev.app/api/v2/bundler/${process.env.API_KEY}`),
         middleware: {
      sponsorUserOperation: async ({ userOperation }) => {
        const paymasterClient = createZeroDevPaymasterClient({
          chain:sepolia,
          transport: http(`https://rpc.zerodev.app/api/v2/paymaster/${process.env.API_KEY}`),
          entryPoint,
        })
        return paymasterClient.sponsorUserOperation({
          userOperation,
          entryPoint,
        })
      },
    },
    });
    const userOpHash = await kernelClient.sendUserOperation({
        userOperation: {
            callData: await account.encodeCallData({
                to: requestData.to as Hex,
                value: requestData.amount,
                data: "0x",
            }),
        },
    });

    const bundlerClient = kernelClient.extend(bundlerActions(entryPoint));
    const _receipt = await bundlerClient.waitForUserOperationReceipt({
        hash: userOpHash,
    });
    return {
        success: true,
        transactionHash: _receipt ?? null,
        userOpHash: _receipt.userOpHash,
    };
}

function convertEtherToWei(etherString: string) {
    const ether = Number(etherString);
    const weiString = (ether * 1e18).toString();
    return BigInt(weiString);
}
