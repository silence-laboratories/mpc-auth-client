// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.
"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/progress";
import { useRouter } from "next/navigation";

import {
    Carousel,
    CarouselApi,
    CarouselContent,
    CarouselDots,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { WALLET_STATUS } from "@/constants";
import { RouteLoader } from "@/components/routeLoader";
import { layoutClassName } from "@/utils/ui";
import { getPairingStatus } from "@/storage/localStorage";
import { useMpcAuth } from "@/hooks/useMpcAuth";

function Page() {
    const router = useRouter();
    const mpcAuth = useMpcAuth();
    const [deviceOS, setDeviceOS] = useState<string>("");
    (async () => {
        const val = await mpcAuth.getPairedDeviceOS();
        setDeviceOS(val);
    })();
    const status = getPairingStatus();
    if (status !== WALLET_STATUS.BackedUp) {
        return <RouteLoader />;
    }
    return (
        <div className={layoutClassName}>
            <div className="absolute w-full top-0 right-0">
                <Progress
                    className="w-[99.5%]"
                    value={50}
                    style={{ height: "4px" }}
                />
            </div>
            <Button
                className="rounded-full bg-gray-custom min-w-max aspect-square"
                size="icon"
                disabled={true}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                >
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M16.1705 4.4545C16.6098 4.89384 16.6098 5.60616 16.1705 6.0455L10.216 12L16.1705 17.9545C16.6098 18.3938 16.6098 19.1062 16.1705 19.5455C15.7312 19.9848 15.0188 19.9848 14.5795 19.5455L7.8295 12.7955C7.39017 12.3562 7.39017 11.6438 7.8295 11.2045L14.5795 4.4545C15.0188 4.01517 15.7312 4.01517 16.1705 4.4545Z"
                        fill="#B1BBC8"
                    />
                </svg>
            </Button>

            <div className="text-black h2-bold leading-[38.4px] mt-4">
                Don’t forget to backup on your phone
            </div>
            <div
                className="text-[#8E95A2]"
                style={{
                    fontFamily: "Epilogue",
                    fontSize: "14px",
                    fontWeight: 400,
                    lineHeight: "22px",
                    letterSpacing: "0px",
                    marginTop: "24px",
                }}
            >
                Save backups{" "}
                <span className="text-[#23272E] b2-bold">
                    on your Mobile Application
                </span>{" "}
                to recover your accounts any time without worry of device loss.
            </div>
            <div className="text-[#B6BAC3] mt-4 mb-3 label-md text-center">
                2 Ways you can backup your wallet
            </div>
            <CarouselWrapper deviceOS={deviceOS} />
            <div className="w-full justify-center items-center flex flex-col mt-14">
                <Button
                    className="bg-indigo-primary hover:bg-indigo-hover active:bg-indigo-active w-1/2"
                    onClick={() => {
                        router.replace("/mint");
                    }}
                >
                    I understand
                </Button>
            </div>
        </div>
    );
}

const StorageBackupContent: React.FC<{ deviceOS: string; isBlur: boolean }> = ({
    deviceOS,
    isBlur = false,
}) => {
    return (
        <div
            className="relative flex p-2 w-[385px] lg:w-[24vw] border"
            style={{
                background: "#F6F7F9",
                borderColor: "#D5D9E2",
                borderRadius: "8px",
                opacity: `${isBlur ? "0.5" : "1"}`,
            }}
        >
            <img
                className="mr-3 h-[223px] w-[104px] flex-none rounded-[8px]"
                src="/backup_gpm.gif"
                alt="laptop"
                style={{ height: "auto" }}
            />

            <div className="flex flex-shrink flex-col">
                <div className="text-[#6B7280] label-regular mt-7 mb-2">
                    Option 1
                </div>
                <div className="my-2">
                    {deviceOS === "android" ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="40"
                            height="40"
                            viewBox="0 0 40 40"
                            fill="none"
                        >
                            <path
                                d="M36.9656 17.3031L36.7891 16.5539H20.5047V23.4461H30.2344C29.2242 28.243 24.5367 30.768 20.7078 30.768C17.9219 30.768 14.9852 29.5961 13.0414 27.7125C12.0159 26.7028 11.1996 25.5008 10.6392 24.1752C10.0789 22.8497 9.78544 21.4266 9.77578 19.9875C9.77578 17.0844 11.0805 14.1805 12.9789 12.2703C14.8773 10.3602 17.7445 9.29141 20.5953 9.29141C23.8602 9.29141 26.2 11.025 27.075 11.8156L31.9727 6.94375C30.5359 5.68125 26.5891 2.5 20.4375 2.5C15.6914 2.5 11.1406 4.31797 7.81406 7.63359C4.53125 10.8984 2.83203 15.6195 2.83203 20C2.83203 24.3805 4.43984 28.8656 7.62109 32.1562C11.0203 35.6656 15.8344 37.5 20.7914 37.5C25.3016 37.5 29.5766 35.7328 32.6234 32.5266C35.6187 29.3703 37.168 25.0031 37.168 20.425C37.168 18.4977 36.9742 17.3531 36.9656 17.3031Z"
                                fill="#867DFC"
                            />
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="40"
                            height="40"
                            viewBox="0 0 40 40"
                            fill="none"
                        >
                            <path
                                d="M27.2768 10.6922C24.1268 10.6922 22.7955 12.1953 20.6018 12.1953C18.3526 12.1953 16.6369 10.7031 13.9072 10.7031C11.2354 10.7031 8.38615 12.3344 6.57677 15.1133C4.03615 19.032 4.4674 26.4125 8.58224 32.7C10.0541 34.9508 12.0197 37.475 14.5979 37.5023H14.6447C16.8854 37.5023 17.551 36.0352 20.6346 36.018H20.6815C23.719 36.018 24.3283 37.4937 26.5596 37.4937H26.6065C29.1846 37.4664 31.2557 34.6695 32.7276 32.4273C33.7869 30.8148 34.1807 30.0055 34.9932 28.1812C29.0408 25.9219 28.0846 17.4836 33.9713 14.2484C32.1744 11.9984 29.6494 10.6953 27.269 10.6953L27.2768 10.6922Z"
                                fill="#867DFC"
                            />
                            <path
                                d="M26.583 2.5C24.708 2.62734 22.5205 3.82109 21.2393 5.37969C20.0768 6.79219 19.1205 8.8875 19.4955 10.9195H19.6455C21.6424 10.9195 23.6861 9.71719 24.8799 8.17656C26.0299 6.71016 26.9018 4.63203 26.583 2.5Z"
                                fill="#867DFC"
                            />
                        </svg>
                    )}
                </div>

                <div className="text-[#25272C] b2-regular mb-1">
                    {deviceOS === "android"
                        ? "Google Password Manager"
                        : "iCloud Keychain"}
                </div>
                <p className="text-[#8E95A2] label-regular">
                    {deviceOS === "android"
                        ? "Store backup on Google Password Manager using your preferred gmail account. The same account will be used for future recovery processes."
                        : "Store backup on iCloud Keychain using your Apple ID. This Apple ID will be used for future recovery processes."}
                </p>
            </div>
        </div>
    );
};

