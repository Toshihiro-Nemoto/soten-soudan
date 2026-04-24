"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function ConfirmPage() {
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function init() {
      // クエリパラメータからtoken_hashを取得
      const params = new URLSearchParams(window.location.search);
      const tokenHash = params.get("token_hash");
      const type = params.get("type");

      if (tokenHash && type === "invite") {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "invite",
        });
        if (!error) {
          setReady(true);
        } else {
          setError("招待リンクが無効です: " + error.message);
        }
      } else {
        // ハッシュからaccess_tokenも試す（フォールバック）
        const hash = window.location.hash.replace("#", "");
        const hashParams = new URLSearchParams(hash);
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token") ?? "";

        if (accessToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (!error) {
            setReady(true);
          } else {
            setError("招待リンクが無効です: " + error.message);
          }
        } else {
          setError("招待リンクが無効です。再度招待を依頼してください。");
        }
      }
    }
    init();
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
    router.push("/");
  };

  if (!ready && !error) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-zinc-200 p-8 w-full max-w-sm text-center">
          <p className="text-zinc-600 text-sm">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error && !ready) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-zinc-200 p-8 w-full max-w-sm text-center">
          <p className="text-red-500 text-sm">{error}</p>
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