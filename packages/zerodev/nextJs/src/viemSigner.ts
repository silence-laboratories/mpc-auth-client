// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import * as viem from 'viem';
import { toAccount} from 'viem/accounts';
import * as index from "./mpc/index";




export async function createViemAccount(keyShareData:any,eoaAddress:viem.Address,accountId:any): Promise<viem.LocalAccount> {
    const address = eoaAddress;
    const publicKey = keyShareData.publicKey;
    return toAccount({
        address : address as `0x${string}`,
        async signMessage({ message }) {
            // console.log("message obj?", message);
            let messageString: viem.Hex | string;
            let messageBytes: Uint8Array;
        
            message = (() => {
              if (typeof message === "string") {
                // console.log("Message is a string");
                return viem.stringToHex(message);
              }
              if (typeof message.raw === "string") {
                // console.log("Message.raw is a string");
                return message.raw;
              }
              // console.log("Message.raw is not a string");
              return viem.bytesToHex(message.raw);
            })();
            
            const sign = await signMessageWithSilentWallet(message,accountId,keyShareData);
            // console.log("verify message props INSIDE", address, message, sign);
        
            const signature: viem.Signature = {
              r: sign.r as viem.Hex,
              s: sign.s as viem.Hex,
              v: sign.recid === 0 ? BigInt(27) : BigInt(28),
              yParity: sign.recid,
            };
            return viem.serializeSignature(signature);
          },
          async signTransaction(transaction) {
            const signTransaction = await signMessageWithSilentWallet(transaction,accountId,keyShareData);
            return viem.serializeTransaction(signTransaction);
          },
          async signTypedData(typedData) {
            const sign = await signMessageWithSilentWallet(typedData,accountId,keyShareData);
            // console.log("verify message props INSIDE", address, typedData, sign);
        
            const signature: viem.Signature = {
              r: sign.r as viem.Hex,
              s: sign.s as viem.Hex,
              v: sign.recid === 0 ? BigInt(27) : BigInt(28),
              yParity: sign.recid,
            };
            console.log("serialized signature", viem.serializeSignature(signature));
            return viem.serializeSignature(signature);
          },
        
        } );
}

export async function signMessageWithSilentWallet(message: any,accountId:number,keyShareData:any) {
    // console.log("signMessageWithSilentWallet message", message);
    const messageToBytes =  viem.toBytes(message);
    const messageWithPrefix = viem.toPrefixedMessage({raw : messageToBytes});
    const messageDigest = viem.hashMessage({raw : messageToBytes});
    const d = {
      hashAlg: "keccak256",
      message: messageWithPrefix,
      messageHashHex: messageDigest,
      signMetadata: "eth_sign",
      accountId: accountId,
      keyShare:keyShareData,
    };
  
    const signature = await index.runSign(
      "keccak256",
      messageWithPrefix,
      messageDigest,
      "eth_sign",
      accountId,
      keyShareData
    );
  
    const signBytes = Buffer.from(signature.signature, "hex");
    const r = viem.toHex(signBytes.subarray(0, 32));
    const s = viem.toHex(signBytes.subarray(32, 64));
    const recid = signature.recId;
    const v = recid === 0 ? BigInt(27) : BigInt(28);
   
    return { signature, r, s, v, recid };
  }
  