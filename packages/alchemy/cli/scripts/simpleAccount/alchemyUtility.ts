// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import { Signer } from "ethers";
import { Address, SmartAccountSigner } from "@alchemy/aa-core";
import {
  Hex,
  SignableMessage,
  toBytes,
  TypedData,
  TypedDataDefinition,
} from "viem";

export const ethersToAccount = (signer: Signer): SmartAccountSigner<Signer> => {
  return {
    inner: signer,
    signerType: "json-rpc",
    getAddress: async () => signer.getAddress() as Promise<Address>,
    signMessage: async (msg: SignableMessage) => {
      let messageToSign: Uint8Array;
      if (typeof msg === "string") {
        messageToSign = toBytes(msg);
      } else {
        messageToSign = toBytes(msg.raw as Hex);
      }
      // Assuming signer.signMessage expects a Uint8Array or similar
      return (await signer.signMessage(messageToSign)) as `0x${string}`;
    },
    //@ts-ignore
    signTypedData: async <
      const TTypedData extends TypedData | { [key: string]: unknown },
      TPrimaryType extends string = string
    >(
      params: TypedDataDefinition<TTypedData, TPrimaryType>
    ): Promise<Hex> => {
      throw new Error(
        "signTypedData is not supported for ethers signers; use Wallet"
      );
    },
  };
};
