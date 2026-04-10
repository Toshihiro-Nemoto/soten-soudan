"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("メールアドレスまたはパスワードが正しくありません");
    } else {
      router.push("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-zinc-200 p-8 w-full max-wbold mb-2">蒼天 相談支援システム</h1>
        <p className="text-sm text-zinc-500 mb-6">ログインしてください</p>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-zinc-600 block mb-1">メールアドレス</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
              placeholder="example@so-ten.org" required />
          </div>
          <div>
            <label className="text-sm text-zinc-600 block mb-1">パスワード</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
              placeholder="........" required />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <butg-zinc-800 text-white rounded-lg py-2 text-sm font-medium hover:bg-zinc-700 disabled:opacity-50">
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>
      </div>
    </div>
  );
}
