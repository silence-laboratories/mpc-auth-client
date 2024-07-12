import { MpcAuthenticator, WalletId, StoragePlatform } from "@silencelaboratories/mpc-sdk";
import { useState } from "react";
export const useMpcAuth = () => {
    const [sdk] = useState<MpcAuthenticator>(
        new MpcAuthenticator({
            walletId: WalletId.Biconomy,
            storagePlatform: StoragePlatform.Browser,
            isDev: process.env.NODE_ENV === "development",
        })
    );
    return sdk;
};
