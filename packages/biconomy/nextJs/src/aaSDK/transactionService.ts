import { providers } from "ethers";
import { SilentWallet } from "@/silentWallet";
import { SupportedSigner, createSmartAccountClient } from "@biconomy/account";
import * as store from "@silencelaboratories/mpc-sdk/storage/account";
import { getSilentShareStorage } from "@silencelaboratories/mpc-sdk/storage/wallet";

export async function sendTransaction(
    recipientAddress: string,
    amount: string
) {
    const provider = new providers.JsonRpcProvider("https://rpc.sepolia.org");
    const keyshards = getSilentShareStorage();
    const distributedKey = keyshards.newPairingState?.distributedKey;
    const client = new SilentWallet(
        store.getEoa().address,
        distributedKey?.publicKey ?? "",
        distributedKey?.keyShareData,
        { distributedKey },
        provider
    );

    const biconomySmartAccount = await createSmartAccountClient({
        signer: client as SupportedSigner,
        bundlerUrl:`https://bundler.biconomy.io/api/v2/11155111/${process.env.API_KEY}`,
    });

    const requestData = {
        to: recipientAddress,
        value: convertEtherToWei(amount),
    };

    try {
        const userOpResponse = await biconomySmartAccount.sendTransaction(
            requestData
        );
        const { transactionHash } = await userOpResponse.waitForTxHash();
        console.log("Transaction Hash:", transactionHash);
        const userOpReceipt = await userOpResponse.wait();
        return { userOpReceipt, transactionHash };
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
