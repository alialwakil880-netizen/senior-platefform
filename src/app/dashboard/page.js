"use client";

import React, { useState, useEffect, useRef } from 'react';

export default function DashboardPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeUnit, setActiveUnit] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  
  // تتبع المحاضرات التي تمت مشاهدتها والكويزات المحلولة (للحساب الديناميكي)
  const [watchedVideos, setWatchedVideos] = useState({});
  const [completedQuizzes, setCompletedQuizzes] = useState({});

  // تتبع الفيديو المفتوح حالياً للعرض (لوحدة معينة ومحاضرة معينة)
  const [playingVideo, setPlayingVideo] = useState({ unitId: null, lecId: null });

 const [studentName, setStudentName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentStage, setStudentStage] = useState('');

  useEffect(() => {
    // افترضنا إنك بتخزن بيانات الطالب في localStorage وقت تسجيل الدخول بالشكل ده
    const userData = JSON.parse(localStorage.getItem("current_student"));
    
    if (userData) {
      setStudentName(userData.fullName);
      setStudentPhone(userData.studentPhone);
      setStudentStage(userData.stageId);
    }
  }, []); 
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMessage, setPassMessage] = useState({ type: '', text: '' });

  const leftEyeRef = useRef(null);
  const rightEyeRef = useRef(null);

  // 🚪 دالة تسجيل الخروج لتنظيف البيانات وإعادة التوجيه
  const handleLogout = () => {
    if (confirm("هل أنت متأكد أنك تريد تسجيل الخروج من المنصة؟")) {
      localStorage.clear(); // مسح الجلسة تماماً لحماية الحساب
      window.location.href = "/"; // توجيه الطالب إلى صفحة تسجيل الدخول الرئيسية
    }
  };

  useEffect(() => {
    const savedName = localStorage.getItem("saved_fullName");
    const savedPhone = localStorage.getItem("saved_studentPhone");
    const savedStage = localStorage.getItem("saved_stageName");
    if (savedName) setStudentName(savedName);
    if (savedPhone) setStudentPhone(savedPhone);
    if (savedStage) setStudentStage(savedStage);
  }, []);

  useEffect(() => {
    const handleMouseMove = (event) => {
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

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPassMessage({ type: '', text: '' });
    const savedPassword = localStorage.getItem("saved_password") || "123456";
    if (oldPassword !== savedPassword) { setPassMessage({ type: 'error', text: 'كلمة المرور القديمة غير صحيحة!' }); return; }
    if (newPassword !== confirmPassword) { setPassMessage({ type: 'error', text: 'كلمة المرور الجديدة غير متطابقة!' }); return; }
    localStorage.setItem("saved_password", newPassword);
    setPassMessage({ type: 'success', text: 'تم تحديث كلمة المرور بنجاح! 🔐' });
    setOldPassword(''); setNewPassword(''); setConfirmPassword('');
  };

  // هيكلة الـ 12 وحدة بالملي
  const units = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    title: `Unit ${i + 1}`,
    lectures: [
      { id: 1, name: "المحاضرة الأولى", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" }, 
      { id: 2, name: "المحاضرة الثانية", videoUrl: "https://www.w3schools.com/html/movie.mp4" },
      { id: 3, name: "المحاضرة الثالثة", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" }
    ]
  }));

  const handlePlayVideo = (unitId, lecId) => {
    setPlayingVideo({ unitId, lecId });
    const videoKey = `${unitId}-${lecId}`;
    if (!watchedVideos[videoKey]) {
      setWatchedVideos(prev => ({ ...prev, [videoKey]: true }));
    }
  };

  const handleQuizClick = (unitId, lecId, lecName) => {
    const quizKey = `${unitId}-${lecId}`;
    if (!completedQuizzes[quizKey]) {
      setCompletedQuizzes(prev => ({ ...prev, [quizKey]: true }));
      alert(`📝 أحسنت يا بطل! تم محاكاة حل كويز: ${lecName}، ونسبة تقدمك زادت الآن!`);
    } else {
      alert(`📝 لقد قمت بحل كويز ${lecName} مسبقاً.`);
    }
  };

  const totalItems = 12 * 3 * 2; 
  const completedItems = Object.keys(watchedVideos).length + Object.keys(completedQuizzes).length;
  const progressPercentage = Math.min(100, Math.round((completedItems / totalItems) * 100));

  return (
    <div className={darkMode ? "min-h-screen bg-slate-950 text-slate-100 pb-12 transition-colors duration-300" : "min-h-screen bg-gray-50 text-slate-900 pb-12 transition-colors duration-300"} dir="rtl">
      
      {/* هيدر المنصة */}
      <header className={darkMode ? "bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-lg" : "bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm"}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500 cursor-pointer" onClick={() => setShowProfile(false)}>
              SENIOR
            </h1>
            <div className="flex space-x-1 space-x-reverse items-center hidden sm:flex">
              <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center border border-purple-500">
                <div ref={rightEyeRef} className="w-2.5 h-2.5 bg-slate-950 rounded-full relative"><div className="w-0.5 h-0.5 bg-white rounded-full absolute top-0.5 right-0.5"></div></div>
              </div>
              <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center border border-purple-500">
                <div ref={leftEyeRef} className="w-2.5 h-2.5 bg-slate-950 rounded-full relative"><div className="w-0.5 h-0.5 bg-white rounded-full absolute top-0.5 right-0.5"></div></div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => setShowProfile(!showProfile)} className={darkMode ? "text-xs md:text-sm font-bold bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl border border-slate-700 text-purple-300" : "text-xs md:text-sm font-bold bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl border border-indigo-100 text-indigo-700"}>
              {showProfile ? "📚 عرض المنهج" : `👤 حسابي: ${studentName.split(' ')[0]}`}
            </button>
            
            {/* 🚪 زر تسجيل الخروج الإضافي والمؤمن */}
            <button 
              onClick={handleLogout} 
              className="text-xs md:text-sm font-bold bg-red-500/10 hover:bg-red-500/20 px-4 py-2 rounded-xl border border-red-500/30 text-red-400 transition-all"
            >
              🚪 خروج
            </button>

            <button onClick={() => setDarkMode(!darkMode)} className={darkMode ? "px-3 py-1.5 rounded-full bg-slate-800 text-yellow-400 text-xs font-bold border border-slate-700" : "px-3 py-1.5 rounded-full bg-white text-indigo-600 text-xs font-bold shadow-sm border border-gray-200"}>
              {darkMode ? "☀️ فاتح" : "🌙 داكن"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8">
        {!showProfile ? (
          /* ==================== واجهة المنهج ووحدات المذاكرة ==================== */
          <div className="space-y-6">
            
            {/* مؤشر تقدم الطالب التفاعلي الديناميكي */}
            <div className={darkMode ? "bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md" : "bg-white border border-gray-200 p-5 rounded-2xl shadow-sm"}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-bold">📈 مؤشر تقدمك الدراسي الفعلي:</h3>
                <span className="text-xs font-black text-purple-500">{progressPercentage}% مكتمل</span>
              </div>
              <div className={darkMode ? "w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800" : "w-full bg-gray-200 h-3 rounded-full overflow-hidden p-0.5"}>
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
              </div>
              <p className="text-[10px] text-gray-400 mt-2">تزداد النسبة تلقائياً فور مشاهدة الفيديوهات وحل الكويزات الخاصة بالمحاضرات.</p>
            </div>

            <div className="text-lg font-black flex items-center gap-2"><span>📚</span> الوحدات الدراسية المتاحة:</div>

            <div className="space-y-3">
              {units.map((unit) => {
                const isOpen = activeUnit === unit.id;
                return (
                  <div key={unit.id} className={darkMode ? `border rounded-xl transition-all ${isOpen ? 'bg-slate-900 border-purple-600' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'}` : `border rounded-xl transition-all ${isOpen ? 'bg-white border-indigo-600 shadow-sm' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                    
                    <button onClick={() => setActiveUnit(isOpen ? null : unit.id)} className="w-full p-4 flex justify-between items-center focus:outline-none">
                      <span className="font-black text-base tracking-wide">{unit.title}</span>
                      <span className={darkMode ? "text-gray-400 text-xs" : "text-gray-500 text-xs"}>{isOpen ? "▲ قفل" : "▼ عرض المحاضرات"}</span>
                    </button>

                    {isOpen && (
                      <div className={darkMode ? "p-4 border-t border-slate-800 bg-slate-950/50 rounded-b-xl space-y-4" : "p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl space-y-4"}>
                        {unit.lectures.map((lec) => {
                          const isVideoOpen = playingVideo.unitId === unit.id && playingVideo.lecId === lec.id;
                          const hasWatched = watchedVideos[`${unit.id}-${lec.id}`];
                          const hasQuizDone = completedQuizzes[`${unit.id}-${lec.id}`];

                          return (
                            <div key={lec.id} className={darkMode ? "p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3" : "p-4 bg-white border border-gray-200 rounded-xl space-y-3"}>
                              
                              <div className="flex justify-between items-center">
                                <h5 className="font-bold text-sm text-purple-400 flex items-center gap-2">
                                  {lec.name} 
                                  {hasWatched && <span className="text-xs text-green-400 font-normal">(✔️ تم المشاهدة)</span>}
                                </h5>
                                
                                <button 
                                  onClick={() => isVideoOpen ? setPlayingVideo({ unitId: null, lecId: null }) : handlePlayVideo(unit.id, lec.id)}
                                  className="text-xs font-bold px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-sm"
                                >
                                  {isVideoOpen ? "⏹️ إغلاق المشغل" : "▶️ تشغيل الفيديو"}
                                </button>
                              </div>

                              {isVideoOpen && (
                                <div className="w-full aspect-video rounded-xl overflow-hidden bg-black border border-slate-800 my-2 shadow-inner">
                                  <video src={lec.videoUrl} controls controlsList="nodownload" className="w-full h-full object-contain">
                                    متصفحك لا يدعم تشغيل هذا الفيديو.
                                  </video>
                                </div>
                              )}
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                <button 
                                  onClick={() => handleQuizClick(unit.id, lec.id, lec.name)} 
                                  className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-bold transition-all border ${
                                    hasQuizDone 
                                      ? 'bg-green-500/10 border-green-500/40 text-green-400' 
                                      : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                                  }`}
                                >
                                  📝 {hasQuizDone ? "تم حل الكويز بنجاح ✓" : `كويز ${lec.name}`}
                                </button>
                                
                                <button 
                                  onClick={() => alert(`📂 جاري تحميل ملف الـ PDF الخاص بـ: ${lec.name}`)} 
                                  className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-bold bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-all"
                                >
                                  📂 ملف PDF الخاص بالمحاضرة
                                </button>
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ==================== شاشة البيانات الشخصية وتغيير الباسورد ==================== */
          <div className={darkMode ? "bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl shadow-xl space-y-6" : "bg-white border border-gray-200 p-6 md:p-8 rounded-2xl shadow-md space-y-6"}>
            <div>
              <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">👤 الملف الشخصي وبيانات الطالب</h2>
              <p className="text-xs text-gray-400 mt-1">تأكد من مراجعة بياناتك المسجلة أو تحديث كلمة المرور الخاصة بك بحرية تامّة.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className={darkMode ? "p-4 bg-slate-950 border border-slate-800 rounded-xl text-center" : "p-4 bg-gray-50 border border-gray-200 rounded-xl text-center"}>
                <span className="text-xs text-gray-400 block mb-1">الاسم بالكامل</span>
                <span className="text-sm font-bold">{studentName}</span>
              </div>
              <div className={darkMode ? "p-4 bg-slate-950 border border-slate-800 rounded-xl text-center" : "p-4 bg-gray-50 border border-gray-200 rounded-xl text-center"}>
                <span className="text-xs text-gray-400 block mb-1">رقم الهاتف المسجل</span>
                <span className="text-sm font-bold" dir="ltr">{studentPhone}</span>
              </div>
              <div className={darkMode ? "p-4 bg-slate-950 border border-slate-800 rounded-xl text-center" : "p-4 bg-gray-50 border border-gray-200 rounded-xl text-center"}>
                <span className="text-xs text-gray-400 block mb-1">الصف الدراسي</span>
                <span className="text-sm font-bold">{studentStage || "الصف الثالث الثانوي"}</span>
              </div>
            </div>
            <form onSubmit={handlePasswordChange} className="border-t border-slate-800/60 pt-6 space-y-4">
              <h4 className="text-sm font-black text-purple-400">🔒 تعديل كلمة المرور بأمان:</h4>
              {passMessage.text && (
                <div className={passMessage.type === 'success' ? "p-3 rounded-xl text-center text-xs font-bold border bg-green-950/60 border-green-800 text-green-400" : "p-3 rounded-xl text-center text-xs font-bold border bg-red-950/60 border-red-800 text-red-400"}>
                  {passMessage.text}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 block">كلمة المرور الحالية</label>
                  <input type="password" required value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="••••••••" className={darkMode ? "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-purple-500 outline-none" : "w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none"} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 block">كلمة المرور الجديدة</label>
                  <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className={darkMode ? "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-purple-500 outline-none" : "w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none"} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 block">تأكيد المرور الجديدة</label>
                  <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className={darkMode ? "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-purple-500 outline-none" : "w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none"} />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs transition-all shadow-md">
                  حفظ وتحديث كلمة المرور الجديدة 🔐
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}