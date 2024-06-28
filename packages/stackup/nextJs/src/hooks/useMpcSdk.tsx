import { WALLET_ID } from "@/constants";
import { MpcSdk } from "@silencelaboratories/mpc-sdk";
import { StoragePlatform } from "@silencelaboratories/mpc-sdk/lib/esm/types";
import { useState } from "react";
export const useMpcSdk = () => {
    const [sdk] = useState<MpcSdk>(
        new MpcSdk({
            walletId: WALLET_ID,
            storagePlatform: StoragePlatform.Browser,
            isDev: process.env.NODE_ENV === "development",
        })
    );
    return sdk;
};
