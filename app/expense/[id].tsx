import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Trash2 } from "lucide-react-native";
import { CategoryPicker } from "@/components/CategoryPicker";
import {
  deleteExpense,
  getExpense,
  signedReceiptUrl,
  updateExpense,
} from "@/lib/api";
import { formatCents, type Expense } from "@/lib/types";

export default function ExpenseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  const [merchant, setMerchant] = useState("");
  const [amountDollars, setAmountDollars] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("other");
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");
  const [isBusiness, setIsBusiness] = useState(true);

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const e = await getExpense(id);
        if (!e) {
          Alert.alert("Not found", "This expense no longer exists.");
          router.back();
          return;
        }
        setExpense(e);
        setMerchant(e.merchant ?? "");
        setAmountDollars(
          e.amount_cents != null ? (e.amount_cents / 100).toFixed(2) : ""
        );
        setDate(e.expense_date ?? "");
        setCategory(e.category_code ?? "other");
        setPurpose(e.business_purpose ?? "");
        setNotes(e.notes ?? "");
        setIsBusiness(e.is_business);
        if (e.receipt_path) {
          const url = await signedReceiptUrl(e.receipt_path);
          setReceiptUrl(url);
        }
      } catch (err) {
        Alert.alert("Error", (err as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function onSave() {
    if (!expense) return;
    setSaving(true);
    try {
      const amountCents = amountDollars
        ? Math.round(Number(amountDollars) * 100)
        : null;
      await updateExpense(expense.id, {
        merchant: merchant || null,
        amount_cents: Number.isFinite(amountCents as number)
          ? (amountCents as number)
          : null,
        expense_date: date || null,
        category_code: category,
        business_purpose: purpose || null,
        notes: notes || null,
        is_business: isBusiness,
      });
      router.back();
    } catch (err) {
      Alert.alert("Save failed", (err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function onDelete() {
    if (!expense) return;
    Alert.alert("Delete expense?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteExpense(expense.id);
            router.back();
          } catch (err) {
            Alert.alert("Delete failed", (err as Error).message);
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }
  if (!expense) return null;

  return (
    <>
      <Stack.Screen
        options={{
          title: merchant || "Expense",
          headerRight: () => (
            <Pressable onPress={onDelete} hitSlop={12}>
              <Trash2 color="#dc2626" size={20} />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        style={{ backgroundColor: "#f8fafc" }}
        contentContainerStyle={styles.scroll}
      >
        {receiptUrl ? (
          <Image source={{ uri: receiptUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={{ color: "#94a3b8" }}>No receipt image</Text>
          </View>
        )}

        <View style={styles.amountBanner}>
          <Text style={styles.amountBig}>
            {formatCents(
              amountDollars ? Math.round(Number(amountDollars) * 100) : null,
              expense.currency
            )}
          </Text>
          <Text style={styles.amountSub}>
            {date || "No date"} · {merchant || "No merchant"}
          </Text>
        </View>

        <Text style={styles.label}>Merchant</Text>
        <TextInput
          value={merchant}
          onChangeText={setMerchant}
          style={styles.input}
          placeholder="Merchant"
          placeholderTextColor="#94a3b8"
        />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Amount</Text>
            <TextInput
              value={amountDollars}
              onChangeText={setAmountDollars}
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#94a3b8"
              keyboardType="decimal-pad"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>Date</Text>
            <TextInput
              value={date}
              onChangeText={setDate}
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        <Text style={styles.label}>Category</Text>
        <CategoryPicker value={category} onChange={setCategory} />

        <Text style={styles.label}>Business purpose</Text>
        <TextInput
          value={purpose}
          onChangeText={setPurpose}
          style={styles.input}
          placeholder="Why was this a business expense?"
          placeholderTextColor="#94a3b8"
        />

        <Text style={styles.label}>Notes</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          style={[styles.input, { minHeight: 80, textAlignVertical: "top" }]}
          placeholder="Optional notes"
          placeholderTextColor="#94a3b8"
          multiline
        />

        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleLabel}>Business expense</Text>
            <Text style={styles.toggleHint}>
              Off = personal, not tax-deductible
            </Text>
          </View>
          <Switch value={isBusiness} onValueChange={setIsBusiness} />
        </View>

        <Pressable
          onPress={onSave}
          disabled={saving}
          style={({ pressed }) => [
            styles.saveBtn,
            saving && { opacity: 0.6 },
            pressed && { opacity: 0.85 },
          ]}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Save changes</Text>
          )}
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { padding: 20, paddingBottom: 60 },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    backgroundColor: "#e2e8f0",
    resizeMode: "cover",
  },
  imagePlaceholder: { alignItems: "center", justifyContent: "center" },
  amountBanner: {
    marginTop: 16,
    marginBottom: 8,
    alignItems: "center",
  },
  amountBig: { fontSize: 32, fontWeight: "700", color: "#0f172a" },
  amountSub: { fontSize: 13, color: "#64748b", marginTop: 4 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: "#0f172a",
  },
  row: { flexDirection: "row" },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 14,
  },
  toggleLabel: { fontSize: 15, fontWeight: "600", color: "#0f172a" },
  toggleHint: { fontSize: 12, color: "#64748b", marginTop: 2 },
  saveBtn: {
    marginTop: 28,
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
