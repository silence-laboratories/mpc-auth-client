import { createViemAccount } from "@/viemSigner";
import { getSilentShareStorage } from "@/mpc/storage/wallet";
import * as store from "@/mpc/storage/account";
import { Presets } from "userop";
import { ENTRYPOINT_ADDRESS_V07, bundlerActions, walletClientToSmartAccountSigner } from "permissionless"
import { createPublicClient, createWalletClient, Hex, http } from "viem";
import { sepolia } from "viem/chains";
import {
    createKernelAccount,
    createZeroDevPaymasterClient,
    createKernelAccountClient,
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
          "https://rpc.zerodev.app/api/v2/bundler/521c47a3-535f-46db-ba5d-e0084aa0eedf"
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
