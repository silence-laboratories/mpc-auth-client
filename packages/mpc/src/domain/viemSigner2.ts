import type { DistributedKey } from "../storage/types";
import type { MpcAuthenticator } from "./authenticator";
import { BaseError, BaseErrorCode } from "../error";
import * as viem from 'viem';
import { toAccount } from 'viem/accounts';

async function signMessageWithSilentWallet(message: any, distributedKey: DistributedKey, mpcAuth: MpcAuthenticator) {
    const messageToBytes = viem.toBytes(message);
    const messageWithPrefix = viem.toPrefixedMessage({ raw: messageToBytes });
    const messageDigest = viem.hashMessage({ raw: messageToBytes });
    const key = await mpcAuth.getDistributionKey();
    const signature = await mpcAuth.runSign(
        "keccak256",
        messageWithPrefix,
        messageDigest,
        "eth_sign",
        key.accountId,
        key.keyShareData
    );

    const signBytes = Buffer.from(signature.signature, "hex");
    const r = viem.toHex(signBytes.subarray(0, 32));
    const s = viem.toHex(signBytes.subarray(32, 64));
    const recid = signature.recId;
    const v = recid === 0 ? BigInt(27) : BigInt(28);

    return { signature, r, s, v, recid };
}

async function createViemAccount(mpcAuth: MpcAuthenticator): Promise<viem.LocalAccount> {
    const distributedKey = await mpcAuth.getDistributionKey();
    const eoa = await mpcAuth.accountManager.getEoa();
    if (!eoa) {
        throw new BaseError(
            "Initialization failed: EOA not found",
            BaseErrorCode.WalletNotCreated,
        );
    }
    const signMessageWithSilentWalletBound = (message: any) => signMessageWithSilentWallet(message, distributedKey, mpcAuth);
    return toAccount({
        address: eoa as `0x${string}`,
        async signMessage({ message }) {

            message = (() => {
                if (typeof message === "string") {
                  return viem.stringToHex(message);
                }
                if (typeof message.raw === "string") {
                  return message.raw;
                }
                return viem.bytesToHex(message.raw);
              })();
            const sign = await signMessageWithSilentWalletBound(message);

            const signature: viem.Signature = {
                r: sign.r as viem.Hex,
                s: sign.s as viem.Hex,
                v: sign.v,
                yParity: sign.recid,
            };
            return viem.serializeSignature(signature);
        },
        async signTransaction(transaction) {
            const signTransaction = await signMessageWithSilentWalletBound(transaction);
            return viem.serializeTransaction(signTransaction);
        },
        async signTypedData(typedData) {
            const sign = await signMessageWithSilentWalletBound(typedData);

            const signature: viem.Signature = {
                r: sign.r as viem.Hex,
                s: sign.s as viem.Hex,
                v: sign.v,
                yParity: sign.recid,
            };
            return viem.serializeSignature(signature);
        },
    });
}

export { createViemAccount };
