// 사진을 클라이언트에서 다운스케일 → 작은 JPEG dataURL/base64로 변환.
// 토큰·전송량을 줄이고, 원본은 어디에도 업로드하지 않는다(섹션 10.4).

export interface PreparedImage {
  dataUrl: string; // 화면 표시용 (data:image/jpeg;base64,...)
  base64: string; // 전송용 (prefix 제거)
  mimeType: string;
}

export async function prepareImage(
  file: File,
  maxDim = 768,
  quality = 0.72,
): Promise<PreparedImage> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("캔버스를 만들 수 없어요.");
    ctx.drawImage(img, 0, 0, w, h);

    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    const base64 = dataUrl.split(",")[1] ?? "";
    return { dataUrl, base64, mimeType: "image/jpeg" };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("이미지를 불러오지 못했어요."));
    img.src = src;
  });
}
