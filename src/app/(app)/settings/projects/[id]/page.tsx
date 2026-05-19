import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { type Project } from "@/lib/types";
import { ProjectDetailClient } from "./project-detail-client";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!project) notFound();

  const year = new Date().getFullYear();
  const yearStart = `${year}-01-01`;
  const { data: ytdRow } = await supabase
    .from("expenses")
    .select("amount_cents")
    .eq("project_id", id)
    .gte("expense_date", yearStart);
  const ytdTotal = (ytdRow ?? []).reduce(
    (sum, r) => sum + ((r.amount_cents as number) ?? 0),
    0,
  );
  const ytdCount = (ytdRow ?? []).length;

  return (
    <ProjectDetailClient
      project={project as Project}
      ytdTotal={ytdTotal}
      ytdCount={ytdCount}
    />
  );
}
