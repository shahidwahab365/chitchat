import { Button } from "./ui/button";

export default function OutlineButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
  }
) {
  const { className, children, ...rest } = props;
  return (
    <Button
      {...rest}
      className={[
        "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium",
        "border border-border bg-background text-foreground hover:bg-accent",
        "focus-visible:outline-none cursor-pointer",
        "disabled:opacity-50",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </Button>
  );
}