export function MessagesSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 20 }).map((_, i) => {
        const incoming = i % 3 === 0;
        return (
          <div
            key={i}
            className={[
              "flex items-end gap-2",
              incoming ? "justify-start" : "justify-end",
            ].join(" ")}
          >

            <div
              className={[
                "animate-pulse rounded-2xl border border-border bg-card p-3",
                "w-[70%] sm:w-[55%] md:w-[45%]",
              ].join(" ")}
            >
              <div className="h-2 w-2/3 rounded bg-muted" />
              <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
            </div>
          </div>
        );
      })}
    </div>
  );
}