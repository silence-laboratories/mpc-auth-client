import { MpcAuthenticator, WalletId, StoragePlatform } from "@silencelaboratories/mpc-sdk";
import { useState } from "react";
export const useMpcAuth = () => {
    const [sdk] = useState<MpcAuthenticator>(
        new MpcAuthenticator({
            walletId: WalletId.Pimlico,
            storagePlatform: StoragePlatform.Browser,
            isDev: process.env.NEXT_PUBLIC_SDK_MODE === "development",
        })
    );
    return sdk;
};
