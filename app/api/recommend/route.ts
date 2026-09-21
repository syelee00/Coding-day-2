import { GoogleGenAI, Type } from "@google/genai";
import { buildRecommendationPrompt, parseRecommendations, type DiningConditions } from "@/lib/recommendations";

const systemInstruction = `당신은 한국의 식사 메뉴 추천 전문가입니다.
사용자의 모든 조건을 우선순위로 반영해 서로 다른 메뉴 3가지를 추천합니다.
못 먹는 음식은 절대 추천하지 마세요. 어제 먹은 음식류와 같은 계열은 가급적 피하세요.
각 이유는 입력 조건을 명시적으로 반영한 자연스러운 한국어 한두 문장으로 씁니다.
응답에는 마크다운, 코드 블록, 설명을 절대 포함하지 말고 지정된 JSON 스키마와 정확히 일치하는 JSON만 반환하세요.`;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    recommendations: {
      type: Type.ARRAY,
      minItems: 3,
      maxItems: 3,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          category: { type: Type.STRING },
          reason: { type: Type.STRING },
          drink: { type: Type.STRING },
        },
        required: ["name", "category", "reason", "drink"],
      },
    },
  },
  required: ["recommendations"],
};

function isDiningConditions(value: unknown): value is DiningConditions {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  return ["mood", "budget", "companion", "restrictions", "yesterdayCuisine", "setting"].every(
    (key) => typeof data[key] === "string",
  );
}

export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return Response.json({ error: "GEMINI_API_KEY가 설정되지 않았습니다." }, { status: 500 });
  }

  try {
    const body: unknown = await request.json();
    if (!isDiningConditions(body) || !body.companion.trim() || !body.setting.trim()) {
      return Response.json({ error: "함께 먹는 사람과 식사 환경은 필수 입력입니다." }, { status: 400 });
    }

    const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await client.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: buildRecommendationPrompt(body),
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
      },
    });
    const result = parseRecommendations(response.text || "");
    return Response.json(result);
  } catch (error) {
    console.error("Gemini recommendation failed", error);
    return Response.json({ error: "추천을 불러오지 못했어요. 다시 시도해 주세요." }, { status: 502 });
  }
}
