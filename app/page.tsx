"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

type OfficeName = "みんなの学校いなしき" | "みんなの拠点いなしき" | "つくば拠点";

type MonthlyReport = {
  id?: string;
  staff_name: string;
  office_name: OfficeName;
  year: number;
  month: number; // 1-12

  goal_text: string;

  target_contracts: number | null;
  target_consultations: number | null;
  target_kokuhoren_claims: number | null;

  end_contracts: number | null;
  new_contracts: number | null;
  cancellations: number | null;
  consultations: number | null;
  monitoring_visits: number | null;
  kokuhoren_claims: number | null;
  plan_creations: number | null;
  monitoring_rate: number | null; // percent

  reflection_result: string;
  reflection_issues: string;
  reflection_next: string;
};

const offices: OfficeName[] = [
  "みんなの学校いなしき",
  "みんなの拠点いなしき",
  "つくば拠点",
];

function toNumberOrNull(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

function ymToParts(ym: string): { year: number; month: number } {
  const [y, m] = ym.split("-").map((v) => Number(v));
  return { year: y, month: m };
}

function partsToYm(year: number, month: number): string {
  const mm = String(month).padStart(2, "0");
  return `${year}-${mm}`;
}

function currentYm(): string {
  const d = new Date();
  return partsToYm(d.getFullYear(), d.getMonth() + 1);
}

function inputBaseClass() {
  return "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-200";
}

function labelClass() {
  return "text-sm font-medium text-zinc-800";
}

function sectionTitleClass() {
  return "text-sm font-semibold text-zinc-900";
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"form" | "trend">("form");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "ok" | "err"; message: string } | null>(
    null,
  );

  const [staffName, setStaffName] = useState("");
  const [officeName, setOfficeName] = useState<OfficeName>("みんなの学校いなしき");
  const [ym, setYm] = useState(currentYm());

  const [goalText, setGoalText] = useState("");

  const [targetContracts, setTargetContracts] = useState("");
  const [targetConsultations, setTargetConsultations] = useState("");
  const [targetKokuhorenClaims, setTargetKokuhorenClaims] = useState("");

  const [endContracts, setEndContracts] = useState("");
  const [newContracts, setNewContracts] = useState("");
  const [cancellations, setCancellations] = useState("");
  const [consultations, setConsultations] = useState("");
  const [monitoringVisits, setMonitoringVisits] = useState("");
  const [kokuhorenClaims, setKokuhorenClaims] = useState("");
  const [planCreations, setPlanCreations] = useState("");
  const [monitoringRate, setMonitoringRate] = useState("");

  const [reflectionResult, setReflectionResult] = useState("");
  const [reflectionIssues, setReflectionIssues] = useState("");
  const [reflectionNext, setReflectionNext] = useState("");

  const { year, month } = useMemo(() => ymToParts(ym), [ym]);

  // Trend state
  const [trendYear, setTrendYear] = useState<number>(() => new Date().getFullYear());
  const [trendRows, setTrendRows] = useState<MonthlyReport[]>([]);
  const [trendLoading, setTrendLoading] = useState(false);
  const [trendError, setTrendError] = useState<string | null>(null);

  async function loadReportForYm() {
    if (!staffName.trim()) return;
    setLoading(true);
    setStatus(null);
    try {
      const { data, error } = await supabase
        .from("monthly_reports")
        .select("*")
        .eq("staff_name", staffName.trim())
        .eq("office_name", officeName)
        .eq("year", year)
        .eq("month", month)
        .maybeSingle();

      if (error) throw error;
      if (!data) return;

      setGoalText((data.goal_text ?? "") as string);

      setTargetContracts(String(data.target_contracts ?? ""));
      setTargetConsultations(String(data.target_consultations ?? ""));
      setTargetKokuhorenClaims(String(data.target_kokuhoren_claims ?? ""));

      setEndContracts(String(data.end_contracts ?? ""));
      setNewContracts(String(data.new_contracts ?? ""));
      setCancellations(String(data.cancellations ?? ""));
      setConsultations(String(data.consultations ?? ""));
      setMonitoringVisits(String(data.monitoring_visits ?? ""));
      setKokuhorenClaims(String(data.kokuhoren_claims ?? ""));
      setPlanCreations(String(data.plan_creations ?? ""));
      setMonitoringRate(String(data.monitoring_rate ?? ""));

      setReflectionResult((data.reflection_result ?? "") as string);
      setReflectionIssues((data.reflection_issues ?? "") as string);
      setReflectionNext((data.reflection_next ?? "") as string);

      setStatus({ type: "ok", message: "保存済みデータを読み込みました。" });
    } catch (e: any) {
      setStatus({ type: "err", message: e?.message ?? "読み込みに失敗しました。" });
    } finally {
      setLoading(false);
    }
  }

  async function saveReport() {
    setStatus(null);
    if (!staffName.trim()) {
      setStatus({ type: "err", message: "担当者名を入力してください。" });
      return;
    }
    if (!year || !month) {
      setStatus({ type: "err", message: "年月を選択してください。" });
      return;
    }

    const payload: MonthlyReport = {
      staff_name: staffName.trim(),
      office_name: officeName,
      year,
      month,
      goal_text: goalText.trim(),

      target_contracts: toNumberOrNull(targetContracts),
      target_consultations: toNumberOrNull(targetConsultations),
      target_kokuhoren_claims: toNumberOrNull(targetKokuhorenClaims),

      end_contracts: toNumberOrNull(endContracts),
      new_contracts: toNumberOrNull(newContracts),
      cancellations: toNumberOrNull(cancellations),
      consultations: toNumberOrNull(consultations),
      monitoring_visits: toNumberOrNull(monitoringVisits),
      kokuhoren_claims: toNumberOrNull(kokuhorenClaims),
      plan_creations: toNumberOrNull(planCreations),
      monitoring_rate: toNumberOrNull(monitoringRate),

      reflection_result: reflectionResult.trim(),
      reflection_issues: reflectionIssues.trim(),
      reflection_next: reflectionNext.trim(),
    };

    setLoading(true);
    try {
      const { data: existing, error: findError } = await supabase
        .from("monthly_reports")
        .select("id")
        .eq("staff_name", payload.staff_name)
        .eq("office_name", payload.office_name)
        .eq("year", payload.year)
        .eq("month", payload.month)
        .maybeSingle();

      if (findError) throw findError;

      if (existing?.id) {
        const { error: updateError } = await supabase
          .from("monthly_reports")
          .update(payload)
          .eq("id", existing.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("monthly_reports")
          .insert(payload);
        if (insertError) throw insertError;
      }

      setStatus({ type: "ok", message: "保存しました。" });
    } catch (e: any) {
      setStatus({ type: "err", message: e?.message ?? "保存に失敗しました。" });
    } finally {
      setLoading(false);
    }
  }

  async function loadTrend() {
    if (!staffName.trim()) {
      setTrendError("担当者名を入力すると年間推移を表示できます。");
      setTrendRows([]);
      return;
    }

    setTrendLoading(true);
    setTrendError(null);
    try {
      const { data, error } = await supabase
        .from("monthly_reports")
        .select("*")
        .eq("staff_name", staffName.trim())
        .eq("office_name", officeName)
        .eq("year", trendYear)
        .order("month", { ascending: true });

      if (error) throw error;
      setTrendRows((data ?? []) as MonthlyReport[]);
    } catch (e: any) {
      setTrendError(e?.message ?? "読み込みに失敗しました。");
      setTrendRows([]);
    } finally {
      setTrendLoading(false);
    }
  }

  useEffect(() => {
    if (activeTab === "trend") {
      loadTrend();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const trendChartData = useMemo(() => {
    const labels = Array.from({ length: 12 }, (_, i) => `${i + 1}月`);
    const byMonth = new Map<number, MonthlyReport>();
    for (const r of trendRows) byMonth.set(r.month, r);

    const actualContracts = labels.map((_, i) => byMonth.get(i + 1)?.end_contracts ?? null);
    const actualConsultations = labels.map((_, i) => byMonth.get(i + 1)?.consultations ?? null);
    const actualClaims = labels.map((_, i) => byMonth.get(i + 1)?.kokuhoren_claims ?? null);

    const targetContractsArr = labels.map(
      (_, i) => byMonth.get(i + 1)?.target_contracts ?? null,
    );
    const targetConsultationsArr = labels.map(
      (_, i) => byMonth.get(i + 1)?.target_consultations ?? null,
    );
    const targetClaimsArr = labels.map(
      (_, i) => byMonth.get(i + 1)?.target_kokuhoren_claims ?? null,
    );

    return {
      labels,
      datasets: [
        {
          label: "月末契約件数",
          data: actualContracts,
          borderColor: "#0f172a",
          backgroundColor: "rgba(15,23,42,0.08)",
          tension: 0.2,
        },
        {
          label: "相談件数",
          data: actualConsultations,
          borderColor: "#2563eb",
          backgroundColor: "rgba(37,99,235,0.08)",
          tension: 0.2,
        },
        {
          label: "国保連請求件数",
          data: actualClaims,
          borderColor: "#16a34a",
          backgroundColor: "rgba(22,163,74,0.08)",
          tension: 0.2,
        },
        {
          label: "契約件数目標",
          data: targetContractsArr,
          borderColor: "rgba(15,23,42,0.35)",
          borderDash: [6, 6],
          pointRadius: 0,
          tension: 0.2,
        },
        {
          label: "相談件数目標",
          data: targetConsultationsArr,
          borderColor: "rgba(37,99,235,0.35)",
          borderDash: [6, 6],
          pointRadius: 0,
          tension: 0.2,
        },
        {
          label: "国保連請求目標",
          data: targetClaimsArr,
          borderColor: "rgba(22,163,74,0.35)",
          borderDash: [6, 6],
          pointRadius: 0,
          tension: 0.2,
        },
      ],
    };
  }, [trendRows]);

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">月報管理</h1>
          <p className="mt-1 text-sm text-zinc-600">
            相談支援専門員向けの月報を入力し、年間推移を確認できます。
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className={labelClass()}>担当者名</label>
              <input
                className={inputBaseClass()}
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                placeholder="例：山田 太郎"
              />
            </div>
            <div>
              <label className={labelClass()}>事業所名</label>
              <select
                className={inputBaseClass()}
                value={officeName}
                onChange={(e) => setOfficeName(e.target.value as OfficeName)}
              >
                {offices.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass()}>年月</label>
              <input
                className={inputBaseClass()}
                type="month"
                value={ym}
                onChange={(e) => setYm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("form")}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                activeTab === "form"
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200"
              }`}
            >
              月報入力
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("trend")}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                activeTab === "trend"
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200"
              }`}
            >
              年間推移
            </button>
          </div>
        </div>

        {status && (
          <div
            className={`mb-6 rounded-xl border p-3 text-sm ${
              status.type === "ok"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-rose-200 bg-rose-50 text-rose-900"
            }`}
          >
            {status.message}
          </div>
        )}

        {activeTab === "form" ? (
          <div className="grid grid-cols-1 gap-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className={sectionTitleClass()}>今月の目標</div>
                  <div className="mt-1 text-xs text-zinc-500">
                    KPI目標と合わせて入力してください。
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={loadReportForYm}
                    disabled={loading}
                    className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50"
                  >
                    取得
                  </button>
                  <button
                    type="button"
                    onClick={saveReport}
                    disabled={loading}
                    className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
                  >
                    保存
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <textarea
                  className={`${inputBaseClass()} min-h-28`}
                  value={goalText}
                  onChange={(e) => setGoalText(e.target.value)}
                  placeholder="例：契約件数の増加、モニタリング実施率の向上、相談対応の質の向上…"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <div className={sectionTitleClass()}>目標（KPI）</div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className={labelClass()}>契約件数目標</label>
                  <input
                    className={inputBaseClass()}
                    inputMode="numeric"
                    value={targetContracts}
                    onChange={(e) => setTargetContracts(e.target.value)}
                    placeholder="例：10"
                  />
                </div>
                <div>
                  <label className={labelClass()}>相談件数目標</label>
                  <input
                    className={inputBaseClass()}
                    inputMode="numeric"
                    value={targetConsultations}
                    onChange={(e) => setTargetConsultations(e.target.value)}
                    placeholder="例：80"
                  />
                </div>
                <div>
                  <label className={labelClass()}>国保連請求目標</label>
                  <input
                    className={inputBaseClass()}
                    inputMode="numeric"
                    value={targetKokuhorenClaims}
                    onChange={(e) => setTargetKokuhorenClaims(e.target.value)}
                    placeholder="例：25"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <div className={sectionTitleClass()}>実績（KPI）</div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div>
                  <label className={labelClass()}>月末契約件数</label>
                  <input
                    className={inputBaseClass()}
                    inputMode="numeric"
                    value={endContracts}
                    onChange={(e) => setEndContracts(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass()}>新規契約</label>
                  <input
                    className={inputBaseClass()}
                    inputMode="numeric"
                    value={newContracts}
                    onChange={(e) => setNewContracts(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass()}>解約</label>
                  <input
                    className={inputBaseClass()}
                    inputMode="numeric"
                    value={cancellations}
                    onChange={(e) => setCancellations(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass()}>相談件数</label>
                  <input
                    className={inputBaseClass()}
                    inputMode="numeric"
                    value={consultations}
                    onChange={(e) => setConsultations(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass()}>モニタリング訪問</label>
                  <input
                    className={inputBaseClass()}
                    inputMode="numeric"
                    value={monitoringVisits}
                    onChange={(e) => setMonitoringVisits(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass()}>国保連請求件数</label>
                  <input
                    className={inputBaseClass()}
                    inputMode="numeric"
                    value={kokuhorenClaims}
                    onChange={(e) => setKokuhorenClaims(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass()}>計画作成件数</label>
                  <input
                    className={inputBaseClass()}
                    inputMode="numeric"
                    value={planCreations}
                    onChange={(e) => setPlanCreations(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass()}>モニタリング実施率（%）</label>
                  <input
                    className={inputBaseClass()}
                    inputMode="decimal"
                    value={monitoringRate}
                    onChange={(e) => setMonitoringRate(e.target.value)}
                    placeholder="例：85"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <div className={sectionTitleClass()}>振り返り</div>
              <div className="mt-4 grid grid-cols-1 gap-4">
                <div>
                  <label className={labelClass()}>結果</label>
                  <textarea
                    className={`${inputBaseClass()} min-h-24`}
                    value={reflectionResult}
                    onChange={(e) => setReflectionResult(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass()}>課題</label>
                  <textarea
                    className={`${inputBaseClass()} min-h-24`}
                    value={reflectionIssues}
                    onChange={(e) => setReflectionIssues(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass()}>来月へ</label>
                  <textarea
                    className={`${inputBaseClass()} min-h-24`}
                    value={reflectionNext}
                    onChange={(e) => setReflectionNext(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className={sectionTitleClass()}>年間推移</div>
                <div className="mt-1 text-xs text-zinc-500">
                  相談件数・契約件数・国保連請求の推移（実績/目標）を表示します。
                </div>
              </div>
              <div className="flex items-end gap-2">
                <div>
                  <label className={labelClass()}>年</label>
                  <input
                    className={inputBaseClass()}
                    inputMode="numeric"
                    value={String(trendYear)}
                    onChange={(e) => setTrendYear(Number(e.target.value))}
                  />
                </div>
                <button
                  type="button"
                  onClick={loadTrend}
                  disabled={trendLoading}
                  className="h-10 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
                >
                  表示
                </button>
              </div>
            </div>

            {trendError ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
                {trendError}
              </div>
            ) : null}

            <div className="mt-6">
              <div className="rounded-xl border border-zinc-200 bg-white p-3">
                <Line
                  data={trendChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "bottom" as const },
                      title: {
                        display: true,
                        text: `${trendYear}年 ${staffName || ""}（${officeName}）`,
                      },
                    },
                    scales: {
                      y: { beginAtZero: true },
                    },
                  }}
                  height={320}
                />
              </div>
              {trendLoading ? (
                <div className="mt-3 text-sm text-zinc-600">読み込み中…</div>
              ) : (
                <div className="mt-3 text-xs text-zinc-500">
                  入力済みの月だけ線が表示されます（未入力月は空欄扱い）。
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
