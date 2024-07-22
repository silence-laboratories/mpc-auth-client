import { createViemAccount } from "@/viemSigner";
import { getSilentShareStorage } from "@/mpc/storage/wallet";
import * as store from "@/mpc/storage/account";
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import { createPublicClient, Hex, http } from "viem";

import {
    signerToSimpleSmartAccount,
} from "permissionless/accounts";
export async function mintWallet(eoa: { address: string }) {
    const keyshards = getSilentShareStorage();
    const distributedKey = keyshards.newPairingState?.distributedKey;
    const accountId = distributedKey?.accountId;
    const keyShareData = distributedKey?.keyShareData ?? null;
    const publicClient = createPublicClient({
        transport: http("https://rpc.ankr.com/eth_sepolia"),
    });
    const simpleAccount = await signerToSimpleSmartAccount(publicClient, {
        signer: await createViemAccount(
            keyShareData,
            eoa.address as Hex,
            accountId
        ),
        entryPoint: ENTRYPOINT_ADDRESS_V07,
        factoryAddress: "0x91E60e0613810449d098b0b5Ec8b51A0FE8c8985",
    });
    const response = simpleAccount.address;
    store.setSmartContractAccount({ address: response });

    return response;
}
