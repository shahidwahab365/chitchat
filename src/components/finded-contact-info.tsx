"use client";
import { IMAGES } from "@/constants/images";
import { capitalizeName } from "@/lib/capitalize-name";
import { IContact } from "@/types/find-contact";
import Image from "next/image";
import { Button } from "./ui/button";
import { UserRoundPlus } from "lucide-react";
import { useSendConnection } from "@/hooks/react-query/mutation-contact";
import { Loader } from "./loader";
import { useState } from "react";

function FindedContactInfo({ userInfo }: { userInfo: IContact }) {
  const { mutate, isPending } = useSendConnection();
  const [sentRequests, setSentRequests] = useState<string[]>([]);

  const isDisabled =
    isPending ||
    userInfo.contactStatus === "requested" ||
    userInfo.contactStatus === "accepted" ||
    sentRequests.includes(userInfo.user_id);

  async function handleSendConnect() {
    mutate({ contact_id: userInfo.user_id });
    setSentRequests((prev) => [...prev, userInfo.user_id]);
  }

  return (
    <div className="flex flex-col items-center w-full p-2 gap-2 rounded-xl bg-primary-foreground/30 relative">
      <Image
        src={userInfo?.avatar_url || IMAGES.ICONS.UNKNOWN_USER}
        alt="avatar"
        width={100}
        height={100}
        className="rounded-full"
        priority={false}
        unoptimized
      />

      <div className="flex flex-col items-start justify-center">
        <p className="font-semibold">
          {capitalizeName({ name: userInfo.full_name })}
        </p>
        <span className="text-sm text-muted-foreground">
          @{userInfo.username}
        </span>
      </div>

      <Button
        onClick={handleSendConnect}
        className="rounded-full cursor-pointer p-1 w-full h-8"
        disabled={isDisabled}
      >
        {isPending ? (
          <>
            <Loader className="size-5" />
            <span>Sending...</span>
          </>
        ) : (
          <>
            <UserRoundPlus className="size-5" strokeWidth={1.89} />
            <span>
              {userInfo.contactStatus === "accepted"
                ? "Connection"
                : userInfo.contactStatus === "requested" ||
                    sentRequests.includes(userInfo.user_id)
                  ? "Pending..."
                  : "Connect"}
            </span>
          </>
        )}
      </Button>
    </div>
  );
}

export default FindedContactInfo;
