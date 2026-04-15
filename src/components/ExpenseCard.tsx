import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { getCategory } from "@/lib/categories";
import { formatCents, formatDate, type Expense } from "@/lib/types";

export function ExpenseCard({ expense }: { expense: Expense }) {
  const router = useRouter();
  const category = getCategory(expense.category_code);
  const isLowConfidence =
    (expense.category_confidence ?? 1) < 0.6;

  return (
    <Pressable
      onPress={() => router.push(`/expense/${expense.id}`)}
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.85 },
        !expense.is_business && { opacity: 0.6 },
      ]}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.merchant} numberOfLines={1}>
          {expense.merchant ?? "Unknown merchant"}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.date}>{formatDate(expense.expense_date)}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.category} numberOfLines={1}>
            {category.label}
          </Text>
          {isLowConfidence && <View style={styles.flag} />}
        </View>
      </View>
      <Text
        style={[
          styles.amount,
          !expense.is_business && { color: "#94a3b8", textDecorationLine: "line-through" },
        ]}
      >
        {formatCents(expense.amount_cents, expense.currency)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    shadowColor: "#0f172a",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  merchant: { fontSize: 16, fontWeight: "600", color: "#0f172a" },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  date: { fontSize: 13, color: "#64748b" },
  dot: { fontSize: 13, color: "#cbd5e1", marginHorizontal: 6 },
  category: { fontSize: 13, color: "#475569", flexShrink: 1 },
  amount: { fontSize: 17, fontWeight: "700", color: "#0f172a", marginLeft: 12 },
  flag: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#f59e0b",
    marginLeft: 8,
  },
});
