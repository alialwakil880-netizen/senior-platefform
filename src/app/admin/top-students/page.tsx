"use client";

import React, { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  LayoutDashboard,
  Users,
  Trophy,
  Crown,
  Medal,
  Star,
  Plus,
  Trash2,
  Edit3,
  X,
  Upload,
  ArrowUp,
  ArrowDown,
  LogOut,
  Sun,
  Moon,
  Globe,
  Image as ImageIcon,
  User,
  GraduationCap,
  FileText,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import Link from "next/link";
import Image from "next/image";

interface TopStudent {
  id: string;
  rank: number;
  student_name: string;
  stage: string;
  description: string;
  image_url: string;
  created_at: string;
}

export default function TopStudentsAdminPage() {
  const { lang, toggleLanguage, t, dir } = useLanguage();
  const [darkMode, setDarkMode] = useState(true);
  const [students, setStudents] = useState<TopStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    rank: 1,
    student_name: "",
    stage: "",
    description: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Theme
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

  // Auth check
  useEffect(() => {
    const status = localStorage.getItem("admin_logged_in");
    setIsAdminLoggedIn(status === "true");
    setIsCheckingAuth(false);
  }, []);

  // Fetch top students
  const fetchTopStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("top_students")
        .select("*")
        .order("rank", { ascending: true });

      if (error) throw error;
      setStudents(data || []);
    } catch (err) {
      console.error("Error fetching top students:", err);
      setError("فشل في تحميل قائمة الأوائل");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchTopStudents();
    }
  }, [isAdminLoggedIn]);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setUploading(true);

    try {
      let imageUrl = "";

      // Upload image if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `top-students/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("top-students")
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("top-students")
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      } else if (editingId) {
        // Keep existing image if editing and no new file
        const existing = students.find(s => s.id === editingId);
        if (existing) imageUrl = existing.image_url;
      }

      // Check if rank already exists
      const existingRank = students.find(s => s.rank === formData.rank && s.id !== editingId);

      if (existingRank && !editingId) {
        setError(`المركز رقم ${formData.rank} موجود بالفعل للطالب "${existingRank.student_name}"`);
        setUploading(false);
        return;
      }

      if (editingId) {
        // Update
        const { error: updateError } = await supabase
          .from("top_students")
          .update({
            rank: formData.rank,
            student_name: formData.student_name,
            stage: formData.stage,
            description: formData.description,
            image_url: imageUrl,
          })
          .eq("id", editingId);

        if (updateError) throw updateError;
        setSuccess("تم تحديث بيانات الطالب بنجاح");
      } else {
        // Insert
        const { error: insertError } = await supabase
          .from("top_students")
          .insert({
            rank: formData.rank,
            student_name: formData.student_name,
            stage: formData.stage,
            description: formData.description,
            image_url: imageUrl,
          });

        if (insertError) throw insertError;
        setSuccess("تم إضافة الطالب إلى قائمة الأوائل بنجاح");
      }

      // Reset form
      resetForm();
      fetchTopStudents();
    } catch (err: any) {
      console.error("Error saving top student:", err);
      setError(err.message || "حدث خطأ أثناء حفظ البيانات");
    } finally {
      setUploading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${name}" من قائمة الأوائل؟`)) return;

    try {
      const { error } = await supabase
        .from("top_students")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setSuccess(`تم حذف "${name}" بنجاح`);
      fetchTopStudents();
    } catch (err: any) {
      console.error("Error deleting top student:", err);
      setError(err.message || "حدث خطأ أثناء الحذف");
    }
  };

  // Reset form
  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      rank: 1,
      student_name: "",
      stage: "",
      description: "",
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setError("");
    setSuccess("");
  };

  // Edit student
  const handleEdit = (student: TopStudent) => {
    setEditingId(student.id);
    setFormData({
      rank: student.rank,
      student_name: student.student_name,
      stage: student.stage,
      description: student.description || "",
    });
    setPreviewUrl(student.image_url);
    setShowForm(true);
  };

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  // Get rank emoji
  const getRankEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  // Get rank color
  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-400";
    if (rank === 2) return "text-gray-400";
    if (rank === 3) return "text-amber-600";
    return "text-purple-400";
  };

  // Logout
  const handleLogout = () => {
    if (confirm("هل أنت متأكد من رغبتك في تسجيل الخروج؟")) {
      localStorage.removeItem("admin_logged_in");
      window.location.href = "/";
    }
  };

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

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <Card className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-8 rounded-3xl shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mx-auto text-purple-400">
            <Trophy className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-amber-400">
              إدارة الأوائل
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              يجب تسجيل الدخول للوصول إلى هذه الصفحة
            </p>
          </div>
          <Link href="/admin">
            <Button className="w-full bg-gradient-to-r from-purple-500 to-amber-500 text-slate-950 font-black py-6 rounded-xl">
              العودة إلى لوحة التحكم
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={
        darkMode
          ? "min-h-screen bg-slate-950 text-slate-100 pb-20 transition-colors duration-300 font-sans"
          : "min-h-screen bg-slate-50 text-slate-900 pb-20 transition-colors duration-300 font-sans"
      }
      dir={dir}
    >
      {/* Header */}
      <header
        className={
          darkMode
            ? "bg-slate-950/80 backdrop-blur-xl border-b border-slate-900/80 sticky top-0 z-50 shadow-sm"
            : "bg-white/80 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-50 shadow-xs"
        }
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-400 to-purple-400 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-purple-400">
                إدارة الأوائل
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">Top Students Management</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              href="/admin"
              className="px-3.5 py-2 bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 text-purple-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">لوحة التحكم</span>
            </Link>

            <button
              onClick={toggleLanguage}
              className={
                darkMode
                  ? "px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 hover:bg-slate-800 transition-all text-xs font-bold flex items-center gap-1.5"
                  : "px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all shadow-xs text-xs font-bold flex items-center gap-1.5"
              }
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t.common.langBtn}</span>
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={
                darkMode
                  ? "p-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 hover:bg-slate-800 transition-all"
                  : "p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all shadow-xs"
              }
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t.common.logout}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-6">
        {/* Success/Error messages */}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl flex items-center gap-2 text-sm font-bold">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{success}</span>
            <button onClick={() => setSuccess("")} className="mr-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl flex items-center gap-2 text-sm font-bold">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError("")} className="mr-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header Actions */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-purple-400">
              🏆 أوائل الشهر
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              إدارة قائمة الطلاب المتميزين
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-slate-950 font-black px-6 py-2.5 rounded-xl text-sm shadow-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة طالب</span>
          </Button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <Card
              className={
                darkMode
                  ? "max-w-lg w-full bg-slate-900 border-slate-800 p-6 rounded-3xl shadow-2xl my-auto"
                  : "max-w-lg w-full bg-white border-slate-200 p-6 rounded-3xl shadow-xl my-auto"
              }
            >
              <div className="flex justify-between items-center border-b border-slate-300 dark:border-slate-800/80 pb-4">
                <h4 className="font-black text-amber-400 text-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  <span>{editingId ? "تعديل بيانات الطالب" : "إضافة طالب جديد"}</span>
                </h4>
                <button
                  onClick={resetForm}
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <label className="text-xs font-bold block mb-1.5 text-slate-700 dark:text-slate-300">
                    المركز (1-10)
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={formData.rank}
                    onChange={(e) =>
                      setFormData({ ...formData, rank: parseInt(e.target.value) || 1 })
                    }
                    className="bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-xs font-bold h-11"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1.5 text-slate-700 dark:text-slate-300">
                    اسم الطالب
                  </label>
                  <Input
                    type="text"
                    value={formData.student_name}
                    onChange={(e) =>
                      setFormData({ ...formData, student_name: e.target.value })
                    }
                    placeholder="أدخل اسم الطالب..."
                    className="bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-xs font-bold h-11"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1.5 text-slate-700 dark:text-slate-300">
                    المرحلة الدراسية
                  </label>
                  <select
                    value={formData.stage}
                    onChange={(e) =>
                      setFormData({ ...formData, stage: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 h-11 text-xs font-bold text-slate-900 dark:text-slate-200 outline-none focus:border-purple-500"
                    required
                  >
                    <option value="">اختر المرحلة</option>
                    <option value="الصف الثالث الإعدادي">الصف الثالث الإعدادي</option>
                    <option value="الصف الأول الثانوي">الصف الأول الثانوي</option>
                    <option value="الصف الثاني الثانوي">الصف الثاني الثانوي</option>
                    <option value="الصف الثالث الثانوي">الصف الثالث الثانوي</option>
                    <option value="مرحلة البكالوريا">مرحلة البكالوريا</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1.5 text-slate-700 dark:text-slate-300">
                    وصف قصير (اختياري)
                  </label>
                  <Input
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="مثال: حاصل على 100% في اختبار الشهر..."
                    className="bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-xs font-bold h-11"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1.5 text-slate-700 dark:text-slate-300">
                    صورة الطالب
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block w-full text-xs text-slate-600 dark:text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-500/10 file:text-purple-400 hover:file:bg-purple-500/20"
                      />
                    </div>
                    {previewUrl && (
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-800 shrink-0">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    disabled={uploading}
                    className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-slate-950 font-black py-5 flex-1 rounded-xl text-xs"
                  >
                    {uploading ? (
                      <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : editingId ? (
                      "تحديث البيانات"
                    ) : (
                      "إضافة الطالب"
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={resetForm}
                    variant="outline"
                    className="rounded-xl px-5 text-xs font-bold"
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Students List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : students.length === 0 ? (
          <Card
            className={
              darkMode
                ? "p-16 glass-card text-center rounded-3xl bg-slate-900/40 border-slate-800/80"
                : "p-16 glass-card text-center rounded-3xl bg-white border-slate-200"
            }
          >
            <Trophy className="w-16 h-16 mx-auto text-slate-600 opacity-60" />
            <h3 className="text-xl font-bold text-slate-600 dark:text-slate-400 mt-4">
              لا يوجد طلاب في قائمة الأوائل
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
              أضف أول طالب متميز باستخدام زر "إضافة طالب"
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {students.map((student) => {
              const isGold = student.rank === 1;
              const isSilver = student.rank === 2;
              const isBronze = student.rank === 3;

              let cardStyle = {};
              if (isGold) {
                cardStyle = darkMode
                  ? "bg-gradient-to-br from-yellow-600/20 to-amber-700/20 border-yellow-500/50 shadow-yellow-500/20"
                  : "bg-gradient-to-br from-yellow-100 to-amber-100 border-yellow-400 shadow-yellow-200/50";
              } else if (isSilver) {
                cardStyle = darkMode
                  ? "bg-gradient-to-br from-gray-600/20 to-gray-700/20 border-gray-400/50 shadow-gray-400/20"
                  : "bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300 shadow-gray-200/50";
              } else if (isBronze) {
                cardStyle = darkMode
                  ? "bg-gradient-to-br from-amber-700/20 to-orange-800/20 border-amber-600/50 shadow-amber-600/20"
                  : "bg-gradient-to-br from-amber-100 to-orange-100 border-amber-400 shadow-amber-200/50";
              } else {
                cardStyle = darkMode
                  ? "bg-slate-900/60 border-slate-800/80 hover:border-purple-500/50"
                  : "bg-white border-slate-200 hover:border-purple-300";
              }

              return (
                <Card
                  key={student.id}
                  className={`p-5 rounded-3xl border transition-all duration-300 hover:shadow-xl ${
                    Object.values(cardStyle).join(" ")
                  }`}
                  style={
                    isGold
                      ? { boxShadow: "0 0 30px rgba(234, 179, 8, 0.1)" }
                      : isSilver
                      ? { boxShadow: "0 0 20px rgba(156, 163, 175, 0.1)" }
                      : {}
                  }
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg ${
                          isGold
                            ? "bg-yellow-500/20 text-yellow-400"
                            : isSilver
                            ? "bg-gray-500/20 text-gray-400"
                            : isBronze
                            ? "bg-amber-600/20 text-amber-500"
                            : "bg-purple-500/20 text-purple-400"
                        }`}
                      >
                        {getRankEmoji(student.rank)}
                      </div>
                      <div>
                        <h4 className="font-black text-base text-slate-900 dark:text-slate-100">
                          {student.student_name}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          {student.stage}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(student)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs text-slate-600 dark:text-slate-300 transition-colors"
                        title="تعديل"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id, student.student_name)}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {student.image_url && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-800 h-32 relative">
                      <img
                        src={student.image_url}
                        alt={student.student_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {student.description && (
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {student.description}
                    </p>
                  )}

                  <div className="mt-3 pt-3 border-t border-slate-300 dark:border-slate-800/80 flex justify-between items-center text-xs text-slate-500 dark:text-slate-500">
                    <span>🏆 المركز #{student.rank}</span>
                    <span>
                      {new Date(student.created_at).toLocaleDateString("ar-EG")}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
