import {
    MpcAuthenticator,
    StoragePlatform,
    WalletId,
} from "@silencelaboratories/mpc-sdk";

import { useState } from "react";
export const useMpcAuth = () => {
    const [sdk] = useState<MpcAuthenticator>(
        MpcAuthenticator.instance({
            walletId: WalletId.Stackup,
            storagePlatform: StoragePlatform.Browser,
            isDev: process.env.NEXT_PUBLIC_SDK_MODE === "development",
        })
    );
    return sdk;
};
