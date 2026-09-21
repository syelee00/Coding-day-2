import assert from "node:assert/strict";
import test from "node:test";

import { buildRecommendationPrompt, parseRecommendations } from "../lib/recommendations";
import { buildIllustrationPrompt } from "../lib/illustrations";

test("buildRecommendationPrompt includes every submitted dining condition", () => {
  const prompt = buildRecommendationPrompt({
    mood: "스트레스 해소",
    budget: "1~2만 원",
    companion: "친구",
    restrictions: "해산물, 고수",
    yesterdayCuisine: "중식",
    setting: "실내",
  });

  assert.match(prompt, /스트레스 해소/);
  assert.match(prompt, /1~2만 원/);
  assert.match(prompt, /친구/);
  assert.match(prompt, /해산물, 고수/);
  assert.match(prompt, /중식/);
  assert.match(prompt, /실내/);
});

test("parseRecommendations accepts exactly three valid recommendation cards", () => {
  const result = parseRecommendations(JSON.stringify({
    recommendations: [
      { name: "순두부찌개", category: "한식", reason: "따뜻하고 든든해요.", drink: "식혜" },
      { name: "쌀국수", category: "아시아", reason: "가볍고 깔끔해요.", drink: "레몬티" },
      { name: "샐러드 파스타", category: "양식", reason: "여럿이 나눠 먹기 좋아요.", drink: "탄산수" }
    ]
  }));

  assert.equal(result.recommendations.length, 3);
  assert.equal(result.recommendations[0].name, "순두부찌개");
});

test("parseRecommendations rejects malformed AI output", () => {
  assert.throws(() => parseRecommendations('{"recommendations": []}'), /3개의 추천/);
});

test("buildIllustrationPrompt names the selected menu and locks the visual style", () => {
  const prompt = buildIllustrationPrompt("얼큰한 순두부찌개");

  assert.match(prompt, /얼큰한 순두부찌개/);
  assert.match(prompt, /food illustration/i);
  assert.match(prompt, /no text/i);
});
