import { WALLET_STATUS } from "@/constants";
import { isPasswordReady } from "@/mpc/storage/account";
import { getWalletStatus } from "@/mpc/storage/wallet";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useSwitchScreen = () => {
    const router = useRouter();
    const initializeScreen = () => {
        const status = getWalletStatus();
        if (status === WALLET_STATUS.Minted) {
            router.replace("/homescreen");
        } else if (status === WALLET_STATUS.BackedUp) {
            router.replace("/mint");
        } else if (status === WALLET_STATUS.Paired && !isPasswordReady()) {
            router.replace("/backup");
        } else {
            router.replace("/intro");
        }
    };
    useEffect(() => {
        initializeScreen();
    }, []);
};
