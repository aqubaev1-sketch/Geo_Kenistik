"use client";

import { useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export function PasswordSettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword.length < 8) return toast.error("Жаңа құпиясөз кемінде 8 таңбадан тұруы керек");
    if (newPassword !== confirmPassword) return toast.error("Жаңа құпиясөздер сәйкес келмейді");
    setLoading(true);
    const { error } = await authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true });
    setLoading(false);
    if (error) return toast.error(error.message || "Құпиясөзді өзгерту мүмкін болмады");
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    toast.success("Құпиясөз өзгертілді. Басқа құрылғылардағы сессиялар жабылды");
  }

  return <section className="mt-7 rounded-[24px] border border-slate-200 bg-white p-6"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><KeyRound className="h-5 w-5"/></span><div><h2 className="font-bold text-slate-900">Қауіпсіздік</h2><p className="text-sm text-slate-500">Құпиясөзді өзгерту</p></div></div><form onSubmit={submit} className="mt-5 grid gap-3 md:grid-cols-3"><input type="password" autoComplete="current-password" required value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} placeholder="Қазіргі құпиясөз" className="h-12 rounded-xl border border-slate-200 px-4 text-sm"/><input type="password" autoComplete="new-password" required minLength={8} value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="Жаңа құпиясөз" className="h-12 rounded-xl border border-slate-200 px-4 text-sm"/><input type="password" autoComplete="new-password" required minLength={8} value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Жаңа құпиясөзді растау" className="h-12 rounded-xl border border-slate-200 px-4 text-sm"/><button disabled={loading} className="min-h-12 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white disabled:opacity-50 md:col-start-3">{loading?<><Loader2 className="mr-2 inline h-4 w-4 animate-spin"/>Сақталуда...</>:"Құпиясөзді өзгерту"}</button></form></section>;
}
