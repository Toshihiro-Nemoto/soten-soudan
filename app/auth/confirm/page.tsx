"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";

export default function ConfirmPage() {
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // URLのハッシュからセッションを取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== passwordConfirm) {
      setError("パスワードが一致しません。");
      return;
    }
    if (password.length < 8) {
      setError("パスワードは8文字以上で入力してください。");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError("パスワードの設定に失敗しました: " + error.message);
      setLoading(false);
      return;
    }

    // profilesのfull_nameが未設定の場合は設定を促す
    router.push("/");
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-zinc-200 p-8 w-full max-w-sm text-center">
          <p className="text-zinc-600 text-sm">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-zinc-200 p-8 w-full max-w-sm">
        <h1 className="text-xl font-semibold mb-2">蒼天 相談支援システム</h1>
        <p className="text-sm text-zinc-500 mb-6">パスワードを設定してください</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-zinc-600 block mb-1">新しいパスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
              placeholder="8文字以上"
              required
            />
          </div>
          <div>
            <label className="text-sm text-zinc-600 block mb-1">パスワード（確認）</label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
              placeholder="もう一度入力"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-zinc-800 text-white rounded-lg py-2 text-sm font-medium hover:bg-zinc-700 disabled:opacity-50"
          >
            {loading ? "設定中..." : "パスワードを設定する"}
          </button>
        </form>
      </div>
    </div>
  );
}