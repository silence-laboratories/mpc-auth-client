import { Presets } from "userop";
import { MpcAuthenticator } from "@silencelaboratories/mpc-sdk";
import { MpcSigner } from "@silencelaboratories/mpc-sdk/lib/esm/domain/signer";

export async function mintWallet(mpcAuth: MpcAuthenticator) {
    const signer = await MpcSigner.instance(mpcAuth);
    const simpleAccount = await Presets.Builder.SimpleAccount.init(
        signer,
        `https://api.stackup.sh/v1/node/${process.env.API_KEY}`
    );
    const response = simpleAccount.getSender();
    mpcAuth.accountManager.setSmartContractAccount({ address: response });
    return response;
}
