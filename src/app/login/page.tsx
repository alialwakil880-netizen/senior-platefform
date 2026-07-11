"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Lock,
  User,
  Phone,
  GraduationCap,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sun,
  Moon,
  Sparkles,
  Globe,
  Eye,
  EyeOff,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";

// مخطط التحقق لحساب جديد (Zod Schema)
const registerSchema = z.object({
  fullName: z.string().min(3, { message: "يرجى إدخال اسم الطالب كاملاً (3 أحرف على الأقل)" }),
  studentPhone: z.string().regex(/^01[0125][0-9]{8}$/, { message: "يجب أن يكون الرقم مصرياً ويبدأ بـ 01 (11 رقم)" }),
  parentPhone: z.string().regex(/^01[0125][0-9]{8}$/, { message: "يجب أن يكون الرقم مصرياً ويبدأ بـ 01 (11 رقم)" }),
  selectedStage: z.string().min(1, { message: "يرجى اختيار الصف الدراسي" }),
  registerPassword: z.string().min(6, { message: "كلمة المرور يجب ألا تقل عن 6 أحرف" }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

// مخطط التحقق لتسجيل الدخول (Zod Schema)
const loginSchema = z.object({
  loginIdentifier: z.string().min(1, { message: "يرجى إدخال رقم الهاتف" }),
  loginPassword: z.string().min(1, { message: "يرجى إدخال كلمة المرور" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const withTimeout = async <T = any>(promise: PromiseLike<T> | Promise<T> | any, ms = 4500, errorMsg = "انتهت مهلة الاتصال بالسيرفر. يرجى التأكد من جودة الإنترنت."): Promise<T> => {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(errorMsg)), ms)),
  ]);
};

export default function AuthPage() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("app_theme");
    if (saved === "light") {
      setDarkMode(false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("app_theme", darkMode ? "dark" : "light");
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);
  const { lang, toggleLanguage, t, dir } = useLanguage();
  const [isLogin, setIsLogin] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [tempRegData, setTempRegData] = useState<RegisterFormValues | null>(null);
  const [resendTimer, setResendTimer] = useState(60);

  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      studentPhone: "",
      parentPhone: "",
      selectedStage: "",
      registerPassword: "",
    },
  });

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      loginIdentifier: "",
      loginPassword: "",
    },
  });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const eyes = [leftEyeRef.current, rightEyeRef.current];
      eyes.forEach((eye) => {
        if (!eye) return;
        const rect = eye.getBoundingClientRect();
        const eyeX = rect.left + rect.width / 2;
        const eyeY = rect.top + rect.height / 2;
        const angle = Math.atan2(event.clientY - eyeY, event.clientX - eyeX);
        const maxDistance = 6;
        const x = Math.cos(angle) * maxDistance;
        const y = Math.sin(angle) * maxDistance;
        eye.style.transform = `translate(${x}px, ${y}px)`;
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOtpStep && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOtpStep, resendTimer]);

  const handleForgotPassword = () => {
    const whatsappText = encodeURIComponent(
      "مرحباً مستر علي، لقد نسيت كلمة المرور الخاصة بحسابي على منصة SENIOR وأرغب في إعادة تعيينها."
    );
    const whatsappUrl = `https://wa.me/201068705721?text=${whatsappText}`;
    window.open(whatsappUrl, "_blank");
  };

  // إنشاء حساب طالب جديد
  const onRegisterSubmit = async (data: RegisterFormValues) => {
    setMessage({ type: "", text: "" });

    // 1. الوضع المحلي الفوري إذا لم يتم ضبط مفاتيح Supabase
    if (!isSupabaseConfigured()) {
      const localStudentsStr = localStorage.getItem("local_students_db") || "[]";
      const localStudents: any[] = JSON.parse(localStudentsStr);

      const exists = localStudents.find((s) => s.studentPhone === data.studentPhone);
      if (exists) {
        setMessage({
          type: "error",
          text: "رقم هاتف الطالب مسجل بالفعل. يرجى تسجيل الدخول أو استخدام رقم آخر.",
        });
        return;
      }

      const newStudent = {
        id: "local-" + Date.now(),
        fullName: data.fullName,
        studentPhone: data.studentPhone,
        parentPhone: data.parentPhone,
        stageId: data.selectedStage,
        password: data.registerPassword,
        createdAt: new Date().toISOString(),
      };

      localStudents.push(newStudent);
      localStorage.setItem("local_students_db", JSON.stringify(localStudents));

      setMessage({
        type: "success",
        text: "تم إنشاء حسابك وحفظ بياناتك بنجاح. جاري تحويلك إلى صفحة تسجيل الدخول...",
      });

      setTimeout(() => {
        setIsLogin(true);
        setMessage({ type: "", text: "" });
        registerForm.reset();
      }, 1500);
      return;
    }

    // 2. الاتصال بـ Supabase مع حماية المهلة الزمنية
    try {
      // Check if phone already exists
      const { data: existingStudent, error: checkError } = await withTimeout(
        supabase
          .from("students")
          .select("studentPhone")
          .eq("studentPhone", data.studentPhone)
          .maybeSingle(),
        4500
      );

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Supabase check error:", checkError);
      }

      if (existingStudent) {
        setMessage({
          type: "error",
          text: "رقم هاتف الطالب مسجل مسبقاً. يرجى تسجيل الدخول مباشرة.",
        });
        return;
      }

      // Directly insert into the `students` table without OTP validation
      const newStudentData = {
        fullName: data.fullName,
        studentPhone: data.studentPhone,
        parentPhone: data.parentPhone,
        stageId: data.selectedStage,
        password: data.registerPassword,
        createdAt: new Date().toISOString(),
      };

      const { error: insertError } = await supabase.from("students").insert([newStudentData]);
      if (insertError) throw insertError;

      setMessage({
        type: "success",
        text: "تم إنشاء حسابك بنجاح! جاري التوجيه إلى المنصة...",
      });

      // Auto login
      localStorage.setItem("current_student", JSON.stringify(newStudentData));
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);

    } catch (error: any) {
      console.error("Registration error:", error);
      setMessage({
        type: "error",
        text: error?.message || "حدث خطأ في الاتصال. يرجى المحاولة لاحقاً.",
      });
    }
  };



  // تسجيل دخول
  const onLoginSubmit = async (data: LoginFormValues) => {
    setMessage({ type: "", text: "" });

    // حساب الإدارة الملكي
    if (
      (["01223698064", "01068705721", "admin"].includes(data.loginIdentifier.trim())) &&
      data.loginPassword === "admin123"
    ) {
      localStorage.setItem("admin_logged_in", "true");
      setMessage({
        type: "success",
        text: "مرحباً مستر علي الوكيل. جاري الدخول إلى لوحة التحكم الإدارية...",
      });
      setTimeout(() => {
        window.location.href = "/admin";
      }, 1000);
      return;
    }

    // 1. التحقق المحلي إذا لم يتم ضبط Supabase
    if (!isSupabaseConfigured()) {
      const localStudentsStr = localStorage.getItem("local_students_db") || "[]";
      const localStudents: any[] = JSON.parse(localStudentsStr);

      const studentData = localStudents.find(
        (s) => s.studentPhone === data.loginIdentifier || s.email === data.loginIdentifier
      );
      if (studentData) {
        if (studentData.password === data.loginPassword) {
          setMessage({
            type: "success",
            text: `تم تسجيل الدخول بنجاح. أهلاً بك يا ${studentData.fullName}...`,
          });
          localStorage.setItem("current_student", JSON.stringify(studentData));
          setTimeout(() => {
            window.location.href = `/dashboard`;
          }, 1000);
        } else {
          setMessage({ type: "error", text: "كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى." });
        }
      } else {
        setMessage({
          type: "error",
          text: "هذا الحساب غير موجود. يرجى الضغط على 'إنشاء حساب جديد' للتسجيل أولاً.",
        });
      }
      return;
    }

    // 2. الاتصال بـ Supabase مع حماية المهلة
    try {
      const { data: studentData, error } = await withTimeout(
        supabase
          .from("students")
          .select("*")
          .eq("studentPhone", data.loginIdentifier)
          .maybeSingle(),
        4500
      );

      if (error) {
        throw error;
      }

      if (studentData) {
        if (studentData.password === data.loginPassword) {
          setMessage({
            type: "success",
            text: `تم تسجيل الدخول بنجاح. أهلاً بك يا ${studentData.fullName}...`,
          });
          localStorage.setItem("current_student", JSON.stringify(studentData));
          setTimeout(() => {
            window.location.href = `/dashboard`;
          }, 1000);
        } else {
          setMessage({ type: "error", text: "كلمة المرور غير صحيحة." });
        }
      } else {
        setMessage({
          type: "error",
          text: "رقم الهاتف غير مسجل في النظام.",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setMessage({
        type: "error",
        text: error?.message || "تعذر الاتصال بقاعدة البيانات. يرجى التحقق من اتصال الإنترنت.",
      });
    }
  };

  return (
    <div
      className={
        darkMode
          ? "min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 transition-colors duration-300 font-sans selection:bg-purple-500 selection:text-white"
          : "min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 transition-colors duration-300 font-sans selection:bg-indigo-500 selection:text-white"
      }
      dir={dir}
    >
      <div className={`absolute top-6 ${dir === "rtl" ? "left-6" : "right-6"} flex items-center gap-2.5 sm:gap-3`}>
        <button
          onClick={toggleLanguage}
          className={
            darkMode
              ? "px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-amber-400 hover:bg-slate-900 transition-all shadow-sm text-xs font-bold flex items-center gap-1.5"
              : "px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all shadow-xs text-xs font-bold flex items-center gap-1.5"
          }
          title="Change Language"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{t.common.langBtn}</span>
        </button>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={
            darkMode
              ? "p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-amber-400 hover:bg-slate-900 transition-all shadow-sm"
              : "p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all shadow-xs"
          }
          title="Toggle Theme"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <Button
          onClick={() => (window.location.href = "/")}
          variant="outline"
          className="text-xs font-bold rounded-xl h-10 px-4"
        >
          {lang === "ar" ? "الرئيسية" : "Home"}
        </Button>
      </div>

      <Card
        className={
          darkMode
            ? "bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-8 max-w-md w-full shadow-2xl rounded-3xl space-y-6"
            : "bg-white/80 backdrop-blur-xl border border-slate-200 p-8 max-w-md w-full shadow-xl rounded-3xl space-y-6 text-slate-900"
        }
      >
        <div className="flex space-x-4 space-x-reverse justify-center items-center py-1">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center border-2 border-amber-500 shadow-inner">
            <div
              ref={rightEyeRef}
              className="w-6 h-6 bg-slate-950 rounded-full flex items-center justify-center relative"
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full absolute top-1 right-1"></div>
            </div>
          </div>
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center border-2 border-amber-500 shadow-inner">
            <div
              ref={leftEyeRef}
              className="w-6 h-6 bg-slate-950 rounded-full flex items-center justify-center relative"
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full absolute top-1 right-1"></div>
            </div>
          </div>
        </div>

        <CardHeader className="text-center space-y-2 p-0">
          <CardTitle className={`text-2xl font-black text-transparent bg-clip-text tracking-wide ${darkMode ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-purple-400' : 'bg-gradient-to-r from-amber-600 via-yellow-500 to-indigo-600'}`}>
            SENIOR PLATFORM
          </CardTitle>
          <CardDescription className={`text-sm font-bold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {isLogin ? t.login.signInBtn : t.login.createAccountBtn}
          </CardDescription>
          {!isSupabaseConfigured() && (
            <div className={`border text-xs p-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 ${darkMode ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>وضع التشغيل المحلي الفوري لتخزين البيانات</span>
            </div>
          )}
        </CardHeader>

        {message.text && (
          <div
            className={
              message.type === "success"
                ? `p-3.5 rounded-xl text-center text-xs font-bold border flex items-center justify-center gap-2 ${darkMode ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-green-50 border-green-200 text-green-700'}`
                : `p-3.5 rounded-xl text-center text-xs font-bold border flex items-center justify-center gap-2 ${darkMode ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`
            }
          >
            {message.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {isLogin ? (
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className={`text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-700'} block flex items-center gap-1.5`}>
                <Phone className={`w-3.5 h-3.5 ${darkMode ? 'text-amber-400' : 'text-indigo-600'}`} />
                <span>{t.login.studentPhoneLabel}</span>
              </label>
              <Input
                type="text"
                placeholder="01xxxxxxxxx"
                {...loginForm.register("loginIdentifier")}
                className={
                  darkMode
                    ? "w-full bg-slate-950/80 border-slate-800 rounded-xl px-4 h-11 text-sm focus-visible:ring-amber-500 text-left"
                    : "w-full bg-slate-100 border-slate-300 rounded-xl px-4 h-11 text-sm focus-visible:ring-indigo-500 text-left text-slate-900"
                }
                dir="ltr"
              />
              {loginForm.formState.errors.loginIdentifier && (
                <p className={`text-[11px] font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                  {loginForm.formState.errors.loginIdentifier.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className={`text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-700'} block flex items-center gap-1.5`}>
                <Lock className={`w-3.5 h-3.5 ${darkMode ? 'text-amber-400' : 'text-indigo-600'}`} />
                <span>{t.login.passwordLabel}</span>
              </label>
              <div className="relative">
                <Input
                  type={showLoginPassword ? "text" : "password"}
                  placeholder={t.login.passwordPlaceholder}
                  {...loginForm.register("loginPassword")}
                  className={
                    darkMode
                      ? "w-full bg-slate-950/80 border-slate-800 rounded-xl px-10 h-11 text-sm focus-visible:ring-amber-500 text-left"
                      : "w-full bg-slate-100 border-slate-300 rounded-xl px-10 h-11 text-sm focus-visible:ring-indigo-500 text-left text-slate-900"
                  }
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                  aria-label={showLoginPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {loginForm.formState.errors.loginPassword && (
                <p className={`text-[11px] font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                  {loginForm.formState.errors.loginPassword.message}
                </p>
              )}
            </div>

            <div className="flex justify-start">
              <button
                type="button"
                onClick={handleForgotPassword}
                className={`text-xs font-medium flex items-center gap-1 transition-colors ${darkMode ? 'text-slate-400 hover:text-amber-400' : 'text-slate-600 hover:text-indigo-600'}`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{t.login.forgotPassword}</span>
              </button>
            </div>

            <Button
              type="submit"
              disabled={loginForm.formState.isSubmitting}
              className="w-full font-black py-6 rounded-xl text-xs bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:from-amber-600 hover:to-yellow-600 shadow-md flex items-center justify-center gap-2"
            >
              <span>{loginForm.formState.isSubmitting ? t.login.loggingIn : t.login.signInBtn}</span>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </form>
        ) : (
          <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-3.5">
            <div className="space-y-1">
              <label className={`text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-700'} block flex items-center gap-1.5`}>
                <User className={`w-3.5 h-3.5 ${darkMode ? 'text-amber-400' : 'text-indigo-600'}`} />
                <span>{t.login.nameLabel}</span>
              </label>
              <Input
                type="text"
                placeholder={t.login.namePlaceholder}
                {...registerForm.register("fullName")}
                className={
                  darkMode
                    ? "w-full bg-slate-950/80 border-slate-800 rounded-xl px-4 h-10 text-xs focus-visible:ring-amber-500"
                    : "w-full bg-slate-100 border-slate-300 rounded-xl px-4 h-10 text-xs focus-visible:ring-indigo-500 text-slate-900"
                }
              />
              {registerForm.formState.errors.fullName && (
                <p className={`text-[11px] font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                  {registerForm.formState.errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className={`text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-700'} block flex items-center gap-1.5`}>
                <Phone className={`w-3.5 h-3.5 ${darkMode ? 'text-amber-400' : 'text-indigo-600'}`} />
                <span>{t.login.studentPhoneLabel}</span>
              </label>
              <Input
                type="tel"
                placeholder="01xxxxxxxxx"
                {...registerForm.register("studentPhone")}
                className={
                  darkMode
                    ? "w-full bg-slate-950/80 border-slate-800 rounded-xl px-4 h-10 text-xs focus-visible:ring-amber-500 text-left"
                    : "w-full bg-slate-100 border-slate-300 rounded-xl px-4 h-10 text-xs focus-visible:ring-indigo-500 text-left text-slate-900"
                }
                dir="ltr"
              />
              {registerForm.formState.errors.studentPhone && (
                <p className={`text-[11px] font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                  {registerForm.formState.errors.studentPhone.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className={`text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-700'} block flex items-center gap-1.5`}>
                <Phone className={`w-3.5 h-3.5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                <span>{t.login.parentPhoneLabel}</span>
              </label>
              <Input
                type="tel"
                placeholder="01xxxxxxxxx"
                {...registerForm.register("parentPhone")}
                className={
                  darkMode
                    ? "w-full bg-slate-950/80 border-slate-800 rounded-xl px-4 h-10 text-xs focus-visible:ring-amber-500 text-left"
                    : "w-full bg-slate-100 border-slate-300 rounded-xl px-4 h-10 text-xs focus-visible:ring-indigo-500 text-left text-slate-900"
                }
                dir="ltr"
              />
              {registerForm.formState.errors.parentPhone && (
                <p className={`text-[11px] font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                  {registerForm.formState.errors.parentPhone.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className={`text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-700'} block flex items-center gap-1.5`}>
                <GraduationCap className={`w-3.5 h-3.5 ${darkMode ? 'text-amber-400' : 'text-indigo-600'}`} />
                <span>{t.login.stageLabel}</span>
              </label>
              <select
                {...registerForm.register("selectedStage")}
                className={
                  darkMode
                    ? "w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 h-10 text-xs focus:border-amber-500 outline-none text-slate-200 font-bold"
                    : "w-full bg-slate-100 border border-slate-300 rounded-xl px-3 h-10 text-xs focus:border-indigo-500 outline-none text-slate-800 font-bold"
                }
              >
                <option value="">{t.login.selectStagePlaceholder}</option>
                <option value="prep3">{t.common.stages.prep3}</option>
                <option value="sec1">{t.common.stages.sec1}</option>
                <option value="sec2">{t.common.stages.sec2}</option>
                <option value="sec3">{t.common.stages.sec3}</option>
                <option value="bac">{t.common.stages.bac}</option>
              </select>
              {registerForm.formState.errors.selectedStage && (
                <p className={`text-[11px] font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                  {registerForm.formState.errors.selectedStage.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className={`text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-700'} block flex items-center gap-1.5`}>
                <Lock className={`w-3.5 h-3.5 ${darkMode ? 'text-amber-400' : 'text-indigo-600'}`} />
                <span>{t.login.passwordLabel}</span>
              </label>
              <div className="relative">
                <Input
                  type={showRegisterPassword ? "text" : "password"}
                  placeholder={t.login.passwordPlaceholder}
                  {...registerForm.register("registerPassword")}
                  className={
                    darkMode
                      ? "w-full bg-slate-950/80 border-slate-800 rounded-xl px-10 h-10 text-xs focus-visible:ring-amber-500 text-left"
                      : "w-full bg-slate-100 border-slate-300 rounded-xl px-10 h-10 text-xs focus-visible:ring-indigo-500 text-left text-slate-900"
                  }
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                  aria-label={showRegisterPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {registerForm.formState.errors.registerPassword && (
                <p className={`text-[11px] font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                  {registerForm.formState.errors.registerPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={registerForm.formState.isSubmitting}
              className="w-full font-black py-5 rounded-xl text-xs bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:from-amber-600 hover:to-yellow-600 shadow-md mt-2 flex items-center justify-center gap-2"
            >
              <span>{registerForm.formState.isSubmitting ? t.common.loading : t.login.createAccountBtn}</span>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </form>
        )}

        <div className={`text-center pt-4 border-t ${darkMode ? 'border-slate-800/80' : 'border-slate-200'}`}>
          <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {isLogin ? (
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setMessage({ type: "", text: "" });
                }}
                className={darkMode ? "text-amber-400 hover:text-amber-300 font-bold underline transition-colors" : "text-indigo-600 hover:text-indigo-700 font-bold underline transition-colors"}
              >
                {t.login.toggleToSignup}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setMessage({ type: "", text: "" });
                }}
                className={darkMode ? "text-amber-400 hover:text-amber-300 font-bold underline transition-colors" : "text-indigo-600 hover:text-indigo-700 font-bold underline transition-colors"}
              >
                {t.login.toggleToSignin}
              </button>
            )}
          </p>
        </div>
      </Card>
    </div>
  );
}
