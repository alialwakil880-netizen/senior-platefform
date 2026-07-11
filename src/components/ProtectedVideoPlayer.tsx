"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ShieldCheck,
  Lock,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  RotateCw,
  Zap,
  Settings,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface ProtectedVideoPlayerProps {
  videoId: string;
  lectureTitle: string;
  studentName?: string;
  studentPhone?: string;
  darkMode?: boolean;
}

export default function ProtectedVideoPlayer({
  videoId,
  lectureTitle,
  studentName = "طالب المنصة",
  studentPhone = "",
  darkMode = true,
}: ProtectedVideoPlayerProps) {
  const { t, lang } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // شريط التقديم والتأخير ومؤشر الوقت
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  // التحكم في السرعة والجودة
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [playbackQuality, setPlaybackQuality] = useState<string>("auto");
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  const [showQualityMenu, setShowQualityMenu] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerInstanceRef = useRef<any>(null);

  // تهيئة مشغل يوتيوب عبر Iframe API للتحكم الدقيق بالوقت والسرعة والجودة
  useEffect(() => {
    let intervalId: any;

    const initPlayer = () => {
      if (!(window as any).YT || !(window as any).YT.Player) {
        setTimeout(initPlayer, 250);
        return;
      }

      const yt = (window as any).YT;
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy();
        } catch (e) {}
      }

      playerInstanceRef.current = new yt.Player(`yt-player-${videoId}`, {
        videoId: videoId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          playsinline: 1,
          enablejsapi: 1,
        },
        events: {
          onReady: (event: any) => {
            const player = event.target;
            const dur = player.getDuration();
            if (dur && dur > 0) setDuration(dur);

            intervalId = setInterval(() => {
              if (player && player.getCurrentTime) {
                const curr = player.getCurrentTime();
                const total = player.getDuration();
                if (curr !== undefined) setCurrentTime(curr);
                if (total !== undefined && total > 0) setDuration(total);
              }
            }, 500);
          },
          onStateChange: (event: any) => {
            // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
            if (event.data === 1) {
              setIsPaused(false);
              setIsPlaying(true);
            } else if (event.data === 2 || event.data === 0) {
              setIsPaused(true);
            }
          },
        },
      });
    };

    if (!(window as any).YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    } else {
      initPlayer();
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy();
        } catch (e) {}
      }
    };
  }, [videoId]);

  // منع زر الفأرة الأيمن ونسخ الرابط
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  // إرسال أوامر تحكم مخصصة لليوتيوب (postMessage API أو عبر الكائن مباشرة)
  const sendCommand = (command: string, args: any = "") => {
    if (playerInstanceRef.current && typeof playerInstanceRef.current[command] === "function") {
      try {
        if (Array.isArray(args)) {
          playerInstanceRef.current[command](...args);
        } else if (args !== "") {
          playerInstanceRef.current[command](args);
        } else {
          playerInstanceRef.current[command]();
        }
        return;
      } catch (e) {}
    }

    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: "command",
          func: command,
          args: args,
        }),
        "*"
      );
    }
  };

  const togglePlay = () => {
    if (isPaused) {
      sendCommand("playVideo");
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      sendCommand("pauseVideo");
      setIsPaused(true);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      sendCommand("unMute");
      setIsMuted(false);
    } else {
      sendCommand("mute");
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // تقديم وتأخير 10 ثوانٍ
  const seekRelative = (deltaSeconds: number) => {
    const newTime = Math.max(0, Math.min(duration || 9999, currentTime + deltaSeconds));
    setCurrentTime(newTime);
    if (playerInstanceRef.current && playerInstanceRef.current.seekTo) {
      playerInstanceRef.current.seekTo(newTime, true);
    } else {
      sendCommand("seekTo", [newTime, true]);
    }
  };

  // التمرير عبر شريط الوقت (Scrubber Bar)
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (playerInstanceRef.current && playerInstanceRef.current.seekTo) {
      playerInstanceRef.current.seekTo(newTime, true);
    } else {
      sendCommand("seekTo", [newTime, true]);
    }
  };

  // التحكم في السرعة (1x, 1.25x, 1.5x...)
  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
    if (playerInstanceRef.current && playerInstanceRef.current.setPlaybackRate) {
      playerInstanceRef.current.setPlaybackRate(rate);
    } else {
      sendCommand("setPlaybackRate", rate);
    }
  };

  // التحكم في جودة الفيديو (1080p, 720p, 480p...)
  const handleQualityChange = (qualityKey: string) => {
    setPlaybackQuality(qualityKey);
    setShowQualityMenu(false);
    if (playerInstanceRef.current && playerInstanceRef.current.setPlaybackQuality) {
      playerInstanceRef.current.setPlaybackQuality(qualityKey);
    } else {
      sendCommand("setPlaybackQuality", qualityKey);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      ref={containerRef}
      className="space-y-2.5 select-none"
      onContextMenu={handleContextMenu}
      onDragStart={(e) => e.preventDefault()}
    >
      <div
        className={`relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border ${
          darkMode ? "border-slate-800 shadow-2xl" : "border-slate-300 shadow-xl"
        } group`}
        onContextMenu={handleContextMenu}
      >
        {/* 1. حاوية الفيديو مع تكبير وإزاحة لحجب وقص أي حافة أو شريط يوتيوب علوي/سفلي تماماً (Cropping Container) */}
        <div className="absolute -top-14 -bottom-14 -left-6 -right-6 pointer-events-auto z-0 overflow-hidden bg-black">
          <div id={`yt-player-${videoId}`} className="w-full h-full border-0 absolute inset-0"></div>
          {/* نسخة احتياطية في حال تأخر تحميل Iframe API */}
          <iframe
            ref={iframeRef}
            src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&controls=0&disablekb=1&fs=0&iv_load_policy=3&playsinline=1&enablejsapi=1`}
            title={lectureTitle}
            className="w-full h-full border-0 absolute inset-0 -z-10 opacity-0 pointer-events-none"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen={false}
          ></iframe>
        </div>

        {/* 2. شريط الحماية العلوي الصلب (Solid Top Bar) - يغطي الجزء العلوي تماماً ويخفي أي أثر للعنوان أو القناة */}
        <div
          className="absolute top-0 left-0 right-0 h-[64px] bg-slate-950 border-b border-slate-800/90 z-20 flex items-center justify-between px-4 sm:px-6 pointer-events-auto shadow-md"
          onContextMenu={handleContextMenu}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 max-w-[70%] overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className={`overflow-hidden ${lang === "ar" ? "text-right" : "text-left"}`}>
              <div className="text-xs sm:text-sm font-black text-slate-100 truncate tracking-tight">
                {lectureTitle}
              </div>
              <div className="text-[10px] text-amber-400 font-bold flex items-center gap-1.5 mt-0.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                <span>{t.player.securityWarning}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-[11px] font-bold text-slate-300">
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden sm:inline">{t.player.watermarkStudent}</span>
            <span className="font-mono text-purple-300 dir-ltr truncate max-w-[110px]">
              {studentName.split(" ")[0]}
            </span>
          </div>
        </div>

        {/* 3. شريط التقديم والتأخير الزمني (Interactive Timeline Scrubber Bar) */}
        <div
          className="absolute bottom-[58px] left-0 right-0 h-4 bg-slate-950/80 z-30 px-4 sm:px-6 flex items-center gap-3 pointer-events-auto backdrop-blur-sm border-t border-slate-800/60"
          onContextMenu={handleContextMenu}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-[10px] font-mono text-purple-300 shrink-0 font-bold dir-ltr">
            {formatTime(currentTime)}
          </span>
          <div className="relative flex-1 flex items-center">
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="1"
              value={currentTime}
              onChange={handleSeekChange}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-amber-400 focus:outline-none transition-all"
            />
          </div>
          <span className="text-[10px] font-mono text-slate-400 shrink-0 font-bold dir-ltr">
            {formatTime(duration)}
          </span>
        </div>

        {/* 4. شريط الحماية والتحكم السفلي المخصص (Custom SENIOR Control Bar) - مع أزرار الإعادة والسرعة والجودة */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[58px] bg-slate-950 border-t border-slate-800/90 z-20 flex items-center justify-between px-3 sm:px-6 pointer-events-auto shadow-xl"
          onContextMenu={handleContextMenu}
          onClick={(e) => e.stopPropagation()}
        >
          {/* الجانب الأيمن: أزرار التشغيل والإعادة 10 ثوانٍ + الصوت */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <button
              onClick={togglePlay}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center transition-all shadow-md active:scale-95 shrink-0"
              title={isPaused ? "Play" : "Pause"}
            >
              {isPaused ? <Play className="w-5 h-5 ml-0.5" /> : <Pause className="w-5 h-5" />}
            </button>

            {/* زر تأخير 10 ثوانٍ */}
            <button
              onClick={() => seekRelative(-10)}
              className="px-2.5 sm:px-3 h-9 sm:h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1 transition-all active:scale-95 text-xs font-bold"
              title="-10s"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-mono dir-ltr">-10s</span>
            </button>

            {/* زر تقديم 10 ثوانٍ */}
            <button
              onClick={() => seekRelative(10)}
              className="px-2.5 sm:px-3 h-9 sm:h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1 transition-all active:scale-95 text-xs font-bold"
              title="+10s"
            >
              <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-mono dir-ltr">+10s</span>
            </button>

            {/* زر الصوت */}
            <button
              onClick={toggleMute}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center justify-center transition-all shrink-0"
              title={isMuted ? t.player.unmuteTitle : t.player.muteTitle}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-purple-400" />}
            </button>
          </div>

          {/* الجانب الأيسر: قوائم السرعة والجودة وتكبير الشاشة */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 relative">
            {/* قائمة التحكم في سرعة الفيديو */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSpeedMenu(!showSpeedMenu);
                  setShowQualityMenu(false);
                }}
                className="px-3 h-9 sm:h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5 transition-all text-xs font-bold"
                title={t.player.speedTitle}
              >
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                <span className="font-mono dir-ltr text-[11px]">{playbackRate}x</span>
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-12 left-0 w-36 bg-slate-900 border border-slate-700 rounded-2xl p-1.5 shadow-2xl z-50 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 px-2.5 py-1 border-b border-slate-800 text-right">
                    {t.player.speedTitle}:
                  </div>
                  {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handleSpeedChange(rate)}
                      className={`w-full text-right px-3 py-1.5 rounded-xl text-xs font-bold flex justify-between items-center transition-all ${
                        playbackRate === rate
                          ? "bg-purple-600 text-white font-black shadow-md"
                          : "text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <span>{rate === 1 ? (lang === "ar" ? "عادي (1x)" : "Normal (1x)") : `${rate}x`}</span>
                      {playbackRate === rate && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* قائمة التحكم في جودة الفيديو */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowQualityMenu(!showQualityMenu);
                  setShowSpeedMenu(false);
                }}
                className="px-3 h-9 sm:h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5 transition-all text-xs font-bold"
                title={t.player.qualityTitle}
              >
                <Settings className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px]">
                  {playbackQuality === "hd1080"
                    ? "1080p HD"
                    : playbackQuality === "hd720"
                    ? "720p HD"
                    : playbackQuality === "large"
                    ? "480p"
                    : playbackQuality === "medium"
                    ? "360p"
                    : (lang === "ar" ? "تلقائي" : "Auto")}
                </span>
              </button>

              {showQualityMenu && (
                <div className="absolute bottom-12 left-0 w-44 bg-slate-900 border border-slate-700 rounded-2xl p-1.5 shadow-2xl z-50 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 px-2.5 py-1 border-b border-slate-800 text-right">
                    {t.player.qualityTitle}:
                  </div>
                  {[
                    { key: "auto", label: lang === "ar" ? "تلقائي (Auto)" : "Auto" },
                    { key: "hd1080", label: "1080p Full HD 🌟" },
                    { key: "hd720", label: "720p HD ⚡" },
                    { key: "large", label: "480p SD" },
                    { key: "medium", label: lang === "ar" ? "360p (توفير الباقة)" : "360p (Data Saver)" },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => handleQualityChange(item.key)}
                      className={`w-full text-right px-3 py-1.5 rounded-xl text-xs font-bold flex justify-between items-center transition-all ${
                        playbackQuality === item.key
                          ? "bg-amber-500 text-slate-950 font-black shadow-md"
                          : "text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <span>{item.label}</span>
                      {playbackQuality === item.key && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* زر شارة المنصة (مختفي على الشاشات الصغيرة لتوفير المساحة) */}
            <div className="hidden md:flex items-center gap-1.5 text-[11px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>{lang === "ar" ? "مشغل سينيور التفاعلي (HD)" : "SENIOR Interactive HD"}</span>
            </div>

            {/* زر تكبير الشاشة */}
            <button
              onClick={toggleFullscreen}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center justify-center transition-all shrink-0"
              title={t.player.fullscreenTitle}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 5. العلامة المائية المتحركة (Watermark Overlay) */}
        <div className="absolute top-20 right-6 z-10 pointer-events-none opacity-30 select-none transition-opacity duration-500">
          <div className="bg-slate-900/95 border border-slate-700 px-3 py-1.5 rounded-xl text-[11px] font-bold text-slate-300 flex items-center gap-2 shadow-lg">
            <span className="text-amber-400">🎓 {t.player.watermarkStudent}</span>
            <span>{studentName}</span>
            <span className="font-mono dir-ltr text-[10px] text-purple-300">({studentPhone})</span>
          </div>
        </div>

        {/* 6. غطاء البدء الأولي (Start Overlay) قبل التشغيل */}
        {!isPlaying && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 bg-slate-950/95 z-30 flex flex-col items-center justify-center text-center p-6 space-y-4 cursor-pointer backdrop-blur-md group-hover:bg-slate-950/90 transition-all"
          >
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600 to-amber-500 flex items-center justify-center shadow-2xl text-white animate-pulse transition-transform group-hover:scale-105">
              <Play className="w-10 h-10 fill-white ml-1" />
            </div>
            <div>
              <h4 className="text-lg sm:text-xl font-black text-slate-100">{lectureTitle}</h4>
              <p className="text-xs text-amber-400 font-bold mt-1.5 flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>{t.player.startWatch}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
