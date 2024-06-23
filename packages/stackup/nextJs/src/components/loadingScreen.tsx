import Image from "next/image";
import React from "react";
import loadingGif from "../../public/loading.gif";

export default function LoadingScreen({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex flex-col items-center justify-center h-[50vh]">
            <Image
                priority={true}
                className="my-4 w-[50%] h-auto"
                src={loadingGif}
                alt="loading"
                unoptimized
            />
            <div
                className="text-center text-blackh2-bold"
                style={{ marginBottom: 140 }}
            >
                {children}
            </div>
        </div>
    );
}
