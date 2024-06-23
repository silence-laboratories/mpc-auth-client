# Getting started

## Key component

```
-src/
   -abi.ts
   -call/
   -index.ts
   -types.ts
-scripts/
   -init.ts: Contains initialization logic for the scripts.
   -kernel/: This directory contains files that handle kernel-related functionalities, such as transactions and addressing.
   -simpleAccount/: This directory contains files that handle functionalities related to simple account operations, such as transfers and ERC20 operations.
-silentWallet.ts
-srcSdk/
  -lib/
    --actions/
     --backUp.ts
     --keygen.ts
     --pairing.ts
     --sign.ts
    -entropy.ts
    -sdk.ts
    -storage.ts
    -utils.ts
  -error.ts
  -firebaseEndpoints.ts
  -permission.ts

```

### Video runthrough: [Link](https://drive.google.com/file/d/1NJXVWYt8jIQtdy-8KNI5SmRsQpcpjTLM/view?usp=sharing)


### Step 1: Download

Clone the ERC-4337 Examples repository to download the scripts. This example is a basic command-line wallet application.

```shell
git clone https://gitlab.com/com.silencelaboratories/experiments/erc-4337-examples.git
```
### Prerequisites:
* Use Node.js version 18 or greater.

### Configuration Setup:
* Node Version:Ensure Node.js version 18


### Step 2: Install

This example uses the userop.js library for building user operations. You can think of it like ethers.js but for ERC-4337. Install it, and all other dependencies.

```shell
npm install
```

### Step 3: Initialize your configuration

Further Instructions for Setup:
Initialize your local configuration by running the following command:

``` shell
npm run init
```
### Using the Silent Shard App

To interact with QR codes essential for this setup, you'll need to use the Silent Shard app. Follow these steps:

