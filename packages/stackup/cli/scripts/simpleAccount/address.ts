// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import { Presets } from "userop";
// @ts-ignore
import config from "../../config.json";
import chalk from "chalk";
import { mpcAuth } from "../../mpc";
import { MpcSigner } from "@silencelaboratories/mpc-sdk";

export default async function main() {
  const signer = await MpcSigner.instance(mpcAuth);
  const simpleAccount = await Presets.Builder.SimpleAccount.init(
    signer,
    config.rpcUrl
  );
  const address = simpleAccount.getSender();

  console.log(chalk.blue(`SimpleAccount address: ${address}`));
}
