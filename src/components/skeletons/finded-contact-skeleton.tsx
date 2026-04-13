import { Skeleton } from "@/components/ui/skeleton";

function FindedContactInfoSkeleton() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center w-full gap-3 p-2 rounded-xl">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />

          <div className="flex flex-col gap-1 w-full">
            <Skeleton className="h-4 w-2/4 " />
            <Skeleton className="h-3 w-2/2 " />
          </div>
        </div>
      ))}
    </>
  );
}

export default FindedContactInfoSkeleton;
