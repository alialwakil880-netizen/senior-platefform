"use client";

import React, { useState, useEffect, useRef } from 'react';
import { db } from '@/firebase'; // استدعاء ملف الربط الجديد
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';

export default function AuthPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [isLogin, setIsLogin] = useState(false);
  
  // بيانات إنشاء الحساب
  const [fullName, setFullName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  // بيانات تسجيل الدخول
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [message, setMessage] = useState({ type: '', text: '' });
  
  const leftEyeRef = useRef(null);
  const rightEyeRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (event) => {
      const eyes = [leftEyeRef.current, rightEyeRef.current];
      eyes.forEach((eye) => {
        if (!eye) return;
        const rect = eye.getBoundingClientRect();
        const eyeX = rect.left + rect.width / 2;
        const eyeY = rect.top + rect.height / 2;
        const angle = Math.atan2(event.clientY - eyeY, event.clientX - eyeX);
        const maxDistance = 8; 
        const x = Math.cos(angle) * maxDistance;
        const y = Math.sin(angle) * maxDistance;
        eye.style.transform = `translate(${x}px, ${y}px)`;
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleForgotPassword = () => {
    const whatsappText = encodeURIComponent("يا مستر علي، أنا نسيت كلمة المرور الخاصة بي على منصة SENIOR ومحتاج أعدلها.");
    const whatsappUrl = `https://wa.me/201068705721?text=${whatsappText}`;
    window.open(whatsappUrl, '_blank');
  };

  // إنشاء حساب حقيقي داخل قاعدة بيانات الفايربيس
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!selectedStage) { 
      setMessage({ type: 'error', text: 'يرجى اختيار الصف الدراسي!' }); 
      return; 
    }

    try {
      // التحقق الفعلي من السيرفر إذا كان رقم الهاتف مسجل من قبل
      const studentDocRef = doc(db, "students", studentPhone);
      const studentSnap = await getDoc(studentDocRef);

      if (studentSnap.exists()) {
        setMessage({ 
          type: 'error', 
          text: 'عذراً، رقم هاتف الطالب هذا مسجل به حساب بالفعل! لا يمكن إنشاء أكثر من حساب بنفس الرقم.' 
        });
        return;
      }

      // رفع بيانات الطالب للفايربيس بالكامل
      await setDoc(studentDocRef, {
        fullName: fullName,
        studentPhone: studentPhone,
        parentPhone: parentPhone,
        stageId: selectedStage,
        password: registerPassword,
        createdAt: new Date().toISOString()
      });
      
      setMessage({ type: 'success', text: 'تم إنشاء حسابك بنجاح على السيرفر! جاري تحويلك لصفحة تسجيل الدخول...' });
      setTimeout(() => { setIsLogin(true); setMessage({ type: '', text: '' }); }, 2000);

    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء الاتصال بالسيرفر، يرجى المحاولة لاحقاً.' });
    }
  };

  // تسجيل دخول حقيقي بالتحقق من الفايربيس السحابي
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    // تسجيل دخول الأدمن الخاص بمستر علي ثابتاً كما هو
    if (loginPhone === "01223698064" && loginPassword === "admin123") {
      setMessage({ type: 'success', text: 'أهلاً بك يا مستر علي! جاري الدخول للوحة التحكم...' });
      setTimeout(() => { window.location.href = "/admin"; }, 1500);
      return;
    }

    try {
      // جلب بيانات الطالب برقم تليفونه من السيرفر مباشرة
      const studentDocRef = doc(db, "students", loginPhone);
      const studentSnap = await getDoc(studentDocRef);

      if (studentSnap.exists()) {
        const studentData = studentSnap.data();
        // مطابقة الباسورد من السيرفر
        if (studentData.password === loginPassword) {
          setMessage({ type: 'success', text: `تم الدخول بنجاح! أهلاً بك يا ${studentData.fullName}...` });
          localStorage.setItem("current_student", JSON.stringify(studentData)); // لحفظ جلسة الدخول الحالية للوحة الطالب
          setTimeout(() => { window.location.href = `/dashboard`; }, 1500);
        } else {
          setMessage({ type: 'error', text: 'كلمة المرور غير صحيحة!' });
        }
      } else {
        setMessage({ type: 'error', text: 'الحساب غير موجود أو رقم الهاتف خاطئ!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'خطأ في الاتصال بالشبكة!' });
    }
  };

  return (
    <div className={darkMode ? "min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 transition-colors duration-300" : "min-h-screen bg-gray-50 text-slate-900 flex flex-col items-center justify-center p-4 transition-colors duration-300"} dir="rtl">
      
      <div className="absolute top-4 left-4">
        <button onClick={() => setDarkMode(!darkMode)} className={darkMode ? "px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-yellow-400 text-sm font-bold shadow-lg" : "px-4 py-2 rounded-full bg-white border border-gray-200 text-indigo-600 text-sm font-bold shadow-md"}>
          {darkMode ? "☀️ الفاتح" : "🌙 الداكن"}
        </button>
      </div>

      <div className={darkMode ? "bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full shadow-2xl space-y-4" : "bg-white border border-gray-200 p-8 rounded-2xl max-w-md w-full shadow-xl space-y-4"}>
        
        <div className="flex space-x-4 space-x-reverse justify-center items-center my-2">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center border-2 border-purple-500 shadow-inner">
            <div ref={rightEyeRef} className="w-6 h-6 bg-slate-950 rounded-full flex items-center justify-center relative"><div className="w-1.5 h-1.5 bg-white rounded-full absolute top-1 right-1"></div></div>
          </div>
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center border-2 border-purple-500 shadow-inner">
            <div ref={leftEyeRef} className="w-6 h-6 bg-slate-950 rounded-full flex items-center justify-center relative"><div className="w-1.5 h-1.5 bg-white rounded-full absolute top-1 right-1"></div></div>
          </div>
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">SENIOR PLATFORM</h1>
          <h2 className="text-lg font-bold">{isLogin ? "تسجيل الدخول للمنصة" : "إنشاء حساب طالب جديد"}</h2>
        </div>

        {message.text && (
          <div className={message.type === 'success' 
            ? "p-3 rounded-xl text-center text-xs font-bold border bg-green-950/60 border-green-800 text-green-400" 
            : "p-3 rounded-xl text-center text-xs font-bold border bg-red-950/60 border-red-800 text-red-400 animate-shake"
          }>
            {message.text}
          </div>
        )}

        {isLogin ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <input type="tel" required value={loginPhone} onChange={(e) => setLoginPhone(e.target.value)} placeholder="رقم هاتف الطالب" className={darkMode ? "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-purple-500 outline-none text-left" : "w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none text-left"} dir="ltr" />
            <input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="كلمة المرور" className={darkMode ? "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-purple-500 outline-none text-left" : "w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none text-left"} dir="ltr" />
            
            <div className="flex justify-start">
               <button type="button" onClick={handleForgotPassword} className="text-xs text-purple-400 hover:text-purple-300 underline font-bold flex items-center gap-1">
                 💬 نسيت كلمة المرور؟ تواصل واتساب
               </button>
            </div>

            <button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black py-3 rounded-xl text-sm transition-all shadow-md">
              تسجيل دخول 🚀
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="اسم الطالب رباعي" className={darkMode ? "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-purple-500 outline-none" : "w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none"} />
            <input type="tel" required value={studentPhone} onChange={(e) => setStudentPhone(e.target.value)} placeholder="رقم هاتف الطالب" className={darkMode ? "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-purple-500 outline-none text-left" : "w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none text-left"} dir="ltr" />
            <input type="tel" required value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} placeholder="رقم هاتف ولي الأمر" className={darkMode ? "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-purple-500 outline-none text-left" : "w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none text-left"} dir="ltr" />
            <select required value={selectedStage} onChange={(e) => setSelectedStage(e.target.value)} className={darkMode ? "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-purple-500 outline-none text-gray-400" : "w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none text-gray-600"}>
              <option value="">-- اختر صفك الدراسي --</option>
              <option value="prep3">الصف الثالث الإعدادي</option>
              <option value="sec1">الصف الأول الثانوي</option>
              <option value="sec2">الصف الثاني الثانوي</option>
              <option value="sec3">الصف الثالث الثانوي</option>
              <option value="bac">مرحلة البكالوريا</option>
            </select>
            <input type="password" required value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} placeholder="عين كلمة المرور للحساب" className={darkMode ? "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-purple-500 outline-none text-left" : "w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none text-left"} dir="ltr" />
            <button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black py-3 rounded-xl text-sm transition-all shadow-md mt-2">
              إنشاء الحساب والانطلاق 🚀
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-800">
          <p className="text-xs text-gray-400">
            {isLogin ? "طالب جديد بالمنصة؟" : "لديك حساب بالفعل؟"}
            <button type="button" onClick={() => { setIsLogin(!isLogin); setMessage({ type: '', text: '' }); }} className="text-purple-400 hover:text-purple-300 font-bold mr-1 underline">
              {isLogin ? "سجل كحساب جديد" : "سجل دخولك"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}