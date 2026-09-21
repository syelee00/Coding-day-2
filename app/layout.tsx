import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "오늘 뭐 먹지? | AI 메뉴 추천", description: "AI가 오늘의 메뉴를 추천합니다." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ko"><body>{children}</body></html>; }
