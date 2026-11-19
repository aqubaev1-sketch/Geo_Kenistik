
"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
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

import { authClient } from "@/lib/auth-client";


const formSchema = z.object({
  email: z
    .string()
    .min(1, "Электрондық поштаңызды енгізіңіз")
    .email("Дұрыс электрондық пошта мекенжайын енгізіңіз"),

  password: z
    .string()
    .min(8, "Құпиясөз кемінде 8 таңбадан тұруы керек"),
});

export function LoginForm({
  className,
  callbackUrl: requestedCallbackUrl,
  ...props
}: React.ComponentProps<"div"> & { callbackUrl?: string }) {
  // Возвращаем только на внутренний путь, чтобы исключить перенаправление на чужой сайт.
  const callbackUrl =
    requestedCallbackUrl?.startsWith("/") && !requestedCallbackUrl.startsWith("//")
      ? requestedCallbackUrl
      : "/profile";

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);

      const { error } = await authClient.signIn.email({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });

      if (error) {
        toast.error(error.code === "EMAIL_NOT_VERIFIED" ? "Алдымен email мекенжайыңызды растаңыз" : error.message || "Email немесе құпиясөз қате");
        return;
      }

      toast.success("Жүйеге сәтті кірдіңіз");
      // Полная навигация гарантирует, что Header заново прочитает сессию и роль.
      window.location.assign(callbackUrl);
    } catch (error) {
      console.error(error);
      toast.error("Қате орын алды. Қайтадан көріңіз.");
    } finally {
      setIsLoading(false);
    }
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
            GeoKenistik платформасындағы оқу мен жұмысты жалғастыру үшін жүйеге кіріңіз
          </p>
        </div>

        {/* Форма */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            {/* Электрондық пошта */}
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
                  <div className="mb-2 flex items-center justify-between">
                    <FormLabel
                      className="
                        text-[12px]
                        font-bold
                        uppercase
                        tracking-[1px]
                        text-[#6a7282]
                      "
                    >
                      Құпиясөз
                    </FormLabel>

                    <Link
                      href="/forgot-password"
                      className="
                        text-[12px]
                        text-[#6a7282]
                        transition-colors
                        hover:text-[#1b1b1b]
                        hover:underline
                      "
                    >
                      Құпиясөзді ұмыттыңыз ба?
                    </Link>
                  </div>

                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="current-password"
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
                        onClick={() =>
                          setShowPassword((prev) => !prev)
                        }
                        className="
                          absolute
                          right-3
                          top-1/2
                          -translate-y-1/2
                          text-[#6a7282]
                          transition-colors
                          hover:text-[#1b1b1b]
                        "
                        aria-label={
                          showPassword
                            ? "Құпиясөзді жасыру"
                            : "Құпиясөзді көрсету"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>

                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Кіру */}
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
                transition-opacity
                hover:bg-[#6960C5]
                hover:opacity-85
                focus:ring-0
                disabled:opacity-50
              "
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Кіру...
                </>
              ) : (
                "Кіру"
              )}
            </Button>
          </form>
        </Form>

      </div>
    </div>
  );
}
