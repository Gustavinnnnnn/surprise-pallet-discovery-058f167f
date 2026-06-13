import QRCode from "qrcode";

export type PixPaymentData = {
  qr_code?: string;
  qr_code_image?: string;
  copy_paste?: string;
};

const copyPasteKeys = [
  "qr_code",
  "qrcode",
  "pix_code",
  "pixcode",
  "pix_copia_cola",
  "copia_cola",
  "copy_paste",
  "copypaste",
  "emv",
  "brcode",
  "payload",
];

const imageKeys = [
  "qr_code_base64",
  "qrcode_base64",
  "qr_code_image",
  "qrcode_image",
  "qr_code_url",
  "qrcode_url",
  "base64",
  "image",
];

const normalizeKey = (key: string) => key.toLowerCase().replace(/[^a-z0-9]/g, "");

const isPixCopyPaste = (value: string) => {
  const trimmed = value.trim();
  return trimmed.startsWith("000201") || trimmed.includes("BR.GOV.BCB.PIX") || trimmed.length > 80;
};

const isLikelyQrImage = (value: string) =>
  value.startsWith("data:image/") ||
  value.startsWith("http://") ||
  value.startsWith("https://") ||
  value.startsWith("iVBOR") ||
  value.startsWith("/9j/");

const walk = (value: unknown, visit: (key: string, value: string) => void, key = "") => {
  if (!value) return;
  if (typeof value === "string") {
    visit(key, value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, visit, `${key}_${index}`));
    return;
  }
  if (typeof value === "object") {
    Object.entries(value as Record<string, unknown>).forEach(([childKey, childValue]) =>
      walk(childValue, visit, childKey),
    );
  }
};

export const extractPixPaymentData = (response: unknown): PixPaymentData => {
  const roots = [response];
  if (response && typeof response === "object") {
    const raw = (response as { raw?: unknown }).raw;
    if (typeof raw === "string") {
      try {
        roots.push(JSON.parse(raw));
      } catch {
        roots.push(raw);
      }
    }
  }

  let copyPaste = "";
  let image = "";

  roots.forEach((root) => {
    walk(root, (key, rawValue) => {
      const value = rawValue.trim();
      if (!value) return;
      const normalized = normalizeKey(key);
      const copyKeyMatch = copyPasteKeys.some((candidate) => normalizeKey(candidate) === normalized);
      const imageKeyMatch = imageKeys.some((candidate) => normalizeKey(candidate) === normalized);

      if (!image && imageKeyMatch && isLikelyQrImage(value)) image = value;
      if (!copyPaste && copyKeyMatch && !isLikelyQrImage(value) && isPixCopyPaste(value)) copyPaste = value;
      if (!copyPaste && isPixCopyPaste(value) && !isLikelyQrImage(value)) copyPaste = value;
    });
  });

  return {
    qr_code: copyPaste || undefined,
    qr_code_image: image || undefined,
    copy_paste: copyPaste || undefined,
  };
};

export const ensurePixQrImage = async (pixData: PixPaymentData): Promise<PixPaymentData> => {
  if (pixData.qr_code_image || !pixData.copy_paste) return pixData;
  const qr_code_image = await QRCode.toDataURL(pixData.copy_paste, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 320,
  });
  return { ...pixData, qr_code_image };
};