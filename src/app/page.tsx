"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import {
  Play,
  FileText,
  HelpCircle,
  Sun,
  Moon,
  ArrowLeft,
  ArrowRight,
  Globe,
  GraduationCap,
  BookOpen,
  Award,
  CheckCircle2,
  ChevronDown,
  Video,
  PenTool,
  BookOpenCheck,
  Mic,
  FileCheck,
  ClipboardList,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";



/* ─────────────────── Fade-in Animation Wrapper ─────────────────── */
const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

const floatingMockup = {
  animate: {
    y: [0, -8, 0],
    transition: { duration: 6, repeat: Infinity, ease: "easeInOut" as const },
  },
};

/* ─────────────────── Main Landing Page ─────────────────── */
export default function LandingPage() {
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
  const [scrolled, setScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const navigate = (path: string) => {
    window.location.href = path;
  };

  const l = t.landing as any;

  const unitIcons = [BookOpen, PenTool, BookOpenCheck, FileText, Mic, ClipboardList];

  return (
    <div
      className={
        darkMode
          ? "min-h-screen bg-[#020617] text-slate-100 font-sans"
          : "min-h-screen bg-[#FAFAFC] text-slate-900 font-sans"
      }
      dir={dir}
      onMouseMove={handleMouseMove}
    >
      {/* ═══════════════ ANIMATED BACKGROUND ═══════════════ */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Grid pattern */}
        <div className={`absolute inset-0 bg-grid-pattern ${darkMode ? "opacity-100" : "opacity-60"}`} />

        {/* Gradient orbs */}
        <div className={`absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full blur-[120px] animate-gradient-shift ${darkMode ? "bg-purple-600/8" : "bg-purple-400/[0.07]"}`} />
        <div className={`absolute bottom-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full blur-[120px] animate-gradient-shift-alt ${darkMode ? "bg-amber-500/8" : "bg-amber-400/[0.06]"}`} />
        <div className={`absolute top-[40%] left-[30%] w-[500px] h-[500px] rounded-full blur-[100px] animate-gradient-shift ${darkMode ? "bg-blue-600/5" : "bg-blue-400/[0.04]"}`} />

        {/* Mouse-follow gradient */}
        <div
          className={`absolute w-[600px] h-[600px] rounded-full blur-[100px] transition-all duration-[1500ms] ease-out ${darkMode ? "bg-purple-500/5" : "bg-purple-400/[0.03]"}`}
          style={{
            left: mousePos.x - 300,
            top: mousePos.y - 300,
          }}
        />
      </div>

      {/* ═══════════════ FLOATING GLASS NAVBAR ═══════════════ */}
      <div className="fixed top-4 sm:top-6 left-0 right-0 z-50 flex justify-center px-4 sm:px-6 pointer-events-none">
        <nav
          className={`pointer-events-auto w-full max-w-7xl transition-all duration-500 rounded-2xl ${
            scrolled
              ? darkMode
                ? "bg-slate-950/80 backdrop-blur-xl border border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.2)] py-1"
                : "bg-white/80 backdrop-blur-2xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] py-1"
              : "bg-transparent border border-transparent py-2"
          }`}
        >
          <div className="px-6 h-14 flex items-center justify-between">
            {/* Left: Actions */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => navigate("/login")}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                  darkMode
                    ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
                    : "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/15 hover:shadow-lg hover:shadow-amber-500/25 hover:-translate-y-px"
                }`}
              >
                {t.common.login}
              </button>
              <button
                onClick={toggleLanguage}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                  darkMode
                    ? "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                <Globe className="w-4 h-4 inline-block" />
                <span className="mr-1 ml-1">{t.common.langBtn}</span>
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-xl transition-all duration-300 ${
                  darkMode
                    ? "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>

            {/* Right: Logo */}
            <div className="flex items-center gap-2.5">
              <span className={`text-[10px] uppercase tracking-[0.2em] font-medium hidden sm:inline ${darkMode ? "text-slate-500" : "text-slate-600"}`}>
                PLATFORM
              </span>
              <h1 className={`text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r ${darkMode ? "from-amber-400 via-yellow-400 to-purple-400" : "from-amber-500 via-yellow-500 to-purple-500"}`}>
                SENIOR
              </h1>
            </div>
          </div>
        </nav>
      </div>

      {/* ═══════════════ HERO SECTION ═══════════════ */}
      <section className="relative z-10 pt-36 pb-24 md:pt-44 md:pb-36">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            {/* Text Column */}
            <motion.div
              className="space-y-10"
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              {/* Badge */}
              <motion.div variants={fadeInUp} className="inline-flex">
                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  darkMode
                    ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                    : "bg-purple-50 text-purple-600 border-purple-200/60"
                }`}>
                  <Award className="w-3.5 h-3.5" />
                  {l.officialBadge}
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={fadeInUp}
                className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight"
              >
                {l.heroTitle}{" "}
                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${darkMode ? "from-amber-400 via-yellow-400 to-purple-400" : "from-amber-500 via-yellow-500 to-purple-500"}`}>
                  SENIOR
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                variants={fadeInUp}
                className={`text-base sm:text-lg leading-relaxed max-w-xl ${
                  darkMode ? "text-slate-400" : "text-slate-600"
                }`}
              >
                {l.heroSubtitle}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 pt-1">
                <button
                  onClick={() => navigate("/login")}
                  className={`group px-8 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2 ${
                    darkMode
                      ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
                      : "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-[0_2px_8px_rgba(245,158,11,0.25),0_8px_24px_rgba(245,158,11,0.15)] hover:shadow-[0_4px_12px_rgba(245,158,11,0.3),0_12px_32px_rgba(245,158,11,0.2)]"
                  }`}
                >
                  {l.ctaPrimary}
                  {dir === "rtl" ? (
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  ) : (
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  )}
                </button>
                <button
                  onClick={() => {
                    document.getElementById("units-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`px-8 py-3.5 rounded-2xl text-sm font-bold border transition-all duration-300 flex items-center gap-2 hover:-translate-y-0.5 ${
                    darkMode
                      ? "text-slate-300 border-slate-700 hover:border-slate-500 hover:bg-white/5"
                      : "text-slate-600 border-slate-300 hover:border-slate-400 hover:bg-white hover:shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
                  }`}
                >
                  {l.ctaSecondary}
                  <ChevronDown className="w-4 h-4" />
                </button>
              </motion.div>
            </motion.div>

            {/* Mockup Column */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: dir === "rtl" ? -40 : 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
            >
              {/* Glow behind mockup */}
              <div className={`absolute -inset-8 rounded-3xl blur-3xl animate-glow-pulse ${darkMode ? "bg-gradient-to-tr from-amber-500/10 via-purple-500/10 to-blue-500/5" : "bg-gradient-to-tr from-amber-400/[0.08] via-purple-400/[0.06] to-blue-400/[0.03]"}`} />

              {/* Platform Mockup */}
              <motion.div
                className={`relative rounded-3xl p-1 ${
                  darkMode
                    ? "glass-card shadow-2xl shadow-black/40"
                    : "bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-[0_2px_4px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.08),0_24px_64px_rgba(15,23,42,0.06)]"
                }`}
                animate={darkMode ? undefined : floatingMockup.animate}
              >
                <div className={`rounded-[20px] overflow-hidden border ${darkMode ? "bg-slate-950/80 border-white/5" : "bg-white border-slate-100"}`}>
                  {/* Mockup top bar */}
                  <div className={`flex items-center gap-2 px-4 py-3 border-b ${darkMode ? "border-white/5" : "border-slate-100"}`}>
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className={`text-[10px] font-medium px-4 py-1 rounded-lg ${darkMode ? "text-slate-500 bg-white/5" : "text-slate-600 bg-slate-100"}`}>
                        senior-platform.com
                      </div>
                    </div>
                  </div>

                  {/* Mockup body */}
                  <div className="flex min-h-[280px] sm:min-h-[320px]">
                    {/* Sidebar */}
                    <div className={`w-[140px] sm:w-[160px] border-r p-3 space-y-1.5 shrink-0 ${darkMode ? "border-white/5" : "border-slate-100"}`}>
                      {(l.mockupSidebar as string[]).map((item: string, i: number) => (
                        <div
                          key={i}
                          className={`px-3 py-2 rounded-xl text-[11px] font-medium transition-all ${
                            i === 0
                              ? darkMode
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-amber-50 text-amber-700 border border-amber-200/60"
                              : darkMode
                                ? "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
                          }`}
                        >
                          {item}
                        </div>
                      ))}
                    </div>

                    {/* Main content */}
                    <div className="flex-1 p-4 sm:p-5 space-y-3.5">
                      <div>
                        <span className={`text-[10px] font-medium uppercase tracking-wider ${darkMode ? "text-slate-500" : "text-slate-600"}`}>
                          {(l.mockupSidebar as string[])[0]}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">{l.mockupLesson}</h3>
                      </div>

                      {/* Video card */}
                      <div className={`rounded-xl p-3 flex items-center gap-3 border transition-all ${darkMode ? "bg-gradient-to-br from-purple-600/20 to-amber-500/10 border-white/5" : "bg-purple-50/80 border-purple-100"}`}>
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${darkMode ? "bg-purple-500/20" : "bg-purple-100"}`}>
                          <Play className={`w-4 h-4 ${darkMode ? "text-purple-400 fill-purple-400" : "text-purple-600 fill-purple-600"}`} />
                        </div>
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{l.mockupWatchVideo}</span>
                      </div>

                      {/* PDF card */}
                      <div className={`rounded-xl p-3 flex items-center gap-3 border transition-all ${darkMode ? "bg-white/3 border-white/5" : "bg-slate-50/80 border-slate-100"}`}>
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${darkMode ? "bg-amber-500/10" : "bg-amber-50"}`}>
                          <FileText className={`w-4 h-4 ${darkMode ? "text-amber-400" : "text-amber-600"}`} />
                        </div>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{l.mockupLessonPDF}</span>
                      </div>

                      {/* Quiz card */}
                      <div className={`rounded-xl p-3 flex items-center gap-3 border transition-all ${darkMode ? "bg-white/3 border-white/5" : "bg-slate-50/80 border-slate-100"}`}>
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${darkMode ? "bg-emerald-500/10" : "bg-emerald-50"}`}>
                          <HelpCircle className={`w-4 h-4 ${darkMode ? "text-emerald-400" : "text-emerald-600"}`} />
                        </div>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{l.mockupQuiz}</span>
                      </div>

                      {/* Progress */}
                      <div className="pt-1">
                        <div className={`flex justify-between text-[10px] mb-1.5 ${darkMode ? "text-slate-500" : "text-slate-600"}`}>
                          <span>{l.mockupProgress}</span>
                          <span>72%</span>
                        </div>
                        <div className={`h-1.5 rounded-full overflow-hidden ${darkMode ? "bg-white/5" : "bg-slate-100"}`}>
                          <motion.div
                            className="h-full bg-gradient-to-r from-amber-500 to-purple-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: "72%" }}
                            transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Teacher floating glass card */}
              <motion.div
                className="absolute -bottom-6 -left-6 sm:-bottom-8 sm:-left-8 z-20"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
                whileHover={{ scale: 1.05, y: -4 }}
              >
                <div className={`relative p-1.5 rounded-full ${
                  darkMode
                    ? ""
                    : "bg-white/80 backdrop-blur-xl shadow-[0_2px_8px_rgba(15,23,42,0.08),0_8px_24px_rgba(15,23,42,0.06)]"
                }`}>
                  <div className={`absolute -inset-2 rounded-full blur-xl animate-glow-pulse ${darkMode ? "bg-gradient-to-tr from-amber-500/40 to-purple-500/40" : "bg-gradient-to-tr from-amber-400/20 to-purple-400/20"}`} />
                  <div className={`relative w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 shadow-xl ${darkMode ? "border-amber-400/60" : "border-amber-400/40"}`}>
                    <img
                      src="/teacher-ali.png"
                      alt={l.teacherName}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-[9px] sm:text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-lg">
                    {l.teacherRole}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURES SECTION ═══════════════ */}
      <section className="relative z-10 py-28 sm:py-36">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-black tracking-tight">
              {l.featuresTitle}
            </motion.h2>
            <motion.p variants={fadeInUp} className={`mt-5 max-w-lg mx-auto text-sm sm:text-base ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
              {l.featuresSubtitle}
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-7"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            {l.features.map((feat: any, idx: number) => {
              const icons = [Video, HelpCircle, FileText];
              const glowColors = darkMode
                ? [
                    "from-purple-500/25 to-purple-500/0",
                    "from-emerald-500/25 to-emerald-500/0",
                    "from-amber-500/25 to-amber-500/0",
                  ]
                : [
                    "from-purple-400/15 to-purple-400/0",
                    "from-emerald-400/15 to-emerald-400/0",
                    "from-amber-400/15 to-amber-400/0",
                  ];
              const iconBgLight = [
                "bg-purple-50 text-purple-600 border border-purple-200/60 group-hover:bg-purple-100 group-hover:text-purple-700 transition-all duration-300",
                "bg-emerald-50 text-emerald-600 border border-emerald-200/60 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-all duration-300",
                "bg-amber-50 text-amber-600 border border-amber-200/60 group-hover:bg-amber-100 group-hover:text-amber-700 transition-all duration-300",
              ];
              const iconBgDark = [
                "bg-purple-500/15 text-purple-400 border border-purple-500/20 group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-all duration-300",
                "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20 group-hover:text-emerald-300 transition-all duration-300",
                "bg-amber-500/15 text-amber-400 border border-amber-500/20 group-hover:bg-amber-500/20 group-hover:text-amber-300 transition-all duration-300",
              ];
              const iconBg = darkMode ? iconBgDark : iconBgLight;
              const hoverBorderColors = [
                "hover:border-purple-300/50 dark:hover:border-purple-500/30",
                "hover:border-emerald-300/50 dark:hover:border-emerald-500/30",
                "hover:border-amber-300/50 dark:hover:border-amber-500/30",
              ];
              const Icon = icons[idx];

              return (
                <motion.div
                  key={idx}
                  variants={fadeInUp}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`glass-card glow-hover rounded-3xl p-9 group cursor-default flex flex-col items-center text-center ${hoverBorderColors[idx]}`}
                >
                  <div className="relative mb-7 flex justify-center">
                    <div className={`absolute -inset-4 bg-gradient-to-br ${glowColors[idx]} rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    <div className={`relative w-16 h-16 rounded-2xl ${iconBg[idx]} flex items-center justify-center shadow-sm`}>
                      <Icon className="w-7 h-7" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-slate-100">{feat.title}</h3>
                  <p className={`text-sm leading-relaxed max-w-xs ${darkMode ? "text-slate-400" : "text-slate-600"}`}>{feat.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>


      {/* ═══════════════ POPULAR UNITS SECTION ═══════════════ */}
      <section id="units-section" className="relative z-10 py-28 sm:py-36">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-black tracking-tight">
              {l.unitsTitle}
            </motion.h2>
            <motion.p variants={fadeInUp} className={`mt-5 max-w-lg mx-auto text-sm sm:text-base ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
              {l.unitsSubtitle}
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            {l.units.map((unit: any, idx: number) => {
              const Icon = unitIcons[idx % unitIcons.length];
              const cardGradients = darkMode
                ? [
                    "from-amber-500/5 to-transparent hover:from-amber-500/10",
                    "from-purple-500/5 to-transparent hover:from-purple-500/10",
                    "from-blue-500/5 to-transparent hover:from-blue-500/10",
                    "from-emerald-500/5 to-transparent hover:from-emerald-500/10",
                    "from-rose-500/5 to-transparent hover:from-rose-500/10",
                    "from-cyan-500/5 to-transparent hover:from-cyan-500/10",
                  ]
                : [
                    "from-amber-50/80 to-transparent hover:from-amber-50",
                    "from-purple-50/80 to-transparent hover:from-purple-50",
                    "from-blue-50/80 to-transparent hover:from-blue-50",
                    "from-emerald-50/80 to-transparent hover:from-emerald-50",
                    "from-rose-50/80 to-transparent hover:from-rose-50",
                    "from-cyan-50/80 to-transparent hover:from-cyan-50",
                  ];
              const iconBgColors = darkMode
                ? [
                    "bg-amber-500/15 text-amber-400 border-amber-500/20",
                    "bg-purple-500/15 text-purple-400 border-purple-500/20",
                    "bg-blue-500/15 text-blue-400 border-blue-500/20",
                    "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
                    "bg-rose-500/15 text-rose-400 border-rose-500/20",
                    "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
                  ]
                : [
                    "bg-amber-50 text-amber-600 border-amber-200/60",
                    "bg-purple-50 text-purple-600 border-purple-200/60",
                    "bg-blue-50 text-blue-600 border-blue-200/60",
                    "bg-emerald-50 text-emerald-600 border-emerald-200/60",
                    "bg-rose-50 text-rose-600 border-rose-200/60",
                    "bg-cyan-50 text-cyan-600 border-cyan-200/60",
                  ];
              const hoverBorders = [
                "hover:border-amber-300/50 dark:hover:border-amber-500/30",
                "hover:border-purple-300/50 dark:hover:border-purple-500/30",
                "hover:border-blue-300/50 dark:hover:border-blue-500/30",
                "hover:border-emerald-300/50 dark:hover:border-emerald-500/30",
                "hover:border-rose-300/50 dark:hover:border-rose-500/30",
                "hover:border-cyan-300/50 dark:hover:border-cyan-500/30",
              ];
              return (
                <motion.div
                  key={idx}
                  variants={fadeInUp}
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`relative rounded-3xl bg-gradient-to-br ${cardGradients[idx]} glass-card p-6 flex items-center gap-4 cursor-pointer group transition-all duration-300 ${hoverBorders[idx]}`}
                  onClick={() => navigate("/login")}
                >
                  <div className={`w-13 h-13 rounded-2xl ${iconBgColors[idx]} border flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110`}>
                    <Icon className="w-5.5 h-5.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{unit.title}</h4>
                    <p className={`text-xs mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>{unit.subtitle}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-3 py-1.5 rounded-xl shrink-0 border ${
                    darkMode
                      ? "text-slate-400 bg-slate-800/80 border-slate-700/50"
                      : "text-slate-600 bg-slate-100 border-slate-200/80"
                  }`}>
                    {unit.lessons} {lang === "ar" ? "درس" : "lessons"}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>


      {/* ═══════════════ CTA SECTION ═══════════════ */}
      <section className="relative z-10 py-28 sm:py-36">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <div className="relative overflow-hidden rounded-3xl">
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${darkMode ? "from-amber-500/10 via-purple-500/10 to-slate-950" : "from-amber-50/80 via-purple-50/50 to-white"}`} />
              <div className={`absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px] ${darkMode ? "bg-amber-500/10" : "bg-amber-200/20"}`} />
              <div className={`absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full blur-[80px] ${darkMode ? "bg-purple-500/10" : "bg-purple-200/20"}`} />

              <div className="relative glass-card border-0 rounded-3xl p-12 sm:p-16 text-center space-y-6">
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                  {l.ctaTitle}
                </h2>
                <p className={`max-w-md mx-auto text-sm sm:text-base ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                  {l.ctaSubtitle}
                </p>
                <div className="pt-5">
                  <button
                    onClick={() => navigate("/login")}
                    className={`group px-10 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 inline-flex items-center gap-2 ${
                      darkMode
                        ? "shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
                        : "shadow-[0_2px_8px_rgba(245,158,11,0.25),0_8px_24px_rgba(245,158,11,0.15)] hover:shadow-[0_4px_12px_rgba(245,158,11,0.3),0_12px_32px_rgba(245,158,11,0.2)]"
                    }`}
                  >
                    {l.ctaBtn}
                    {dir === "rtl" ? (
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    ) : (
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className={`relative z-10 border-t ${darkMode ? "border-slate-900" : "border-slate-200/60"}`}>
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Logo & Desc */}
            <div className="space-y-4 lg:col-span-1">
              <h2 className={`text-xl font-black text-transparent bg-clip-text bg-gradient-to-r ${darkMode ? "from-amber-400 to-purple-400" : "from-amber-500 to-purple-500"}`}>
                SENIOR
              </h2>
              <p className={`text-xs leading-relaxed ${darkMode ? "text-slate-500" : "text-slate-600"}`}>
                {l.footerDesc}
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200">{l.footerLinks}</h4>
              <div className="space-y-2.5">
                {[l.footerHome, l.footerAbout, l.footerUnits, l.footerLogin].map((link: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => navigate(i === 3 ? "/login" : "/")}
                    className={`block text-xs transition-colors ${darkMode ? "text-slate-500 hover:text-slate-300" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    {link}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200">{l.footerContact}</h4>
              <div className={`space-y-2.5 text-xs ${darkMode ? "text-slate-500" : "text-slate-600"}`}>
                <p>senior.platform@email.com</p>
                <p>01223698064</p>
              </div>
            </div>

            {/* Social */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200">
                {lang === "ar" ? "تابعنا" : "Follow Us"}
              </h4>
              <div className="flex gap-3">
                {["Facebook", "YouTube", "WhatsApp"].map((social) => (
                  <span
                    key={social}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-bold transition-all duration-200 cursor-pointer ${
                      darkMode
                        ? "bg-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/10"
                        : "bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300"
                    }`}
                  >
                    {social.charAt(0)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className={`mt-12 pt-6 border-t text-center ${darkMode ? "border-slate-900" : "border-slate-200/80"}`}>
            <p className={`text-[11px] ${darkMode ? "text-slate-600" : "text-slate-500"}`}>{l.footerRights}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
