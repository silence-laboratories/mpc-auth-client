"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getPairingStatus } from "@/mpc/storage/wallet";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        if (getPairingStatus() == "Paired") {
            router.replace("/homescreen");
        } else {
            router.replace("/intro");
        }
    }, []);
}
