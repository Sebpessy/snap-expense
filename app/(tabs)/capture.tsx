import { useRef, useState } from "react";
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
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Camera as CameraIcon,
  Image as ImageIcon,
  RotateCcw,
  X,
  Check,
} from "lucide-react-native";
import { useAuth } from "@/hooks/useAuth";
import { CategoryPicker } from "@/components/CategoryPicker";
import { extractReceipt, uploadReceiptImage, createExpense } from "@/lib/api";
import { formatCents, type ExtractionResult } from "@/lib/types";

type Stage = "idle" | "captured" | "extracting" | "review" | "saving";

export default function CaptureScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const [stage, setStage] = useState<Stage>("idle");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [extraction, setExtraction] = useState<ExtractionResult | null>(null);
  const [merchant, setMerchant] = useState("");
  const [amountDollars, setAmountDollars] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState<string>("other");
  const [purpose, setPurpose] = useState("");
  const [isBusiness, setIsBusiness] = useState(true);

  function reset() {
    setStage("idle");
    setImageUri(null);
    setImageBase64(null);
    setExtraction(null);
    setMerchant("");
    setAmountDollars("");
    setDate("");
    setCategory("other");
    setPurpose("");
    setIsBusiness(true);
  }

  async function onTakePhoto() {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        skipProcessing: false,
      });
      if (!photo?.uri) return;
      await onImageReady(photo.uri);
    } catch (err) {
      Alert.alert("Camera error", (err as Error).message);
    }
  }

  async function onPickFromLibrary() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    await onImageReady(result.assets[0].uri);
  }

  async function onImageReady(uri: string) {
    setStage("captured");
    setImageUri(uri);
    // Resize/compress to keep request payload reasonable; Claude vision
    // works fine with ~1600px on the long edge.
    const manipulated = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1600 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );
    if (!manipulated.base64) {
      Alert.alert("Image error", "Could not read image data.");
      reset();
      return;
    }
    setImageUri(manipulated.uri);
    setImageBase64(manipulated.base64);
    await runExtraction(manipulated.base64);
  }

  async function runExtraction(base64: string) {
    setStage("extracting");
    try {
      const res = await extractReceipt({
        imageBase64: base64,
        mimeType: "image/jpeg",
      });
      setExtraction(res);
      setMerchant(res.merchant ?? "");
      setAmountDollars(
        res.amount_cents != null ? (res.amount_cents / 100).toFixed(2) : ""
      );
      setDate(res.expense_date ?? "");
      setCategory(res.category_code ?? "other");
      setPurpose(res.business_purpose ?? "");
      setIsBusiness(res.is_business);
      setStage("review");
    } catch (err) {
      Alert.alert("Extraction failed", (err as Error).message);
      setStage("captured");
    }
  }

  async function onSave() {
    if (!user || !imageBase64 || !extraction) return;
    setStage("saving");
    try {
      const receiptPath = await uploadReceiptImage({
        userId: user.id,
        filename: "receipt.jpg",
        base64: imageBase64,
        mimeType: "image/jpeg",
      });
      const amountCents = amountDollars
        ? Math.round(Number(amountDollars) * 100)
        : null;
      await createExpense({
        userId: user.id,
        extraction: {
          ...extraction,
          merchant: merchant || null,
          amount_cents: Number.isFinite(amountCents as number)
            ? (amountCents as number)
            : null,
          expense_date: date || null,
          category_code: category,
          business_purpose: purpose || null,
          is_business: isBusiness,
        },
        receiptPath,
      });
      reset();
      router.replace("/(tabs)/expenses");
    } catch (err) {
      Alert.alert("Save failed", (err as Error).message);
      setStage("review");
    }
  }

  // ─── render ──────────────────────────────────────────────────────
  if (stage === "idle") {
    if (!permission) {
      return (
        <SafeAreaView style={styles.safe}>
          <View style={styles.center}>
            <ActivityIndicator />
          </View>
        </SafeAreaView>
      );
    }
    if (!permission.granted) {
      return (
        <SafeAreaView style={styles.safe}>
          <View style={styles.center}>
            <Text style={styles.permTitle}>Camera permission needed</Text>
            <Text style={styles.permSubtitle}>
              We use your camera to snap receipts. Images stay private to
              your account.
            </Text>
            <Pressable
              onPress={requestPermission}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>Grant access</Text>
            </Pressable>
            <Pressable onPress={onPickFromLibrary} style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>Pick from library instead</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      );
    }
    return (
      <View style={styles.cameraWrap}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
        />
        <SafeAreaView style={styles.cameraOverlay} edges={["top", "bottom"]}>
          <View style={styles.guide}>
            <Text style={styles.guideText}>
              Line up the receipt inside the frame
            </Text>
          </View>
          <View style={styles.frame} />
          <View style={styles.controls}>
            <Pressable onPress={onPickFromLibrary} style={styles.iconBtn}>
              <ImageIcon color="#fff" size={26} />
            </Pressable>
            <Pressable onPress={onTakePhoto} style={styles.shutter}>
              <View style={styles.shutterInner} />
            </Pressable>
            <View style={{ width: 52 }} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (stage === "captured" || stage === "extracting") {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.previewHeader}>
          <Pressable onPress={reset} hitSlop={12}>
            <X color="#0f172a" size={24} />
          </Pressable>
          <Text style={styles.previewTitle}>Processing…</Text>
          <View style={{ width: 24 }} />
        </View>
        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
        )}
        <View style={styles.extractingBox}>
          <ActivityIndicator color="#2563eb" />
          <Text style={styles.extractingText}>
            Reading receipt with Claude vision…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // review | saving
  const confidence = extraction?.category_confidence ?? 1;
  const lowConf = confidence < 0.6;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.previewHeader}>
        <Pressable onPress={reset} hitSlop={12}>
          <X color="#0f172a" size={24} />
        </Pressable>
        <Text style={styles.previewTitle}>Review</Text>
        <Pressable
          onPress={() => imageBase64 && runExtraction(imageBase64)}
          hitSlop={12}
        >
          <RotateCcw color="#2563eb" size={22} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.reviewScroll}>
        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.thumbnail} />
        )}

        {extraction?.warnings && extraction.warnings.length > 0 && (
          <View style={styles.warnBox}>
            {extraction.warnings.map((w, i) => (
              <Text key={i} style={styles.warnText}>• {w}</Text>
            ))}
          </View>
        )}

        <Text style={styles.label}>Merchant</Text>
        <TextInput
          value={merchant}
          onChangeText={setMerchant}
          style={styles.input}
          placeholder="e.g. Home Depot"
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

        <Text style={styles.label}>
          Category {lowConf && <Text style={styles.lowConf}>— low confidence, please confirm</Text>}
        </Text>
        <CategoryPicker value={category} onChange={setCategory} />

        <Text style={styles.label}>Business purpose</Text>
        <TextInput
          value={purpose}
          onChangeText={setPurpose}
          style={styles.input}
          placeholder="e.g. Client meeting, office supplies"
          placeholderTextColor="#94a3b8"
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

        {extraction?.line_items && extraction.line_items.length > 0 && (
          <View style={styles.lineItems}>
            <Text style={styles.label}>Line items</Text>
            {extraction.line_items.map((li, i) => (
              <View key={i} style={styles.lineItem}>
                <Text style={styles.lineItemDesc} numberOfLines={1}>
                  {li.description}
                </Text>
                <Text style={styles.lineItemAmt}>
                  {formatCents(li.amount_cents)}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Pressable
          onPress={onSave}
          disabled={stage === "saving"}
          style={({ pressed }) => [
            styles.saveBtn,
            (stage === "saving" || !merchant) && { opacity: 0.6 },
            pressed && { opacity: 0.85 },
          ]}
        >
          {stage === "saving" ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Check color="#fff" size={18} />
              <Text style={styles.saveBtnText}>Save expense</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8fafc" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  permTitle: { fontSize: 20, fontWeight: "700", color: "#0f172a" },
  permSubtitle: {
    fontSize: 14,
    color: "#475569",
    textAlign: "center",
    marginTop: 8,
  },
  primaryBtn: {
    marginTop: 24,
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  primaryBtnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  secondaryBtn: { marginTop: 16, padding: 12 },
  secondaryBtnText: { color: "#2563eb", fontWeight: "500" },

  cameraWrap: { flex: 1, backgroundColor: "#000" },
  cameraOverlay: { flex: 1, justifyContent: "space-between", alignItems: "center" },
  guide: { marginTop: 24, paddingHorizontal: 20 },
  guideText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: "hidden",
  },
  frame: {
    flex: 1,
    width: "80%",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.7)",
    borderRadius: 16,
    borderStyle: "dashed",
    marginVertical: 32,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 40,
    paddingBottom: 12,
  },
  iconBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  shutter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 4,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#fff",
  },

  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#f8fafc",
  },
  previewTitle: { fontSize: 17, fontWeight: "600", color: "#0f172a" },
  previewImage: {
    width: "100%",
    aspectRatio: 0.75,
    resizeMode: "cover",
  },
  extractingBox: { padding: 32, alignItems: "center" },
  extractingText: { marginTop: 12, color: "#475569" },

  reviewScroll: { padding: 20, paddingBottom: 60 },
  thumbnail: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    resizeMode: "cover",
    marginBottom: 20,
    backgroundColor: "#e2e8f0",
  },
  warnBox: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fcd34d",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  warnText: { color: "#78350f", fontSize: 13 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
    marginTop: 14,
  },
  lowConf: { color: "#b45309", fontWeight: "500" },
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
  lineItems: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 14,
  },
  lineItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  lineItemDesc: { flex: 1, color: "#0f172a", fontSize: 14, marginRight: 12 },
  lineItemAmt: { color: "#475569", fontSize: 14, fontWeight: "500" },
  saveBtn: {
    marginTop: 28,
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
