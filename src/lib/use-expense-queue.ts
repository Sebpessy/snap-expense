"use client";

import { useEffect, useState } from "react";
import { expenseQueue, type QueuedExpense } from "@/lib/expense-queue";

export function useExpenseQueue() {
  const [pending, setPending] = useState<QueuedExpense[]>([]);

  useEffect(() => {
    return expenseQueue.subscribe(setPending);
  }, []);

  return { pending };
}
