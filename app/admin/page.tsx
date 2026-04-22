"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type MonthlyReport = {
  id: string;
  staff_name: string;
  office_name: string;
  year: number;
  month: number;
  end_contracts: number | null;
  consultations: number | null;
  kokuhoren_claims: number | null;
  new_contracts: number | null;
  cancellations: number | null;
  monitoring_rate: number | null;
  reflection_result: string;
  reflection_issues: string;
  reflection_next: string;
};

export default function AdminPage() {
  const [data, setData] = useState<MonthlyReport[]>([]);
  const [year, setYear] = useState(2026);
  const [kpi, setKpi] = useState("consultations");
  const [selectedReport, setSelectedReport] = useState<MonthlyReport | null>(null);

  const kpis = [
    { key: "consultations", label: "相談件数" },
    { key: "end_contracts", label: "契約件数" },
    { key: "kokuhoren_claims", label: "国保連請求" },
    { key: "new_contracts", label: "新規契約" },
    { key: "cancellations", label: "解約" },
  ];

  const months = [1,2,3,4,5,6,7,8,9,10,11,12];

  useEffect(() => {
    supabase
      .from("monthly_reports")
      .select("*")
      .eq("year", year)
      .then(({ data }) => setData((data ?? []) as MonthlyReport[]));
  }, [year]);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const staffList = [...new Set(data.map((d) => d.staff_name + "___" + d.office_name))];

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">相談員別 年間実績</h1>
            <p className="text-sm text-zinc-500 mt-1">管理者専用ページ</p>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100">
              月報入力へ
            </Link>
            <button onClick={handleLogout} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100">
              ログアウト
            </button>
          </div>
        </div>

        <div className="flex gap-4 mb-4 flex-wrap items-center">
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}
            className="border border-zinc-200 rounded-lg px-3 py-2 text-sm bg-white">
            <option value={2024}>2024年</option>
            <option value={2025}>2025年</option>
            <option value={2026}>2026年</option>
            <option value={2027}>2027年</option>
          </select>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          {kpis.map((k) => (
            <button key={k.key} onClick={() => setKpi(k.key)}
              className={"px-4 py-1.5 rounded-lg text-sm border font-medium transition " +
                (kpi === k.key ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50")}>
              {k.label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="px-4 py-3 text-left font-medium text-zinc-600 whitespace-nowrap">担当者（事業所）</th>
                {months.map((m) => (
                  <th key={m} className="px-2 py-3 text-center font-medium text-zinc-600">{m}月</th>
                ))}
                <th className="px-4 py-3 text-center font-medium text-zinc-600">合計</th>
                <th className="px-4 py-3 text-center font-medium text-zinc-600">振り返り</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {staffList.length === 0 && (
                <tr>
                  <td colSpan={15} className="px-4 py-8 text-center text-zinc-400">データがありません</td>
                </tr>
              )}
              {staffList.map((staffKey) => {
                const [staffName, officeName] = staffKey.split("___");
                const sd = data.filter((d) => d.staff_name === staffName && d.office_name === officeName);
                const vals = months.map((m) => sd.find((d) => d.month === m));
                const total = vals.reduce((s, v) => s + ((v as any)?.[kpi] ?? 0), 0);
                const latest = [...sd].sort((a, b) => b.month - a.month)[0];
                return (
                  <tr key={staffKey} className="hover:bg-zinc-50 transition">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium">{staffName}</div>
                      <div className="text-xs text-zinc-400">{officeName}</div>
                    </td>
                    {vals.map((v, i) => (
                      <td key={i} className="px-2 py-3 text-center">
                        {v != null ? ((v as any)[kpi] ?? "—") : "—"}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center font-bold">{total}</td>
                    <td className="px-4 py-3 text-center">
                      {latest ? (
                        <button onClick={() => setSelectedReport(latest)}
                          className="rounded-lg bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-200">
                          最新
                        </button>
                      ) : "—"}
                    </td>
                  </tr>
                );
              })}
              {staffList.length > 0 && (
                <tr className="bg-zinc-50 font-bold border-t-2 border-zinc-200">
                  <td className="px-4 py-3">合計</td>
                  {months.map((m) => {
                    const t = data.filter((d) => d.month === m).reduce((s, d) => s + ((d as any)[kpi] ?? 0), 0);
                    return <td key={m} className="px-2 py-3 text-center">{t || "—"}</td>;
                  })}
                  <td className="px-4 py-3 text-center">
                    {data.reduce((s, d) => s + ((d as any)[kpi] ?? 0), 0)}
                  </td>
                  <td />
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-2 text-xs text-zinc-400">{data.length}件のデータ</div>
      </div>

      {selectedReport && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedReport(null)}>
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 max-w-lg w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">
                {selectedReport.year}年{selectedReport.month}月　{selectedReport.staff_name}
              </h2>
              <button onClick={() => setSelectedReport(null)}
                className="text-zinc-400 hover:text-zinc-600 text-xl leading-none">✕</button>
            </div>
            <div className="space-y-4 text-sm">
              {[
                { label: "結果", value: selectedReport.reflection_result },
                { label: "課題", value: selectedReport.reflection_issues },
                { label: "来月へ", value: selectedReport.reflection_next },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="font-medium text-zinc-700 mb-1">{label}</div>
                  <div className="rounded-lg bg-zinc-50 p-3 text-zinc-800 whitespace-pre-wrap min-h-12">
                    {value || "未入力"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}