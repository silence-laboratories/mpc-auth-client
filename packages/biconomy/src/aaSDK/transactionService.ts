import { ethers, providers } from "ethers";
import { SilentWallet } from "@/silentWallet";
import { getSilentShareStorage } from "@/mpc/storage/wallet";
import { SupportedSigner, createSmartAccountClient } from "@biconomy/account";
import * as store from "@/mpc/storage/account";


export async function sendTransaction(recipientAddress: string, amount: string){
    const provider = new providers.JsonRpcProvider("https://rpc.sepolia.org");
    const keyshards = getSilentShareStorage();
    const distributedKey = keyshards.newPairingState?.distributedKey;
    const client = new SilentWallet(
        store.getEoa().address,
        distributedKey?.publicKey ?? "",
        distributedKey?.keyShareData,
        { distributedKey },
        provider,
    );

    const biconomySmartAccount = await createSmartAccountClient({
        signer: client as SupportedSigner,
        bundlerUrl: "https://bundler.biconomy.io/api/v2/11155111/J51Gd5gX3.fca10d8b-6619-4ed3-a580-3ce21fc0d717",
    });

    const requestData = {
        to: recipientAddress,
        value:convertEtherToWei(amount),
    };

    try {
        const userOpResponse = await biconomySmartAccount.sendTransaction(requestData);
        const { transactionHash } = await userOpResponse.waitForTxHash();
        console.log("Transaction Hash:", transactionHash);
        const userOpReceipt = await userOpResponse.wait();
        return {userOpReceipt, transactionHash };
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

