import { IMAGES } from "@/constants/images";
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function UserAvatar({
  src,
  alt,
  isOnline = false,
}: {
  src?: string | null;
  alt: string;
  isOnline?: boolean;
}) {
  return (
    <Avatar className="overflow-visible">
      <AvatarImage className="rounded-full" src={src ?? IMAGES.ICONS.UNKNOWN_USER} alt={alt} />
      <AvatarFallback>{alt.substring(0, 2).toUpperCase()}</AvatarFallback>
      {isOnline && <AvatarBadge className="bg-green-500 dark:bg-green-500 max-w-2 max-h-2" />}
    </Avatar>
  );
}
