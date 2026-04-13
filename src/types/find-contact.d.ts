export interface IContact {
  username: string;
  full_name: string;
  avatar_url?: string;
  user_id: string;
  contactStatus: "requested" | "blocked" | "accepted";
}
