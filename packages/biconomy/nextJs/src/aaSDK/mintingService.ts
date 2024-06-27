
import { SilentWallet } from "@/silentWallet";
import { SupportedSigner, createSmartAccountClient } from "@biconomy/account";
import { MpcSdk } from "@silencelaboratories/mpc-sdk";
import { providers } from "ethers";



export async function mintBiconomyWallet(eoa: string, mpcSdk: MpcSdk) {
    const distributedKey = mpcSdk.getDistributionKey();
    const keyShareData = distributedKey?.keyShareData ?? null;
    const provider = new providers.JsonRpcProvider("https://rpc.sepolia.org");

    const client = new SilentWallet(
        eoa,
        distributedKey?.publicKey ?? "",
        keyShareData,
        { distributedKey },
        provider,
        mpcSdk
    );

    const biconomySmartAccount = await createSmartAccountClient({
        signer: client as SupportedSigner,
        bundlerUrl: `https://bundler.biconomy.io/api/v2/11155111/${process.env.API_KEY}`,
    });
    
    const response = await biconomySmartAccount.getAccountAddress();
    mpcSdk.accountManager.setSmartContractAccount({ address: response });
    return response;
}
