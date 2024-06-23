import { SilentWallet } from "@/silentWallet";
import { getSilentShareStorage } from "@/mpc/storage/wallet";
import * as store from "@/mpc/storage/account";
import { SupportedSigner, createSmartAccountClient } from "@biconomy/account";
import { providers } from "ethers";

export async function mintBiconomyWallet(eoa: { address: string; }) {
    const keyshards = getSilentShareStorage();
    const distributedKey = keyshards.newPairingState?.distributedKey;
    const keyShareData = distributedKey?.keyShareData ?? null;
    const provider = new providers.JsonRpcProvider("https://rpc.sepolia.org");

    const client = new SilentWallet(
        eoa.address,
        distributedKey?.publicKey ?? "",
        keyShareData,
        { distributedKey },
        provider,
    );

    const biconomySmartAccount = await createSmartAccountClient({
        signer: client as SupportedSigner,
        bundlerUrl: "https://bundler.biconomy.io/api/v2/11155111/J51Gd5gX3.fca10d8b-6619-4ed3-a580-3ce21fc0d717",
    });
    
    const response = await biconomySmartAccount.getAccountAddress();
    store.setSmartContractAccount({ address: response });
    return response;
}
