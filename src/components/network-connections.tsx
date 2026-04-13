import * as Tabs from "@radix-ui/react-tabs";
import { useEffect } from "react";
import EmptyState from "./network-empty-state";
import OutlineButton from "./out-line-button";
import { useGetContacts } from "@/hooks/react-query/query-contact";
import { NetworkListSkeleton } from "./skeletons/network-skeleton";
import ConnectionPersonRow from "./network-connections-person-row";
import { useRemoveContact } from "@/hooks/react-query/mutation-contact";
import { ROUTES } from "@/constants/routes";
import { useRouter } from "next/navigation";

function NetworkConnections({
  setContactsLength,
}: {
  setContactsLength: (length: number) => void;
}) {
  const router = useRouter();
  const { data: connections, isLoading, error } = useGetContacts();
  const { mutate: removeContactFn, isPending } = useRemoveContact();

  useEffect(() => {
    if (connections && !isLoading) {
      setContactsLength(connections.length);
    }
  }, [connections, isLoading]);

  if (error) {
    return (
      <EmptyState
        title="Error loading connections"
        text="There was an error loading your connections. Please try again later."
      />
    );
  }

  if (isLoading) {
    return <NetworkListSkeleton />;
  }

  async function handleRemoveContact({ data }: { data: { id: string } }) {
    removeContactFn({
      id: data.id,
    });
  }

  return (
    <Tabs.Content value="connections" className="outline-none">
      {connections?.length === 0 ? (
        <EmptyState
          title="No connections yet"
          text="Start connecting with people to grow your network."
        />
      ) : (
        <div className="space-y-2">
          {connections?.map((p) => (
            <ConnectionPersonRow
              key={p.id}
              person={p}
              right={
                <div className="flex flex-col gap-2 sm:flex-row">
                  <OutlineButton type="button" disabled={isPending} onClick={() => router.push(ROUTES.CHAT)}>
                    Message
                  </OutlineButton>
                  <OutlineButton
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      handleRemoveContact({
                        data: { id: p.id },
                      })
                    }
                  >
                    {isPending ? "Removing..." : "Remove"}
                  </OutlineButton>
                </div>
              }
            />
          ))}
        </div>
      )}
    </Tabs.Content>
  );
}

export default NetworkConnections;
