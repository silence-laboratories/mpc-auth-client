## MPC X AA CLI

This example is a basic command-line wallet application which uses the alchemy-sdk to build user operations.

## Prerequisites:

- **Build MPC Authenticator library**. Follow instruction in ["How to build" section](../../mpc/README.md#how-to-build)

- **Node Version:** Ensure you are using Node.js version 18.

## How to run

### Step 1: Clone the Repository

Clone the repository.

```bash
git clone https://github.com/silence-laboratories/mpc-account-abstraction-sdk
```

Navigate to the cli directory within the cloned repository:

```bash
cd packages/alchemy/cli
```

#### Set Up the RPC URL

- To set up the rpcUrl, create an instance at : [Alchemy](https://dashboard.alchemy.com/apps)
- Create an account or log in if you already have one.
- Click on the "Create new App" button and add the name,discrption and use case of the app.
- Once added,navigate to network tab and select API key corresponding to the sepolia network.
- Copy the API Key for your instance.

### Step 2: Setting Up Environment Variables

1. Create a `.env` file:

   - In the root of your project, create a new file named `.env`.

2. Fill in your Base urls and API keys in `.env`:

   - Replace `your_alchemy_api_key_here` with your actual alchemy's API key.
   - To run in development environment, add `NEXT_PUBLIC_SDK_MODE=development`.

     ```env
     API_KEY=your_alchemy_api_key_here
     NEXT_PUBLIC_SDK_MODE=development
     ```

### Step 3: Using the Silent Shard App

As defined earlier, this setup is between your CLI and the Silent Shard Mobile Application. To interact further with this setup, please install the Silent Shard App.

1. Download the Silent Shard App from:

   - [Apple App Store](https://apps.apple.com/us/app/silent-shard/id6468993285)
   - [Google Play Store](https://play.google.com/store/apps/details?id=com.silencelaboratories.silentshard&hl=kr&pli=1)

2. Press the "Connect new Account" button to initiate the QR scanner on the app to pair with the CLI.

## Step 4: Initialising and Distributed Key Generation

Initialize your local configuration by running the following command:

```bash
npm run init
```

A QR code will be generated on your CLI which must be scanned by the QR scanner on your mobile app (refer to Step 4). Note that during the account setup in the init step, the mobile app will ask you to set a password and backup option. For this CLI demo version, please skip all these steps.

Note that the QR code is time-limited, and will expire post 30 seconds of initiation. Upon expiry, you can run the above command again to generate a new QR code

A `config.json` file will be created. The file will look like this:

```json
{
    "pairingData": {
        "pairingId": "pairingId",
        "webEncPublicKey": "",
        "webEncPrivateKey": "",
        "webSignPublicKey": "",
        "webSignPrivateKey": "",
        "appPublicKey": "",
        "token": "",
        "tokenExpiration": ,
        "deviceName": "SilentShard: android, AP1A.240505.005"
    },
  "keygenResult": {
    "distributedKey": {
      "publicKey": "YourDistributedPublicKeyHere",
      "accountId": 1,
      "keyShareData": {
        "x1": "YourX1Here",
        "public_key": "YourPublicKeyHere",
        "paillier_private_key": {
          "p": "YourPaillierPHere",
          "q": "YourPaillierQHere"
        },
        "paillier_public_key": "YourPaillierPublicKeyHere"
      }
    },
    "elapsedTime": 2977,
    "deviceName": "SilentShard: android, AP1A.240505.005",
    "eoa": "0xa3f30a5a0c0ae1e7e5b0ca348b3eea6322c9de69"
  }
}
```

### Anatomy of the config.json file:

- `keygenResult`: Contains the result of the key generation process, including the distributed public key and key share data, along with the elapsed time for the operation.
- `pairingData`: Contains the pairing data, including the pairing ID, web encryption and signing keys, app public key, token, token expiration, and device name.

## Step 5: Create an account

Create a counterfactual address by running the command:

```bash
npm run simpleAccount address
```

A counterfactual address will be returned. At this point, the Smart Account has not been deployed. ERC-4337 account addresses are deterministic, so you don't need to deploy the contract to know its address.

## Step 6: Fund the account

You will now need to deposit the native token of the blockchain you are using into your new Smart Account. Since we are using the sepolia testnet, you will deposit sepolia ETH into the account.

Navigate to a faucet, such as [this link](https://cloud.google.com/application/web3/faucet/ethereum/sepolia). Enter the account address from Step 6 and claim the testnet token.

## Step 7: Initiate the transfer

The transfer command allows you to transfer the native token from the smart contract account to any address. It will create a User Operation, sign it, and send it to the Bundler:

```bash
npm run simpleAccount transfer -- --to <address> --amount <eth>
```

## Step 8: Approve the signature on the paired Mobile Application

When transferring the token to any address via this integration, your phone will receive a signature alert notification twice. You need to swipe right to approve the transaction. Once approved,you will see transaction hash.
