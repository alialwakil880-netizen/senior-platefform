"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import ProtectedVideoPlayer from "@/components/ProtectedVideoPlayer";
import {
  StageCurriculum,
  CourseUnit,
  LectureItem,
  QuizQuestion,
  getCurriculum,
  extractYouTubeId,
} from "@/lib/curriculum";
import {
  BookOpen,
  Play,
  FileText,
  HelpCircle,
  CheckCircle2,
  Award,
  ChevronDown,
  ChevronUp,
  LogOut,
  Sun,
  Moon,
  User,
  Lock,
  Download,
  ShieldCheck,
  Send,
  AlertCircle,
  Edit2,
  Save,
  X,
  Globe,
  Eye,
  EyeOff,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface StudentData {
  id?: string;
  fullName: string;
  studentPhone: string;
  stageId: string;
  password?: string;
}

const passwordChangeSchema = z
  .object({
    oldPassword: z.string().min(1, { message: "يرجى إدخال كلمة المرور الحالية" }),
    newPassword: z.string().min(6, { message: "كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف" }),
    confirmPassword: z.string().min(1, { message: "يرجى تأكيد كلمة المرور الجديدة" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "كلمة المرور الجديدة غير متطابقة مع التأكيد!",
    path: ["confirmPassword"],
  });

type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;

export default function DashboardPage() {
  const { lang, toggleLanguage, t, dir } = useLanguage();
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
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  const [activeLectureId, setActiveLectureId] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  // نظام المناهج المربوط بالإدارة
  const [curriculum, setCurriculum] = useState<StageCurriculum>({});

  // تتبع المحاضرات والكويزات المحلولة
  const [watchedVideos, setWatchedVideos] = useState<Record<string, boolean>>({});
  const [completedQuizzes, setCompletedQuizzes] = useState<Record<string, { score: number; total: number }>>({});

  // تتبع الفيديو أو الكويز المفتوح حالياً للعرض داخل المحاضرة
  const [activeTabPerLecture, setActiveTabPerLecture] = useState<Record<string, "video" | "materials" | "quiz" | null>>({});

  // إجابات الطالب في الكويز الحالي (LectureId -> QuestionId -> choiceIndex)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, Record<string, number>>>({});

  const [student, setStudent] = useState<StudentData>({
    fullName: "طالب المنصة",
    studentPhone: "",
    stageId: "sec3",
  });

  // حالة تعديل الملف الشخصي
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editStageId, setEditStageId] = useState("sec3");

  const [passMessage, setPassMessage] = useState({ type: "", text: "" });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);

  const passwordForm = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const loadCurriculum = () => {
      const data = getCurriculum();
      setCurriculum(data);
    };
    loadCurriculum();

    window.addEventListener("curriculum_updated", loadCurriculum);
    window.addEventListener("storage", loadCurriculum);
    return () => {
      window.removeEventListener("curriculum_updated", loadCurriculum);
      window.removeEventListener("storage", loadCurriculum);
    };
  }, []);

  useEffect(() => {
    const savedStudentStr = localStorage.getItem("current_student");
    let hasValidSession = false;

    if (savedStudentStr) {
      try {
        const userData: StudentData = JSON.parse(savedStudentStr);
        setStudent(userData);
        hasValidSession = true;
      } catch (e) {
        console.error("Error parsing student session:", e);
      }
    } else {
      const savedName = localStorage.getItem("saved_fullName");
      const savedPhone = localStorage.getItem("saved_studentPhone");
      const savedStage = localStorage.getItem("saved_stageId");
      if (savedName) {
        setStudent({
          fullName: savedName,
          studentPhone: savedPhone || "",
          stageId: savedStage || "sec3",
        });
        hasValidSession = true;
      }
    }

    if (!hasValidSession) {
      setIsLoggedIn(false);
      setIsCheckingAuth(false);
      window.location.href = "/login";
      return;
    }

    setIsLoggedIn(true);
    setIsCheckingAuth(false);

    const savedWatchedStr = localStorage.getItem("student_watched_videos");
    if (savedWatchedStr) {
      try {
        setWatchedVideos(JSON.parse(savedWatchedStr));
      } catch (e) {}
    }

    const savedQuizzesStr = localStorage.getItem("student_completed_quizzes_v2");
    if (savedQuizzesStr) {
      try {
        setCompletedQuizzes(JSON.parse(savedQuizzesStr));
      } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    if (confirm("هل أنت متأكد أنك تريد تسجيل الخروج من المنصة؟")) {
      localStorage.removeItem("current_student");
      localStorage.removeItem("saved_fullName");
      localStorage.removeItem("saved_studentPhone");
      localStorage.removeItem("saved_stageId");
      window.location.href = "/login";
    }
  };

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

  const onPasswordChangeSubmit = async (data: PasswordChangeFormValues) => {
    setPassMessage({ type: "", text: "" });

    try {
      if (student.password && student.password !== data.oldPassword) {
        setPassMessage({ type: "error", text: "كلمة المرور الحالية غير صحيحة" });
        return;
      }

      if (student.studentPhone) {
        const { error: updateError } = await supabase
          .from("students")
          .update({ password: data.newPassword })
          .eq("studentPhone", student.studentPhone);

        if (updateError && updateError.code !== "42P01") {
          console.error("Supabase password update error:", updateError);
        }
      }

      const updatedStudent = { ...student, password: data.newPassword };
      setStudent(updatedStudent);
      localStorage.setItem("current_student", JSON.stringify(updatedStudent));
      localStorage.setItem("saved_password", data.newPassword);

      setPassMessage({ type: "success", text: "تم تحديث كلمة المرور بنجاح" });
      passwordForm.reset();
    } catch (error: any) {
      console.error("Password update error:", error);
      setPassMessage({ type: "error", text: "حدث خطأ أثناء تحديث كلمة المرور" });
    }
  };

  const handleSaveProfileDetails = async () => {
    if (!editFullName.trim() || editFullName.trim().split(" ").length < 2) {
      alert("يرجى كتابة الاسم ثنائي أو ثلاثي على الأقل");
      return;
    }
    if (!editPhone.trim()) {
      alert("يرجى إدخال رقم الهاتف");
      return;
    }

    const updatedStudent = {
      ...student,
      fullName: editFullName.trim(),
      studentPhone: editPhone.trim(),
      stageId: editStageId,
    };

    setStudent(updatedStudent);
    localStorage.setItem("current_student", JSON.stringify(updatedStudent));
    localStorage.setItem("saved_fullName", editFullName.trim());
    localStorage.setItem("saved_studentPhone", editPhone.trim());
    localStorage.setItem("saved_stageId", editStageId);

    // تحديث في قاعدة بيانات الإدارة المحلية (local_students_db)
    const localStudentsStr = localStorage.getItem("local_students_db");
    if (localStudentsStr) {
      try {
        const localStudents: any[] = JSON.parse(localStudentsStr);
        const updatedList = localStudents.map((s) =>
          s.studentPhone === student.studentPhone || s.phone === student.studentPhone
            ? {
                ...s,
                fullName: editFullName.trim(),
                name: editFullName.trim(),
                studentPhone: editPhone.trim(),
                phone: editPhone.trim(),
                stageId: editStageId,
                stage: editStageId,
              }
            : s
        );
        localStorage.setItem("local_students_db", JSON.stringify(updatedList));
      } catch (e) {}
    }

    // تحديث في Supabase إن وجد
    if (student.studentPhone) {
      try {
        await supabase
          .from("students")
          .update({
            fullName: editFullName.trim(),
            studentPhone: editPhone.trim(),
            stageId: editStageId,
          })
          .eq("studentPhone", student.studentPhone);
      } catch (err) {
        console.error("Supabase update profile details error:", err);
      }
    }

    setIsEditingProfile(false);
    alert("تم تحديث معلومات حسابك الشخصي بنجاح! 🎉");
  };

  const currentStageUnits = curriculum[student.stageId] || curriculum["sec3"] || [];

  useEffect(() => {
    if (currentStageUnits.length > 0 && !activeLectureId) {
      for (const unit of currentStageUnits) {
        const firstPub = unit.lectures.find((l) => l.isPublished);
        if (firstPub) {
          setActiveLectureId(firstPub.id);
          setActiveUnitId(unit.id);
          break;
        }
      }
    }
  }, [currentStageUnits, activeLectureId]);

  const toggleLectureTab = (lecId: string, tab: "video" | "materials" | "quiz") => {
    const cur = activeTabPerLecture[lecId];
    if (cur === tab) {
      setActiveTabPerLecture({ ...activeTabPerLecture, [lecId]: null });
    } else {
      setActiveTabPerLecture({ ...activeTabPerLecture, [lecId]: tab });
      if (tab === "video") {
        const newWatched = { ...watchedVideos, [lecId]: true };
        setWatchedVideos(newWatched);
        localStorage.setItem("student_watched_videos", JSON.stringify(newWatched));
      }
    }
  };

  const handleSelectQuizAnswer = (lecId: string, qId: string, choiceIndex: number) => {
    const curAnswers = quizAnswers[lecId] || {};
    setQuizAnswers({
      ...quizAnswers,
      [lecId]: { ...curAnswers, [qId]: choiceIndex },
    });
  };

  const handleSubmitQuiz = (lec: LectureItem) => {
    if (!lec.quiz || !lec.quiz.questions) return;
    const ans = quizAnswers[lec.id] || {};
    let earnedPoints = 0;
    let totalPoints = 0;

    lec.quiz.questions.forEach((q) => {
      totalPoints += q.points;
      if (ans[q.id] === q.correctChoiceIndex) {
        earnedPoints += q.points;
      }
    });

    const newCompleted = {
      ...completedQuizzes,
      [lec.id]: { score: earnedPoints, total: totalPoints },
    };
    setCompletedQuizzes(newCompleted);
    localStorage.setItem("student_completed_quizzes_v2", JSON.stringify(newCompleted));

    // حفظ درجة الطالب وإحصائيته الشاملة داخل سجل الإدارة
    const percentage = totalPoints === 0 ? 0 : Math.round((earnedPoints / totalPoints) * 100);
    const status = percentage >= 85 ? "ممتاز" : percentage >= 70 ? "ناجح" : percentage >= 50 ? "يحتاج مراجعة" : "غير مجتاز";
    const nowStr = new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

    const newScoreItem = {
      id: `qs-${Date.now()}`,
      quizTitle: lec.quiz?.title || `اختبار ${lec.title}`,
      lectureTitle: lec.title,
      score: earnedPoints,
      totalPoints: totalPoints,
      percentage: percentage,
      status: status as any,
      completedAt: nowStr,
    };

    // 1. التحديث المحلي في التخزين
    const localStudentsStr = localStorage.getItem("local_students_db") || "[]";
    try {
      const localStudents: any[] = JSON.parse(localStudentsStr);
      const updatedStudents = localStudents.map((s) => {
        if ((s.studentPhone && s.studentPhone === student.studentPhone) || (s.phone && s.phone === student.studentPhone)) {
          const prevScores = s.quizScores || [];
          const filteredScores = prevScores.filter((x: any) => x.lectureTitle !== lec.title);
          return {
            ...s,
            progress: progressPercentage,
            lastQuiz: `${lec.title} (${earnedPoints}/${totalPoints})`,
            quizScores: [newScoreItem, ...filteredScores],
          };
        }
        return s;
      });
      localStorage.setItem("local_students_db", JSON.stringify(updatedStudents));
    } catch (e) {
      console.error("Error updating local student quiz history:", e);
    }

    // 2. التحديث في Supabase إن وجد
    if (student.studentPhone) {
      try {
        supabase
          .from("students")
          .select("*")
          .eq("studentPhone", student.studentPhone)
          .single()
          .then(({ data: existingData }) => {
            if (existingData) {
              const prevScores = Array.isArray(existingData.quizScores) ? existingData.quizScores : [];
              const filteredScores = prevScores.filter((x: any) => x.lectureTitle !== lec.title);
              const newScoresList = [newScoreItem, ...filteredScores];
              supabase
                .from("students")
                .update({
                  progress: progressPercentage,
                  lastQuiz: `${lec.title} (${earnedPoints}/${totalPoints})`,
                  quizScores: newScoresList,
                })
                .eq("studentPhone", student.studentPhone)
                .then(() => {});
            }
          });
      } catch (err) {
        console.error("Supabase update quiz error:", err);
      }
    }

    alert(
      `تم تصحيح الاختبار التفاعلي "${lec.title}"\nالنتيجة: ${earnedPoints} من أصل ${totalPoints} نقطة (${percentage}%)\nالتقييم: ${status}`
    );
  };

  let totalPublishedLectures = 0;
  let completedCount = 0;
  currentStageUnits.forEach((u) => {
    u.lectures.forEach((lec) => {
      if (lec.isPublished) {
        totalPublishedLectures++;
        if (watchedVideos[lec.id] || completedQuizzes[lec.id]) {
          completedCount++;
        }
      }
    });
  });

  const progressPercentage =
    totalPublishedLectures === 0 ? 0 : Math.min(100, Math.round((completedCount / totalPublishedLectures) * 100));

  const activeLecture = currentStageUnits
    .flatMap((u) => u.lectures)
    .find((l) => l.id === activeLectureId && l.isPublished);

  const activeUnit = currentStageUnits.find((u) =>
    u.lectures.some((l) => l.id === activeLectureId)
  );

  function getStageLabel(key: string) {
    const labels: Record<string, string> = {
      prep3: t.common.stages.prep3,
      sec1: t.common.stages.sec1,
      sec2: t.common.stages.sec2,
      sec3: t.common.stages.sec3,
      bac: t.common.stages.bac,
    };
    return labels[key] || (lang === "ar" ? "المرحلة الدراسية" : "Academic Stage");
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6" dir={dir}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-300">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6" dir={dir}>
        <Card className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-100">{t.dashboard.sessionRequired}</h3>
          </div>
          <div className="pt-2">
            <Button
              onClick={() => {
                window.location.href = "/login";
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-6 rounded-2xl shadow-lg transition-all"
            >
              <span>{t.dashboard.goToLogin}</span>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={
        darkMode
          ? "min-h-screen bg-slate-950 text-slate-100 pb-16 transition-colors duration-300 font-sans selection:bg-purple-500 selection:text-white"
          : "min-h-screen bg-slate-50 text-slate-900 pb-16 transition-colors duration-300 font-sans selection:bg-indigo-500 selection:text-white"
      }
      dir={dir}
    >
      <nav
        className={
          darkMode
            ? "border-b border-slate-900/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 transition-colors shadow-sm"
            : "border-b border-slate-200/80 bg-white/80 backdrop-blur-xl sticky top-0 z-50 transition-colors shadow-xs"
        }
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1
              className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-600 to-purple-600 dark:from-amber-400 dark:via-yellow-500 dark:to-purple-400 cursor-pointer"
              onClick={() => setShowProfile(false)}
            >
              SENIOR
            </h1>
            <div className="flex space-x-1 space-x-reverse items-center hidden sm:flex">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center border border-amber-500">
                <div ref={rightEyeRef} className="w-2.5 h-2.5 bg-slate-950 rounded-full relative">
                  <div className="w-0.5 h-0.5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                </div>
              </div>
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center border border-amber-500">
                <div ref={leftEyeRef} className="w-2.5 h-2.5 bg-slate-950 rounded-full relative">
                  <div className="w-0.5 h-0.5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={toggleLanguage}
              className={
                darkMode
                  ? "px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-amber-400 hover:bg-slate-800 transition-all text-xs font-bold flex items-center gap-1.5"
                  : "px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all shadow-xs text-xs font-bold flex items-center gap-1.5"
              }
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t.common.langBtn}</span>
            </button>

            <button
              onClick={() => setShowProfile(!showProfile)}
              className={
                darkMode
                  ? "text-xs font-bold bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl border border-slate-800 text-amber-400 transition-all flex items-center gap-2"
                  : "text-xs font-bold bg-white hover:bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 transition-all shadow-xs flex items-center gap-2"
              }
            >
              <User className="w-3.5 h-3.5" />
              <span>{showProfile ? t.dashboard.showCurriculum : `${t.dashboard.myProfile}: ${student.fullName.split(" ")[0]}`}</span>
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={
                darkMode
                  ? "p-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 hover:bg-slate-800 transition-all"
                  : "p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all shadow-xs"
              }
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={handleLogout}
              className="text-xs font-bold bg-red-500/10 hover:bg-red-500/20 px-3.5 py-2 rounded-xl border border-red-500/30 text-red-600 dark:text-red-400 transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 mt-8 space-y-8">
        {!showProfile ? (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* بطاقة الترحيب ونسبة التقدم الحية */}
            <Card
              className={
                darkMode
                  ? "bg-gradient-to-r from-slate-900 via-slate-900/90 to-purple-950/40 border border-slate-800/80 p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                  : "bg-gradient-to-r from-white via-white to-slate-50 border border-slate-200 p-6 md:p-8 rounded-3xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-slate-900"
              }
            >
              <div className="space-y-2.5 max-w-xl">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 dark:border-amber-500/20 inline-block">
                  {getStageLabel(student.stageId)}
                </span>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                  {t.dashboard.welcome}{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-600 to-purple-600 dark:from-amber-400 dark:via-yellow-400 dark:to-purple-400">
                    {student.fullName}
                  </span>
                </h2>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  {t.dashboard.welcomeSubtitle}
                </p>
              </div>

              <div className="w-full md:w-72 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 p-4.5 rounded-2xl space-y-2.5 shrink-0 shadow-inner">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>{t.dashboard.progressTitle}</span>
                  <span className="text-amber-600 dark:text-amber-400">{progressPercentage}%</span>
                </div>
                <div className={`w-full h-2.5 rounded-full overflow-hidden border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-slate-200 border-slate-300"}`}>
                  <div
                    className="bg-gradient-to-r from-purple-500 via-amber-400 to-emerald-400 h-full transition-all duration-700 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium text-center">
                  {t.dashboard.progressSubtitle}
                </p>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* القائمة الجانبية (Right Sidebar) - Units and Lectures list */}
              <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24 max-h-[500px] lg:max-h-[calc(100vh-120px)] overflow-y-auto pr-1">
                <Card className={darkMode ? "p-5 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl" : "p-5 bg-white border border-slate-200 rounded-3xl shadow-xs"}>
                  <h3 className="text-xs font-black text-slate-700 dark:text-slate-400 mb-4 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    <span>{t.dashboard.curriculumContent}</span>
                  </h3>
                  
                  {currentStageUnits.length === 0 ? (
                    <p className="text-xs text-slate-600 dark:text-slate-500 font-bold text-center py-4">{t.dashboard.noPublishedLectures}</p>
                  ) : (
                    <div className="space-y-6">
                      {currentStageUnits.map((unit, uIdx) => {
                        const publishedLectures = unit.lectures.filter((l) => l.isPublished);
                        if (publishedLectures.length === 0) return null;

                        return (
                          <div key={unit.id} className="space-y-2">
                            {/* Unit Title */}
                            <div className="flex items-center gap-2 text-xs font-black text-slate-600 dark:text-slate-400 tracking-wider">
                              <span className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center text-[10px] border border-amber-500/20">
                                {uIdx + 1}
                              </span>
                              <span className="truncate">{unit.title}</span>
                            </div>

                            {/* Lectures List */}
                            <div className="space-y-1.5 pr-2">
                              {publishedLectures.map((lec) => {
                                const isActive = activeLectureId === lec.id;
                                const hasWatched = watchedVideos[lec.id];
                                const quizResult = completedQuizzes[lec.id];

                                return (
                                  <button
                                    key={lec.id}
                                    onClick={() => {
                                      setActiveLectureId(lec.id);
                                      setActiveUnitId(unit.id);
                                    }}
                                    className={`w-full text-right px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between border border-box ${
                                      isActive
                                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 dark:border-amber-500/20 shadow-md shadow-amber-500/5"
                                        : "text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200"
                                    }`}
                                  >
                                    <span className="truncate max-w-[180px]">{lec.title}</span>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      {hasWatched && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                                      {quizResult && <Award className="w-3.5 h-3.5 text-amber-500" />}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </div>

              {/* المحتوى الرئيسي للمحاضرة النشطة (Left Content Area) */}
              <div className="lg:col-span-8 space-y-6">
                {activeLecture ? (
                  <div className="space-y-6">
                    {/* Lesson Header */}
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                        {activeUnit?.title}
                      </span>
                      <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100">
                        {activeLecture.title}
                      </h2>
                      {activeLecture.description && (
                        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl pt-1">
                          {activeLecture.description}
                        </p>
                      )}
                    </div>

                    {/* Resources Action List */}
                    <div className="space-y-4">
                      {/* 1. Watch Video Card */}
                      <div className="space-y-3">
                        <button
                          onClick={() => toggleLectureTab(activeLecture.id, "video")}
                          className={`w-full p-5 rounded-3xl transition-all duration-300 flex items-center justify-between text-right cursor-pointer border ${
                            activeTabPerLecture[activeLecture.id] === "video"
                              ? "bg-purple-500/15 dark:bg-purple-500/20 border-purple-500/50 dark:border-purple-500/60 text-purple-800 dark:text-purple-200 shadow-md shadow-purple-500/5"
                              : "bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 hover:border-purple-500/30 hover:bg-purple-500/5 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <span className="text-sm md:text-base font-black">{t.dashboard.lectureTabVideo}</span>
                          <div className={`w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0`}>
                            <Play className="w-4.5 h-4.5 text-purple-600 dark:text-purple-400 fill-purple-600 dark:fill-purple-400" />
                          </div>
                        </button>

                        {activeTabPerLecture[activeLecture.id] === "video" && (
                          <div className="p-5 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-3xl animate-in slide-in-from-top-4 duration-300">
                            {(() => {
                              const videoId = activeLecture.videoId || extractYouTubeId(activeLecture.youtubeUrl);
                              return videoId ? (
                                <ProtectedVideoPlayer
                                  videoId={videoId}
                                  lectureTitle={activeLecture.title}
                                  studentName={student.fullName}
                                  studentPhone={student.studentPhone}
                                  darkMode={darkMode}
                                />
                              ) : (
                                <div className="p-8 text-center text-xs text-slate-600 dark:text-slate-400 font-bold border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
                                  {t.dashboard.noVideoAdded}
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>

                      {/* 2. PDF Materials Card */}
                      <div className="space-y-3">
                        <button
                          onClick={() => toggleLectureTab(activeLecture.id, "materials")}
                          className={`w-full p-5 rounded-3xl transition-all duration-300 flex items-center justify-between text-right cursor-pointer border ${
                            activeTabPerLecture[activeLecture.id] === "materials"
                              ? "bg-amber-500/15 border-amber-500/50 text-amber-800 dark:text-amber-200 shadow-md shadow-amber-500/5"
                              : "bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 hover:border-amber-500/30 hover:bg-amber-500/5 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <span className="text-sm md:text-base font-black">{t.dashboard.lectureTabMaterials}</span>
                          <div className={`w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0`}>
                            <FileText className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />
                          </div>
                        </button>

                        {activeTabPerLecture[activeLecture.id] === "materials" && (
                          <div className="p-5 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-3xl animate-in slide-in-from-top-4 duration-300 space-y-4">
                            <h6 className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                              <FileText className="w-4 h-4" />
                              <span>{t.dashboard.materialsHeader}</span>
                            </h6>

                            {activeLecture.materials.length === 0 ? (
                              <div className="text-xs text-slate-600 dark:text-slate-400 text-center py-6 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl font-bold">
                                {t.dashboard.noMaterialsAdded}
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {activeLecture.materials.map((mat) => (
                                  <div
                                    key={mat.id}
                                    className="p-3.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl flex justify-between items-center gap-3"
                                  >
                                    <div className="flex items-center gap-2.5 overflow-hidden">
                                      <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                                        <FileText className="w-4 h-4" />
                                      </div>
                                      <div>
                                        <h6 className="text-xs font-bold text-slate-900 dark:text-slate-200 truncate max-w-[150px]">
                                          {mat.name}
                                        </h6>
                                        <span className="text-[10px] text-slate-600 dark:text-slate-500">{t.dashboard.fileSize}: {mat.size || "PDF"}</span>
                                      </div>
                                    </div>
                                    <a
                                      href={mat.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => {
                                        if (mat.url === "#" || !mat.url) {
                                          e.preventDefault();
                                          alert(`تم النقر لعرض الملف: ${mat.name}\n(هذا ملف تجريبي محمي عبر المنصة)`);
                                        }
                                      }}
                                      className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 text-xs font-bold border border-blue-500/30 transition-all shrink-0 flex items-center gap-1"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                      <span>{t.dashboard.download}</span>
                                    </a>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 3. Interactive Quiz Card */}
                      <div className="space-y-3">
                        <button
                          onClick={() => toggleLectureTab(activeLecture.id, "quiz")}
                          className={`w-full p-5 rounded-3xl transition-all duration-300 flex items-center justify-between text-right cursor-pointer border ${
                            activeTabPerLecture[activeLecture.id] === "quiz"
                              ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-800 dark:text-emerald-200 shadow-md shadow-emerald-500/10"
                              : "bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/30 hover:bg-emerald-500/5 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <span className="text-sm md:text-base font-black">{t.dashboard.lectureTabQuiz}</span>
                          <div className={`w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0`}>
                            <HelpCircle className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                        </button>

                        {activeTabPerLecture[activeLecture.id] === "quiz" && (
                          <div className="p-5 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-3xl animate-in slide-in-from-top-4 duration-300 space-y-4">
                            {(() => {
                              const quizResult = completedQuizzes[activeLecture.id];
                              return (
                                <>
                                  <div className="flex justify-between items-center flex-wrap gap-2">
                                    <h6 className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                                      <HelpCircle className="w-4 h-4" />
                                      <span>{activeLecture.quiz?.title || `${t.dashboard.quizTitlePrefix} ${activeLecture.title}`} ({activeLecture.quiz?.questions?.length || 0} {t.dashboard.questionsText})</span>
                                    </h6>
                                    {quizResult && (
                                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/30 flex items-center gap-1.5">
                                        <Award className="w-4 h-4" />
                                        <span>{t.dashboard.prevScore}: {quizResult.score} / {quizResult.total} {t.dashboard.points}</span>
                                      </span>
                                    )}
                                  </div>

                                  {(!activeLecture.quiz?.questions || activeLecture.quiz.questions.length === 0) ? (
                                    <div className="text-xs text-slate-600 dark:text-slate-400 text-center py-6 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl font-bold">
                                      {t.dashboard.noQuestions}
                                    </div>
                                  ) : (
                                    <div className="space-y-4">
                                      {activeLecture.quiz.questions.map((q, qIdx) => {
                                        const studentChosenIndex = (quizAnswers[activeLecture.id] || {})[q.id];
                                        const isCorrect = studentChosenIndex === q.correctChoiceIndex;

                                        return (
                                          <div
                                            key={q.id}
                                            className="p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3"
                                          >
                                            <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex justify-between gap-4">
                                              <span>
                                                {qIdx + 1}. {q.questionText}
                                              </span>
                                              <span className="text-amber-600 dark:text-amber-400 shrink-0 font-bold">({q.points} {t.dashboard.points})</span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                              {q.choices.map((choice, cIdx) => {
                                                const isSelected = studentChosenIndex === cIdx;
                                                let btnStyle = darkMode
                                                  ? "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                                                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100";
                                                if (isSelected) {
                                                  btnStyle = "bg-purple-600 text-white border-purple-500 font-bold shadow-md";
                                                }
                                                if (quizResult) {
                                                  if (cIdx === q.correctChoiceIndex) {
                                                    btnStyle = "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/60 font-bold";
                                                  } else if (isSelected && !isCorrect) {
                                                    btnStyle = "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/60";
                                                  }
                                                }

                                                return (
                                                  <button
                                                    key={cIdx}
                                                    disabled={!!quizResult}
                                                    onClick={() => handleSelectQuizAnswer(activeLecture.id, q.id, cIdx)}
                                                    className={`p-3 rounded-xl text-xs text-right border transition-all flex items-center justify-between ${btnStyle}`}
                                                  >
                                                    <span>
                                                      <b>{["A", "B", "C", "D"][cIdx]}.</b> {choice}
                                                    </span>
                                                    {isSelected && !quizResult && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                    {quizResult && cIdx === q.correctChoiceIndex && <span className="text-[11px] text-emerald-400 font-bold">{t.dashboard.correctAnswer}</span>}
                                                    {quizResult && isSelected && !isCorrect && <span className="text-[11px] text-red-400 font-bold">{t.dashboard.wrongAnswer}</span>}
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        );
                                      })}

                                      <div className="flex justify-end pt-2">
                                        <Button
                                          onClick={() => handleSubmitQuiz(activeLecture)}
                                          className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black px-6 py-5 rounded-xl text-xs shadow-md flex items-center gap-2"
                                        >
                                          <Send className="w-4 h-4" />
                                          <span>{t.dashboard.submitQuizBtn}</span>
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Card className={`p-12 text-center font-bold rounded-3xl border ${
                    darkMode
                      ? "bg-slate-900/40 border-slate-800/80 text-slate-400"
                      : "bg-slate-100 border-slate-300 text-slate-600"
                  }`}>
                    اختر محاضرة من القائمة الجانبية لبدء الشرح.
                  </Card>
                )}
              </div>
            </div>
          </div>
        ) : (
          <Card
            className={
              darkMode
                ? "bg-slate-900 border-slate-800 p-6 md:p-8 rounded-3xl shadow-xl space-y-6"
                : "bg-white border-slate-200 p-6 md:p-8 rounded-3xl shadow-md space-y-6 text-slate-900"
            }
          >
            <div className="flex justify-between items-start sm:items-center flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-purple-400">
                  الملف الشخصي وبيانات الطالب
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  إدارة بيانات الحساب المسجلة وتغيير كلمة المرور بأمان.
                </p>
              </div>

              {!isEditingProfile && (
                <Button
                  onClick={() => {
                    setEditFullName(student.fullName);
                    setEditPhone(student.studentPhone);
                    setEditStageId(student.stageId || "sec3");
                    setIsEditingProfile(true);
                  }}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>تعديل البيانات الأساسية</span>
                </Button>
              )}
            </div>

            {!isEditingProfile ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl text-center">
                  <span className="text-xs text-slate-600 dark:text-slate-400 block mb-1">الاسم بالكامل</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{student.fullName}</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl text-center">
                  <span className="text-xs text-slate-600 dark:text-slate-400 block mb-1">رقم الهاتف المسجل</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100" dir="ltr">
                    {student.studentPhone || "غير مسجل"}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl text-center">
                  <span className="text-xs text-slate-600 dark:text-slate-400 block mb-1">المرحلة الدراسية</span>
                  <span className="text-sm font-bold text-purple-700 dark:text-purple-400">
                    {getStageLabel(student.stageId)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-5 bg-white dark:bg-slate-950/90 border border-purple-500/40 rounded-2xl space-y-4 animate-in fade-in duration-200">
                <div className={`flex items-center justify-between border-b pb-3 ${darkMode ? "border-slate-800" : "border-slate-200"}`}>
                  <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-purple-400" />
                    <span>تعديل معلومات الحساب الأساسية</span>
                  </h4>
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">الاسم الرباعي بالكامل</label>
                    <Input
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      placeholder="الاسم بالكامل"
                      className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs h-10 text-slate-900 dark:text-slate-100 font-bold focus-visible:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">رقم الهاتف المسجل</label>
                    <Input
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="01xxxxxxxxx"
                      dir="ltr"
                      className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs h-10 text-slate-900 dark:text-slate-100 font-mono text-right font-bold focus-visible:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">المرحلة الدراسية</label>
                    <select
                      value={editStageId}
                      onChange={(e) => setEditStageId(e.target.value)}
                      className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 font-bold px-3 focus:outline-none focus:border-purple-500"
                    >
                      <option value="prep3">الصف الثالث الإعدادي</option>
                      <option value="sec1">الصف الأول الثانوي</option>
                      <option value="sec2">الصف الثاني الثانوي</option>
                      <option value="sec3">الصف الثالث الثانوي</option>
                      <option value="bac">مرحلة البكالوريا</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    variant="outline"
                    className="bg-slate-50 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 text-xs px-5 h-10"
                  >
                    <span>إلغاء</span>
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveProfileDetails}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs px-6 h-10 shadow-md flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ وتحديث البيانات ✅</span>
                  </Button>
                </div>
              </div>
            )}

            <form onSubmit={passwordForm.handleSubmit(onPasswordChangeSubmit)} className={`space-y-4 pt-4 border-t ${darkMode ? "border-slate-800/80" : "border-slate-200"}`}>
              <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>تحديث كلمة المرور الخاصة بك</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">كلمة المرور الحالية</label>
                  <div className="relative">
                    <Input
                      type={showOldPassword ? "text" : "password"}
                      {...passwordForm.register("oldPassword")}
                      placeholder="••••••••"
                      className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs h-10 text-slate-900 dark:text-slate-100 font-bold focus-visible:ring-purple-500 px-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                      aria-label={showOldPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                    >
                      {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.oldPassword && (
                    <span className="text-[11px] text-red-600 dark:text-red-400 font-bold">
                      {passwordForm.formState.errors.oldPassword.message}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">كلمة المرور الجديدة</label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      {...passwordForm.register("newPassword")}
                      placeholder="••••••••"
                      className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs h-10 text-slate-900 dark:text-slate-100 font-bold focus-visible:ring-purple-500 px-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                      aria-label={showNewPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.newPassword && (
                    <span className="text-[11px] text-red-600 dark:text-red-400 font-bold">
                      {passwordForm.formState.errors.newPassword.message}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">تأكيد كلمة المرور الجديدة</label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      {...passwordForm.register("confirmPassword")}
                      placeholder="••••••••"
                      className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs h-10 text-slate-900 dark:text-slate-100 font-bold focus-visible:ring-purple-500 px-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                      aria-label={showConfirmPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.confirmPassword && (
                    <span className="text-[11px] text-red-600 dark:text-red-400 font-bold">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </span>
                  )}
                </div>
              </div>

              {passMessage.text && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 ${
                    passMessage.type === "error"
                      ? "bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400"
                      : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {passMessage.type === "error" ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{passMessage.text}</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-black px-6 py-5 rounded-xl text-xs"
                >
                  حفظ كلمة المرور الجديدة
                </Button>
              </div>
            </form>
          </Card>
        )}
      </main>
    </div>
  );
}
