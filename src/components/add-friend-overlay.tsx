import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Input } from "./ui/input";
import { useFindContact } from "@/hooks/react-query/query-contact";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import FindedContactInfoSkeleton from "./skeletons/finded-contact-skeleton";
import FindedContactInfo from "./finded-contact-info";
import { toast } from "sonner";

function AddFriend({
  showOverlay,
  setShowOverlay,
}: {
  showOverlay: boolean;
  setShowOverlay: (e: boolean) => void;
}) {
  const [userName, setUserName] = useState<string>("");
  const [value] = useDebounce(userName, 1000);

  const { data, isLoading, error, isError } = useFindContact({
    userName: value,
    enabled: value.length > 0,
  });

  if (error || isError) {
    toast.error(error.message || "Contact Fetch Failed! Try again later");
  }

  return (
    <div
      className={`absolute inset-0 space-y-2 bg-background/95 backdrop-blur-sm z-50 p-4 flex flex-col transition-transform duration-300 ease-in-out ${
        showOverlay ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="w-full flex items-center justify-between mb-4">
        <Label className="font-semibold text-lg">Find friends</Label>
        <Button
          className="p-0 h-8 w-8 rounded-full bg-transparent hover:bg-primary-foreground cursor-pointer"
          onClick={() => setShowOverlay(false)}
        >
          <X className="size-5 text-primary" strokeWidth={1.89} />
        </Button>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <Input
          defaultValue={userName}
          onChange={(e: any) => {
            setUserName(e.target.value);
          }}
          className="w-full border-none rounded-full focus-visible:ring-1"
          placeholder="Enter your friends username..."
        />
      </div>
      <div className="w-full h-full flex flex-col items-start justify-start gap-2">
        {isLoading ? (
          <FindedContactInfoSkeleton />
        ) : data && data?.length > 0 ? (
          data.map((contact: any) => (
            <FindedContactInfo key={contact.user_id} userInfo={contact} />
          ))
        ) : data?.length === 0 ? (
          <span className="text-primary">🤦No contact found!</span>
        ) : (
          <span className="text-muted-foreground">🔍 Search new friends here...</span>
        )}
      </div>
    </div>
  );
}

export default AddFriend;
