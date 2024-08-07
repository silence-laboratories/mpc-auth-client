import { MpcAuthenticator,ViemSigner} from "@silencelaboratories/mpc-sdk";
import { providers } from "ethers";
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import { createPublicClient, Hex, http } from "viem";

import {
    signerToSimpleSmartAccount,
} from "permissionless/accounts";
import { SmartAccountSigner } from "permissionless/_types/accounts";

export async function mintBiconomyWallet(mpcAuth: MpcAuthenticator) {
    const client = await ViemSigner.instance(mpcAuth);
    const signer = await client.getViemAccount();


  
    const publicClient = createPublicClient({
        transport: http("https://rpc.ankr.com/eth_sepolia"),
    });
    const simpleAccount = await signerToSimpleSmartAccount(publicClient, {
        signer: signer as SmartAccountSigner,
        entryPoint: ENTRYPOINT_ADDRESS_V07,
        factoryAddress: "0x91E60e0613810449d098b0b5Ec8b51A0FE8c8985",
    });

    const response = simpleAccount.address
    mpcAuth.accountManager.setSmartContractAccount({ address: response });
    return response;
}
