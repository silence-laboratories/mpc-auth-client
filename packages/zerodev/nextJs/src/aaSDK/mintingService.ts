import { MpcAuthenticator, ViemSigner } from "@silencelaboratories/mpc-sdk";
import {
    ENTRYPOINT_ADDRESS_V07,
    walletClientToSmartAccountSigner,
} from "permissionless";
import { createPublicClient, createWalletClient, Hex, http } from "viem";
import { sepolia } from "viem/chains";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { createKernelAccount } from "@zerodev/sdk";

export async function mintZeroDevWallet(mpcAuth: MpcAuthenticator) {
    const client = await ViemSigner.instance(mpcAuth);
    const signer = await client.getViemAccount();
    const walletClient = createWalletClient({
        account: signer,
        chain: sepolia,
        transport: http(
            `https://rpc.zerodev.app/api/v2/bundler/${process.env.API_KEY}`
        ),
    });
    const smartAccountSigner = walletClientToSmartAccountSigner(walletClient);
    const publicClient = createPublicClient({
        transport: http("https://rpc.ankr.com/eth_sepolia"),
    });
    const entryPoint = ENTRYPOINT_ADDRESS_V07;

    const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
        signer: smartAccountSigner,
        entryPoint,
    });

    const account = await createKernelAccount(publicClient, {
        plugins: {
            sudo: ecdsaValidator,
        },
        entryPoint,
    });

    const response = account.address;
    mpcAuth.accountManager.setSmartContractAccount({ address: response });
    return response;
}
