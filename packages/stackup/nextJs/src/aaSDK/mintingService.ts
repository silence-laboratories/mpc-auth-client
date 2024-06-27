import { Presets } from "userop";
import { MpcSdk } from "@silencelaboratories/mpc-sdk";
import { MpcSigner } from "@silencelaboratories/mpc-sdk/lib/esm/domain/signer";

export async function mintWallet(eoa: string, mpcSdk: MpcSdk) {
    const distributedKey = mpcSdk.getDistributionKey();
    const keyShareData = distributedKey?.keyShareData ?? null;
    const simpleAccount = await Presets.Builder.SimpleAccount.init(
        new MpcSigner(
            eoa,
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
