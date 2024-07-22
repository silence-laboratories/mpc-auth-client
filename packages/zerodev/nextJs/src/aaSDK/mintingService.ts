import { createViemAccount } from "@/viemSigner";
import { getSilentShareStorage } from "@/mpc/storage/wallet";
import * as store from "@/mpc/storage/account";
import { ENTRYPOINT_ADDRESS_V07, walletClientToSmartAccountSigner } from "permissionless"
import { createPublicClient, createWalletClient, Hex, http } from "viem";
import { sepolia } from "viem/chains";
import {
    createKernelAccount
  } from "@zerodev/sdk"
  import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator"
export async function mintWallet(eoa: { address: string; }) {
    const keyshards = getSilentShareStorage();
    const distributedKey = keyshards.newPairingState?.distributedKey;
    const accountId =distributedKey?.accountId;
    const keyShareData = distributedKey?.keyShareData ?? null;
    const walletClient = createWalletClient({
        account: await createViemAccount(keyShareData, eoa.address as Hex,accountId),
        chain: sepolia,
        transport: http(
          `https://rpc.zerodev.app/api/v2/bundler/${process.env.API_KEY}`
        ),
      });
     
    const smartAccountSigner = walletClientToSmartAccountSigner(walletClient);

    const publicClient = createPublicClient({
        transport: http("https://rpc.ankr.com/eth_sepolia"),
    })
    const entryPoint = ENTRYPOINT_ADDRESS_V07

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
    store.setSmartContractAccount({ address: response });
    return response;
}
