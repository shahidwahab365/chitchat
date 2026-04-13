"use client";

import { toast } from "sonner";
import { useRouter } from "next/router";
import { ROUTES } from "@/constants/routes";

export default function NToaster(title: string, body?: string) {
  const router = useRouter();
  return toast(title, {
    action: {
      label: "View",
      onClick: () => router.push(ROUTES.NOTIFICATIONS),
    },
    description: body,
  });
}
