import { SilentWallet } from "@/silentWallet";
import { getSilentShareStorage } from "@/mpc/storage/wallet";
import * as store from "@/mpc/storage/account";
import { Client, Presets } from "userop";
import { Address } from "@ethereumjs/util";
import { ethers } from "ethers";

export async function sendTransaction(recipientAddress: string, amount: string) {
    const requestData = {
        to: recipientAddress,
        amount: convertEtherToWei(amount),
    };

    console.log("requestData",requestData)
    // TODO: Move this to `mpc`
    const keyshards = getSilentShareStorage();
    const distributedKey = keyshards.newPairingState?.distributedKey;
    const simpleAccount = await Presets.Builder.SimpleAccount.init(
        new SilentWallet(
            store.getEoa().address,
            distributedKey?.publicKey as string,
            distributedKey?.keyShareData,
            { distributedKey }
        ),
        "https://api.stackup.sh/v1/node/32bbc56086c93278c34d5b3376a487e6b57147f052ec41688c1ad65bd984af7e"
    );
    const client = await Client.init(
        "https://api.stackup.sh/v1/node/32bbc56086c93278c34d5b3376a487e6b57147f052ec41688c1ad65bd984af7e"
    );
    try{
    const target = ethers.utils.getAddress(requestData.to);
    const value = requestData.amount;

    console.log("requestData",requestData)
    const res = await client.sendUserOperation(
        simpleAccount.execute(target, value, "0x"),
        {
          // Add necessary options as needed
            onBuild: (op) => console.log("Signed UserOperation:", op),
        }
    );
    console.log("userOp Hash", res.userOpHash);

    const ev = await res.wait();
    console.log("transactionHash", ev?.transactionHash ?? null);

    return {success:true,transactionHash:ev?.transactionHash ?? null, userOpHash:res.userOpHash}
    }
    catch(error){
        console.log("transaction error :",error)
        return {success:false,error:error}
    }
}

function convertEtherToWei(etherString: string) {
    const ether = Number(etherString);
    const weiString = (ether * 1e18).toString();
    return BigInt(weiString);
}