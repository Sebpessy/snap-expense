import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { type Project } from "@/lib/types";
import { ProjectsClient } from "./projects-client";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Pull all projects (we filter by status in the client tabs).
  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("status", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to load projects: ${error.message}`);
  }

  // Aggregate YTD spend per project (single query — RLS filters by user).
  const year = new Date().getFullYear();
  const yearStart = `${year}-01-01`;
  const { data: expenses } = await supabase
    .from("expenses")
    .select("project_id, amount_cents, is_business")
    .gte("expense_date", yearStart)
    .not("project_id", "is", null);

  const ytdByProject: Record<string, { total_cents: number; count: number }> = {};
  for (const row of expenses ?? []) {
    const pid = row.project_id as string;
    if (!ytdByProject[pid]) ytdByProject[pid] = { total_cents: 0, count: 0 };
    ytdByProject[pid].total_cents += (row.amount_cents as number) ?? 0;
    ytdByProject[pid].count += 1;
  }

  return (
    <ProjectsClient
      initialProjects={(projects ?? []) as Project[]}
      ytdByProject={ytdByProject}
    />
  );
}
