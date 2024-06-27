
import { SupportedSigner, createSmartAccountClient } from "@biconomy/account";
import { MpcSdk } from "@silencelaboratories/mpc-sdk";
import { MpcSigner } from "@silencelaboratories/mpc-sdk/lib/esm/domain/signer";
import { providers } from "ethers";



export async function mintBiconomyWallet(eoa: string, mpcSdk: MpcSdk) {
    const distributedKey = mpcSdk.getDistributionKey();
    const keyShareData = distributedKey?.keyShareData ?? null;
    const provider = new providers.JsonRpcProvider("https://rpc.sepolia.org");

    const client = new MpcSigner(
        eoa,
        distributedKey?.publicKey ?? "",
        keyShareData,
        { distributedKey },
        mpcSdk,
        provider
    );

    const biconomySmartAccount = await createSmartAccountClient({
        signer: client as SupportedSigner,
        bundlerUrl: `https://bundler.biconomy.io/api/v2/11155111/${process.env.API_KEY}`,
    });
    
    const response = await biconomySmartAccount.getAccountAddress();
    mpcSdk.accountManager.setSmartContractAccount({ address: response });
    return response;
}
