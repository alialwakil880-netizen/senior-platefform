"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import {
  GraduationCap,
  BookOpen,
  Award,
  Sparkles,
  Compass,
  ChevronLeft,
} from "lucide-react";

interface StageOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  desc: string;
}

export default function SelectStagePage() {
  const stages: StageOption[] = [
    {
      id: "prep3",
      name: "الصف الثالث الإعدادي (Prep 3)",
      icon: <Compass className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
      desc: "مرحلة الشهادة الإعدادية والتأسيس اللغوي",
    },
    {
      id: "sec1",
      name: "الصف الأول الثانوي (Sec 1)",
      icon: <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      desc: "بداية المرحلة الثانوية وتنمية مهارات الترجمة والقواعد",
    },
    {
      id: "sec2",
      name: "الصف الثاني الثانوي (Sec 2)",
      icon: <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
      desc: "مرحلة التركيز والتجهيز للشهادة الثانوية العامة",
    },
    {
      id: "sec3",
      name: "الصف الثالث الثانوي (Sec 3)",
      icon: <GraduationCap className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      desc: "دفعة الثانوية العامة - التدريب المكثف والامتحانات الشاملة",
    },
    {
      id: "bac",
      name: "مرحلة البكالوريا (Baccalaureate)",
      icon: <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />,
      desc: "المستوى المتقدم والتأهيل لاختبارات القبول الجامعي",
    },
  ];

  const handleSelect = (stageId: string, stageName: string) => {
    localStorage.setItem("studentStageId", stageId);
    localStorage.setItem("studentStageName", stageName);
    window.location.href = "/dashboard";
  };

  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col justify-center items-center p-6 selection:bg-purple-500 selection:text-white transition-colors"
      dir="rtl"
    >
      <div className="text-center max-w-md mb-10 space-y-3">
        <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-black tracking-wider uppercase mb-1">
          SENIOR PLATFORM
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-slate-200 dark:to-slate-400 tracking-tight">
          اختر مرحلتك الدراسية
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm leading-relaxed">
          من فضلك حدد الصف الدراسي الحالي ليتم تخصيص لوحة التحكم والمحاضرات والاختبارات التفاعلية الخاصة بك.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl w-full">
        {stages.map((stage) => (
          <button
            key={stage.id}
            onClick={() => handleSelect(stage.id, stage.name)}
            className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 hover:border-amber-500/50 dark:hover:border-amber-500/50 p-5 rounded-2xl text-right flex items-center justify-between gap-4 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-900 group shadow-sm dark:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center shrink-0 group-hover:border-amber-500/30 transition-all">
                {stage.icon}
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-slate-800 dark:text-slate-200 text-sm md:text-base group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {stage.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">{stage.desc}</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-950/60 flex items-center justify-center text-slate-600 dark:text-slate-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:bg-amber-50 dark:group-hover:bg-amber-500/10 transition-all shrink-0">
              <ChevronLeft className="w-4 h-4" />
            </div>
          </button>
        ))}
      </div>

      <p className="text-[11px] text-slate-600 dark:text-slate-500 mt-14 font-medium">
        جميع الحقوق محفوظة لمنصة SENIOR التعليمية © 2026
      </p>
    </div>
  );
}
