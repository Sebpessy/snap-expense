import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LogOut, FileText, ShieldCheck } from "lucide-react-native";
import { useAuth } from "@/hooks/useAuth";

export default function SettingsScreen() {
  const { user, signOut } = useAuth();

  function confirmSignOut() {
    Alert.alert("Sign out?", "You can sign back in anytime.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: signOut },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Signed in as</Text>
        <Text style={styles.cardValue}>{user?.email ?? "—"}</Text>
      </View>

      <View style={styles.section}>
        <Row
          icon={<FileText color="#0f172a" size={20} />}
          label="Export (coming soon)"
          hint="Schedule C-ready CSV for your accountant"
          onPress={() =>
            Alert.alert("Coming soon", "CSV export lands in the next build.")
          }
        />
        <Row
          icon={<ShieldCheck color="#0f172a" size={20} />}
          label="Privacy"
          hint="Your receipts are encrypted at rest. Only you can read them."
          onPress={() => {}}
        />
      </View>

      <Pressable onPress={confirmSignOut} style={styles.signOut}>
        <LogOut color="#dc2626" size={18} />
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function Row({
  icon,
  label,
  hint,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}
    >
      <View style={styles.rowIcon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowHint}>{hint}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8fafc" },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: "700", color: "#0f172a" },
  card: {
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardLabel: { fontSize: 12, color: "#64748b" },
  cardValue: { fontSize: 16, color: "#0f172a", fontWeight: "600", marginTop: 2 },
  section: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e2e8f0",
    gap: 12,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { fontSize: 15, fontWeight: "600", color: "#0f172a" },
  rowHint: { fontSize: 12, color: "#64748b", marginTop: 2 },
  signOut: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 32,
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fff",
  },
  signOutText: { color: "#dc2626", fontWeight: "600", fontSize: 15 },
});
