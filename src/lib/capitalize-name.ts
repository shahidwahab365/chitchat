export function capitalizeName({ name }: { name: string}) {
  const parts = name.trim().split(" ");

  const firstName =
    parts[0][0].toUpperCase() + parts[0].slice(1);

  const lastName = parts[1]
    ? parts[1][0].toUpperCase() + parts[1].slice(1)
    : "";

  return lastName ? `${firstName} ${lastName}` : firstName;
}
