import { redirect } from "next/navigation";

// Chat entry is now merged into /capture. Keep this route as a permanent redirect
// so old links (and bookmarked /chat) still work.
export default function ChatPage() {
  redirect("/capture");
}
