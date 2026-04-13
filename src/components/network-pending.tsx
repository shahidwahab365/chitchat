import { useGetPendingContacts } from "@/hooks/react-query/query-contact";
import * as Tabs from "@radix-ui/react-tabs";
import OutlineButton from "./out-line-button";
import EmptyState from "./network-empty-state";
import { useEffect } from "react";
import { NetworkListSkeleton } from "./skeletons/network-skeleton";
import PendingPersonRow from "./network-pending-person-row";
import { useWithdrawConnectionRequest } from "@/hooks/react-query/mutation-contact";

function NetworkPendings({
  setPendingRequestsLength,
}: {
  setPendingRequestsLength: (length: number) => void;
}) {
  const { mutate: withdrawConnectionFn, isPending } =
    useWithdrawConnectionRequest();
  const { data: pendingRequests, isLoading, error } = useGetPendingContacts();
  useEffect(() => {
    if (pendingRequests && !isLoading) {
      setPendingRequestsLength(pendingRequests.length);
    }
  }, [pendingRequests]);

  if (isLoading) {
    return <NetworkListSkeleton />;
  }

  if (error) {
    console.log(error);
    return (
      <div className="p-4 text-sm text-red-500">
        Failed to load pending requests.
      </div>
    );
  }

  return (
    <Tabs.Content value="pending" className="outline-none">
      {pendingRequests?.length === 0 ? (
        <EmptyState
          title="No pending requests"
          text="Requests you send will stay here until accepted."
        />
      ) : (
        <div className="space-y-2">
          {pendingRequests?.map((p) => {
            return (
              <PendingPersonRow
                key={p.id}
                person={p}
                right={
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <OutlineButton
                      disabled={isPending}
                      type="button"
                      onClick={() => withdrawConnectionFn({ contact_id: p.id })}
                    >
                      Withdraw
                    </OutlineButton>
                  </div>
                }
              />
            );
          })}
        </div>
      )}
    </Tabs.Content>
  );
}

export default NetworkPendings;
