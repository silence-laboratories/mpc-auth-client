## MPC X AA DApp
 A NextJs app that uses the Biconomy AA SDK. This DApp allows users to pair with the silent Shard app, mint a smart contact account, and create transactions on the blockchain.

## Prerequisites:
- Node.js v16.13.0 or higher
- Build MPC Authenticator library, follow instruction in [packages/mpc README](../../mpc/README.md)

## Setting Up Development Environment

1. Clone the repository.

 ```bash
  git clone https://github.com/silence-laboratories/mpc-account-abstraction-sdk
 ```

- Navigate to the nextJs directory within the cloned repository:

  ```bash
  cd packages/biconomy/nextJs
  ```

2. Create a .env file:
- In the root of your project, create a new file named .env

- Fill in your API keys in .env:
    ``` bash
    API_KEY = your_biconomy_api_key_here #update this API key using step 3 below
    NODE_ENV=development #only require for development
    ```
3. Set the rpcUrl:
- To set up the rpcUrl, create an instance at :
- Create an account or log in if you already have one.
- Select the Sepolia network for your instance.
- Once the instance is created, navigate to the "Bundlers" tab
- The API Key is the string after the chain ID in the testnet Bundler's URL 
- Copy the API Key for your instance.

## How to run
Make sure you've done all the steps mentioned above. Run command:

```sh
npm run dev
```

If you see the error below:

```sh
npm ERR! code ENOWORKSPACES
npm ERR! This command does not support workspaces.
```

It is an [issue](https://github.com/vercel/next.js/issues/47121) of NextJS with npm workspace.
You could ignore the error or skips the error by running the command `npx next telemetry disable`

**Note:** The dapp is required to run on port 3000 only, if we don't strictly run dapp at http://localhost:3000/ the functionality of the dapp will not work as expected.

## Using the Silent Shard App to interact with the DApp
To interact with QR codes essential for this setup, you'll need to use the Silent Shard app. Follow these steps:
1. Download the App:
 - Get the Silent Shard app from the Google Play Store.
2. Scan the QR Code:
 - Launch the Silent Shard app and use it to scan the QR code provided during the setup process. This step is crucial for continued configuration.

Do note that the QR code is time-limited, and will expire post 30 seconds. Post which you can initiate a new QR creation.


