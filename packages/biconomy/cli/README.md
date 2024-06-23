# Getting started


### Step 1: Download

Clone the Biconomy ERC-4337 Examples repository to download the scripts. This example is a basic command-line wallet application.

```shell
git clone https://gitlab.com/com.silencelaboratories/experiments/biconomysdkxtwoparty.git
```
### Prerequisites:
* Use Node.js version 18 or greater.
* Obtain the NPM_TOKEN from your POC for library installations.
### Configuration Setup:
* Node Version:Ensure Node.js version 18
* NPM Token and Configuration:Acquire the NPM_TOKEN from POC for library installations("@silencelaboratories/ecdsa-tss").
* Create a .npmrc file in the root folder.
* Paste the following into the .npmrc file:
```shell
//registry.npmjs.org/:_authToken=<Your Auth Token>
```
<br>

You can also set the Auth token as an env Variable in a .env file as
```shell
NPM_TOKEN = "Your_Auth_Token"
```


### Step 2: Install

This example uses the userop.js library for building user operations. You can think of it like ethers.js but for ERC-4337. Install it, and all other dependencies.

```shell
npm install
```

### Step 3: Initialize your configuration

Further Instructions for Setup:
Initialize your local configuration by running the following command:

``` shell
yarn run smartAccount init --network=mumbai
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
  "INIT_CONFIG": {
    "accountIndex": 0,
    "chainId": 80001,
    "rpcUrl": "https://rpc.ankr.com/polygon_mumbai",
    "bundlerUrl": "https://bundler.biconomy.io/api/v2/80001/cJPK7B3ru.dd7f7861-190d-45ic-af80-6877f74b8f44",
    "biconomyPaymasterUrl": "https://paymaster.biconomy.io/api/v1/80001/<YOUR_PAYMASTER_API_KEY_FROM_DASHBOARD>",
    "preferredToken": "",
    "tokenList": []
  },
  "silentSigner": {
    "_isSigner": true,
    "address": "0x9B15f9df556b7ff9f0718DcDF12c386A05a8C1ae",
    "public_key": "e39e5ac68d22326b46525ee5b83da62884f935337b507333f9167a20eebec5595be6d902dc9f2df539478cfc5a0a246a3eb4484ff17eba7dd8a8cd64ea782741",
    "p1KeyShare": {
      "x1": "c647669aaa39a9ed70dc0e7c8850ddd9d326ee59202b237029cfb2968d0161a5",
      "public_key": "e39e5ac68d22326b46525ee5b83da62884f935337b507333f9167a20eebec5595be6d902dc9f2df539478cfc5a0a246a3eb4484ff17eba7dd8a8cd64ea782741",
      "paillier_private_key": {
        "p": "AWnU9vQSTm7KOq7zK3/Fb7yLx28DwxwkW2lZien9ZA6VyUCeFOksYe1rNH272zmcazd9giewcvIsDTXi+gsYZhyFz49fjelTpuGnqPFdGUn20L16jJ2ybZJAZvfGkaOy7vx8IPg4NKBinXgHHfYEtkqWZRs7Z5YDGdXZ4l/vrBN3",
        "q": "s4sOMRIHYX9IZcvurLpBFpnvdbkqb+qkytdjeuFOIOhLyOcizgOq+JL9a5fHai4tT0FJJ2z7WO0h2VQbdszESh2cLlCaTEUUf2cBu9F81jNb3MIKTHG23CXrs4TQk8pxyzVwoqO7poRxeghTFEWUjwtFy2m8ZEp+t1EdMH9I19k="
      },
      "paillier_public_key": "/cRzXcASzcLcaz2bl66YRBljLbPdVXFjp3UNZGfTglKsBCDWlV4okKyxcvg1noDFt9/C8cuTqUh89//yi/zIW3vL9WMRTv+qoXeh1QMQqChyh4tV/JR8kcpofozhFTgLvow+qFlpenHmqfVHM4mpgzoUSM7vjRKHknV3i/oT/jcKOwWaJI//EoNgEw7r5cYCpzcGYylKnD5+A1J5dwgHSv9bqsaJC4OssRJ4ipevuMtJIj3JRRxh3ALVOqPE61wkgKLMXLvShvRs9h1X1klrhhNOXGguKXUoz6xxUKqXs4hSl8MMz7OQMYYpKpGP6ZcCn3Dwuyoasict0Fz5L61w3w=="
    },
    "keygenResult": {
      "distributedKey": {
        "publicKey": "e39e5ac68d22326b46525ee5b83da62884f935337b507333f9167a20eebec5595be6d902dc9f2df539478cfc5a0a246a3eb4484ff17eba7dd8a8cd64ea782741",
        "accountId": 1,
        "keyShareData": {
          "x1": "c647669aaa39a9ed70dc0e7c8850ddd9d326ee59202b237029cfb2968d0161a5",
          "public_key": "e39e5ac68d22326b46525ee5b83da62884f935337b507333f9167a20eebec5595be6d902dc9f2df539478cfc5a0a246a3eb4484ff17eba7dd8a8cd64ea782741",
          "paillier_private_key": {
            "p": "AWnU9vQSTm7KOq7zK3/Fb7yLx28DwxwkW2lZien9ZA6VyUCeFOksYe1rNH272zmcazd9giewcvIsDTXi+gsYZhyFz49fjelTpuGnqPFdGUn20L16jJ2ybZJAZvfGkaOy7vx8IPg4NKBinXgHHfYEtkqWZRs7Z5YDGdXZ4l/vrBN3",
            "q": "s4sOMRIHYX9IZcvurLpBFpnvdbkqb+qkytdjeuFOIOhLyOcizgOq+JL9a5fHai4tT0FJJ2z7WO0h2VQbdszESh2cLlCaTEUUf2cBu9F81jNb3MIKTHG23CXrs4TQk8pxyzVwoqO7poRxeghTFEWUjwtFy2m8ZEp+t1EdMH9I19k="
          },
          "paillier_public_key": "/cRzXcASzcLcaz2bl66YRBljLbPdVXFjp3UNZGfTglKsBCDWlV4okKyxcvg1noDFt9/C8cuTqUh89//yi/zIW3vL9WMRTv+qoXeh1QMQqChyh4tV/JR8kcpofozhFTgLvow+qFlpenHmqfVHM4mpgzoUSM7vjRKHknV3i/oT/jcKOwWaJI//EoNgEw7r5cYCpzcGYylKnD5+A1J5dwgHSv9bqsaJC4OssRJ4ipevuMtJIj3JRRxh3ALVOqPE61wkgKLMXLvShvRs9h1X1klrhhNOXGguKXUoz6xxUKqXs4hSl8MMz7OQMYYpKpGP6ZcCn3Dwuyoasict0Fz5L61w3w=="
        }
      },
      "elapsedTime": 3553
    }
  }
}

```



