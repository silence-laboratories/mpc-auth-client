import * as sdk from './srcMpc/lib/sdk';
import { keccak256 } from "@ethersproject/keccak256";
import { hexlify } from 'ethers/lib/utils';


//just a testing file

async function main() {
    await sdk.initPairing();
    let result = await sdk.runPairing();
    console.log(result);
    let keygenResult = await sdk.runKeygen();
    console.log(keygenResult);
  


}

main();