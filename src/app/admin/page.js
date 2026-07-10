"use client";

import React, { useState, useEffect, useRef } from 'react';

export default function AdminPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('content'); 
  const [selectedStage, setSelectedStage] = useState('all'); 

  // --- نظام إدارة المناهج الذكي ---
  const [contentStage, setContentStage] = useState('sec3'); 
  const [contentUnit, setContentUnit] = useState(1); 

  // إدارة أسماء الوحدات ديناميكياً لتعديلها
  const [unitNames, setUnitNames] = useState({
    prep3: Array.from({ length: 12 }, (_, i) => `Unit ${i + 1}`),
    sec1: Array.from({ length: 12 }, (_, i) => `Unit ${i + 1}`),
    sec2: Array.from({ length: 12 }, (_, i) => `Unit ${i + 1}`),
    sec3: Array.from({ length: 12 }, (_, i) => `Unit ${i + 1}`),
    bac: Array.from({ length: 12 }, (_, i) => `Unit ${i + 1}`),
  });

  const [stagesContent, setStagesContent] = useState({
    prep3: Array.from({ length: 12 }, (_, i) => ({ id: i + 1, lectures: [{ id: 1, name: "المحاضرة الأولى", video: "", pdf: "", quiz: "" }, { id: 2, name: "المحاضرة الثانية", video: "", pdf: "", quiz: "" }, { id: 3, name: "المحاضرة الثالثة", video: "", pdf: "", quiz: "" }] })),
    sec1: Array.from({ length: 12 }, (_, i) => ({ id: i + 1, lectures: [{ id: 1, name: "المحاضرة الأولى", video: "", pdf: "", quiz: "" }, { id: 2, name: "المحاضرة الثانية", video: "", pdf: "", quiz: "" }, { id: 3, name: "المحاضرة الثالثة", video: "", pdf: "", quiz: "" }] })),
    sec2: Array.from({ length: 12 }, (_, i) => ({ id: i + 1, lectures: [{ id: 1, name: "المحاضرة الأولى", video: "", pdf: "", quiz: "" }, { id: 2, name: "المحاضرة الثانية", video: "", pdf: "", quiz: "" }, { id: 3, name: "المحاضرة الثالثة", video: "", pdf: "", quiz: "" }] })),
    sec3: Array.from({ length: 12 }, (_, i) => ({ id: i + 1, lectures: [{ id: 1, name: "المحاضرة الأولى", video: "https://www.w3schools.com/html/mov_bbb.mp4", pdf: "lecture1.pdf", quiz: "https://forms.gle/sample" }, { id: 2, name: "المحاضرة الثانية", video: "", pdf: "", quiz: "" }, { id: 3, name: "المحاضرة الثالثة", video: "", pdf: "", quiz: "" }] })),
    bac: Array.from({ length: 12 }, (_, i) => ({ id: i + 1, lectures: [{ id: 1, name: "المحاضرة الأولى", video: "", pdf: "", quiz: "" }, { id: 2, name: "المحاضرة الثانية", video: "", pdf: "", quiz: "" }, { id: 3, name: "المحاضرة الثالثة", video: "", pdf: "", quiz: "" }] })),
  });

  // إدارة التعديل والمسميات والملفات
  const [editingLec, setEditingLec] = useState({ lecId: null, name: '', video: '', pdf: '', quiz: '', customUnitName: '' });

 // 1. استبدل تعريف الـ students بالسطر ده:
const [students, setStudents] = useState([]);