### Step 3: Create an account

Create an account using the factory `simpleAccountFactory` defined in the configuration file.

```shell
yarn run smartAccount address
```

An address will be returned. At this point, the Smart Account has not been deployed. ERC-4337 account addresses are deterministic, so you don't need to deploy the contract to know its address.

### Step 5: Fund the account

You will now need to deposit the native token of the blockchain you are using into your new Smart Account. Since this tutorial uses the Polygon Mumbai testnet, you will deposit MATIC into the account on Mumbai.

Navigate to a faucet, such as https://faucet.polygon.technology/. Enter the account address from step 4 and claim the testnet token.

**Note:** Faucets do not send directly to smart contracts. You must deposit tokens from the faucet before your first transaction.

### Step 6: Initiate the transfer

The `simpleAccount transfer` command allows you to transfer the native token from the smart contract account to any address. It will create a User Operation, sign it, and send it to the Bundler:

```shell
# replace the receiver below
yarn run smartAccount transfer --to=0x1234567890123456789012345678901234567890 --amount=0.001

# replace the token address and receiver below
yarn run smartAccount erc20Transfer --to=0x1234567890123456789012345678901234567890 --amount=0.1 --token=0xdA5289fCAAF71d52a80A254da614a192b693e977
```

# License

Distributed under the MIT License. See [LICENSE](./LICENSE) for more information.


















