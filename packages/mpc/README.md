# MPC Authenticator JS library

## How to build this library for other repositories usage:

```bash
git clone https://github.com/silence-laboratories/mpc-account-abstraction-sdk.git
cd ./mpc-account-abstraction-sdk
npm i
cd ./packages/mpc
npm run build
```

## Components:

The library provides the following 2 main components:

1. MpcAuthenticator
2. MpcSigner

### MpcAuthenticator

The `MpcAuthenticator` class is designed to handle authentication processes using Multi-Party Computation (MPC) techniques. This class provides a secure way to authenticate users without exposing sensitive information to any single party.

An example of `MpcAuthenticator`:

```javascript
// MpcAuthenticator initialization
const mpcAuth = MpcAuthenticator.instance({
  walletId: WalletId.Biconomy,
  storagePlatform: StoragePlatform.CLI,
  customStorage: storage,
  isDev: process.env.NODE_ENV === "development",
});

// Use Silent Shard App to scan this generated QR
// How to install Silent Shard App: https://github.com/silence-laboratories/mpc-account-abstraction-sdk/tree/main/packages/biconomy/cli#step-4-using-the-silent-shard-app
const qrCode = await mpcAuth.initPairing();

// ... Scanning happens

const pairingSessionData = await mpcAuth.runStartPairingSession();
await mpcAuth.runEndPairingSession(pairingSessionData);

const keygenResult = await mpcAuth.runKeygen(); // Retrieve MPC keyshares after MPC Key Generation is done

await mpcAuth.runBackup("demopassword"); // (Optional) Sent backup to Silent Shard App for key restoration later
```

### MpcSigner

The `MpcSigner` class is responsible for signing Ethereum transactions and messages. It is inherited from ethers.js `Signer` class, so we could use it with any ethers.js compatible interfaces out-of-the-box.

An example of `MpcSigner` with Biconomy account creation:

```javascript
// MpcSigner initialization
const provider = new providers.JsonRpcProvider("https://rpc.sepolia.org");
const mpcSigner = await MpcSigner.instance(mpcAuth, provider); // Now, mpcSigner could be used to sign ETH transactions

const biconomySmartAccount = await createSmartAccountClient({
  signer: client as SupportedSigner,
  bundlerUrl: `https://bundler.biconomy.io/api/v2/11155111/${process.env.API_KEY}`,
});
```
