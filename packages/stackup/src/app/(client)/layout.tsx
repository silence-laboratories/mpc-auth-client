"use client";
import * as React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
    const [isClient, setIsClient] = React.useState(false);
    React.useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;
    return children;
};

export default Layout;
