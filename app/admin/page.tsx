"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function AdminPage() {
  const [data, setData] = useState<any[]>([]);
  const [year, setYear] = useState(2026);
  const [kpi, setKpi] = useState("consultations");

  useEffect(() => {
    supabase
      .from("monthly_reports")
      .select("*")
      .eq("year", year)
      .then(({ data }) => setData(data || []));
  }, [year]);

  const kpis = [
    { key: "consultations", label: "相談件数" },
    { key: "end_contracts", label: "契約件数" },
    { key: "kokuhoren_claims", label: "国保連請求" },
    { key: "new_contracts", label: "新規契約" },
    { key: "cancellations", label: "解約" },
  ];

  const months = [1,2,3,4,5,6,7,8,9,10,11,12];
  const staffList = [...new Set(data.map((d) => `${d.staff_name}（${d.office_name}）`))];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div cl mb-6">
        <h1 className="text-2xl font-bold">相談員別 年間実績</h1>
        <Link href="/" className="text-blue-600 underline text-sm">← 月報入力へ戻る</Link>
      </div>
      <div className="flex gap-4 mb-4 items-center">
        <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="border rounded px-3 py-1">
          <option value={2025}>2025年</option>
          <option value={2026}>2026年</option>
          <option value={2027}>2027年</option>
        </select>
      </div>
      <div className="flex gap-2 mb-4">
        {kpis.map((k) => (
          <button key={k.key} onClick={() => setKpi(k.key)}
            className={`px-3 py-1 rounded text-sm border ${kpi === k.key ? "bg-blue-600 text-white" : "bg-white"}`}>
            {k.label}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
             left">担当者</th>
              {months.map((m) => <th key={m} className="border px-2 py-2">{m}月</th>)}
              <th className="border px-3 py-2">合計</th>
            </tr>
          </thead>
          <tbody>
            {staffList.map((staff) => {
              const staffData = data.filter((d) => `${d.staff_name}（${d.office_name}）` === staff);
              const values = months.map((m) => staffData.find((d) => d.month === m)?.[kpi]);
              const total = values.reduce((s, v) => s + (v || 0), 0);
              return (
                <tr key={staff}>
                  <td className="border px-3 py-2 whitespace-nowrap">{staff}</td>
                  {values.map((v, i) => <td key={i} className="border px-2 py-2 text-center">{v ?? "—"}</td>)}
                  <td className="border px-3 py-2 text-center font-bold">{total}</td>
                </tr>
              );
            })}
            {staffList.length > 0 && (
              <tr className="bg-gray-50 font-bold">
          e="border px-3 py-2">合計</td>
                {months.map((m) => {
                  const total = data.filter((d) => d.month === m).reduce((s, d) => s + (d[kpi] || 0), 0);
                  return <td key={m} className="border px-2 py-2 text-center">{total}</td>;
                })}
                <td className="border px-3 py-2 text-center">{data.reduce((s, d) => s + (d[kpi] || 0), 0)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
