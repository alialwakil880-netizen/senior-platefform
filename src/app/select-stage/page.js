"use client";

import React from 'react';

export default function SelectStagePage() {
  
  // قائمة السنين الدراسية اللي طلبتها بالظبط
  const stages = [
    { id: "prep3", name: "الصف الثالث الإعدادي", icon: "🎓", desc: "مرحلة الشهادة الإعدادية" },
    { id: "sec1", name: "الصف الأول الثانوي", icon: "📚", desc: "بداية الرحلة الثانوية" },
    { id: "sec2", name: "الصف الثاني الثانوي", icon: "✏️", desc: "مرحلة التركيز والتجهيز" },
    { id: "sec3", name: "الصف الثالث الثانوي", icon: "🎯", desc: "دفعة الأبطال 2027" },
    { id: "bac", name: "مرحلة البكالوريا", icon: "🌟", desc: "طريقك للجامعة والتميز" },
  ];

  // دالة لحفظ سنة الطالب وتوجيهه للـ Dashboard
  const handleSelect = (stageId, stageName) => {
    // بنحفظ الاختيار في ذاكرة المتصفح عشان السيستم يفتكره دايماً
    localStorage.setItem("studentStageId", stageId);
    localStorage.setItem("studentStageName", stageName);
    
    // بننقل الطالب أوتوماتيك للوحة التحكم
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col justify-center items-center p-6" dir="rtl">
      
      {/* رأس الصفحة والترحيب */}
      <div className="text-center max-w-md mb-10 space-y-3">
        <h1 className="text-3xl font-black text-purple-500 tracking-wider">SENIOR PLATFORM</h1>
        <h2 className="text-xl font-bold text-gray-100">مرحباً بك في منصة مستر علي الوكيل 👋</h2>
        <p className="text-gray-400 text-sm">
          من فضلك اختر سنتك الدراسية الحالية لتخصيص لوحة التحكم والمحاضرات الخاصة بك.
        </p>
      </div>

      {/* شبكة الأزرار للسنين الدراسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
        {stages.map((stage) => (
          <button
            key={stage.id}
            onClick={() => handleSelect(stage.id, stage.name)}
            className="bg-slate-900 border border-slate-800 hover:border-purple-600/50 p-5 rounded-2xl text-right flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] group shadow-xl"
          >
            <span className="text-3xl bg-slate-950 p-3 rounded-xl group-hover:bg-purple-950/50 transition-all">
              {stage.icon}
            </span>
            <div className="space-y-1">
              <h3 className="font-bold text-gray-150 text-lg group-hover:text-purple-400 transition-all">
                {stage.name}
              </h3>
              <p className="text-xs text-gray-500">{stage.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* تذييل بسيط */}
      <p className="text-xs text-gray-600 mt-12">جميع الحقوق محفوظة لمنصة SENIOR © 2026</p>
    </div>
  );
}