const FileBackupInstruction: React.FunctionComponent<{ isBlur: boolean }> = ({
    isBlur = false,
}) => {
    return (
        <div
            className="relative flex p-2 w-[385px] lg:w-[24vw] border"
            style={{
                background: "#F6F7F9",
                borderColor: "#D5D9E2",
                borderRadius: "8px",
                opacity: `${isBlur ? "0.5" : "1"}`,
            }}
        >
            <img
                className="mr-3 h-[223px] w-[104px] flex-none rounded-[8px]"
                src="/backup_export.gif"
                alt="laptop"
                style={{ height: "auto" }}
            />

            <div className="flex flex-shrink flex-col">
                <div className="text-[#6B7280] label-regular mt-7 mb-2">
                    Option 2
                </div>
                <div className="my-2 flex items-center space-x-2 flex-wrap">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="40"
                        height="40"
                        viewBox="0 0 40 40"
                        fill="none"
                    >
                        <path
                            d="M9.0868 10.9641C10.5938 7.24877 14.3686 3.73438 20 3.73438C26.0587 3.73438 31.2224 7.85671 32.3546 14.5277C33.9532 14.767 35.6269 15.3792 37.0051 16.403C38.7181 17.6754 40 19.6143 40 22.2031C40 24.7133 38.9432 26.7102 37.2226 28.0488C35.5361 29.3609 33.2915 29.9844 30.9375 29.9844H25C24.3096 29.9844 23.75 29.4247 23.75 28.7344C23.75 28.044 24.3096 27.4844 25 27.4844H30.9375C32.8804 27.4844 34.542 26.9668 35.6875 26.0756C36.799 25.2109 37.5 23.9422 37.5 22.2031C37.5 20.5428 36.7116 19.2992 35.5144 18.4099C34.2864 17.4977 32.6588 16.9932 31.1882 16.9203C30.5724 16.8898 30.0709 16.415 30.0068 15.8018C29.377 9.77611 25.0461 6.23438 20 6.23438C15.235 6.23438 12.1885 9.37782 11.1903 12.491C11.0377 12.9671 10.616 13.3065 10.1182 13.3538C5.81075 13.763 2.5 16.4148 2.5 20.4219C2.5 24.4502 5.98088 27.4844 10.625 27.4844H15C15.6904 27.4844 16.25 28.044 16.25 28.7344C16.25 29.4247 15.6904 29.9844 15 29.9844H10.625C4.95662 29.9844 0 26.1623 0 20.4219C0 14.9625 4.32226 11.7009 9.0868 10.9641Z"
                            fill="#867DFC"
                        />
                        <path
                            d="M20.8839 14.1005L25.8839 19.1005C26.372 19.5886 26.372 20.3801 25.8839 20.8683C25.3957 21.3564 24.6043 21.3564 24.1161 20.8683L21.25 18.0021V35.0172C21.25 35.7075 20.6904 36.2672 20 36.2672C19.3096 36.2672 18.75 35.7075 18.75 35.0172V18.0021L15.8839 20.8683C15.3957 21.3564 14.6043 21.3564 14.1161 20.8683C13.628 20.3801 13.628 19.5886 14.1161 19.1005L19.1161 14.1005C19.6043 13.6123 20.3957 13.6123 20.8839 14.1005Z"
                            fill="#867DFC"
                        />
                    </svg>

                    <img src="/ggdrive.svg" alt="" />
                    <img src="/onedrive.svg" alt="" />
                    <img src="/openfolder.svg" alt="" />
                    <img src="/dropbox.svg" alt="" />

                    <span
                        className="whitespace-nowrap"
                        style={{
                            fontSize: 10,
                            fontWeight: 400,
                            fontFamily: "Epilogue",
                            color: "#FFF",
                        }}
                    >
                        + more
                    </span>
                </div>
                <div className="text-[#F7F8F8] b2-regular mb-1">
                    Export wallet
                </div>
                <p className="text-[#8E95A2] label-regular">
                    Backup your wallet anytime by exporting it and saving it in
                    any file storage or password managers of your choice i.e.{" "}
                    <span className="label-bold">
                        Device Storage/Google Drive
                    </span>{" "}
                    etc.
                </p>
            </div>
        </div>
    );
};

