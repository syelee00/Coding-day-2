import { GoogleGenAI } from "@google/genai";
import { DEFAULT_GEMINI_IMAGE_MODEL } from "@/lib/gemini-models";
import { buildIllustrationPrompt } from "@/lib/illustrations";

type GeneratedImage = { type: "image"; data?: string };

function findImageData(outputs: unknown): string | null {
  if (!Array.isArray(outputs)) return null;
  const image = outputs.find((item): item is GeneratedImage =>
    Boolean(item) && typeof item === "object" && (item as GeneratedImage).type === "image" && typeof (item as GeneratedImage).data === "string",
  );
  return image?.data ?? null;
}

export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) return Response.json({ error: "GEMINI_API_KEY가 설정되지 않았습니다." }, { status: 500 });
  try {
    const body: unknown = await request.json();
    const name = typeof body === "object" && body ? (body as { name?: unknown }).name : null;
    if (typeof name !== "string" || !name.trim()) return Response.json({ error: "메뉴 이름이 필요합니다." }, { status: 400 });
    const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const interaction = await client.interactions.create({
      model: process.env.GEMINI_IMAGE_MODEL || DEFAULT_GEMINI_IMAGE_MODEL,
      input: buildIllustrationPrompt(name.trim()),
      response_format: { type: "image", mime_type: "image/png", aspect_ratio: "1:1", image_size: "1K" },
    });
    const data = findImageData(interaction.outputs);
    if (!data) throw new Error("Image model returned no image data");
    return Response.json({ imageUrl: `data:image/png;base64,${data}` });
  } catch (error) {
    console.error("Gemini illustration failed", error);
    return Response.json({ error: "메뉴 일러스트를 불러오지 못했어요." }, { status: 502 });
  }
}
