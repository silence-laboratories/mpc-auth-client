import { SilentWallet } from "@/silentWallet";
import { Presets } from "userop";
import { WALLET_ID } from "@/constants";
import { StoragePlatform } from "@silencelaboratories/mpc-sdk/lib/esm/types";
import { MpcSdk } from "@silencelaboratories/mpc-sdk";

export async function mintWallet(eoa: { address: string; }, mpcSdk: MpcSdk) {
    const distributedKey = mpcSdk.getDistributionKey();
    const keyShareData = distributedKey?.keyShareData ?? null;
    const simpleAccount = await Presets.Builder.SimpleAccount.init(
        new SilentWallet(
            eoa.address,
            distributedKey?.publicKey ?? "",
            keyShareData,
            { distributedKey },
            mpcSdk
        ),
        `https://api.stackup.sh/v1/node/${process.env.API_KEY}`
    );
    const response = simpleAccount.getSender();
    mpcSdk.accountManager.setSmartContractAccount({ address: response });
    return response;
}
