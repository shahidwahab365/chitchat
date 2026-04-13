import * as Tabs from "@radix-ui/react-tabs";
import OutlineButton from "./out-line-button";
import EmptyState from "./network-empty-state";
import { Button } from "./ui/button";
import { useGetInvitations } from "@/hooks/react-query/query-contact";
import { NetworkListSkeleton } from "./skeletons/network-skeleton";
import InvitationPendingPersonRow from "./network-invitation-person-row";
import { useEffect } from "react";
import { useResponsedToConnectionRequest } from "@/hooks/react-query/mutation-contact";

function PrimaryButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
  },
) {
  const { className, children, ...rest } = props;
  return (
    <Button
      {...rest}
      className={[
        "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium",
        "bg-primary text-primary-foreground hover:opacity-95",
        "focus-visible:outline-none",
        "disabled:opacity-50 cursor-pointer",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </Button>
  );
}

function NetworkInvitations({
  setInvitationsLength,
}: {
  setInvitationsLength: (length: number) => void;
}) {
  const { mutate: responsedToConnectionFn, isPending } =
    useResponsedToConnectionRequest();
  const { data: invitations, isLoading, error } = useGetInvitations();

  useEffect(() => {
    if (invitations && !isLoading) {
      setInvitationsLength(invitations.length);
    }
  }, [invitations, isLoading]);

  if (isLoading) {
    return <NetworkListSkeleton />;
  }

  async function handleResponseToConnectionRequest({
    data,
  }: {
    data: { id: string; user_id: string; accept: boolean };
  }) {
    responsedToConnectionFn({
      id: data.id,
      contact_user_id: data.user_id,
      accept: data.accept,
    });
  }

  if (error) {
    return (
      <EmptyState
        title="Error loading invitations"
        text="There was an error loading your invitations. Please try again later."
      />
    );
  }

  return (
    <Tabs.Content value="invitations" className="outline-none">
      {invitations?.length === 0 ? (
        <EmptyState
          title="No invitations"
          text="When people invite you, you’ll see them here."
        />
      ) : (
        <div className="space-y-2">
          {invitations?.map((p) => (
            <InvitationPendingPersonRow
              key={p.id}
              person={p}
              right={
                <div className="flex flex-col gap-2 sm:flex-row">
                  <PrimaryButton
                    type="button"
                    onClick={handleResponseToConnectionRequest.bind(null, {
                      data: { id: p.id, user_id: p.user_id, accept: true },
                    })}
                    disabled={isPending}
                  >
                    Accept
                  </PrimaryButton>
                  <OutlineButton
                    type="button"
                    onClick={handleResponseToConnectionRequest.bind(null, {
                      data: { id: p.id, user_id: p.user_id, accept: false },
                    })}
                    disabled={isPending}
                  >
                    Ignore
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

export default NetworkInvitations;
