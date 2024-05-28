"use client";
import 'animate.css';
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getPairingStatus } from "@/mpc/storage/wallet";
import { WALLET_STATUS } from "@/constants";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        if (getPairingStatus() == WALLET_STATUS.Paired) {
            router.replace("/homescreen");
        } else {
            router.replace("/intro");
        }
    }, [router]);
}
