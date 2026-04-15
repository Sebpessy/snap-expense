import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    setError(null);
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) setError(error.message);
    setSubmitting(false);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brandBlock}>
            <Text style={styles.logo}>📸</Text>
            <Text style={styles.title}>Snap Expense</Text>
            <Text style={styles.subtitle}>
              Snap a receipt. We'll handle the rest.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#94a3b8"
              style={styles.input}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              style={styles.input}
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <Pressable
              onPress={onSubmit}
              disabled={submitting || !email || !password}
              style={({ pressed }) => [
                styles.primaryBtn,
                (submitting || !email || !password) && { opacity: 0.5 },
                pressed && { opacity: 0.85 },
              ]}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>Sign in</Text>
              )}
            </Pressable>

            <Link href="/(auth)/signup" asChild>
              <Pressable style={styles.secondaryBtn}>
                <Text style={styles.secondaryBtnText}>
                  Don't have an account? Sign up
                </Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8fafc" },
  container: { flexGrow: 1, padding: 24, justifyContent: "space-between" },
  brandBlock: { marginTop: 48, alignItems: "center" },
  logo: { fontSize: 56, marginBottom: 8 },
  title: { fontSize: 30, fontWeight: "700", color: "#0f172a" },
  subtitle: { fontSize: 15, color: "#475569", marginTop: 6, textAlign: "center" },
  form: { marginTop: 32 },
  label: { fontSize: 13, fontWeight: "600", color: "#334155", marginBottom: 6, marginTop: 12 },
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
  error: { color: "#dc2626", marginTop: 12, fontSize: 13 },
  primaryBtn: {
    marginTop: 20,
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  secondaryBtn: { marginTop: 16, paddingVertical: 12, alignItems: "center" },
  secondaryBtnText: { color: "#2563eb", fontSize: 14, fontWeight: "500" },
});
