import {
    MpcAuthenticator,
    StoragePlatform,
    WalletId,
} from "@silencelaboratories/mpc-sdk";

import { useState } from "react";
export const useMpcAuth = () => {
    console.log("process.env.API_KEY", process.env)
    console.log("process.env.NODE_ENV", process.env.NODE_ENV)
    console.log("process.env.NEXT_PUBLIC_SDK_MODE", process.env.NEXT_PUBLIC_SDK_MODE)
    const [sdk] = useState<MpcAuthenticator>(
        MpcAuthenticator.instance({
            walletId: WalletId.Stackup,
            storagePlatform: StoragePlatform.Browser,
            isDev: process.env.NEXT_PUBLIC_SDK_MODE === "development",
        })
    );
    return sdk;
};
