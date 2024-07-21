import { SilentWallet } from "@/silentWallet";
import { getSilentShareStorage } from "@/mpc/storage/wallet";
import * as store from "@/mpc/storage/account";
import { Client, Presets } from "userop";
import { ethers } from "ethers";
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

    // // TODO: Move this to `mpc`
    // const keyshards = getSilentShareStorage();
    // const distributedKey = keyshards.newPairingState?.distributedKey;
    // const simpleAccount = await Presets.Builder.SimpleAccount.init(
    //     new SilentWallet(
    //         store.getEoa().address,
    //         distributedKey?.publicKey as string,
    //         distributedKey?.keyShareData,
    //         { distributedKey }
    //     ),
    //     `https://api.stackup.sh/v1/node/${process.env.API_KEY}`
    // );
    // const client = await Client.init(
    //     `https://api.stackup.sh/v1/node/${process.env.API_KEY}`
    // );
    // try{
    // const target = ethers.utils.getAddress(requestData.to);
    // const value = requestData.amount;

    // const res = await client.sendUserOperation(
    //     simpleAccount.execute(target, value, "0x"),
    //     {
    //       // Add necessary options as needed
    //         onBuild: (op) => console.log("Signed UserOperation:", op),
    //     }
    // );
    // console.log("userOp Hash", res.userOpHash);

    // const ev = await res.wait();
    // console.log("transactionHash", ev?.transactionHash ?? null);

    // return {success:true,transactionHash:ev?.transactionHash ?? null, userOpHash:res.userOpHash}
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
            "https://rpc.zerodev.app/api/v2/bundler/521c47a3-535f-46db-ba5d-e0084aa0eedf"
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
    console.log("account1",account)
    console.log("transaction props",requestData.to as Hex, requestData.amount);

    const kernelClient = createKernelAccountClient({
        account: account,
        entryPoint,
        chain: sepolia,
        bundlerTransport: http("https://rpc.zerodev.app/api/v2/bundler/521c47a3-535f-46db-ba5d-e0084aa0eedf"),
         middleware: {
      sponsorUserOperation: async ({ userOperation }) => {
        const paymasterClient = createZeroDevPaymasterClient({
          chain:sepolia,
          transport: http("https://rpc.zerodev.app/api/v2/paymaster/521c47a3-535f-46db-ba5d-e0084aa0eedf"),
          entryPoint,
        })
        return paymasterClient.sponsorUserOperation({
          userOperation,
          entryPoint,
        })
      },
    },
    });
    console.log("transaction props",requestData.to as Hex, requestData.amount);

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
    console.log("receipt:", _receipt.userOpHash);

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
