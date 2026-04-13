import { IMAGES } from "@/constants/images";
import {  SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function SignUpPage() {
  return (
    <SignUp
      appearance={{
        layout: {
          logoImageUrl: IMAGES.LOGO,
          logoPlacement: "inside",
          socialButtonsPlacement: "bottom",
        },
        elements: {
          headerTitle: "hidden",
          footer: "hidden",
          header: "h-16",
          logoBox: "min-h-1/2",
        },
        theme: dark,
      }}
    />
  );
}
