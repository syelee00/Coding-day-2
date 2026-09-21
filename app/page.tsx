"use client";

import { FormEvent, useState } from "react";
import type { DiningConditions, Recommendation } from "@/lib/recommendations";

const moods = ["든든하게", "가볍게", "스트레스 해소", "특별하게"];
const budgets = ["1만 원 이하", "1~2만 원", "2만 원 이상"];
const companions = ["혼밥", "친구", "연인"];
const cuisines = ["한식", "중식", "양식", "일식", "분식", "없음"];
const settings = ["실내", "야외"];

const initialConditions: DiningConditions = {
  mood: "", budget: "", companion: "", restrictions: "", yesterdayCuisine: "", setting: "",
};

function ChoiceGroup({ label, values, value, onChange, required }: { label: string; values: string[]; value: string; onChange: (value: string) => void; required?: boolean }) {
  return <fieldset className="field"><legend>{label}{required && <span> *</span>}</legend><div className="choices">{values.map((item) => <button type="button" className={`choice ${value === item ? "active" : ""}`} key={item} onClick={() => onChange(item)}>{item}</button>)}</div></fieldset>;
}

export default function Home() {
  const [conditions, setConditions] = useState(initialConditions);
  const [results, setResults] = useState<Recommendation[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const update = (key: keyof DiningConditions, value: string) => setConditions((current) => ({ ...current, [key]: value }));

  async function recommend(event: FormEvent) {
    event.preventDefault(); setError("");
    if (!conditions.companion || !conditions.setting) { setError("함께 먹는 사람과 식사 환경을 골라주세요."); return; }
    setLoading(true);
    try {
      const response = await fetch("/api/recommend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(conditions) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setResults(data.recommendations);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "추천을 불러오지 못했어요."); }
    finally { setLoading(false); }
  }

  if (results) return <main className="shell result-shell"><button className="back" onClick={() => setResults(null)}>← 조건 수정하기</button><header><p className="eyebrow">TODAY&apos;S PICK</p><h1>오늘은 이 메뉴 어때요?</h1><p>당신의 조건을 반영한 세 가지 추천이에요.</p></header><section className="result-grid">{results.map((item, index) => <article className="recommendation-card" key={item.name}><span className="number">0{index + 1}</span><span className="category">{item.category}</span><h2>{item.name}</h2><p>{item.reason}</p><div className="drink"><span>어울리는 음료</span><strong>{item.drink}</strong></div></article>)}</section><button className="primary-button retry" onClick={() => setResults(null)}>다른 메뉴 추천받기</button></main>;

  return <main className="shell"><header><p className="eyebrow">AI MENU CURATOR</p><h1>오늘 뭐 먹지?</h1><p>지금의 기분과 상황을 알려주면 딱 맞는 메뉴를 골라드릴게요.</p></header><form onSubmit={recommend} className="menu-form"><ChoiceGroup label="오늘의 기분" values={moods} value={conditions.mood} onChange={(value) => update("mood", value)} /><ChoiceGroup label="예산" values={budgets} value={conditions.budget} onChange={(value) => update("budget", value)} /><ChoiceGroup label="함께 먹는 사람" values={companions} value={conditions.companion} onChange={(value) => update("companion", value)} required /><label className="field">못 먹는 음식<input value={conditions.restrictions} onChange={(event) => update("restrictions", event.target.value)} placeholder="예: 해산물, 고수, 매운 음식" /></label><ChoiceGroup label="어제 먹은 음식류" values={cuisines} value={conditions.yesterdayCuisine} onChange={(value) => update("yesterdayCuisine", value)} /><ChoiceGroup label="식사 환경" values={settings} value={conditions.setting} onChange={(value) => update("setting", value)} required />{error && <p className="error" role="alert">{error}</p>}<button className="primary-button" disabled={loading}>{loading ? "오늘의 메뉴를 고민 중이에요…" : "메뉴 추천받기"}</button></form></main>;
}
