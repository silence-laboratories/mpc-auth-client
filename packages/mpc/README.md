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
  isDev: process.env.NEXT_PUBLIC_SDK_MODE === "development",
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

#### MpcAuthenticator options

- `walletId` - Supported Wallet ID to use for identifying the wallet. Check `WalletId` enum for available options.
- `storagePlatform` - Supported Storage platform to use for storing keyshares and pairing data. Check `StoragePlatform` enum for available options.
- `customStorage` - Custom storage object to use for storing keyshares and pairing data. If not provided, the library will use the default storage, which is `localStorage` (assuming the library is used in the browser).
- `isDev` - Development mode flag. If set to `true`, the library will use the development mode for the MPC SDK.

#### Custom Storage

The library provides a way to use custom storage for data storing. The custom storage must implement `IStorage` interface, `MpcAuthenticator` will access the storage using the provided methods.

```typescript
interface IStorage {
	clearStorageData: () => Promise<void>;
	setStorageData: (data: StorageData) => Promise<void>;
	getStorageData: () => Promise<StorageData>;
	migrate?(): void;
}
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
enum BaseErrorCode {
	StorageWriteFailed = 1,
	StorageFetchFailed = 2,
	HttpError = 3,
	// Action errors
	PairingFailed = 4,
	KeygenFailed = 5,
	BackupFailed = 6,
	SignFailed = 7,
	RecoverFailed = 8,

	KeygenResourceBusy = 9,
	SignResourceBusy = 10,
	InternalLibError = 11,
	PhoneDenied = 12,
	InvalidBackupData = 13,
	InvalidMessageHashLength = 14,
	WalletNotCreated = 15,
	UnknownError = 16,
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
