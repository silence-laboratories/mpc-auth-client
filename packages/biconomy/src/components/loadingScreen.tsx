import React from "react";

export default function LoadingScreen({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex flex-col items-center justify-center h-[50vh]">
            <img className="h-[50%] mb-8" src="/loading.gif" alt="loading" />
            <div
                className="text-center text-blackh2-bold"
                style={{ marginBottom: 140 }}
            >
                {children}
            </div>
        </div>
    );
}
