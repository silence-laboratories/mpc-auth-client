"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import * as store from "@/utils/store";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        if (store.getPairingStatus() == "Paired") {
            router.replace("/homescreen");
        } else {
            router.replace("/intro");
        }
    }, []);
}