1. **Download the App**:
   - Get the [Silent Shard app](https://play.google.com/store/apps/details?id=com.silencelaboratories.silentshard&pcampaignid=web_share) from the Google Play Store.

2. **Scan the QR Code**:
   - Launch the Silent Shard app and use it to scan the QR code provided during the setup process. This step is crucial for continued configuration.


Do note that the QR code is time limited, and will expire post 30 seconds. Post which you can initiate a new QR creation.

<br>

A `config.json` file will be created. The file will look like this:

```json
{
  "rpcUrl": "https://api.stackup.sh/v1/node/88b9386910e64c14fd00cb2342c5e4a8f78b9789b5e7c592e64b2dbe3442e633",
  "paymaster": {
    "rpcUrl": "https://api.stackup.sh/v1/paymaster/88b9386910e64c14fd00cb2342c5e4a8f78b9789b5e7c592e64b2dbe3442e633",
    "context": {}
  },
  "_isSigner": true,
  "address": "0xfc0470608Df27E5Ea585fD9F556cC056adA33d9d",
  "public_key": "0e68470f1e8c857a67207ce57e05e4dcce2e8875f2808107cffc521b5409dafa818d211fdb4a77dc55b6fc0eedd196ba7dbe82bcb6611f5e4dd9b46a0110c40d",
  "keyshares": [
    {
      "x1": "a3672a6dc25a5b7b7831323b114396ff98f577a58eb6f18e1159178609a00880",
      "public_key": "0e68470f1e8c857a67207ce57e05e4dcce2e8875f2808107cffc521b5409dafa818d211fdb4a77dc55b6fc0eedd196ba7dbe82bcb6611f5e4dd9b46a0110c40d",
      "paillier_private_key": {
        "p": "ATfacFrnINRWtmFmmVXCFNXnvtuyecF0oB9a7Dq02M4flYfT4AKre5STvQh53GOCzhoYSodjouhHq/GPVT2yb6T7YPkFF8gvPUs9YH2A/5vp6i/33t4zQCTI/W83ErZTofITT/dShpa5LDhPvQjtU02IQfOjgXzMmpKeXlUqiuOz",
        "q": "z9orKZt252QAzbrmy9T/zjosr4fESpSEJmFocHB6J8ajSYyr6mwzG36iB7vqVBdDPXHX0678Uh1GT72ElciRsH2WRT+EtnOkgUMUhLeFLTwnapTaqlF8/dfUHxv9SCOElkD57+ow+lQHdkzrpX5hM2HQ0gZofl8FGYRB32s0tpk="
      },
      "paillier_public_key": "/TNlcY6Ju584xJTKCo4jCMetjuQCuzl1vrAFx5uQp5FDRTr2JCNuECnVgz3X64VlpZsTvT7An4p8Iw2Pn+iNZs9QmmlvVIs+N97PkWYgQbxpbBUxaYkXV9oiHG5dJiJXnQ0M+d2gRnFMcI4tDyduMQrLI11whMWMOpIjaKjciihLgirj8BXY3pEYcNKc4EuSzsKtR0Y090KEVMu8Ea1ztinu9vWQL0lvfruLeKsdXHQWs5HYbhKjJZBY+vmHbYsuRXUitXF7dpacObH03MNC2O4j+u4VCWFX7v+XQaXb5mVxFwkIF/pwsZiQR+iQfilzpmvX5lQDUY0v5Gp0PD9X+w=="
    },
    {
      "x2": "c4f7eb2f4cf93f97b85119121a2ab5060d577cfe7565c8e73250b473ff5ee4d9",
      "public_key": "0e68470f1e8c857a67207ce57e05e4dcce2e8875f2808107cffc521b5409dafa818d211fdb4a77dc55b6fc0eedd196ba7dbe82bcb6611f5e4dd9b46a0110c40d",
      "c_key_x1": "DsCbBtNItrpavkEZOvqUXwXJTFq0fkBSvZa22NEjbwx5aW7eCo+ZmtWHReebsLc1ZvTtUj3+7Nm84m0NlT5DCZoXxduyhLydbSnrHHY9TZi9BVI6FpTSazbyUALbjwnKaAoeRiwyH3mh6Krg4poqybVpLN45GeirW6Ox/9p9Q3Du6n8QRO6AKD+PL3B9uD2DWBIYRxr6qi/BTSY0AbaKw2P5D5XFBQHi4aAxyPOFE7/TidRRY4G1d9iNmCcpLi6ENSaSKNUHrPNAHaiya8325r7NCUtJlyL7hZPMGB5SqI+AG7slC1cAbEWLG9z7cprEQ6H12AR+aBQ/1vbSzpq1RGCYNBzvdBuXaVUePgKOh7LHk2A0sjJJLupWmAD0ItSL9KOnvJuPZmxjZdRBMcZCbgdqraOq4wBXQ3FHFHo4+npQvK/v+sptjYahaUYpjvMGRfhaJMJvcsMSnckiVR9vowrSlUzjRfgattKBOaUyCipVRbn+SyUGvVrqmWJfNSUzmaCU9tuLO5vHA9tV+7KGO9eW1OBoqSs8wjaIe2gy944qldQmCe7097Fjvcimuo0tdva37DHFNLXbzz0KQnSBmsn9hc+ceAcDbmUls3cMWxi0MQwojKYHw3udwEDim45Usneu1PG3PYIkHGJJy1uz4yNixC/JY+VY7ETpHAVE/zI=",
      "paillier_public_key": "/TNlcY6Ju584xJTKCo4jCMetjuQCuzl1vrAFx5uQp5FDRTr2JCNuECnVgz3X64VlpZsTvT7An4p8Iw2Pn+iNZs9QmmlvVIs+N97PkWYgQbxpbBUxaYkXV9oiHG5dJiJXnQ0M+d2gRnFMcI4tDyduMQrLI11whMWMOpIjaKjciihLgirj8BXY3pEYcNKc4EuSzsKtR0Y090KEVMu8Ea1ztinu9vWQL0lvfruLeKsdXHQWs5HYbhKjJZBY+vmHbYsuRXUitXF7dpacObH03MNC2O4j+u4VCWFX7v+XQaXb5mVxFwkIF/pwsZiQR+iQfilzpmvX5lQDUY0v5Gp0PD9X+w=="
    }
  ]
}
```

Anatomy of the `config.json` file:

- `rpcUrl`: URL of an ERC-4337 bundler and node
- `signingKey`: Private key that can sign transactions for the Smart Account
- `entryPoint`: Address of the EntryPoint contract
- `simpleAccountFactory`: Address of the factory that will create the account
- `paymaster`: URL of the Paymaster service you are using and context (optional)

In this quick start, you will only need to set the `rpcUrl`.

#### Set the rpcUrl

You can create a free bundler instance at app.stackup.sh. Create an account and select the Polygon Mumbai network for the instance and ensure the version is set to 0.6.x. Once the instance is created, click the copy icon to view the instance URL. Copy it and replace the default `rpcUrl` in `config.json` with the generated address.

Copy the RPC URL from the Stackup user portal.

You can leave the paymaster blank. If you want to try a paymaster, see the Paymaster Example.

### Step 4: Create an account

Create an account using the factory `simpleAccountFactory` defined in the configuration file.

```shell
npm run simpleAccount address
```

An address will be returned. At this point, the Smart Account has not been deployed. ERC-4337 account addresses are deterministic, so you don't need to deploy the contract to know its address.

### Step 5: Fund the account

You will now need to deposit the native token of the blockchain you are using into your new Smart Account. Since this tutorial uses the Polygon Mumbai testnet, you will deposit MATIC into the account on Mumbai.

Navigate to a faucet, such as https://faucet.polygon.technology/. Enter the account address from step 4 and claim the testnet token.

**Note:** Faucets do not send directly to smart contracts. You must deposit tokens from the faucet before your first transaction.

### Step 6: Initiate the transfer

The `simpleAccount transfer` command allows you to transfer the native token from the smart contract account to any address. It will create a User Operation, sign it, and send it to the Bundler:

```shell
npm run simpleAccount transfer --  --to <address> --amount <eth>
```

The implementation for all commands are located in the [scripts directory](./scripts/). All scripts are built with the following open source packages:

- Sample contracts: [eth-infinitism/account-abstraction](https://github.com/eth-infinitism/account-abstraction)
- ZeroDev Kernel contracts: [zerodevapp/kernel](https://github.com/zerodevapp/kernel)
- JS SDK: [userop.js](https://github.com/stackup-wallet/userop.js)

