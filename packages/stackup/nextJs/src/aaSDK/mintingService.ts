import { Presets } from "userop";
import { MpcAuthenticator } from "@silencelaboratories/mpc-sdk";
import { MpcSigner } from "@silencelaboratories/mpc-sdk/lib/esm/domain/signer";

export async function mintWallet(eoa: string, mpcAuth: MpcAuthenticator) {
    const distributedKey = mpcAuth.getDistributionKey();
    const keyShareData = distributedKey?.keyShareData ?? null;
    const simpleAccount = await Presets.Builder.SimpleAccount.init(
        new MpcSigner(
            eoa,
            distributedKey?.publicKey ?? "",
            keyShareData,
            { distributedKey },
            mpcAuth
        ),
        `https://api.stackup.sh/v1/node/${process.env.API_KEY}`
    );
    const response = simpleAccount.getSender();
    mpcAuth.accountManager.setSmartContractAccount({ address: response });
    return response;
}
