
import { MpcSdk } from "@silencelaboratories/mpc-sdk";
import { StoragePlatform } from "@silencelaboratories/mpc-sdk/lib/cjs/types";
import { CliStorage } from "./storage";

const WALLET_ID = "stackup";
const storage = new CliStorage();
export const mpcSdk = new MpcSdk(WALLET_ID, StoragePlatform.CLI, storage);