// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import React from "react";

export default function Footer() {
    return (
        <div className="text-[#8E95A2] text-center label-regular">
            This Dapp is powered by Silent Shard{" "}
            <a
                className="underline text-[#745EF6] label-bold"
                href="https://docs.silencelaboratories.com/duo"
                target="_blank"
                rel="noreferrer"
            >
                Two Party SDK
            </a>{" "}
            from{" "}
            <a
                className="underline text-[#745EF6] label-bold"
                href="https://www.silencelaboratories.com"
                target="_blank"
                rel="noreferrer"
            >
                {" "}
                Silence Laboratories.
            </a>
        </div>
    );
}
