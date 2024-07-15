# MPC Authenticator JS library

## Getting started

Install the SDK:

```sh
npm i --save @silencelaboratories/mpc-sdk
```

## Overview:

The library provides the following 2 main components:

1. MpcAuthenticator
2. MpcSigner

### MpcAuthenticator

The `MpcAuthenticator` class is designed to handle authentication processes using MPC SDK for {2,2} TSS.


```javascript
import { MpcAuthenticator, StoragePlatform, WalletId } from "@silencelaboratories/mpc-sdk";

// 1. Set up MpcAuthenticator with custom storage and development mode
const mpcAuth = MpcAuthenticator.instance({
  walletId: WalletId.Biconomy,
  storagePlatform: StoragePlatform.CLI,
  customStorage: storage,
  isDev: process.env.NODE_ENV === "development",
});

// 2. Generate QR code for Silent Shard App pairing
const qrCode = await mpcAuth.initPairing();

// ... Scanning happens

const pairingSessionData = await mpcAuth.runStartPairingSession();
await mpcAuth.runEndPairingSession(pairingSessionData);

// 3. Key generation after pairing is done
const keygenResult = await mpcAuth.runKeygen(); // The generated keyshares will be stored to do signing later

// 4. (Optional) Sent backup to Silent Shard App for key restoration later
await mpcAuth.runBackup("demopassword"); 
```

### MpcSigner

The `MpcSigner` class is designed for signing Ethereum transactions and messages using `MpcAuthenticator` keyshares.

An example of `MpcSigner` with `Biconomy` account creation:

```javascript
// MpcSigner initialization
const provider = new providers.JsonRpcProvider("https://rpc.sepolia.org");
const mpcSigner = await MpcSigner.instance(mpcAuth, provider); // Now, mpcSigner could be used to sign ETH transactions

const biconomySmartAccount = await createSmartAccountClient({
  signer: client as SupportedSigner,
  bundlerUrl: `https://bundler.biconomy.io/api/v2/11155111/${process.env.API_KEY}`,
});
```

### Error codes

The library provides the following error codes:

```typescript
enum MpcErrorCode {
	StorageWriteFailed = 1,
	StorageFetchFailed = 2,
	HttpError = 3,
	// Action errors
	PairingFailed = 4,
	KeygenFailed = 5,
	BackupFailed = 6,
	SignFailed = 7,

	KeygenResourceBusy = 8,
	SignResourceBusy = 9,
	InternalLibError = 10,
	PhoneDenied = 11,
	InvalidBackupData = 12,
	InvalidMessageHashLength = 13,
	WalletNotCreated = 14,
	UnknownError = 15,
}
```


## How to build:

```bash
git clone https://github.com/silence-laboratories/mpc-account-abstraction-sdk.git
cd ./mpc-account-abstraction-sdk
npm i
cd ./packages/mpc
npm run build
```
