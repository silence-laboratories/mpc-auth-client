import { WALLET_STATUS } from "@/constants";
import { getWalletStatus } from "@/mpc/storage/wallet";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useSwitchScreen = () => {
    const router = useRouter();
    const initializeScreen = () => {
        const status = getWalletStatus();
        if (status === WALLET_STATUS.Minted) {
            router.replace("/homescreen");
        } else if (status === WALLET_STATUS.Paired) {
            router.replace("/mint");
        } else {
            router.replace("/intro");
        }
    };
    useEffect(() => {
        initializeScreen();
    }, []);
};
