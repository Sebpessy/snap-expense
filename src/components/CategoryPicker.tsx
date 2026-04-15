import { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SCHEDULE_C_CATEGORIES, getCategory } from "@/lib/categories";

export function CategoryPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const current = getCategory(value);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SCHEDULE_C_CATEGORIES;
    return SCHEDULE_C_CATEGORIES.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.hint.toLowerCase().includes(q) ||
        c.line.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <>
      <Pressable onPress={() => setOpen(true)} style={styles.trigger}>
        <View style={{ flex: 1 }}>
          <Text style={styles.triggerLabel}>{current.label}</Text>
          <Text style={styles.triggerHint}>
            {current.line} · {current.hint}
          </Text>
        </View>
        <Text style={styles.chev}>›</Text>
      </Pressable>

      <Modal
        animationType="slide"
        presentationStyle="pageSheet"
        visible={open}
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Category</Text>
            <Pressable onPress={() => setOpen(false)} hitSlop={12}>
              <Text style={styles.close}>Done</Text>
            </Pressable>
          </View>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search categories"
            placeholderTextColor="#94a3b8"
            style={styles.search}
          />
          <FlatList
            data={results}
            keyExtractor={(c) => c.code}
            renderItem={({ item }) => {
              const selected = item.code === value;
              return (
                <Pressable
                  onPress={() => {
                    onChange(item.code);
                    setOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.row,
                    selected && styles.rowSelected,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowLabel}>{item.label}</Text>
                    <Text style={styles.rowHint}>
                      {item.line} · {item.hint}
                    </Text>
                  </View>
                  {selected && <Text style={styles.check}>✓</Text>}
                </Pressable>
              );
            }}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  triggerLabel: { fontSize: 16, fontWeight: "600", color: "#0f172a" },
  triggerHint: { fontSize: 12, color: "#64748b", marginTop: 2 },
  chev: { fontSize: 28, color: "#94a3b8", marginLeft: 8 },
  sheet: { flex: 1, backgroundColor: "#f8fafc", paddingTop: 12 },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sheetTitle: { fontSize: 20, fontWeight: "700", color: "#0f172a" },
  close: { color: "#2563eb", fontWeight: "600", fontSize: 16 },
  search: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#fff",
  },
  rowSelected: { backgroundColor: "#eff6ff" },
  rowLabel: { fontSize: 16, color: "#0f172a", fontWeight: "500" },
  rowHint: { fontSize: 12, color: "#64748b", marginTop: 2 },
  check: { color: "#2563eb", fontWeight: "700", fontSize: 18 },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: "#e2e8f0" },
});
