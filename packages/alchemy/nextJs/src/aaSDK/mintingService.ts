import { MpcAuthenticator, MpcSigner } from "@silencelaboratories/mpc-sdk";
import { providers } from "ethers";
import {ethersToAccount} from "./alchemyUtility"
import { sepolia } from "@alchemy/aa-core";
import { createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";

export async function mintAlchemyWallet(mpcAuth: MpcAuthenticator) {
    const provider = new providers.JsonRpcProvider("https://rpc.sepolia.org");
    const client = await MpcSigner.instance(mpcAuth, provider);
    
    const accountSigner = ethersToAccount(client);
    const smartAccountClient =  await createModularAccountAlchemyClient({
        apiKey:process.env.API_KEY,
        chain:sepolia,
        signer: accountSigner,
      });

    const response = smartAccountClient.getAddress()
    mpcAuth.accountManager.setSmartContractAccount({ address: response });
    return response;
}
