// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import { Presets } from "userop";
// @ts-ignore
import config from "../../config.json";
import { SilentWallet } from "../../silentWallet";
import chalk from "chalk";
import { mpcSdk } from "../../mpc";

export default async function main() {
  const simpleAccount = await Presets.Builder.SimpleAccount.init(
    new SilentWallet(
      config.address,
      config.public_key,
      config.p1KeyShare,
      config.keygenResult,
      mpcSdk
    ),
    config.rpcUrl
  );
  const address = simpleAccount.getSender();

  console.log(chalk.blue(`SimpleAccount address: ${address}`));
}
