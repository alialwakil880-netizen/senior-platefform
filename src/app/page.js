"use client";

import React, { useState, useEffect, useRef } from "react";

export default function LandingPage() {
  const [darkMode, setDarkMode] = useState(true);
  const leftEyeRef = useRef(null);
  const rightEyeRef = useRef(null);

  // تتبع حركة الماوس لتحريك بؤبؤ العين
  useEffect(() => {
    const handleMouseMove = (event) => {
      const eyes = [leftEyeRef.current, rightEyeRef.current];
      eyes.forEach((eye) => {
        if (!eye) return;
        const rect = eye.getBoundingClientRect();
        const eyeX = rect.left + rect.width / 2;
        const eyeY = rect.top + rect.height / 2;
        const angle = Math.atan2(event.clientY - eyeY, event.clientX - eyeX);
        const maxDistance = 10; // أقصى مسافة يتحركها البؤبؤ داخل العين
        const x = Math.cos(angle) * maxDistance;
        const y = Math.sin(angle) * maxDistance;
        eye.style.transform = `translate(${x}px, ${y}px)`;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleStartJourney = () => {
    window.location.href = "/login";
  };

  return (
    <div className={darkMode ? "min-h-screen bg-slate-950 text-white transition-colors duration-300" : "min-h-screen bg-gray-50 text-slate-900 transition-colors duration-300"} dir="rtl">
      
      {/* شريط العناوين العلوي */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500">
          SENIOR
        </h1>
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className={darkMode ? "px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-yellow-400 text-sm font-bold shadow-lg" : "px-4 py-2 rounded-full bg-white border border-gray-200 text-indigo-600 text-sm font-bold shadow-md"}
        >
          {darkMode ? "☀️ المود الفاتح" : "🌙 المود الداكن"}
        </button>
      </nav>

      {/* القسم الرئيسي الترحيبي */}
      <main className="max-w-4xl mx-auto text-center mt-4 px-4 space-y-6 flex flex-col items-center justify-center">
        
        {/* تأثير العينين التفاعلية المستوحى من Center Steps */}
        <div className="flex space-x-6 space-x-reverse justify-center items-center my-1">
          {/* العين اليمنى */}
          <div className={darkMode ? "w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-purple-600 shadow-2xl transition-all duration-300 hover:scale-105" : "w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-indigo-600 shadow-xl transition-all duration-300 hover:scale-105"}>
            <div 
              ref={rightEyeRef}
              className="w-10 h-10 bg-slate-950 rounded-full flex items-center justify-center transition-transform duration-75 ease-out relative"
            >
              <div className="w-3 h-3 bg-white rounded-full absolute top-2 right-2"></div>
            </div>
          </div>
          {/* العين اليسرى */}
          <div className={darkMode ? "w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-purple-600 shadow-2xl transition-all duration-300 hover:scale-105" : "w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-indigo-600 shadow-xl transition-all duration-300 hover:scale-105"}>
            <div 
              ref={leftEyeRef}
              className="w-10 h-10 bg-slate-950 rounded-full flex items-center justify-center transition-transform duration-75 ease-out relative"
            >
              <div className="w-3 h-3 bg-white rounded-full absolute top-2 right-2"></div>
            </div>
          </div>
        </div>

        {/* النصوص والترحيب وإبراز الاسم */}
        <div className="space-y-4">
          <h2 className="text-4xl md:text-6xl font-black leading-tight">
            منصة{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400">
              SENIOR
            </span>{" "}
            التعليمية
          </h2>
          
          {/* مربع اسم مستر علي الوكيل الفخم والمضيء */}
          <div className="pt-2 flex justify-center">
            <div className={darkMode ? "border-2 border-purple-500 px-6 py-2 rounded-xl bg-purple-950/20 shadow-[0_0_15px_rgba(168,85,247,0.4)]" : "border-2 border-indigo-600 px-6 py-2 rounded-xl bg-indigo-50 shadow-md"}>
              <span className={darkMode ? "text-xl md:text-2xl font-black text-white tracking-wide" : "text-xl md:text-2xl font-black text-indigo-900 tracking-wide"}>
                Mr Ali Alwakil
              </span>
            </div>
          </div>
          
          {/* الـ Banner الخاص بالجملة التشجيعية المضيئة باللون الأبيض في الدارك مود */}
          <div className={darkMode ? "bg-purple-950/40 border border-purple-800/60 p-4 rounded-2xl max-w-2xl mx-auto shadow-xl mt-4 animate-pulse" : "bg-indigo-50 border border-indigo-200 p-4 rounded-2xl max-w-2xl mx-auto shadow-md mt-4"}>
            <p className={darkMode ? "text-base md:text-lg font-bold text-white italic" : "text-base md:text-lg font-bold text-indigo-800 italic"}>
              "رحلة الألف ميل تبدأ بخطوة، واليوم إحنا بنحط أول حجر أساس لأقوى منصة تعليمية.. استعد للقمة لأن السنيور مكانة تليق بك!" 🔥
            </p>
          </div>

          <p className={darkMode ? "text-sm md:text-base text-gray-400 max-w-2xl mx-auto font-medium pt-2" : "text-sm md:text-base text-gray-600 max-w-2xl mx-auto font-medium pt-2"}>
            بوابتك الذكية للتميز. نقدم لك تجربة تعليمية فريدة ومخصصة تناسب صفك الدراسي، مع نظام متابعة وتقييم مستمر يضمن لك الصدارة دائماً.🎯
          </p>
        </div>

        {/* زر الانطلاق - باللون الأصفر المضيء والخاطف للعين بناءً على طلبك */}
        <div className="pt-2">
          <button 
            onClick={handleStartJourney}
            className={darkMode 
              ? "px-10 py-4 text-lg font-black rounded-2xl bg-yellow-400 text-slate-950 hover:bg-yellow-300 shadow-[0_0_20px_rgba(250,204,21,0.4)] transition-all duration-300 transform hover:-translate-y-1 block"
              : "px-10 py-4 text-lg font-black rounded-2xl bg-yellow-500 text-white hover:bg-yellow-600 shadow-lg transition-all duration-300 transform hover:-translate-y-1 block"
            }
          >
            ابدأ رحلتك معانا الآن 🚀
          </button>
        </div>

        {/* نبذة عن المميزات السريعة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-2">
          <div className={darkMode ? "bg-slate-900/50 border border-slate-800 p-6 rounded-2xl text-right" : "bg-white border border-gray-200 p-6 rounded-2xl text-right shadow-sm"}>
            <div className="text-2xl mb-2">📚</div>
            <h4 className="font-bold text-lg mb-1">منهج منظم ومقسم</h4>
            <p className="text-xs text-gray-400">وحدات مقسمة لدروس تفصيلية تدعم استيعابك بذكاء.</p>
          </div>
          <div className={darkMode ? "bg-slate-900/50 border border-slate-800 p-6 rounded-2xl text-right" : "bg-white border border-gray-200 p-6 rounded-2xl text-right shadow-sm"}>
            <div className="text-2xl mb-2">📝</div>
            <h4 className="font-bold text-lg mb-1">امتحانات وتقييم فوري</h4>
            <p className="text-xs text-gray-400">اختبر نفسك بعد كل درس واعرف مستواك ونسبة تقدمك فوراً.</p>
          </div>
          <div className={darkMode ? "bg-slate-900/50 border border-slate-800 p-6 rounded-2xl text-right" : "bg-white border border-gray-200 p-6 rounded-2xl text-right shadow-sm"}>
            <div className="text-2xl mb-2">📎</div>
            <h4 className="font-bold text-lg mb-1">ملفات وملخصات PDF</h4>
            <p className="text-xs text-gray-400">مكتبة شاملة لكل المستندات والملخصات التي تحتاجها في جيبك.</p>
          </div>
        </div>

      </main>
    </div>
  );
}