import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  ssr: false,
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Login efetuado");
        navigate({ to: "/admin" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Conta criada! Você já pode entrar.");
        setMode("login");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#121212] px-4">
      <Card className="w-full max-w-sm p-6 bg-zinc-900 border-zinc-800 text-white">
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "Montserrat, sans-serif" }}>
          Painel Admin
        </h1>
        <p className="text-sm text-zinc-400 mb-6">
          {mode === "login" ? "Entre para gerenciar o site" : "Criar conta de acesso"}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-zinc-300">E-mail</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" />
          </div>
          <div>
            <Label htmlFor="password" className="text-zinc-300">Senha</Label>
            <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-semibold">
            {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
          </Button>
        </form>
        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="mt-4 text-sm text-zinc-400 hover:text-[#FF6B00] w-full text-center"
        >
          {mode === "login" ? "Primeiro acesso? Criar conta" : "Já tenho conta"}
        </button>
        <Link to="/" className="block mt-4 text-xs text-zinc-500 text-center hover:text-zinc-300">
          ← Voltar ao site
        </Link>
      </Card>
    </main>
  );
}
