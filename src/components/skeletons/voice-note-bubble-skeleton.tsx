import { Skeleton } from "../ui/skeleton";

function VoiceNoteBubbleSkeleton({ incomming } : {incomming: boolean}) {
  return (
    <div className={`flex gap-2 ${incomming && "flex-row-reverse"}`}>
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex flex-col gap-1">
        <Skeleton className="w-40 h-5 rounded" />
        <Skeleton className="w-12 h-4 rounded" />
      </div>
    </div>
  );
}

export default VoiceNoteBubbleSkeleton;
