import { WALLET_STATUS } from "@/constants";
import { getEoa, isPasswordReady } from "@/mpc/storage/account";
import { getWalletStatus } from "@/mpc/storage/wallet";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export const useSwitchScreen = () => {
    const router = useRouter();
    const query = useSearchParams();
    const isRepairing = query.get("repair");
    const initializeScreen = () => {
        const status = getWalletStatus();
        const eoa = getEoa();
        console.log(status, eoa, isRepairing);
        if ((status === WALLET_STATUS.Minted || eoa) && !isRepairing) {
            router.replace("/homescreen");
        } else if ((status === WALLET_STATUS.Minted || eoa) && isRepairing) {
            router.replace("/pair?repair=true");
        } else if (status === WALLET_STATUS.BackedUp) {
            router.replace("/mint");
        } else if (status === WALLET_STATUS.Paired && !isPasswordReady()) {
            router.replace("/backup");
        } else if (status === WALLET_STATUS.Mismatched) {
            router.replace("/mismatchAccounts");
        } else if (status === WALLET_STATUS.Unpaired) {
            router.replace("/intro");
        }
    };
    useEffect(() => {
        initializeScreen();
    }, []);
};
