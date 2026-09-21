export type DiningConditions = {
  mood: string;
  budget: string;
  companion: string;
  restrictions: string;
  yesterdayCuisine: string;
  setting: string;
};

export type Recommendation = {
  name: string;
  category: string;
  reason: string;
  drink: string;
};

export type RecommendationResponse = { recommendations: Recommendation[] };

export function buildRecommendationPrompt(conditions: DiningConditions) {
  return `오늘 식사 조건입니다.\n- 기분: ${conditions.mood || "특별한 선호 없음"}\n- 예산: ${conditions.budget || "특별한 제한 없음"}\n- 함께 먹는 사람: ${conditions.companion}\n- 못 먹는 음식: ${conditions.restrictions || "없음"}\n- 어제 먹은 음식류: ${conditions.yesterdayCuisine || "기억 안 남"}\n- 식사 환경: ${conditions.setting}\n\n이 조건을 모두 반영하여 오늘 먹기 좋은 메뉴를 추천해 주세요.`;
}

function isRecommendation(value: unknown): value is Recommendation {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return ["name", "category", "reason", "drink"].every(
    (key) => typeof item[key] === "string" && item[key].trim().length > 0,
  );
}

export function parseRecommendations(raw: string): RecommendationResponse {
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object") throw new Error("추천 결과 형식이 올바르지 않습니다.");
  const recommendations = (parsed as { recommendations?: unknown }).recommendations;
  if (!Array.isArray(recommendations) || recommendations.length !== 3 || !recommendations.every(isRecommendation)) {
    throw new Error("AI는 정확히 3개의 추천 메뉴를 반환해야 합니다.");
  }
  return { recommendations };
}
