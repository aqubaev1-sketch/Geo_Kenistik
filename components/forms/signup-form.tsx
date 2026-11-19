
"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, GraduationCap, UserRound } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { signUpUser } from "@/server/users";
import { authClient } from "@/lib/auth-client";

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Атыңызды енгізіңіз"),

  email: z
    .string()
    .min(1, "Электрондық поштаңызды енгізіңіз")
    .email("Электрондық пошта мекенжайын дұрыс енгізіңіз"),

  password: z
    .string()
    .min(8, "Құпиясөз кемінде 8 таңбадан тұруы керек"),

  confirmPassword: z
    .string()
    .min(8, "Құпиясөз кемінде 8 таңбадан тұруы керек"),
  requestedRole: z.enum(["student", "teacher"]),
});

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      requestedRole: "student",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);

      if (values.password !== values.confirmPassword) {
        toast.error("Құпиясөздер сәйкес келмейді");
        return;
      }

      const response = await signUpUser(
        values.email,
        values.password,
        values.name,
        values.requestedRole
      );

      if (response.success) {
        toast.success(response.message);
        setRegisteredEmail(response.email || values.email.trim().toLowerCase());
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Қате орын алды. Қайталап көріңіз.");
    } finally {
      setIsLoading(false);
    }
  }

  if (registeredEmail) {
    return <div className={`w-full max-w-md rounded-[24px] border border-emerald-100 bg-white p-7 text-center shadow-sm ${className ?? ""}`} {...props}><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-2xl">✓</span><h1 className="mt-5 text-2xl font-bold text-slate-900">Email-ды растаңыз</h1><p className="mt-3 text-sm leading-6 text-slate-600"><b>{registeredEmail}</b> мекенжайына растау сілтемесін жібердік. Сілтемені ашқаннан кейін жүйеге кіре аласыз.</p><button type="button" disabled={isResending} onClick={async()=>{setIsResending(true);const {error}=await authClient.sendVerificationEmail({email:registeredEmail,callbackURL:"/login?verified=1"});setIsResending(false);error?toast.error(error.message):toast.success("Растау хаты қайта жіберілді");}} className="mt-6 min-h-11 w-full rounded-xl border border-indigo-200 px-4 text-sm font-bold text-indigo-700 disabled:opacity-50">{isResending?"Жіберілуде...":"Хатты қайта жіберу"}</button><Link href="/login" className="mt-3 inline-flex text-sm font-bold text-slate-500">Кіру бетіне өту</Link></div>;
  }

  return (
    <div
      className={`w-full max-w-none ${className ?? ""}`}
      {...props}
    >
      <div className="w-full">
        {/* Тақырып */}
        <div className="mb-8 text-center">
          

          <p className="text-sm text-[#6a7282]">
            Рөліңізді таңдап, GeoKenistik платформасына тіркеліңіз
          </p>
        </div>

        {/* Форма */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            <FormField
              control={form.control}
              name="requestedRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-2 block text-[12px] font-bold uppercase tracking-[1px] text-[#6a7282]">
                    Мен платформаға
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" onClick={() => field.onChange("student")} className={`rounded-[14px] border p-4 text-left transition ${field.value === "student" ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/10" : "border-slate-200 bg-white hover:border-indigo-200"}`}>
                        <UserRound className="h-5 w-5 text-indigo-600" />
                        <b className="mt-3 block text-sm text-slate-900">Оқушы</b>
                        <span className="mt-1 block text-xs text-slate-500">Курстарды оқу</span>
                      </button>
                      <button type="button" onClick={() => field.onChange("teacher")} className={`rounded-[14px] border p-4 text-left transition ${field.value === "teacher" ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/10" : "border-slate-200 bg-white hover:border-indigo-200"}`}>
                        <GraduationCap className="h-5 w-5 text-indigo-600" />
                        <b className="mt-3 block text-sm text-slate-900">Мұғалім</b>
                        <span className="mt-1 block text-xs text-slate-500">Курс құру</span>
                      </button>
                    </div>
                  </FormControl>
                  {field.value === "teacher" && <p className="mt-2 text-xs leading-5 text-amber-700">Мұғалім рөлі админ растағаннан кейін ашылады.</p>}
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            {/* Аты */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className="
                      mb-2
                      block
                      text-[12px]
                      font-bold
                      uppercase
                      tracking-[1px]
                      text-[#6a7282]
                    "
                  >
                    Аты-жөні
                  </FormLabel>

                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Айсұлтан Құбаев"
                      autoComplete="name"
                      {...field}
                      className="
                        h-12
                        rounded-[10px]
                        border-[#d1d5db]
                        bg-white
                        px-4
                        text-sm
                        text-[#1b1b1b]
                        shadow-none
                        outline-none
                        placeholder:text-[#9ca3af]
                        focus:border-[#1b1b1b]
                        focus:ring-0
                        transition-colors
                      "
                    />
                  </FormControl>

                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className="
                      mb-2
                      block
                      text-[12px]
                      font-bold
                      uppercase
                      tracking-[1px]
                      text-[#6a7282]
                    "
                  >
                    Электрондық пошта
                  </FormLabel>

                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      {...field}
                      className="
                        h-12
                        rounded-[10px]
                        border-[#d1d5db]
                        bg-white
                        px-4
                        text-sm
                        text-[#1b1b1b]
                        shadow-none
                        outline-none
                        placeholder:text-[#9ca3af]
                        focus:border-[#1b1b1b]
                        focus:ring-0
                        transition-colors
                      "
                    />
                  </FormControl>

                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Құпиясөз */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className="
                      mb-2
                      block
                      text-[12px]
                      font-bold
                      uppercase
                      tracking-[1px]
                      text-[#6a7282]
                    "
                  >
                    Құпиясөз
                  </FormLabel>

                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      {...field}
                      className="
                        h-12
                        rounded-[10px]
                        border-[#d1d5db]
                        bg-white
                        px-4
                        pr-11
                        text-sm
                        text-[#1b1b1b]
                        shadow-none
                        outline-none
                        placeholder:text-[#9ca3af]
                        focus:border-[#1b1b1b]
                        focus:ring-0
                        transition-colors
                      "
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6a7282] transition-colors hover:text-[#1b1b1b]"
                        aria-label={showPassword ? "Құпиясөзді жасыру" : "Құпиясөзді көрсету"}
                        aria-pressed={showPassword}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>

                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Құпиясөзді растау */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className="
                      mb-2
                      block
                      text-[12px]
                      font-bold
                      uppercase
                      tracking-[1px]
                      text-[#6a7282]
                    "
                  >
                    Құпиясөзді растаңыз
                  </FormLabel>

                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      {...field}
                      className="
                        h-12
                        rounded-[10px]
                        border-[#d1d5db]
                        bg-white
                        px-4
                        pr-11
                        text-sm
                        text-[#1b1b1b]
                        shadow-none
                        outline-none
                        placeholder:text-[#9ca3af]
                        focus:border-[#1b1b1b]
                        focus:ring-0
                        transition-colors
                      "
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6a7282] transition-colors hover:text-[#1b1b1b]"
                        aria-label={showConfirmPassword ? "Құпиясөзді жасыру" : "Құпиясөзді көрсету"}
                        aria-pressed={showConfirmPassword}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>

                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Тіркелу батырмасы */}
            <Button
              type="submit"
              disabled={isLoading}
              className="
                mt-1
                h-12
                w-full
                rounded-[10px]
                bg-indigo-500
                text-[14px]
                font-bold
                uppercase
                tracking-[1px]
                text-white
                shadow-none
                transition-colors
                hover:bg-[#5a51b3]
                active:bg-[#4e46a0]
                focus:ring-0
                disabled:opacity-50
              "
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Құрылуда...
                </>
              ) : (
                "Тіркелу"
              )}
            </Button>
          </form>
        </Form>

      </div>
    </div>
  );
}

