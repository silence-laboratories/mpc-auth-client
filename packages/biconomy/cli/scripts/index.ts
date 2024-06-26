

// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import yargs from "yargs";
import chalk from "chalk";
import { hideBin } from 'yargs/helpers';
import { init } from "./init";
import { getAddress } from "./address";
import { nativeTransferPayERC20 } from "./erc20/nativeTransfer";
import { erc20TransferPayERC20 } from "./erc20/erc20Transfer";
import { mintNftPayERC20 } from "./erc20/mintNFT";

const argv = yargs(hideBin(process.argv))
  .scriptName(chalk.green("smartAccount"))
  .usage("$0 <command> [options]")
  .demandCommand(1, chalk.red.bold("You must specify a command."))
  .recommendCommands()
  // Initialize config file
  .command(
    "init",
    chalk.blue("Create a config file"),
    {
      network: {
        describe: chalk.cyan("Choose chain type"),
        type: "string",
      },
    },
    ({ network }) => {
      console.log(
        chalk.magenta(`Initializing config for ${network || 'default'} network`)
      );
      init(network || "");
    }
  )
  // Get SmartAccount address
  .command("address", chalk.blue("Get counterfactual address"), {}, getAddress)
  // Transfer native assets (ether)
  .command(
    "transfer",
    chalk.blue("Transfer native (ether/matic)"),
    {
      to: {
        describe: chalk.cyan("Recipient address"),
        demandOption: true,
        type: "string",
        default: process.env.TO,
      },
      amount: {
        describe: chalk.cyan("Amount of ether to transfer"),
        demandOption: true,
        type: "number",
        default: process.env.AMOUNT,
      },
      mode: {
        describe: chalk.cyan("Paymaster mode"),
        type: "string",
      },
    },
    ({ amount, to, mode }) => {
      console.log(
        chalk.magenta(`Transferring ${amount} ether to ${to}...`)
      );
      if (argv.mode === "TOKEN") {
        nativeTransferPayERC20(recipientAddress, amount);
      } else {
        nativeTransferPayERC20(recipientAddress, amount);
      }
    }
  )
  // Transfer an ERC20 token
  .command(
    "erc20Transfer",
    chalk.blue("Transfer an ERC20 token"),
    {
      to: {
        describe: chalk.cyan("Recipient address"),
        demandOption: true,
        type: "string",
      },
      amount: {
        describe: chalk.cyan("Amount of tokens to transfer"),
        demandOption: true,
        type: "number",
      },
      token: {
        describe: chalk.cyan("Token address"),
        demandOption: true,
        type: "string",
      },
      mode: {
        describe: chalk.cyan("Paymaster mode"),
        demandOption: false,
        type: "string",
      },
    },
    (argv) => {
      const amount = argv.amount;
      const tokenAddress = argv.token;
      const recipientAddress = argv.to;
      console.log(
        chalk.magenta(
          `Transferring ${amount} tokens of ${tokenAddress} to ${recipientAddress}...`
        )
      );
      if (argv.mode === "TOKEN") {
        erc20TransferPayERC20(recipientAddress, amount, tokenAddress);
      }
    }
  )
  // Mint nft token to SmartAccount
  .command(
    "mint",
    chalk.blue("Mint nft token"),
    {
      mode: {
        describe: chalk.cyan("Paymaster mode"),
        demandOption: false,
        type: "string",
      },
    },
    (argv) => {
      console.log(chalk.magenta("Minting an NFT token to the SmartAccount..."));
      if (argv.mode === "TOKEN") {
        mintNftPayERC20();
      }
    }
  )
  // Batch mint nft token to SmartAccount
  .command(
    "batchMint",
    chalk.blue("Batch mint nft 2 times"),
    {
      mode: {
        describe: chalk.cyan("Paymaster mode"),
        demandOption: false,
        type: "string",
      },
    },
    (argv) => {
      console.log(
        chalk.magenta("Batch minting 2 NFT tokens to the SmartAccount...")
      );
    }
  )
  .help().argv;
      nativeTransferPayERC20(to, Number(amount));
    }
  )

  
  .help()
  .parse();

export default argv;
