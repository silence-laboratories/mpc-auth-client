import { providers } from "ethers";
import { SilentWallet } from "@/silentWallet";
import { SupportedSigner, createSmartAccountClient } from "@biconomy/account";
import { MpcSdk } from "@silencelaboratories/mpc-sdk";

export async function sendTransaction(
    recipientAddress: string,
    amount: string,
    mpcSdk: MpcSdk
) {
    const provider = new providers.JsonRpcProvider("https://rpc.sepolia.org");
    const distributedKey = mpcSdk.getDistributionKey();
    const client = new SilentWallet(
        mpcSdk.accountManager.getEoa().address,
        distributedKey?.publicKey ?? "",
        distributedKey?.keyShareData,
        { distributedKey },
        provider,
        mpcSdk
    );

    const biconomySmartAccount = await createSmartAccountClient({
        signer: client as SupportedSigner,
        bundlerUrl: `https://bundler.biconomy.io/api/v2/11155111/${process.env.API_KEY}`,
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