const CarouselWrapper: React.FunctionComponent<{
    deviceOS: string;
}> = ({ deviceOS }) => {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    useEffect(() => {
        if (!api) {
            return;
        }

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap());
        });
    }, [api]);

    return (
        <Carousel
            opts={{
                align: "center",
                loop: true,
            }}
            setApi={setApi}
            className="w-full"
        >
            <CarouselContent>
                <CarouselItem
                    className="basis-[88%] lg:basis-[98%] pl-32"
                    key={0}
                >
                    <StorageBackupContent
                        deviceOS={deviceOS}
                        isBlur={current === 1}
                    />
                </CarouselItem>
                <CarouselItem
                    className="basis-[80%] -ml-12 lg:basis-[84%] lg:-ml-20"
                    key={1}
                >
                    <FileBackupInstruction isBlur={current === 0} />
                </CarouselItem>
            </CarouselContent>
            {current === 0 && (
                <CarouselNext className=" bg-transparent hover:bg-transparent -right-0" />
            )}
            {current === 1 && (
                <CarouselPrevious className=" bg-transparent hover:bg-transparent -left-0" />
            )}
            <CarouselDots className="absolute -bottom-5 left-1/2 -translate-x-1/2 cursor-pointer" />
        </Carousel>
    );
};

export default Page;
