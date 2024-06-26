import { WALLET_ID } from "@/constants";
import { MpcSdk } from "@silencelaboratories/mpc-sdk";
import { StoragePlatform } from "@silencelaboratories/mpc-sdk/lib/esm/types";
import { useState } from "react";
let mpcSdk: MpcSdk | null = null;
export const useMpcSdk = () => {
    const [sdk] = useState<MpcSdk>(
        new MpcSdk(WALLET_ID, StoragePlatform.Browser)
    );
    if (!mpcSdk) mpcSdk = sdk;
    return mpcSdk ? mpcSdk : sdk;
};
