import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, Search } from "lucide-react-native";
import { ExpenseCard } from "@/components/ExpenseCard";
import { listExpenses } from "@/lib/api";
import { formatCents, type Expense } from "@/lib/types";

export default function ExpensesScreen() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setError(null);
    try {
      const rows = await listExpenses();
      setExpenses(rows);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load().finally(() => setLoading(false));
    }, [load])
  );

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return expenses;
    return expenses.filter((e) =>
      [e.merchant, e.business_purpose, e.category_code, e.notes]
        .filter(Boolean)
        .some((s) => (s as string).toLowerCase().includes(q))
    );
  }, [expenses, query]);

  const monthTotals = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const businessCents = expenses
      .filter(
        (e) =>
          e.is_business &&
          e.amount_cents != null &&
          e.expense_date &&
          new Date(e.expense_date).getTime() >= cutoff
      )
      .reduce((acc, e) => acc + (e.amount_cents ?? 0), 0);
    return { businessCents };
  }, [expenses]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.hello}>Expenses</Text>
          <Text style={styles.sub}>
            {formatCents(monthTotals.businessCents)} deductible this month
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/(tabs)/capture")}
          style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}
        >
          <Plus color="#fff" size={24} />
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <Search color="#94a3b8" size={18} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search merchant, purpose, category"
          placeholderTextColor="#94a3b8"
          style={styles.searchInput}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={load} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📸</Text>
          <Text style={styles.emptyTitle}>No expenses yet</Text>
          <Text style={styles.emptyBody}>
            Tap the + button or the Capture tab to snap your first receipt.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(e) => e.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <ExpenseCard expense={item} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  hello: { fontSize: 28, fontWeight: "700", color: "#0f172a" },
  sub: { fontSize: 13, color: "#475569", marginTop: 2 },
  fab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, color: "#0f172a", padding: 0 },
  list: { padding: 20, paddingTop: 10 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  errorText: { color: "#dc2626", textAlign: "center" },
  retryBtn: {
    marginTop: 14,
    backgroundColor: "#2563eb",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: { color: "#fff", fontWeight: "600" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a", marginTop: 12 },
  emptyBody: {
    fontSize: 14,
    color: "#475569",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
  },
});