// 2. أضف الـ useEffect دي عشان تجيب البيانات من الفايربيس أوتوماتيك:
useEffect(() => {
  const fetchStudents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "students"));
      const studentsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(studentsList);
    } catch (error) {
      console.error("خطأ في جلب بيانات الطلاب:", error);
    }
  };
  
  fetchStudents();
}, []);

  const leftEyeRef = useRef(null);
  const rightEyeRef = useRef(null);

  // 🚪 تسجيل الخروج
  const handleLogout = () => {
    if (confirm("هل أنت متأكد أنك تريد تسجيل الخروج من لوحة الإدارة؟")) {
      localStorage.clear();
      window.location.href = "/"; 
    }
  };

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

  const handleResetPassword = (studentName) => {
    const newPass = prompt(`أدخل كلمة المرور الجديدة للطالب (${studentName}):`, "123456");
    if (newPass) alert(`🔒 تم تحديث كلمة المرور بنجاح للطالب ${studentName} لتصبح: ${newPass}`);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditingLec({ ...editingLec, pdf: file.name });
    }
  };

  const saveLectureData = (e) => {
    e.preventDefault();

    // 1. تحديث اسم الوحدة
    setUnitNames(prev => {
      const updatedStageUnits = [...prev[contentStage]];
      updatedStageUnits[contentUnit - 1] = editingLec.customUnitName || `Unit ${contentUnit}`;
      return { ...prev, [contentStage]: updatedStageUnits };
    });
    
    // 2. تحديث بيانات المحاضرة
    setStagesContent(prev => {
      const currentStageUnits = prev[contentStage];
      const updatedUnits = currentStageUnits.map(unit => {
        if (unit.id === contentUnit) {
          return {
            ...unit,
            lectures: unit.lectures.map(lec => 
              lec.id === editingLec.lecId ? { ...lec, name: editingLec.name, video: editingLec.video, pdf: editingLec.pdf, quiz: editingLec.quiz } : lec
            )
          };
        }
        return unit;
      });
      return { ...prev, [contentStage]: updatedUnits };
    });

    alert(`✔️ تم حفظ التعديلات وتحديث البيانات بنجاح!`);
    setEditingLec({ lecId: null, name: '', video: '', pdf: '', quiz: '', customUnitName: '' });
  };

  const filteredStudents = selectedStage === 'all' ? students : students.filter(s => s.stage === selectedStage);

  function getStageLabel(key) {
    const labels = { prep3: "تالتة إعدادي", sec1: "أولى ثانوي", sec2: "تانية ثانوي", sec3: "تالتة ثانوي", bac: "بكالوريا" };
    return labels[key] || "مرحلة تعليمية";
  }

  const currentLectures = stagesContent[contentStage]?.find(u => u.id === parseInt(contentUnit))?.lectures || [];
  const currentUnitTitle = unitNames[contentStage]?.[contentUnit - 1] || `Unit ${contentUnit}`;

  return (
    <div className={darkMode ? "min-h-screen bg-slate-950 text-slate-100 pb-12 transition-colors duration-300" : "min-h-screen bg-gray-50 text-slate-900 pb-12 transition-colors duration-300"} dir="rtl">
      
      <header className={darkMode ? "bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-md" : "bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm"}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">
              SENIOR ADMIN PANEL
            </h1>
            <div className="flex space-x-1 space-x-reverse items-center hidden sm:flex">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center border border-amber-500">
                <div ref={rightEyeRef} className="w-2 h-2 bg-slate-950 rounded-full relative"></div>
              </div>
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center border border-amber-500">
                <div ref={leftEyeRef} className="w-2 h-2 bg-slate-950 rounded-full relative"></div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-black bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1.5 rounded-xl hidden md:inline-block">
              👑 التحكم المباشر: مستر علي الوكيل
            </span>
            
            <button 
              onClick={handleLogout}
              className="px-4 py-1.5 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold transition-all"
            >
              🚪 تسجيل الخروج
            </button>

            <button onClick={() => setDarkMode(!darkMode)} className={darkMode ? "px-3 py-1.5 rounded-full bg-slate-800 text-yellow-400 text-xs font-bold border border-slate-700" : "px-3 py-1.5 rounded-full bg-white text-indigo-600 text-xs font-bold shadow-sm border border-gray-200"}>
              {darkMode ? "☀️ فاتح" : "🌙 داكن"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        
        <div className="flex gap-2 border-b border-slate-800 pb-4 mb-6">
          <button onClick={() => setActiveTab('content')} className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'content' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-900/40 border border-slate-800 hover:bg-slate-800'}`}>
            📚 رفع وتحديث المناهج الذكي
          </button>
          <button onClick={() => setActiveTab('students')} className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'students' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-900/40 border border-slate-800 hover:bg-slate-800'}`}>
            👥 إدارة الطلاب ومتابعة الدرجات
          </button>
        </div>

        {activeTab === 'content' && (
          <div className="space-y-6">
            
            <div className={darkMode ? "p-5 bg-slate-900 border border-slate-800 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4" : "p-5 bg-white border border-gray-200 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4 shadow-sm"}>
              <div className="space-y-2">
                <label className="text-xs font-black text-amber-400 block">1️⃣ اختر الصف الدراسي المستهدف:</label>
                <select value={contentStage} onChange={(e) => { setContentStage(e.target.value); setEditingLec({ lecId: null, name: '', video: '', pdf: '', quiz: '', customUnitName: '' }); }} className={darkMode ? "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs outline-none font-bold text-slate-200 focus:border-amber-500" : "w-full bg-gray-100 border border-gray-300 rounded-xl px-3 py-2.5 text-xs outline-none font-bold text-slate-800 focus:border-indigo-500"}>
                  <option value="prep3">الصف الثالث الإعدادي</option>
                  <option value="sec1">الصف الأول الثانوي</option>
                  <option value="sec2">الصف الثاني الثانوي</option>
                  <option value="sec3">الصف الثالث الثانوي</option>
                  <option value="bac">مرحلة البكالوريا</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-amber-400 block">2️⃣ اختر رقم الوحدة (Unit):</label>
                <select value={contentUnit} onChange={(e) => { setContentUnit(parseInt(e.target.value)); setEditingLec({ lecId: null, name: '', video: '', pdf: '', quiz: '', customUnitName: '' }); }} className={darkMode ? "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs outline-none font-bold text-slate-200 focus:border-amber-500" : "w-full bg-gray-100 border border-gray-300 rounded-xl px-3 py-2.5 text-xs outline-none font-bold text-slate-800 focus:border-indigo-500"}>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i+1} value={i+1}>Unit {i+1} ({unitNames[contentStage][i]})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              
              <div className="md:col-span-2 space-y-3">
                <div className="text-xs font-black text-gray-400">
                  📍 المنهج الحالي المعروض: <span className="text-purple-400 font-bold">{getStageLabel(contentStage)}</span> - <span className="text-amber-400 font-bold">{currentUnitTitle}</span>
                </div>
                
                {currentLectures.map((lec) => (
                  <div key={lec.id} className={darkMode ? "p-4 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center" : "p-4 bg-white border border-gray-200 rounded-xl flex justify-between items-center shadow-sm"}>
                    <div className="space-y-1">
                      <div className="font-bold text-sm text-slate-100">{lec.name}</div>
                      <div className="text-[11px] text-gray-400 flex flex-wrap gap-x-3">
                        <span>📹 فيديو: {lec.video ? "✅ مرفوع" : "❌ فارغ"}</span>
                        <span>📝 كويز: {lec.quiz ? "✅ مضاف" : "❌ فارغ"}</span>
                        <span>📂 PDF: {lec.pdf ? "✅ متوفر" : "❌ فارغ"}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setEditingLec({ lecId: lec.id, name: lec.name, video: lec.video, pdf: lec.pdf, quiz: lec.quiz, customUnitName: currentUnitTitle })}
                      className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-400 hover:bg-amber-500/20 font-bold text-xs transition-all"
                    >
                      ✏️ تعديل الروابط والمسميات
                    </button>
                  </div>
                ))}
              </div>

              {/* صندوق التحكم والمزامنة */}
              <div className={darkMode ? "bg-slate-900 border border-purple-900/40 p-5 rounded-2xl shadow-xl sticky top-24 space-y-4" : "bg-white border border-gray-300 p-5 rounded-2xl shadow-md sticky top-24 space-y-4"}>
                <div>
                  <h4 className="text-xs font-black text-purple-400">⚡ صندوق التحكم والمزامنة</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">ارفع محتوى الفيديو والكويزات والملفات لتظهر تلقائياً للطلاب.</p>
                </div>

                {editingLec.lecId ? (
                  <form onSubmit={saveLectureData} className="space-y-4">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-[11px] font-bold text-amber-400">
                      تعديل: {getStageLabel(contentStage)} - {currentUnitTitle}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-400 block">✏️ تعديل اسم / عنوان الوحدة</label>
                      <input type="text" value={editingLec.customUnitName} onChange={(e) => setEditingLec({...editingLec, customUnitName: e.target.value})} placeholder="مثال: الوحدة الأولى: قواعد الأزمنة" className={darkMode ? "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-amber-500" : "w-full bg-gray-100 border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500"} />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-400 block">✏️ تعديل اسم / عنوان المحاضرة</label>
                      <input type="text" value={editingLec.name} onChange={(e) => setEditingLec({...editingLec, name: e.target.value})} placeholder="مثال: المحاضرة الأولى: قواعد" className={darkMode ? "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-amber-500" : "w-full bg-gray-100 border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500"} />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-400 block">🔗 رابط محاضرة الفيديو (Direct/YouTube/Vimeo)</label>
                      <input type="text" value={editingLec.video} onChange={(e) => setEditingLec({...editingLec, video: e.target.value})} placeholder="https://..." className={darkMode ? "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-left outline-none focus:border-amber-500" : "w-full bg-gray-100 border border-gray-300 rounded-xl px-3 py-2 text-xs text-left outline-none focus:border-indigo-500"} dir="ltr" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-400 block">📝 رابط الكويز الإلكتروني (Google Forms / Quiz)</label>
                      <input type="text" value={editingLec.quiz} onChange={(e) => setEditingLec({...editingLec, quiz: e.target.value})} placeholder="https://forms.gle/..." className={darkMode ? "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-left outline-none focus:border-amber-500" : "w-full bg-gray-100 border border-gray-300 rounded-xl px-3 py-2 text-xs text-left outline-none focus:border-indigo-500"} dir="ltr" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-400 block">📂 ملف الـ PDF الخاص بالمحاضرة</label>
                      <div className="relative">
                        <input 
                          type="file" 
                          accept=".pdf" 
                          id="pdf-upload"
                          onChange={handleFileChange} 
                          className="hidden" 
                        />
                        <label 
                          htmlFor="pdf-upload" 
                          className={darkMode 
                            ? "w-full bg-slate-950 border border-slate-800 hover:border-amber-500/60 rounded-xl px-4 py-3 text-xs flex items-center justify-between cursor-pointer transition-all text-slate-300" 
                            : "w-full bg-gray-100 border border-gray-300 hover:border-indigo-500/60 rounded-xl px-4 py-3 text-xs flex items-center justify-between cursor-pointer transition-all text-slate-700"
                          }
                        >
                          <span className="truncate max-w-[180px]">
                            {editingLec.pdf ? `📄 ${editingLec.pdf}` : "اضغط هنا لاختيار ملف PDF من جهازك"}
                          </span>
                          <span className="bg-amber-500/10 text-amber-400 px-2 py-1 rounded-md text-[10px] border border-amber-500/20 font-black">
                            {editingLec.pdf ? "تغيير الملف" : "تصفح الكمبيوتر"}
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2 rounded-xl text-xs transition-all shadow-sm">
                        حفظ ونشر الآن ✓
                      </button>
                      <button type="button" onClick={() => setEditingLec({ lecId: null, name: '', video: '', pdf: '', quiz: '', customUnitName: '' })} className="px-3 py-2 bg-slate-800 text-slate-200 text-xs font-bold rounded-xl border border-slate-700">
                        إلغاء
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-12 text-xs font-bold text-gray-500 border border-dashed border-slate-800 rounded-xl">
                    💡 اضغط على زر "✏️ تعديل الروابط والمسميات" بجانب أي محاضرة لتعديل الفيديوهات، الكويزات، والأسماء فوراً.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-bold text-gray-400">تصفية حسب المرحلة:</span>
              {['all', 'prep3', 'sec1', 'sec2', 'sec3', 'bac'].map((stage) => (
                <button key={stage} onClick={() => setSelectedStage(stage)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedStage === stage ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'}`}>
                  {stage === 'all' ? "🌍 الكل" : getStageLabel(stage)}
                </button>
              ))}
            </div>

            <div className={darkMode ? "bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl" : "bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"}>
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className={darkMode ? "bg-slate-950 border-b border-slate-800 text-gray-400 text-xs font-bold" : "bg-gray-100 border-b border-gray-200 text-gray-600 text-xs font-bold"}>
                      <th className="p-4">اسم الطالب رباعي</th>
                      <th className="p-4">رقم الهاتف</th>
                      <th className="p-4">الصف الدراسي</th>
                      <th className="p-4">نسبة التقدم الدراسي</th>
                      <th className="p-4">آخر كويز حله</th>
                      <th className="p-4 text-center">إجراءات الأمان</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-medium divide-y divide-slate-800/60">
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className={darkMode ? "hover:bg-slate-950/40" : "hover:bg-gray-50"}>
                        <td className="p-4 font-bold">{student.name}</td>
                        <td className="p-4" dir="ltr">{student.phone}</td>
                        <td className="p-4"><span className="px-2 py-1 rounded bg-purple-500/10 text-purple-400 font-bold">{getStageLabel(student.stage)}</span></td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden"><div className="bg-green-500 h-full" style={{ width: `${student.progress}%` }}></div></div>
                            <span>{student.progress}%</span>
                          </div>
                        </td>
                        <td className="p-4 text-amber-400 font-bold">{student.lastQuiz}</td>
                        <td className="p-4 text-center">
                          <button onClick={() => handleResetPassword(student.name)} className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all font-bold">
                            🔑 تعديل الباسورد
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}