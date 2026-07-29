"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  StageCurriculum,
  CourseUnit,
  LectureItem,
  QuizQuestion,
  LectureMaterial,
  getCurriculum,
  saveCurriculum,
  extractYouTubeId,
  validateYouTubeUrl,
} from "@/lib/curriculum";
import {
  LayoutDashboard,
  Users,
  FolderPlus,
  Video,
  FileText,
  HelpCircle,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  Save,
  Plus,
  LogOut,
  Sun,
  Moon,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ShieldCheck,
  FolderOpen,
  Sparkles,
  X,
  PlusCircle,
  GraduationCap,
  Award,
  BarChart3,
  Clock,
  Globe,
  Eye,
  EyeOff,
  Trophy,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface QuizScoreRecord {
  id: string;
  quizTitle: string;
  lectureTitle: string;
  score: number;
  totalPoints: number;
  percentage: number;
  status: "ممتاز" | "ناجح" | "يحتاج مراجعة" | "غير مجتاز";
  completedAt: string;
}

interface StudentRecord {
  id?: string;
  fullName?: string;
  name?: string;
  studentPhone?: string;
  phone?: string;
  stageId?: string;
  stage?: string;
  progress?: number;
  lastQuiz?: string;
  password?: string;
  quizScores?: QuizScoreRecord[];
  watchedCount?: number;
}

export default function AdminPage() {
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
  const [activeTab, setActiveTab] = useState<"content" | "students" | "settings">("content");
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>("all");
  const [selectedStudentStats, setSelectedStudentStats] = useState<StudentRecord | null>(null);

  // شروط وحماية دخول المدرس / الإدارة
  const [isCheckingAdminAuth, setIsCheckingAdminAuth] = useState<boolean>(true);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [adminLoginPhone, setAdminLoginPhone] = useState<string>("");
  const [adminLoginPassword, setAdminLoginPassword] = useState<string>("");
  const [showAdminPassword, setShowAdminPassword] = useState<boolean>(false);
  const [loginErr, setLoginErr] = useState<string>("");

  const [adminOldPass, setAdminOldPass] = useState<string>("");
  const [adminNewPass, setAdminNewPass] = useState<string>("");
  const [adminConfirmPass, setAdminConfirmPass] = useState<string>("");
  const [passMessage, setPassMessage] = useState({ type: "", text: "" });

  const [showAdminOldPass, setShowAdminOldPass] = useState<boolean>(false);
  const [showAdminNewPass, setShowAdminNewPass] = useState<boolean>(false);
  const [showAdminConfirmPass, setShowAdminConfirmPass] = useState<boolean>(false);

  useEffect(() => {
    const status = localStorage.getItem("admin_logged_in");
    if (status === "true") {
      setIsAdminLoggedIn(true);
    } else {
      setIsAdminLoggedIn(false);
    }
    setIsCheckingAdminAuth(false);
  }, []);

  // نظام إدارة المناهج الديناميكي الشامل (Units & Lectures & Content)
  const [curriculum, setCurriculum] = useState<StageCurriculum>({});
  const [contentStage, setContentStage] = useState<string>("sec3");
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);

  // حالة إضافة وحدة جديدة
  const [newUnitTitle, setNewUnitTitle] = useState("");
  const [newUnitDesc, setNewUnitDesc] = useState("");
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);

  // حالة إضافة محاضرة جديدة
  const [newLectureTitle, setNewLectureTitle] = useState("");
  const [newLectureDesc, setNewLectureDesc] = useState("");
  const [showAddLectureModal, setShowAddLectureModal] = useState(false);

  // المحاضرة قيد التحرير الفعلي (Lecture Editor State)
  const [editingLecture, setEditingLecture] = useState<LectureItem | null>(null);
  const [newPdfName, setNewPdfName] = useState("");
  const [newPdfUrl, setNewPdfUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // حالة إضافة سؤال MCQ جديد في المحاضرة
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [qText, setQText] = useState("");
  const [qChoice0, setQChoice0] = useState("");
  const [qChoice1, setQChoice1] = useState("");
  const [qChoice2, setQChoice2] = useState("");
  const [qChoice3, setQChoice3] = useState("");
  const [qCorrectIndex, setQCorrectIndex] = useState(0);
  const [qPoints, setQPoints] = useState(10);

  // الطلاب
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);

  // جلب المنهج من التخزين وقت التحميل
  useEffect(() => {
    const loadCurriculum = async () => {
      const data = await getCurriculum();
      setCurriculum(data);
      if (data[contentStage] && data[contentStage].length > 0 && !activeUnitId) {
        setActiveUnitId(data[contentStage][0].id);
      }
    };

    loadCurriculum();

    window.addEventListener("curriculum_updated", loadCurriculum);

    return () => {
      window.removeEventListener("curriculum_updated", loadCurriculum);
    };
  }, []);

  // عند تغيير المرحلة التعليمية اختر أول وحدة
  useEffect(() => {
    if (curriculum[contentStage] && curriculum[contentStage].length > 0) {
      setActiveUnitId(curriculum[contentStage][0].id);
    } else {
      setActiveUnitId(null);
    }
    setEditingLecture(null);
  }, [contentStage, curriculum]);

  // جلب الطلاب
  useEffect(() => {
    const fetchStudents = async () => {
      if (!isSupabaseConfigured()) {
        const localStudentsStr = localStorage.getItem("local_students_db") || "[]";
        try {
          const localStudents: StudentRecord[] = JSON.parse(localStudentsStr);
          setStudents(
            localStudents.length > 0
              ? localStudents
              : [
                  {
                    id: "demo-1",
                    fullName: "أحمد محمد علي (طالب تجريبي)",
                    studentPhone: "01012345678",
                    stageId: "sec3",
                    progress: 85,
                    lastQuiz: "المحاضرة الأولى: قواعد الأزمنة (18/20)",
                    password: "password123",
                    watchedCount: 4,
                    quizScores: [
                      {
                        id: "qs-101",
                        quizTitle: "اختبار قواعد الأزمنة والتراكيب",
                        lectureTitle: "المحاضرة الأولى: قواعد الأزمنة (Present & Past)",
                        score: 18,
                        totalPoints: 20,
                        percentage: 90,
                        status: "ممتاز",
                        completedAt: "10 يوليو 2026 - 08:30 م",
                      },
                      {
                        id: "qs-102",
                        quizTitle: "اختبار المفردات والترجمة اللغوية",
                        lectureTitle: "المحاضرة الثانية: مفردات الوحدة الأولى (Vocabulary)",
                        score: 15,
                        totalPoints: 20,
                        percentage: 75,
                        status: "ناجح",
                        completedAt: "09 يوليو 2026 - 06:15 م",
                      },
                      {
                        id: "qs-103",
                        quizTitle: "كويز القطعة السريعة (Reading Comprehension)",
                        lectureTitle: "المحاضرة الثالثة: القراءة المتقدمة والاستنتاج",
                        score: 20,
                        totalPoints: 20,
                        percentage: 100,
                        status: "ممتاز",
                        completedAt: "08 يوليو 2026 - 04:00 م",
                      },
                    ],
                  },
                ]
          );
        } catch (e) {
          console.error("Local parse error:", e);
        }
        return;
      }

      setLoadingStudents(true);
      try {
        const { data: studentsList, error }: any = await Promise.race([
          Promise.resolve(supabase.from("students").select("*")),
          new Promise<any>((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 4500)
          ),
        ]);

        if (error && error.code !== "42P01") {
          console.error("خطأ في جلب بيانات الطلاب من Supabase:", error);
        } else if (studentsList) {
          setStudents(studentsList as StudentRecord[]);
        }
      } catch (error) {
        console.error("خطأ في جلب بيانات الطلاب (أو انتهت المهلة):", error);
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, []);

  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    if (confirm("هل أنت متأكد من رغبتك في تسجيل الخروج من لوحة التحكم؟")) {
      localStorage.removeItem("admin_logged_in");
      window.location.href = "/";
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

  const handleResetPassword = async (student: StudentRecord) => {
    const displayName = student.fullName || student.name || "الطالب";
    const studentPhone = student.studentPhone || student.phone;
    const newPass = prompt(`أدخل كلمة المرور الجديدة للطالب (${displayName}):`, "123456");

    if (!newPass) return;

    if (isSupabaseConfigured() && studentPhone) {
      try {
        const { error } = await supabase
          .from("students")
          .update({ password: newPass })
          .eq("studentPhone", studentPhone);

        if (error && error.code !== "42P01") {
          console.error("Error updating password in Supabase:", error);
        }
      } catch (err) {
        console.error("Failed to reset password:", err);
      }
    }

    setStudents((prev) =>
      prev.map((s) =>
        (s.studentPhone || s.phone) === studentPhone ? { ...s, password: newPass } : s
      )
    );

    if (!isSupabaseConfigured()) {
      const localStudentsStr = localStorage.getItem("local_students_db") || "[]";
      const localStudents: any[] = JSON.parse(localStudentsStr);
      const updated = localStudents.map((s) =>
        s.studentPhone === studentPhone ? { ...s, password: newPass } : s
      );
      localStorage.setItem("local_students_db", JSON.stringify(updated));
    }

    alert(`تم تحديث كلمة المرور بنجاح للطالب ${displayName} لتصبح: ${newPass}`);
  };

  const handleDeleteStudent = async (student: StudentRecord) => {
    const displayName = student.fullName || student.name || "الطالب";
    const studentPhone = student.studentPhone || student.phone;
    
    if (!confirm(`هل أنت متأكد من رغبتك في حذف حساب الطالب (${displayName}) نهائياً؟`)) {
      return;
    }

    if (isSupabaseConfigured() && studentPhone) {
      try {
        const { error } = await supabase
          .from("students")
          .delete()
          .eq("studentPhone", studentPhone);

        if (error && error.code !== "42P01") {
          console.error("Error deleting student from Supabase:", error);
          alert("حدث خطأ أثناء مسح الطالب من قاعدة البيانات.");
          return;
        }
      } catch (err) {
        console.error("Failed to delete student:", err);
      }
    }

    setStudents((prev) => prev.filter((s) => (s.studentPhone || s.phone) !== studentPhone));

    if (!isSupabaseConfigured()) {
      const localStudentsStr = localStorage.getItem("local_students_db") || "[]";
      const localStudents: any[] = JSON.parse(localStudentsStr);
      const updated = localStudents.filter((s) => s.studentPhone !== studentPhone);
      localStorage.setItem("local_students_db", JSON.stringify(updated));
    }

    if (selectedStudentStats && (selectedStudentStats.studentPhone || selectedStudentStats.phone) === studentPhone) {
      setSelectedStudentStats(null);
    }

    alert(`تم مسح حساب الطالب ${displayName} بنجاح.`);
  };

  function getStageLabel(key: string) {
    const labels: Record<string, string> = {
      prep3: "الصف الثالث الإعدادي",
      sec1: "الصف الأول الثانوي",
      sec2: "الصف الثاني الثانوي",
      sec3: "الصف الثالث الثانوي",
      bac: "مرحلة البكالوريا",
    };
    return labels[key] || "مرحلة تعليمية";
  }

  // دوال التحكم في الوحدات (Units Management)
  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitTitle.trim()) return;
    const currentUnits = curriculum[contentStage] || [];
    const newUnit: CourseUnit = {
      id: `unit-${Date.now()}`,
      title: newUnitTitle.trim(),
      description: newUnitDesc.trim(),
      lectures: [],
      order: currentUnits.length + 1,
    };
    const updated = {
      ...curriculum,
      [contentStage]: [...currentUnits, newUnit],
    };
    setCurriculum(updated);
    await saveCurriculum(updated);
    setActiveUnitId(newUnit.id);
    setNewUnitTitle("");
    setNewUnitDesc("");
    setShowAddUnitModal(false);
  };

  const handleDeleteUnit = async (unitId: string, unitTitle: string) => {
    if (!confirm(`هل أنت متأكد من رغبتك في حذف الوحدة "${unitTitle}" وجميع المحاضرات التي بداخلها؟`)) return;
    const currentUnits = curriculum[contentStage] || [];
    const updatedUnits = currentUnits.filter((u) => u.id !== unitId);
    const updated = {
      ...curriculum,
      [contentStage]: updatedUnits,
    };
    setCurriculum(updated);
    await saveCurriculum(updated);
    if (activeUnitId === unitId) {
      setActiveUnitId(updatedUnits[0]?.id || null);
    }
    setEditingLecture(null);
  };

  const handleRenameUnit = async (unit: CourseUnit) => {
    const newTitle = prompt("أدخل الاسم الجديد للوحدة:", unit.title);
    if (!newTitle || !newTitle.trim()) return;
    const currentUnits = curriculum[contentStage] || [];
    const updatedUnits = currentUnits.map((u) =>
      u.id === unit.id ? { ...u, title: newTitle.trim() } : u
    );
    const updated = { ...curriculum, [contentStage]: updatedUnits };
    setCurriculum(updated);
    await saveCurriculum(updated);
  };

  const handleMoveUnitOrder = async (unitId: string, direction: "up" | "down") => {
    const currentUnits = [...(curriculum[contentStage] || [])];
    const index = currentUnits.findIndex((u) => u.id === unitId);
    if (index === -1) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === currentUnits.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const temp = currentUnits[index];
    currentUnits[index] = currentUnits[targetIndex];
    currentUnits[targetIndex] = temp;

    const updated = { ...curriculum, [contentStage]: currentUnits };
    setCurriculum(updated);
    await saveCurriculum(updated);
  };

  // دوال التحكم في المحاضرات (Lectures Management)
  const activeUnit = (curriculum[contentStage] || []).find((u) => u.id === activeUnitId);

  const handleAddLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLectureTitle.trim() || !activeUnit) return;
    const newLec: LectureItem = {
      id: `lec-${Date.now()}`,
      title: newLectureTitle.trim(),
      description: newLectureDesc.trim(),
      youtubeUrl: "",
      videoId: "",
      materials: [],
      quiz: {
        title: `اختبار ${newLectureTitle.trim()}`,
        questions: [],
      },
      isPublished: true,
      order: activeUnit.lectures.length + 1,
    };

    const updatedUnits = (curriculum[contentStage] || []).map((u) =>
      u.id === activeUnit.id ? { ...u, lectures: [...u.lectures, newLec] } : u
    );
    const updated = { ...curriculum, [contentStage]: updatedUnits };
    setCurriculum(updated);
    await saveCurriculum(updated);
    setEditingLecture(newLec);
    setNewLectureTitle("");
    setNewLectureDesc("");
    setShowAddLectureModal(false);
  };

  const handleDeleteLecture = async (lecId: string, lecTitle: string) => {
    if (!confirm(`هل أنت متأكد من حذف المحاضرة "${lecTitle}"؟`)) return;
    if (!activeUnit) return;
    const updatedLectures = activeUnit.lectures.filter((l) => l.id !== lecId);
    const updatedUnits = (curriculum[contentStage] || []).map((u) =>
      u.id === activeUnit.id ? { ...u, lectures: updatedLectures } : u
    );
    const updated = { ...curriculum, [contentStage]: updatedUnits };
    setCurriculum(updated);
    await saveCurriculum(updated);
    if (editingLecture?.id === lecId) setEditingLecture(null);
  };

  const handleMoveLectureToAnotherUnit = async (lec: LectureItem, targetUnitId: string) => {
    if (!activeUnit || targetUnitId === activeUnit.id) return;
    const sourceLectures = activeUnit.lectures.filter((l) => l.id !== lec.id);
    const updatedUnits = (curriculum[contentStage] || []).map((u) => {
      if (u.id === activeUnit.id) return { ...u, lectures: sourceLectures };
      if (u.id === targetUnitId) return { ...u, lectures: [...u.lectures, lec] };
      return u;
    });
    const updated = { ...curriculum, [contentStage]: updatedUnits };
    setCurriculum(updated);
    await saveCurriculum(updated);
    setEditingLecture(null);
    alert(`تم نقل المحاضرة "${lec.title}" إلى الوحدة المحددة بنجاح.`);
  };

  const handleMoveLectureOrder = async (lecId: string, direction: "up" | "down") => {
    if (!activeUnit) return;
    const currentLectures = [...activeUnit.lectures];
    const index = currentLectures.findIndex((l) => l.id === lecId);
    if (index === -1) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === currentLectures.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const temp = currentLectures[index];
    currentLectures[index] = currentLectures[targetIndex];
    currentLectures[targetIndex] = temp;

    const updatedUnits = (curriculum[contentStage] || []).map((u) =>
      u.id === activeUnit.id ? { ...u, lectures: currentLectures } : u
    );
    const updated = { ...curriculum, [contentStage]: updatedUnits };
    setCurriculum(updated);
    await saveCurriculum(updated);
  };

  // تحرير محتوى المحاضرة (Video / PDF / Quiz)
  const handleSaveLectureContent = async () => {
    if (!editingLecture || !activeUnit) return;

    const extractedId = extractYouTubeId(editingLecture.youtubeUrl) || "";
    const finalizedLecture: LectureItem = {
      ...editingLecture,
      videoId: extractedId,
    };

    const updatedLectures = activeUnit.lectures.map((l) =>
      l.id === finalizedLecture.id ? finalizedLecture : l
    );
    const updatedUnits = (curriculum[contentStage] || []).map((u) =>
      u.id === activeUnit.id ? { ...u, lectures: updatedLectures } : u
    );
    const updated = { ...curriculum, [contentStage]: updatedUnits };
    setCurriculum(updated);
    await saveCurriculum(updated);
    setEditingLecture(finalizedLecture);
    alert(`تم حفظ ونشر محتوى المحاضرة "${finalizedLecture.title}" بنجاح وتحديثها في لوحة الطلاب.`);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLecture) return;
    if (!newPdfName.trim()) {
      alert("الرجاء كتابة اسم الملف أو المذكرة أولاً.");
      return;
    }
    if (!selectedFile && !newPdfUrl.trim()) {
      alert("الرجاء اختيار ملف أو إدخال رابط خارجي.");
      return;
    }

    setIsUploadingFile(true);
    let finalUrl = newPdfUrl.trim() || "#";
    let finalSize = "External Link";

    try {
      if (selectedFile) {
        finalSize = formatFileSize(selectedFile.size);
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${contentStage}/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('materials')
          .upload(filePath, selectedFile);

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from('materials')
          .getPublicUrl(filePath);

        finalUrl = publicUrlData.publicUrl;
      }

      const newMat: LectureMaterial = {
        id: `mat-${Date.now()}`,
        name: newPdfName.trim(),
        url: finalUrl,
        size: finalSize,
      };

      setEditingLecture({
        ...editingLecture,
        materials: [...editingLecture.materials, newMat],
      });

      setNewPdfName("");
      setNewPdfUrl("");
      setSelectedFile(null);
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(`فشل رفع الملف: ${error.message}`);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleDeleteMaterial = (matId: string) => {
    if (!editingLecture) return;
    setEditingLecture({
      ...editingLecture,
      materials: editingLecture.materials.filter((m) => m.id !== matId),
    });
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLecture || !qText.trim()) return;
    const newQ: QuizQuestion = {
      id: `q-${Date.now()}`,
      questionText: qText.trim(),
      choices: [
        qChoice0.trim() || "الخيار الأول",
        qChoice1.trim() || "الخيار الثاني",
        qChoice2.trim() || "الخيار الثالث",
        qChoice3.trim() || "الخيار الرابع",
      ],
      correctChoiceIndex: qCorrectIndex,
      points: qPoints,
    };
    const updatedQuestions = [...(editingLecture.quiz?.questions || []), newQ];
    setEditingLecture({
      ...editingLecture,
      quiz: {
        title: editingLecture.quiz?.title || `اختبار ${editingLecture.title}`,
        questions: updatedQuestions,
      },
    });
    setQText("");
    setQChoice0("");
    setQChoice1("");
    setQChoice2("");
    setQChoice3("");
    setShowAddQuestion(false);
  };

  const handleDeleteQuestion = (qId: string) => {
    if (!editingLecture || !editingLecture.quiz) return;
    setEditingLecture({
      ...editingLecture,
      quiz: {
        ...editingLecture.quiz,
        questions: editingLecture.quiz.questions.filter((q) => q.id !== qId),
      },
    });
  };

  const filteredStudents =
    selectedStageFilter === "all"
      ? students
      : students.filter((s) => (s.stageId || s.stage) === selectedStageFilter);

  if (isCheckingAdminAuth) {
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
      <div className={darkMode ? "min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans selection:bg-purple-500 selection:text-white" : "min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6 font-sans selection:bg-indigo-500 selection:text-white"} dir={dir}>
        <Card className={darkMode ? "max-w-md w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-8 rounded-3xl shadow-2xl text-center space-y-6" : "max-w-md w-full bg-white/80 backdrop-blur-xl border border-slate-200 p-8 rounded-3xl shadow-xl text-center space-y-6"}>
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400 shadow-md">
            <LayoutDashboard className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
              {t.admin.title}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              {t.admin.subtitle}
            </p>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            setLoginErr("");
            const storedAdminPass = localStorage.getItem("admin_password") || "admin123";
            if ((["01223698064", "01068705721", "admin", "alialwakil880@gmail.com"].includes(adminLoginPhone.trim())) && adminLoginPassword === storedAdminPass) {
              localStorage.setItem("admin_logged_in", "true");
              setIsAdminLoggedIn(true);
            } else {
              setLoginErr(t.admin.wrongCreds);
            }
          }} className="space-y-4 text-right">
            <div>
              <label className="text-xs font-bold block mb-1.5 text-slate-700 dark:text-slate-300">{t.admin.phoneLabel}</label>
              <Input
                type="text"
                value={adminLoginPhone}
                onChange={(e) => setAdminLoginPhone(e.target.value)}
                placeholder={t.admin.phonePlaceholder}
                className="rounded-xl text-right bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-amber-500 h-11 text-xs text-slate-900 dark:text-slate-100"
                dir="ltr"
              />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5 text-slate-700 dark:text-slate-300">{t.admin.passwordLabel}</label>
              <div className="relative">
                <Input
                  type={showAdminPassword ? "text" : "password"}
                  value={adminLoginPassword}
                  onChange={(e) => setAdminLoginPassword(e.target.value)}
                  placeholder={t.admin.passwordPlaceholder}
                  className="rounded-xl text-right bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-amber-500 h-11 text-xs px-10"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                  aria-label={showAdminPassword ? t.admin.hidePassword : t.admin.showPassword}
                >
                  {showAdminPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {loginErr && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs rounded-xl font-bold text-center">
                {loginErr}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black py-6 rounded-xl shadow-md transition-all text-xs"
            >
              {t.admin.loginBtn}
            </Button>
            <Button
              type="button"
              onClick={() => window.location.href = "/"}
              variant="outline"
              className="w-full rounded-xl py-5 text-xs font-bold"
            >
              {t.common.home}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={
        darkMode
          ? "min-h-screen bg-slate-950 text-slate-100 pb-20 transition-colors duration-300 font-sans selection:bg-purple-500 selection:text-white"
          : "min-h-screen bg-slate-50 text-slate-900 pb-20 transition-colors duration-300 font-sans selection:bg-indigo-500 selection:text-white"
      }
      dir={dir}
    >
      <header
        className={
          darkMode
            ? "bg-slate-950/80 backdrop-blur-xl border-b border-slate-900/80 sticky top-0 z-50 shadow-sm"
            : "bg-white/80 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-50 shadow-xs"
        }
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-purple-400">
              SENIOR ADMIN PANEL
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              Control Center
            </span>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="text-xs font-bold bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 px-3.5 py-1.5 rounded-xl hidden md:flex items-center gap-2">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>{t.admin.headerRole}</span>
            </span>

            {/* ✅ زر إدارة الدفعات - الموجود */}
            <Link
              href="/admin/payments"
              className="px-3.5 py-2 bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <span className="text-base">📋</span>
              <span className="hidden sm:inline">إدارة الدفعات</span>
            </Link>

            {/* ✅ زر إدارة أوائل الشهر - الجديد */}
            <Link
              href="/admin/top-students"
              className="px-3.5 py-2 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">🏆 أوائل الشهر</span>
            </Link>

            <button
              onClick={toggleLanguage}
              className={
                darkMode
                  ? "px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 hover:bg-slate-800 transition-all text-xs font-bold flex items-center gap-1.5"
                  : "px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all shadow-xs text-xs font-bold flex items-center gap-1.5"
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
                  ? "p-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 hover:bg-slate-800 transition-all"
                  : "p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all shadow-xs"
              }
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t.common.logout}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-6">
        {!isSupabaseConfigured() && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs p-3.5 rounded-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{t.admin.localModeAlert}</span>
          </div>
        )}

        <div className={`flex gap-2 border-b pb-4 ${darkMode ? "border-slate-800/80" : "border-slate-200"}`}>
          <button
            onClick={() => setActiveTab("content")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 border ${
              activeTab === "content"
                ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md border-transparent"
                : darkMode
                  ? "bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-900"
                  : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>{t.admin.tabContent}</span>
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 border ${
              activeTab === "students"
                ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md border-transparent"
                : darkMode
                  ? "bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-900"
                  : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t.admin.tabStudents}</span>
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 border ${
              activeTab === "settings"
                ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md border-transparent"
                : darkMode
                  ? "bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-900"
                  : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>{t.admin.accountSettings}</span>
          </button>
        </div>

        {activeTab === "content" && (
          <div className="space-y-6">
            <Card className="p-5 glass-card rounded-3xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-xs font-black text-slate-700 dark:text-slate-200">{t.admin.selectStage}</span>
                <select
                  value={contentStage}
                  onChange={(e) => setContentStage(e.target.value)}
                  className={
                    darkMode
                      ? "bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs outline-none font-bold text-slate-200 focus:border-amber-500"
                      : "bg-slate-100 border border-slate-300 rounded-xl px-4 py-2 text-xs outline-none font-bold text-slate-800 focus:border-indigo-500"
                  }
                >
                  <option value="prep3">الصف الثالث الإعدادي (Prep 3)</option>
                  <option value="sec1">الصف الأول الثانوي (Sec 1)</option>
                  <option value="sec2">الصف الثاني الثانوي (Sec 2)</option>
                  <option value="sec3">الصف الثالث الثانوي (Sec 3)</option>
                  <option value="bac">مرحلة البكالوريا (Baccalaureate)</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setShowAddUnitModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-black px-5 py-2 rounded-xl text-xs shadow-md flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{t.admin.addUnit}</span>
                </Button>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-4 space-y-4">
                <div className="text-xs font-black text-slate-600 dark:text-slate-400 flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <FolderOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>{t.admin.curriculumUnits.replace('{stage}', getStageLabel(contentStage))}</span>
                  </span>
                  <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold border ${
                    darkMode
                      ? "bg-slate-900 text-amber-400 border-slate-800"
                      : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                  }`}>
                    {(curriculum[contentStage] || []).length} {t.admin.unitsCount}
                  </span>
                </div>

                {(curriculum[contentStage] || []).length === 0 ? (
                  <Card className="p-8 glass-card text-center text-xs text-slate-600 dark:text-slate-400 font-bold rounded-3xl">
                    {t.admin.noUnits}
                  </Card>
                ) : (
                  (curriculum[contentStage] || []).map((unit, idx) => {
                    const isSelected = activeUnitId === unit.id;
                    return (
                      <Card
                        key={unit.id}
                        onClick={() => {
                          setActiveUnitId(unit.id);
                          setEditingLecture(null);
                        }}
                        className={`p-4 rounded-3xl cursor-pointer transition-all border ${
                          isSelected
                            ? "bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/30 dark:border-amber-500/20 shadow-md shadow-amber-500/5"
                            : darkMode
                            ? "bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/80"
                            : "bg-white border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 dark:text-amber-400 font-black text-xs flex items-center justify-center border border-amber-500/20">
                                #{idx + 1}
                              </span>
                              <h4 className={`font-black text-sm ${isSelected ? "text-amber-500 dark:text-amber-400" : "text-slate-900 dark:text-slate-100"}`}>
                                {unit.title}
                              </h4>
                            </div>
                            {unit.description && (
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-1 font-medium">
                                {unit.description}
                              </p>
                            )}
                            <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 font-bold flex gap-3">
                              <span>{unit.lectures.length} {t.admin.lectureCountStr}</span>
                              <span>
                                {unit.lectures.reduce((acc, l) => acc + l.materials.length, 0)} {t.admin.pdfFileStr}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleRenameUnit(unit)}
                              title={t.admin.renameUnit}
                              className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors border border-slate-200/50 dark:border-slate-800/50"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveUnitOrder(unit.id, "up")}
                              title={t.admin.moveUp}
                              className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors border border-slate-200/50 dark:border-slate-800/50"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveUnitOrder(unit.id, "down")}
                              title={t.admin.moveDown}
                              className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors border border-slate-200/50 dark:border-slate-800/50"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUnit(unit.id, unit.title)}
                              title={t.admin.deleteUnit}
                              className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-xs flex items-center justify-center text-red-500 dark:text-red-400 transition-colors border border-red-500/20"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>

              <div className="lg:col-span-8 space-y-6">
                {activeUnit ? (
                  <div className="space-y-6">
                    <Card className="p-5 glass-card rounded-3xl flex justify-between items-center gap-4 flex-wrap shadow-xs">
                      <div>
                        <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 block mb-0.5">{t.admin.selectedUnit}</span>
                        <h3 className="text-lg font-black text-amber-600 dark:text-amber-400">{activeUnit.title}</h3>
                        {activeUnit.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{activeUnit.description}</p>
                        )}
                      </div>
                      <Button
                        onClick={() => setShowAddLectureModal(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-black px-4.5 py-2.5 rounded-xl text-xs shadow-md flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{t.admin.addLecture}</span>
                      </Button>
                    </Card>

                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <Video className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span>{t.admin.unitLectures} ({activeUnit.lectures.length} {t.admin.lectureCountStr}):</span>
                      </h4>

                      {activeUnit.lectures.length === 0 ? (
                        <Card className="p-8 glass-card text-center text-xs text-slate-600 dark:text-slate-400 font-bold rounded-3xl">
                          {t.admin.noLectures}
                        </Card>
                      ) : (
                        activeUnit.lectures.map((lec, lIdx) => {
                          const isEditingThis = editingLecture?.id === lec.id;
                          return (
                            <Card
                              key={lec.id}
                              className={`p-4 rounded-3xl border transition-all ${
                                isEditingThis
                                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-350 border-purple-500/40 shadow-md"
                                  : darkMode
                                  ? "bg-slate-900/50 border-slate-800/80"
                                  : "bg-white border-slate-200"
                              }`}
                            >
                              <div className="flex justify-between items-center gap-4 flex-wrap">
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-2.5 flex-wrap">
                                    <span className="text-xs font-black text-purple-600 dark:text-purple-400">#{lIdx + 1}</span>
                                    <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100">{lec.title}</h5>
                                    <span
                                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black border ${
                                        lec.isPublished
                                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                      }`}
                                    >
                                      {lec.isPublished ? t.admin.published : t.admin.draft}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-600 dark:text-slate-400 flex flex-wrap gap-x-5 font-medium">
                                    <span className="flex items-center gap-1">
                                      <Video className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                                      <span>{t.admin.video} {lec.videoId || lec.youtubeUrl ? t.admin.videoPresent : t.admin.notAdded}</span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                      <span>{t.admin.pdfFiles} {lec.materials.length > 0 ? `(${lec.materials.length} ${t.admin.files})` : t.admin.none}</span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                      <span>{t.admin.mcqQuiz} {lec.quiz?.questions && lec.quiz.questions.length > 0 ? `(${lec.quiz.questions.length} ${t.admin.questions})` : t.admin.notAdded}</span>
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                  <select
                                    onChange={(e) => handleMoveLectureToAnotherUnit(lec, e.target.value)}
                                    value={activeUnit.id}
                                    className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-1.5 text-[11px] font-bold text-slate-300 outline-none max-w-[150px]"
                                  >
                                    <option value={activeUnit.id} disabled>
                                      {t.admin.moveToUnit}
                                    </option>
                                    {(curriculum[contentStage] || []).map((u) => (
                                      <option key={u.id} value={u.id}>
                                        {t.admin.toUnit} {u.title}
                                      </option>
                                    ))}
                                  </select>

                                  <button
                                    onClick={() => handleMoveLectureOrder(lec.id, "up")}
                                    title={t.admin.moveUpOrder}
                                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleMoveLectureOrder(lec.id, "down")}
                                    title={t.admin.moveDownOrder}
                                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLecture(lec.id, lec.title)}
                                    title={t.admin.deleteLecture}
                                    className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 text-xs transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>

                                  <Button
                                    onClick={() => setEditingLecture(isEditingThis ? null : lec)}
                                    className="bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span>{isEditingThis ? t.admin.closeEditor : t.admin.manageContent}</span>
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          );
                        })
                      )}
                    </div>

                    {editingLecture && (
                      <Card
                        className={
                          darkMode
                            ? "bg-slate-900 border border-purple-500/60 p-6 rounded-3xl shadow-2xl space-y-6 animate-in fade-in duration-200"
                            : "bg-white border border-purple-500/60 p-6 rounded-3xl shadow-xl space-y-6 animate-in fade-in duration-200"
                        }
                      >
                        <div className={`flex justify-between items-center border-b pb-4 ${darkMode ? "border-slate-800" : "border-slate-200"}`}>
                          <div className="space-y-0.5">
                            <span className="text-xs font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                              <Edit3 className="w-4 h-4" />
                              <span>{t.admin.lectureEditor}</span>
                            </span>
                            <h4 className="text-lg font-black text-slate-900 dark:text-slate-100">{editingLecture.title}</h4>
                          </div>
                          <button
                            onClick={() => setEditingLecture(null)}
                            className={`text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 border transition-all ${
                              darkMode
                                ? "text-slate-400 hover:text-white bg-slate-800 border-transparent"
                                : "text-slate-650 hover:text-slate-900 bg-slate-100 border-slate-200"
                            }`}
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>{t.admin.close}</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.admin.lectureTitle}</label>
                            <Input
                              type="text"
                              value={editingLecture.title}
                              onChange={(e) =>
                                setEditingLecture({ ...editingLecture, title: e.target.value })
                              }
                              className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl text-xs h-10 font-bold text-slate-900 dark:text-slate-100 focus-visible:ring-purple-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">حالة النشر في لوحة الطالب</label>
                            <select
                              value={editingLecture.isPublished ? "true" : "false"}
                              onChange={(e) =>
                                setEditingLecture({
                                  ...editingLecture,
                                  isPublished: e.target.value === "true",
                                })
                              }
                              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 h-10 text-xs font-bold text-slate-900 dark:text-slate-200 outline-none focus:border-purple-500"
                            >
                              <option className="dark:bg-slate-900" value="true">منشور ومتاح للطلاب (Published)</option>
                              <option className="dark:bg-slate-900" value="false">مسودة خاصة غير ظاهرة (Unpublished Draft)</option>
                            </select>
                          </div>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                          <div className="flex justify-between items-center flex-wrap gap-2">
                            <h5 className="text-xs font-black text-amber-600 dark:text-amber-400 flex items-center gap-2">
                              <Video className="w-4 h-4" />
                              <span>1. رابط فيديو اليوتيوب الغير مدرج (YouTube Unlisted URL)</span>
                            </h5>
                            <span className={`text-[10px] px-2.5 py-1 rounded-lg border ${
                              darkMode
                                ? "text-slate-400 bg-slate-900 border-slate-800"
                                : "text-slate-600 bg-slate-100 border-slate-200"
                            }`}>
                              بث محمي داخلياً بدون كشف الرابط الأصلي
                            </span>
                          </div>

                          <div className="space-y-2">
                            <Input
                              type="text"
                              value={editingLecture.youtubeUrl || ""}
                              onChange={(e) => {
                                const newUrl = e.target.value;
                                const extracted = extractYouTubeId(newUrl) || "";
                                setEditingLecture({
                                  ...editingLecture,
                                  youtubeUrl: newUrl,
                                  videoId: extracted,
                                });
                              }}
                              placeholder="ألصق رابط الفيديو (مثال: https://youtu.be/xxxx or https://www.youtube.com/watch?v=xxxx)"
                              className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-left text-xs font-mono h-11 text-slate-900 dark:text-slate-100 focus-visible:ring-purple-500"
                              dir="ltr"
                            />

                            {editingLecture.youtubeUrl && (
                              <div className="flex items-center gap-2 text-xs font-bold pt-1">
                                {validateYouTubeUrl(editingLecture.youtubeUrl) ? (
                                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/30">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>رابط يوتيوب صحيح (Video ID: {extractYouTubeId(editingLecture.youtubeUrl)})</span>
                                  </span>
                                ) : (
                                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/30">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    <span>رابط يوتيوب غير قياسي، يرجى التأكد من الرابط.</span>
                                  </span>
                                )}
                              </div>
                            )}

                            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                              عند لصق رابط يوتيوب الغير مدرج، يقوم النظام باستخلاص الرمز الداخلي ودمجه في مشغل آمن مع إخفاء أزرار المشاركة والعناوين لمنع الطلاب من نسخ الرابط.
                            </p>
                          </div>

                          {(editingLecture.videoId || extractYouTubeId(editingLecture.youtubeUrl)) && (
                            <div className="mt-3 pt-3 border-t border-slate-300 dark:border-slate-800/80">
                              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-2">
                                معاينة المحاضرة كما ستظهر بالطالب:
                              </span>
                              <div className="relative aspect-video w-full max-w-xl mx-auto rounded-xl overflow-hidden border border-slate-300 dark:border-slate-800 shadow-lg bg-black">
                                <iframe
                                  src={`https://www.youtube-nocookie.com/embed/${
                                    editingLecture.videoId || extractYouTubeId(editingLecture.youtubeUrl)
                                  }?rel=0&modestbranding=1&controls=1&disablekb=1&fs=0`}
                                  title={editingLecture.title}
                                  className="w-full h-full border-0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen={false}
                                ></iframe>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-300 dark:border-slate-800 space-y-4">
                          <h5 className="text-xs font-black text-amber-600 dark:text-amber-400 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span>2. مستندات ومذكرات المحاضرة (PDF / Worksheets)</span>
                          </h5>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {editingLecture.materials.length === 0 ? (
                              <div className="col-span-2 text-xs text-slate-600 dark:text-slate-400 py-3 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-xl font-bold">
                                لم يتم إرفاق ملفات PDF لهذا الدرس بعد.
                              </div>
                            ) : (
                              editingLecture.materials.map((mat) => (
                                <div
                                  key={mat.id}
                                  className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-800 flex justify-between items-center text-xs font-bold"
                                >
                                  <div className="flex items-center gap-2.5 overflow-hidden">
                                    <FileText className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                                    <span className="truncate text-slate-200">{mat.name}</span>
                                    <span className="text-[10px] text-slate-600 dark:text-slate-400">({mat.size})</span>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteMaterial(mat.id)}
                                    className="text-red-600 dark:text-red-400 hover:text-red-300 text-xs font-bold px-2.5 py-1 bg-red-500/10 rounded-lg transition-colors"
                                  >
                                    حذف
                                  </button>
                                </div>
                              ))
                            )}
                          </div>

                          <form onSubmit={handleAddMaterial} className="flex gap-2 flex-wrap items-end pt-2 border-t border-slate-300 dark:border-slate-800/80">
                            <div className="flex-1 min-w-[200px]">
                              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">اسم الملف أو المذكرة</label>
                              <Input
                                type="text"
                                value={newPdfName}
                                onChange={(e) => setNewPdfName(e.target.value)}
                                placeholder="مثال: ملزمة قواعد الوحدة الأولى.pdf"
                                className="bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-xs h-9 font-bold"
                              />
                            </div>
                            <div className="flex-1 min-w-[200px]">
                              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">رفع الملف من الجهاز</label>
                              <input
                                type="file"
                                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                className="block w-full text-xs text-slate-600 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500/10 file:text-amber-600 hover:file:bg-amber-500/20"
                              />
                            </div>
                            <div className="flex-1 min-w-[200px]">
                              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">أو رابط خارجي للملف</label>
                              <Input
                                type="text"
                                value={newPdfUrl}
                                onChange={(e) => setNewPdfUrl(e.target.value)}
                                placeholder="رابط التحميل أو اتركه فارغاً..."
                                className="bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-xs h-9 font-mono"
                                dir="ltr"
                                disabled={!!selectedFile}
                              />
                            </div>
                            <Button
                              type="submit"
                              disabled={isUploadingFile}
                              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs h-9 px-4 rounded-xl flex items-center gap-1.5"
                            >
                              {isUploadingFile ? <span className="animate-spin text-lg">↻</span> : <Plus className="w-3.5 h-3.5" />}
                              <span>إرفاق الملف</span>
                            </Button>
                          </form>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-300 dark:border-slate-800 space-y-4">
                          <div className="flex justify-between items-center flex-wrap gap-2">
                            <h5 className="text-xs font-black text-amber-600 dark:text-amber-400 flex items-center gap-2">
                              <HelpCircle className="w-4 h-4" />
                              <span>3. بنك أسئلة الاختبار الإلكتروني (MCQ Quiz Builder)</span>
                            </h5>
                            <Button
                              onClick={() => setShowAddQuestion(!showAddQuestion)}
                              className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>{showAddQuestion ? "إغلاق إضافة سؤال" : "إضافة سؤال MCQ جديد"}</span>
                            </Button>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">عنوان الاختبار</label>
                            <Input
                              type="text"
                              value={editingLecture.quiz?.title || ""}
                              onChange={(e) =>
                                setEditingLecture({
                                  ...editingLecture,
                                  quiz: {
                                    title: e.target.value,
                                    questions: editingLecture.quiz?.questions || [],
                                  },
                                })
                              }
                              placeholder="عنوان الاختبار..."
                              className="bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-xs font-bold max-w-md h-9"
                            />
                          </div>

                          {showAddQuestion && (
                            <form onSubmit={handleAddQuestion} className="p-4 bg-slate-900 rounded-2xl border border-purple-500/40 space-y-3">
                              <h6 className="text-xs font-black text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>صياغة سؤال اختيار من متعدد جديد:</span>
                              </h6>
                              <div>
                                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">نص السؤال</label>
                                <Input
                                  type="text"
                                  value={qText}
                                  onChange={(e) => setQText(e.target.value)}
                                  placeholder="اكتب نص السؤال بوضوح..."
                                  className="bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-xs font-bold"
                                  required
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                                  { label: "الخيار الأول (A)", val: qChoice0, set: setQChoice0, idx: 0 },
                                  { label: "الخيار الثاني (B)", val: qChoice1, set: setQChoice1, idx: 1 },
                                  { label: "الخيار الثالث (C)", val: qChoice2, set: setQChoice2, idx: 2 },
                                  { label: "الخيار الرابع (D)", val: qChoice3, set: setQChoice3, idx: 3 },
                                ].map((c) => (
                                  <div key={c.idx} className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name="correctChoice"
                                      checked={qCorrectIndex === c.idx}
                                      onChange={() => setQCorrectIndex(c.idx)}
                                      className="w-4 h-4 accent-amber-500 cursor-pointer"
                                      title="تحديد كإجابة صحيحة"
                                    />
                                    <Input
                                      type="text"
                                      value={c.val}
                                      onChange={(e) => c.set(e.target.value)}
                                      placeholder={c.label}
                                      className="bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-xs flex-1 font-bold"
                                    />
                                  </div>
                                ))}
                              </div>

                              <div className="flex justify-between items-center gap-4 pt-2">
                                <div className="flex items-center gap-2">
                                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">الدرجات</label>
                                  <Input
                                    type="number"
                                    value={qPoints}
                                    onChange={(e) => setQPoints(parseInt(e.target.value) || 10)}
                                    className="bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-xs w-20 font-bold"
                                  />
                                </div>
                                <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-5 rounded-xl">
                                  حفظ السؤال في الاختبار
                                </Button>
                              </div>
                            </form>
                          )}

                          <div className="space-y-2">
                            {(!editingLecture.quiz?.questions || editingLecture.quiz.questions.length === 0) ? (
                              <div className="text-xs text-slate-600 dark:text-slate-400 py-4 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-xl font-bold">
                                لا توجد أسئلة في هذا الاختبار بعد. اضغط على "إضافة سؤال MCQ جديد".
                              </div>
                            ) : (
                              editingLecture.quiz.questions.map((q, idx) => (
                                <div
                                  key={q.id}
                                  className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-800 flex justify-between items-start gap-4 text-xs"
                                >
                                  <div className="space-y-1.5 flex-1">
                                    <div className="font-bold text-slate-200">
                                      {idx + 1}. {q.questionText} <span className="text-amber-600 dark:text-amber-400 font-bold">({q.points} نقطة)</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400 pt-1">
                                      {q.choices.map((choice, cIdx) => (
                                        <div
                                          key={cIdx}
                                          className={`px-2.5 py-1.5 rounded-lg border ${
                                            q.correctChoiceIndex === cIdx
                                              ? "bg-emerald-500/10 text-emerald-400 font-bold border-emerald-500/30"
                                              : "bg-slate-950 border-slate-800/80"
                                          }`}
                                        >
                                          {["A", "B", "C", "D"][cIdx]}: {choice} {q.correctChoiceIndex === cIdx && "✓"}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteQuestion(q.id)}
                                    className="text-red-600 dark:text-red-400 hover:text-red-300 font-bold bg-red-500/10 px-2.5 py-1 rounded-lg text-[11px] transition-colors"
                                  >
                                    حذف
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-slate-300 dark:border-slate-800">
                          <Button
                            onClick={handleSaveLectureContent}
                            className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black px-8 py-6 rounded-2xl text-sm shadow-xl flex-1 flex items-center justify-center gap-2"
                          >
                            <Save className="w-4 h-4" />
                            <span>حفظ ونشر المحاضرة للمنهج وتحديث لوحة الطلاب</span>
                          </Button>
                          <Button
                            onClick={() => setEditingLecture(null)}
                            variant="outline"
                            className="rounded-2xl px-6 font-bold text-xs h-auto"
                          >
                            إغلاق
                          </Button>
                        </div>
                      </Card>
                    )}
                  </div>
                ) : (
                  <Card className="p-12 glass-card text-center text-slate-600 dark:text-slate-400 font-bold space-y-3 rounded-3xl">
                    <FolderOpen className="w-12 h-12 mx-auto text-slate-600 opacity-60" />
                    <div>يرجى تحديد وحدة من القائمة الجانبية لإدارة المحاضرات أو إنشاء وحدة جديدة.</div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "students" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">تصفية حسب المرحلة:</span>
              {["all", "prep3", "sec1", "sec2", "sec3", "bac"].map((stage) => (
                <button
                  key={stage}
                  onClick={() => setSelectedStageFilter(stage)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    selectedStageFilter === stage
                      ? "bg-purple-600 text-white border-purple-500 shadow-sm"
                      : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  {stage === "all" ? "الكل" : getStageLabel(stage)}
                </button>
              ))}
            </div>

            <Card className="glass-card rounded-3xl overflow-hidden shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr
                      className={
                        darkMode
                          ? "bg-slate-950 border-b border-slate-800 text-slate-400 text-xs font-bold"
                          : "bg-slate-100 border-b border-slate-200 text-slate-600 text-xs font-bold"
                      }
                    >
                      <th className="p-4">اسم الطالب</th>
                      <th className="p-4">رقم الهاتف</th>
                      <th className="p-4">الصف الدراسي</th>
                      <th className="p-4">نسبة التقدم الدراسي</th>
                      <th className="p-4">آخر تقييم</th>
                      <th className="p-4 text-center">الإجراءات الأمنيّة</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-medium divide-y divide-slate-800/60">
                    {loadingStudents ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-purple-600 dark:text-purple-400 font-bold animate-pulse">
                          جاري تحميل بيانات الطلاب من قاعدة البيانات...
                        </td>
                      </tr>
                    ) : filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-600 dark:text-slate-400 font-bold">
                          لم يتم العثور على طلاب مسجلين في هذا القسم بعد.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student, idx) => {
                        const studentName = student.fullName || student.name || `طالب ${idx + 1}`;
                        const phone = student.studentPhone || student.phone || "غير مسجل";
                        const stage = student.stageId || student.stage || "sec3";
                        const progress = student.progress || 0;
                        const lastQuiz = student.lastQuiz || "لا يوجد";

                        return (
                          <tr
                            key={student.id || idx}
                            className={darkMode ? "hover:bg-slate-950/40 transition-colors" : "hover:bg-slate-50 transition-colors"}
                          >
                            <td
                              className="p-4 font-bold text-amber-600 dark:text-amber-400 hover:text-amber-300 cursor-pointer transition-colors"
                              onClick={() => setSelectedStudentStats(student)}
                              title="اضغط لعرض إحصائيات ودرجات الطالب"
                            >
                              <div className="flex items-center gap-1.5">
                                <Award className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                                <span className="underline decoration-amber-400/40 underline-offset-4">{studentName}</span>
                              </div>
                            </td>
                            <td className="p-4 font-mono text-slate-700 dark:text-slate-300" dir="ltr">
                              {phone}
                            </td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 font-bold border border-purple-500/20">
                                {getStageLabel(stage)}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                                  <div
                                    className="bg-gradient-to-r from-purple-500 to-amber-400 h-full"
                                    style={{ width: `${progress}%` }}
                                  ></div>
                                </div>
                                <span className="font-bold text-slate-700 dark:text-slate-300">{progress}%</span>
                              </div>
                            </td>
                            <td className="p-4 text-amber-600 dark:text-amber-400 font-bold">{lastQuiz}</td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => setSelectedStudentStats(student)}
                                  className="px-3.5 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 transition-all font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-xs"
                                  title="عرض إحصائيات ودرجات الكويزات التفصيلية"
                                >
                                  <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                  <span>الإحصائيات والدرجات</span>
                                </button>
                                <button
                                  onClick={() => handleResetPassword(student)}
                                  className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all font-bold text-[11px] flex items-center justify-center gap-1.5"
                                  title="تغيير كلمة المرور"
                                >
                                  <KeyRound className="w-3.5 h-3.5 shrink-0" />
                                  <span>الباسورد</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteStudent(student)}
                                  className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-all font-bold text-[11px] flex items-center justify-center gap-1.5"
                                  title="حذف حساب الطالب نهائياً"
                                >
                                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                  <span>حذف</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            <Card className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 max-w-2xl mx-auto shadow-md">
              <div className="flex items-center gap-3 border-b border-slate-300 dark:border-slate-800/80 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg text-slate-950">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">إعدادات الحساب</h3>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
                    تغيير كلمة مرور الإدارة
                  </p>
                </div>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                setPassMessage({ type: "", text: "" });
                
                const currentStored = localStorage.getItem("admin_password") || "admin123";
                if (adminOldPass !== currentStored) {
                  setPassMessage({ type: "error", text: "كلمة المرور الحالية غير صحيحة" });
                  return;
                }
                if (adminNewPass.length < 6) {
                  setPassMessage({ type: "error", text: "كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف" });
                  return;
                }
                if (adminNewPass !== adminConfirmPass) {
                  setPassMessage({ type: "error", text: "كلمة المرور غير متطابقة" });
                  return;
                }

                localStorage.setItem("admin_password", adminNewPass);
                setPassMessage({ type: "success", text: "تم تغيير كلمة المرور بنجاح" });
                setAdminOldPass("");
                setAdminNewPass("");
                setAdminConfirmPass("");
              }} className="space-y-4">
                
                <div>
                  <label className="text-xs font-bold block mb-1.5 text-slate-700 dark:text-slate-300">كلمة المرور الحالية</label>
                  <div className="relative">
                    <Input
                      type={showAdminOldPass ? "text" : "password"}
                      value={adminOldPass}
                      onChange={(e) => setAdminOldPass(e.target.value)}
                      placeholder="••••••••"
                      className="rounded-xl text-right bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-amber-500 h-11 text-xs px-10"
                      dir="ltr"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminOldPass(!showAdminOldPass)}
                      className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                      aria-label={showAdminOldPass ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                    >
                      {showAdminOldPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1.5 text-slate-700 dark:text-slate-300">كلمة المرور الجديدة</label>
                  <div className="relative">
                    <Input
                      type={showAdminNewPass ? "text" : "password"}
                      value={adminNewPass}
                      onChange={(e) => setAdminNewPass(e.target.value)}
                      placeholder="••••••••"
                      className="rounded-xl text-right bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-amber-500 h-11 text-xs px-10"
                      dir="ltr"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminNewPass(!showAdminNewPass)}
                      className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                      aria-label={showAdminNewPass ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                    >
                      {showAdminNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1.5 text-slate-700 dark:text-slate-300">تأكيد كلمة المرور الجديدة</label>
                  <div className="relative">
                    <Input
                      type={showAdminConfirmPass ? "text" : "password"}
                      value={adminConfirmPass}
                      onChange={(e) => setAdminConfirmPass(e.target.value)}
                      placeholder="••••••••"
                      className="rounded-xl text-right bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-amber-500 h-11 text-xs px-10"
                      dir="ltr"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminConfirmPass(!showAdminConfirmPass)}
                      className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                      aria-label={showAdminConfirmPass ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                    >
                      {showAdminConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {passMessage.text && (
                  <div className={`p-3 text-xs rounded-xl font-bold text-center border ${
                    passMessage.type === "error" 
                      ? "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400" 
                      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  }`}>
                    {passMessage.text}
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black py-6 rounded-xl shadow-md transition-all text-xs"
                  >
                    <Save className="w-4 h-4 ml-2 inline-block" />
                    تحديث كلمة المرور
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </main>

      {showAddUnitModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className={darkMode ? "max-w-md w-full bg-slate-900 border-slate-800 p-6 rounded-3xl space-y-4 shadow-2xl" : "max-w-md w-full bg-white border-slate-200 p-6 rounded-3xl space-y-4 shadow-xl text-slate-900"}>
            <div className="flex justify-between items-center border-b border-slate-300 dark:border-slate-800/80 pb-3">
              <h4 className="font-black text-amber-600 dark:text-amber-400 text-base flex items-center gap-2">
                <FolderPlus className="w-5 h-5" />
                <span>إنشاء وحدة تعليمية جديدة</span>
              </h4>
              <button onClick={() => setShowAddUnitModal(false)} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold">✕</button>
            </div>
            <form onSubmit={handleAddUnit} className="space-y-4 text-right">
              <div>
                <label className="text-xs font-bold block mb-1.5 text-slate-700 dark:text-slate-300">اسم الوحدة (مثال: Unit 1 أو Grammar):</label>
                <Input
                  type="text"
                  value={newUnitTitle}
                  onChange={(e) => setNewUnitTitle(e.target.value)}
                  placeholder="عنوان الوحدة..."
                  className="bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-xs font-bold h-11"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1.5 text-slate-700 dark:text-slate-300">وصف الوحدة (اختياري):</label>
                <Input
                  type="text"
                  value={newUnitDesc}
                  onChange={(e) => setNewUnitDesc(e.target.value)}
                  placeholder="وصف مختصر لمحتوى الوحدة..."
                  className="bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-xs font-bold h-11"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:from-amber-600 hover:to-yellow-600 font-black py-5 flex-1 rounded-xl text-xs">
                  إضافة الوحدة الآن
                </Button>
                <Button type="button" onClick={() => setShowAddUnitModal(false)} variant="outline" className="rounded-xl px-5 text-xs font-bold">
                  إلغاء
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {showAddLectureModal && activeUnit && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className={darkMode ? "max-w-md w-full bg-slate-900 border-slate-800 p-6 rounded-3xl space-y-4 shadow-2xl" : "max-w-md w-full bg-white border-slate-200 p-6 rounded-3xl space-y-4 shadow-xl text-slate-900"}>
            <div className="flex justify-between items-center border-b border-slate-300 dark:border-slate-800/80 pb-3">
              <div>
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 block">إضافة داخل: {activeUnit.title}</span>
                <h4 className="font-black text-amber-600 dark:text-amber-400 text-base flex items-center gap-2 mt-0.5">
                  <Video className="w-5 h-5" />
                  <span>إضافة درس أو محاضرة جديدة</span>
                </h4>
              </div>
              <button onClick={() => setShowAddLectureModal(false)} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold">✕</button>
            </div>
            <form onSubmit={handleAddLecture} className="space-y-4 text-right">
              <div>
                <label className="text-xs font-bold block mb-1.5 text-slate-700 dark:text-slate-300">عنوان الدرس (مثال: Present Simple أو Lecture 1):</label>
                <Input
                  type="text"
                  value={newLectureTitle}
                  onChange={(e) => setNewLectureTitle(e.target.value)}
                  placeholder="عنوان أو اسم المحاضرة..."
                  className="bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-xs font-bold h-11"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1.5 text-slate-700 dark:text-slate-300">وصف قصير للدرس (اختياري):</label>
                <Input
                  type="text"
                  value={newLectureDesc}
                  onChange={(e) => setNewLectureDesc(e.target.value)}
                  placeholder="أهم النقاط التي سيتم شرحها..."
                  className="bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-xs font-bold h-11"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-black py-5 flex-1 rounded-xl text-xs">
                  إنشاء الدرس والانتقال للمحرر
                </Button>
                <Button type="button" onClick={() => setShowAddLectureModal(false)} variant="outline" className="rounded-xl px-5 text-xs font-bold">
                  إلغاء
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {selectedStudentStats && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <Card className={darkMode ? "max-w-3xl w-full bg-slate-900 border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl my-auto text-slate-100" : "max-w-3xl w-full bg-white border-slate-200 p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl my-auto text-slate-900"}>
            <div className="flex justify-between items-start border-b border-slate-300 dark:border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-amber-500 flex items-center justify-center shadow-lg text-white font-black text-xl">
                  {(selectedStudentStats.fullName || selectedStudentStats.name || "S").charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-black text-amber-600 dark:text-amber-400 flex items-center gap-2">
                    <span>{selectedStudentStats.fullName || selectedStudentStats.name || "طالب بدون اسم"}</span>
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
                    <span className="font-mono dir-ltr">{selectedStudentStats.studentPhone || selectedStudentStats.phone || "غير مسجل"}</span>
                    <span>•</span>
                    <span className="text-purple-300 font-bold bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                      {getStageLabel(selectedStudentStats.stageId || selectedStudentStats.stage || "sec3")}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentStats(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 dark:hover:text-white transition-all font-bold"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* بطاقات المؤشرات العامة (KPI Cards) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex flex-col items-center justify-center text-center">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>إجمالي الاختبارات</span>
                </span>
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  {selectedStudentStats.quizScores ? selectedStudentStats.quizScores.length : 0}
                </span>
                <span className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">اختبار محلول</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex flex-col items-center justify-center text-center">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
                  <span>متوسط الدرجات</span>
                </span>
                <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
                  {selectedStudentStats.quizScores && selectedStudentStats.quizScores.length > 0
                    ? Math.round(
                        selectedStudentStats.quizScores.reduce((acc, curr) => acc + curr.percentage, 0) /
                          selectedStudentStats.quizScores.length
                      ) + "%"
                    : selectedStudentStats.progress
                    ? selectedStudentStats.progress + "%"
                    : "0%"}
                </span>
                <span className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">المعدل التراكمي</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex flex-col items-center justify-center text-center">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                  <span>تقدم المنهج</span>
                </span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {selectedStudentStats.progress || 0}%
                </span>
                <span className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">نسبة المشاهدة والحل</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex flex-col items-center justify-center text-center">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                  <span>التقييم العام</span>
                </span>
                <span className="text-sm font-black text-blue-600 dark:text-blue-300 mt-1">
                  {(selectedStudentStats.progress || 0) >= 85 ||
                  (selectedStudentStats.quizScores &&
                    selectedStudentStats.quizScores.reduce((a, c) => a + c.percentage, 0) /
                      (selectedStudentStats.quizScores.length || 1) >=
                      85)
                    ? "متميز 👑"
                    : (selectedStudentStats.progress || 0) >= 65
                    ? "جيد جداً ⭐"
                    : (selectedStudentStats.progress || 0) >= 40
                    ? "جيد 🟢"
                    : "يحتاج متابعة ⚠️"}
                </span>
                <span className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">الحالة الدراسية</span>
              </div>
            </div>

            {/* تفاصيل الاختبارات السابقة (Quiz Scores History Table) */}
            <div className="space-y-3">
              <h4 className="font-black text-sm text-slate-900 dark:text-slate-200 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>سجل الاختبارات والكويزات التفصيلي:</span>
              </h4>

              {selectedStudentStats.quizScores && selectedStudentStats.quizScores.length > 0 ? (
                <div className="bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-inner max-h-72 overflow-y-auto">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-900/90 text-[11px] font-bold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                        <th className="p-3.5">عنوان الاختبار والدرس</th>
                        <th className="p-3.5 text-center">الدرجة المكتسبة</th>
                        <th className="p-3.5 text-center">النسبة (%)</th>
                        <th className="p-3.5 text-center">التقييم</th>
                        <th className="p-3.5 text-left">تاريخ ووقت التقديم</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs divide-y divide-slate-200 dark:divide-slate-800/60 font-medium">
                      {selectedStudentStats.quizScores.map((scoreObj, sIdx) => (
                        <tr
                          key={scoreObj.id || sIdx}
                          className="hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors text-slate-900 dark:text-slate-200"
                        >
                          <td className="p-3.5 font-bold">
                            <div className="text-amber-600 dark:text-amber-400 text-xs">{scoreObj.quizTitle}</div>
                            <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">{scoreObj.lectureTitle}</div>
                          </td>
                          <td className="p-3.5 text-center font-mono font-black text-sm">
                            <span className="text-purple-600 dark:text-purple-400">{scoreObj.score}</span>{" "}
                            <span className="text-slate-600 dark:text-slate-400 text-xs">/ {scoreObj.totalPoints}</span>
                          </td>
                          <td className="p-3.5 text-center font-bold text-slate-700 dark:text-slate-300">
                            {scoreObj.percentage}%
                          </td>
                          <td className="p-3.5 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-lg font-black text-[10px] border ${
                                scoreObj.status === "ممتاز"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                  : scoreObj.status === "ناجح"
                                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                                  : scoreObj.status === "يحتاج مراجعة"
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                                  : "bg-red-500/10 text-red-650 dark:text-red-400 border-red-500/30"
                              }`}
                            >
                              {scoreObj.status || "مكتمل"}
                            </span>
                          </td>
                          <td className="p-3.5 text-left text-slate-600 dark:text-slate-400 text-[11px] font-mono">
                            <div className="flex items-center gap-1.5 justify-end">
                               <Clock className="w-3 h-3 text-slate-600 dark:text-slate-400 shrink-0" />
                              <span>{scoreObj.completedAt || "مسجل"}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 text-center text-slate-600 dark:text-slate-400">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-2 text-purple-500 dark:text-purple-400">
                    <Award className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-xs">لم يقم هذا الطالب بحل أي اختبارات إلكترونية (MCQ) مسجلة في النظام حتى الآن.</p>
                  {selectedStudentStats.lastQuiz && selectedStudentStats.lastQuiz !== "لا يوجد" && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2 font-medium">
                      آخر نشاط مسجل للطالب: {selectedStudentStats.lastQuiz}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-300 dark:border-slate-800/80">
              <Button
                type="button"
                onClick={() => {
                  const studentToEdit = selectedStudentStats;
                  setSelectedStudentStats(null);
                  handleResetPassword(studentToEdit);
                }}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 font-bold px-4 rounded-xl text-xs flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>تعديل باسورد الطالب</span>
              </Button>
              <Button
                type="button"
                onClick={() => setSelectedStudentStats(null)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 rounded-xl text-xs"
              >
                إغلاق النافذة
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
