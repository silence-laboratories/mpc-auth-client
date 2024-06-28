
import { SupportedSigner, createSmartAccountClient } from "@biconomy/account";
import { MpcAuthenticator, MpcSigner } from "@silencelaboratories/mpc-sdk";
import { providers } from "ethers";



export async function mintBiconomyWallet(eoa: string, mpcAuth: MpcAuthenticator) {
    const distributedKey = mpcAuth.getDistributionKey();
    const keyShareData = distributedKey?.keyShareData ?? null;
    const provider = new providers.JsonRpcProvider("https://rpc.sepolia.org");

    const client = new MpcSigner(
        eoa,
        distributedKey?.publicKey ?? "",
        keyShareData,
        { distributedKey },
        mpcAuth,
        provider
    );

    const biconomySmartAccount = await createSmartAccountClient({
        signer: client as SupportedSigner,
        bundlerUrl: `https://bundler.biconomy.io/api/v2/11155111/${process.env.API_KEY}`,
    });
    
    const response = await biconomySmartAccount.getAccountAddress();
    mpcAuth.accountManager.setSmartContractAccount({ address: response });
    return response;
}
