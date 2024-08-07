import type { DistributedKey } from "../storage/types";
import type { MpcAuthenticator } from "./authenticator";
import { BaseError, BaseErrorCode } from "../error";
import * as viem from 'viem';
import { toAccount } from 'viem/accounts';

export class ViemSigner {
    mpcAuth: MpcAuthenticator;
    #distributedKey?: DistributedKey;
    #address?: string;
    #viemAccount?: viem.LocalAccount;
    static #instance: ViemSigner | null = null;

    static instance = async (mpcAuth: MpcAuthenticator) => {
        if (ViemSigner.#instance === null) {
            ViemSigner.#instance = new ViemSigner(mpcAuth);
            await ViemSigner.#instance.#build();
        }
        return ViemSigner.#instance;
    };

    constructor(mpcAuth: MpcAuthenticator) {
        this.mpcAuth = mpcAuth;
    }

    #build = async () => {
        const distributedKey = await this.mpcAuth.getDistributionKey();
        this.#distributedKey = distributedKey;
        const eoa = await this.mpcAuth.accountManager.getEoa() as viem.Hex;
        if (!eoa) {
            throw new BaseError(
                "Init Signer failed due to EOA not found",
                BaseErrorCode.WalletNotCreated,
            );
        }
        this.#address = eoa as viem.Hex;
        this.#viemAccount = await this.createViemAccount(distributedKey, eoa);
    };

    getAddress = async (): Promise<string> => {
        if (!this.#address) {
            throw new BaseError("Address not found", BaseErrorCode.WalletNotCreated);
        }
        return this.#address;
    };

    getViemAccount = async (): Promise<viem.LocalAccount> => {
        if (!this.#viemAccount) {
            throw new BaseError("Viem account not created", BaseErrorCode.WalletNotCreated);
        }
        return this.#viemAccount;
    };

    signMessageWithSilentWallet = async (message: any, accountId: number, keyShareData: any) => {
        const messageToBytes = viem.toBytes(message);
        const messageWithPrefix = viem.toPrefixedMessage({ raw: messageToBytes });
        const messageDigest = viem.hashMessage({ raw: messageToBytes });
        const d = {
            hashAlg: "keccak256",
            message: messageWithPrefix,
            messageHashHex: messageDigest,
            signMetadata: "eth_sign",
            accountId: accountId,
            keyShare: keyShareData,
        };

        const signature = await this.mpcAuth.runSign(
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
    };

    createViemAccount = async (keyShareData: DistributedKey, eoaAddress: viem.Address): Promise<viem.LocalAccount> => {
        const address = eoaAddress;
        const accountId = keyShareData.accountId;
        const publicKey = keyShareData.publicKey;
        const signMessageWithSilentWallet = this.signMessageWithSilentWallet.bind(this);

        return toAccount({
            address: address as `0x${string}`,
            async signMessage({ message }) {
                let messageString: viem.Hex | string;
                let messageBytes: Uint8Array;

                message = (() => {
                    if (typeof message === "string") {
                        return viem.stringToHex(message);
                    }
                    if (typeof message.raw === "string") {
                        return message.raw;
                    }
                    return viem.bytesToHex(message.raw);
                })();

                const sign = await signMessageWithSilentWallet(message, accountId, keyShareData);

                const signature: viem.Signature = {
                    r: sign.r as viem.Hex,
                    s: sign.s as viem.Hex,
                    v: sign.recid === 0 ? BigInt(27) : BigInt(28),
                    yParity: sign.recid,
                };
                return viem.serializeSignature(signature);
            },
            async signTransaction(transaction) {
                const signTransaction = await signMessageWithSilentWallet(transaction, accountId, keyShareData);
                return viem.serializeTransaction(signTransaction);
            },
            async signTypedData(typedData) {
                const sign = await signMessageWithSilentWallet(typedData, accountId, keyShareData);

                const signature: viem.Signature = {
                    r: sign.r as viem.Hex,
                    s: sign.s as viem.Hex,
                    v: sign.recid === 0 ? BigInt(27) : BigInt(28),
                    yParity: sign.recid,
                };
                return viem.serializeSignature(signature);
            },
        });
    }
}
