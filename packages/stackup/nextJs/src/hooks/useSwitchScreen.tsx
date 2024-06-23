import { WALLET_STATUS } from "@/constants";
import { getEoa, isPasswordReady } from "@/mpc/storage/account";
import { getWalletStatus } from "@/mpc/storage/wallet";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// This hook is used to switch screens based on the wallet state in FIRST time load
export const useSwitchScreen = () => {
    const router = useRouter();
    const initializeScreen = () => {
        const status = getWalletStatus();
        const eoa = getEoa();
        if (status === WALLET_STATUS.Minted || eoa) {
            router.replace("/homescreen");
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
