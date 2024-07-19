import { SilentWallet } from "@/silentWallet";
import { getSilentShareStorage } from "@/mpc/storage/wallet";
import * as store from "@/mpc/storage/account";
import { Presets } from "userop";

export async function mintWallet(eoa: { address: string; }) {
    const keyshards = getSilentShareStorage();
    const distributedKey = keyshards.newPairingState?.distributedKey;
    const keyShareData = distributedKey?.keyShareData ?? null;
    const simpleAccount = await Presets.Builder.SimpleAccount.init(
        new SilentWallet(
            eoa.address,
            distributedKey?.publicKey ?? "",
            keyShareData,
            { distributedKey }
        ),
        `https://api.stackup.sh/v1/node/${process.env.API_KEY}`
    );
    const response = simpleAccount.getSender();
    store.setSmartContractAccount({ address: response });
    return response;
}
