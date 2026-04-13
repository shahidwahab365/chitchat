"use client";

import { IMAGES } from "@/constants/images";
import Image from "next/image";
import { useWindowSize } from "@/hooks/useWindowSize";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

function Logo({ className } : { className?: string}) {
  const { width } = useWindowSize();
  const ASPECT_RATIO = 2.5;
  let logoWidth = 400;

  if (width >= 1280) logoWidth = 160;
  else if (width >= 1024) logoWidth = 160;
  else if (width >= 768) logoWidth = 160;
  else if (width >= 480) logoWidth = 130;

  const logoHeight = logoWidth / ASPECT_RATIO;

  return (
    <Link href={ROUTES.HOME}>
      <Image
        src={IMAGES.LOGO}
        alt="logo"
        width={logoWidth}
        height={logoHeight}
        priority
        className={`object-contain ${className}`}
      />
    </Link>
  );
}

export default Logo;
