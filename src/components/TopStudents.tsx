"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Trophy, Star, Crown, Medal, Sparkles } from "lucide-react";

interface TopStudent {
  id: string;
  rank: number;
  student_name: string;
  stage: string;
  description: string;
  image_url: string;
  created_at: string;
}

export default function TopStudents() {
  const [students, setStudents] = useState<TopStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTopStudents();
  }, []);

  const fetchTopStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("top_students")
        .select("*")
        .order("rank", { ascending: true })
        .limit(10);

      if (error) throw error;
      setStudents(data || []);
    } catch (err) {
      console.error("Error fetching top students:", err);
      setError("فشل في تحميل قائمة الأوائل");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || students.length === 0) {
    return null; // Don't show anything if no students or error
  }

  // Get rank styling
  const getRankStyle = (rank: number) => {
    if (rank === 1) {
      return {
        border: "border-yellow-500/50",
        bg: "bg-gradient-to-br from-yellow-500/20 to-amber-500/20",
        shadow: "shadow-yellow-500/20",
        badge: "bg-gradient-to-r from-yellow-500 to-amber-500",
        badgeText: "text-yellow-400",
        icon: <Crown className="w-5 h-5 text-yellow-400" />,
        title: "🥇 الذهبي",
      };
    }
    if (rank === 2) {
      return {
        border: "border-gray-400/50",
        bg: "bg-gradient-to-br from-gray-400/20 to-gray-500/20",
        shadow: "shadow-gray-400/20",
        badge: "bg-gradient-to-r from-gray-400 to-gray-500",
        badgeText: "text-gray-400",
        icon: <Medal className="w-5 h-5 text-gray-400" />,
        title: "🥈 الفضي",
      };
    }
    if (rank === 3) {
      return {
        border: "border-amber-600/50",
        bg: "bg-gradient-to-br from-amber-600/20 to-orange-600/20",
        shadow: "shadow-amber-600/20",
        badge: "bg-gradient-to-r from-amber-600 to-orange-600",
        badgeText: "text-amber-500",
        icon: <Medal className="w-5 h-5 text-amber-500" />,
        title: "🥉 البرونزي",
      };
    }
    return {
      border: "border-purple-500/30",
      bg: "bg-purple-500/10",
      shadow: "shadow-purple-500/10",
      badge: "bg-gradient-to-r from-purple-500 to-purple-600",
      badgeText: "text-purple-400",
      icon: <Star className="w-5 h-5 text-purple-400" />,
      title: `#${rank} المميز`,
    };
  };

  return (
    <section className="py-16 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-amber-500/20 mb-4">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-amber-500">أوائل الشهر</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-purple-400">
            طلابنا المتميزون
          </h2>
          <p className="text-slate-400 mt-3 max-w-2xl mx-auto">
            نفتخر بطلابنا المتميزين الذين حققوا أعلى النتائج هذا الشهر
          </p>
        </div>

        {/* Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {students.map((student) => {
            const style = getRankStyle(student.rank);
            const isTop3 = student.rank <= 3;

            return (
              <Card
                key={student.id}
                className={`group relative overflow-hidden rounded-3xl border transition-all duration-500 hover:scale-105 hover:shadow-2xl ${style.border} ${style.bg} ${style.shadow}`}
                style={
                  isTop3
                    ? {
                        boxShadow: `0 0 40px ${
                          student.rank === 1
                            ? "rgba(234, 179, 8, 0.15)"
                            : student.rank === 2
                            ? "rgba(156, 163, 175, 0.15)"
                            : "rgba(217, 119, 6, 0.15)"
                        }`,
                      }
                    : {}
                }
              >
                {/* Rank Badge */}
                <div
                  className={`absolute top-4 right-4 px-3 py-1.5 rounded-xl text-xs font-black text-white ${style.badge} shadow-lg`}
                >
                  {style.title}
                </div>

                {/* Image */}
                <div className="relative h-48 w-full overflow-hidden rounded-t-3xl">
                  {student.image_url ? (
                    <img
                      src={student.image_url}
                      alt={student.student_name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-amber-500/20 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center">
                        <span className="text-4xl font-black text-slate-400">
                          {student.student_name.charAt(0)}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {/* Rank Icon */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/10">
                      {style.icon}
                    </div>
                    <span className="text-sm font-bold text-white drop-shadow-lg">
                      #{student.rank}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-black text-lg text-slate-900 dark:text-slate-100 group-hover:text-amber-400 transition-colors">
                      {student.student_name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      {student.stage}
                    </p>
                  </div>

                  {student.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-300 dark:border-slate-800/60 pt-3">
                      {student.description}
                    </p>
                  )}

                  {/* Decorative line for top 3 */}
                  {isTop3 && (
                    <div className="flex items-center gap-2 pt-2">
                      <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
                    </div>
                  )}
                </div>

                {/* Glow effect for top 1 */}
                {student.rank === 1 && (
                  <div className="absolute inset-0 pointer-events-none rounded-3xl">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
