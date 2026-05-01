/* eslint-disable react-hooks/purity */
// ============================================================
// 🏦 بنك الجيل الواعد - واجهة الترحيب (React + Tailwind CSS)
// 📁 ملف واحد: WelcomePage.tsx
// 📝 جميع الحقوق محفوظة - تصميم باستيل أزرق مع تأثيرات زجاجية
// ============================================================
// import bgImage from "./assest/bg.png"; // أو المسار الصحيح

import React, { useMemo, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// ============================================================
// 🎨 تعريف متغيرات CSS العامة (Custom Properties)
//    تُستخدم للألوان الباستيل والنظام اللوني الموحد
// ============================================================
const CSS_VARIABLES = `
  :root {
    /* --- 🎨 لوحة الألوان الباستيل الزرقاء --- */
    --blue-glass-light: rgba(205, 230, 250, 0.55);
    --blue-glass-mid: rgba(175, 212, 240, 0.4);
    --blue-glass-border: rgba(110, 175, 215, 0.65);
    --blue-glow: rgba(90, 170, 220, 0.5);
    --blue-deep: #2c6e9e;
    --white-pure: #ffffff;
    --text-dark: #1e3a4d;
    --text-muted: #467a9e;
    --shadow-soft: 0 12px 40px rgba(60, 120, 160, 0.2);
    --shadow-glow: 0 0 35px rgba(70, 165, 215, 0.45);

    /* --- 🎨 تدرجات الأزرار --- */
    --child-btn-gradient: linear-gradient(
      135deg,
      #ff6b8a, #ff8e53, #ffb347, #ffd166,
      #a0e7a0, #6ec6f5, #c77dff
    );
    --child-btn-hover: linear-gradient(
      135deg,
      #ff5278, #ff7a3a, #ffa52e, #ffc94d,
      #88dd88, #55b8f0, #b966ff
    );

    --parent-btn-gradient: linear-gradient(
      135deg, #136b9c, #1c7cb3, #2a8fc9, #3aa2df
    );
    --parent-btn-hover: linear-gradient(
      135deg, #0f5a86, #166c9e, #1f7fb5, #2c90ca
    );
  }
`;

// ============================================================
// 🎬 تعريف جميع حركات الأنيميشن (Keyframes)
// ============================================================
const KEYFRAMES_CSS = `
  @keyframes glowPulseBlue {
    0%, 100% { opacity: 0.55; transform: translateX(-50%) scale(1); }
    50% { opacity: 0.9; transform: translateX(-50%) scale(1.12); }
  }

  @keyframes characterFloat {
    0%, 100% { transform: translate(-50%, -75%) translateY(0); }
    40% { transform: translate(-50%, -75%) translateY(-9px); }
    70% { transform: translate(-50%, -75%) translateY(-4px); }
  }

  @keyframes dotPulseBlue {
    0%, 100% { transform: scale(1); opacity: 0.7; }
    50% { transform: scale(1.6); opacity: 1; background: #2c8bcb; }
  }

  @keyframes shimmerMove {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes floatSoft1 {
    0% { transform: translateY(0) translateX(0) scale(0.7); opacity: 0; }
    12% { opacity: 0.8; transform: translateY(-8vh) translateX(10px) scale(0.85); }
    50% { opacity: 0.75; transform: translateY(-55vh) translateX(-15px) scale(1); }
    82% { opacity: 0.5; transform: translateY(-92vh) translateX(12px) scale(0.8); }
    100% { transform: translateY(-115vh) translateX(-6px) scale(0.55); opacity: 0; }
  }

  @keyframes floatSoft2 {
    0% { transform: translateY(0) translateX(0) scale(0.6); opacity: 0; }
    10% { opacity: 0.85; transform: translateY(-12vh) translateX(-18px) scale(0.9); }
    48% { opacity: 0.7; transform: translateY(-60vh) translateX(22px) scale(1.05); }
    80% { opacity: 0.45; transform: translateY(-95vh) translateX(-12px) scale(0.7); }
    100% { transform: translateY(-118vh) translateX(8px) scale(0.5); opacity: 0; }
  }

  @keyframes floatSoft3 {
    0% { transform: translateY(0) translateX(0) scale(0.65); opacity: 0; }
    15% { opacity: 0.8; transform: translateY(-10vh) translateX(25px) scale(0.9); }
    55% { opacity: 0.7; transform: translateY(-65vh) translateX(-20px) scale(1.02); }
    85% { opacity: 0.4; transform: translateY(-100vh) translateX(16px) scale(0.75); }
    100% { transform: translateY(-122vh) translateX(-12px) scale(0.45); opacity: 0; }
  }

  @keyframes floatSoft4 {
    0% { transform: translateY(0) translateX(0) scale(0.55); opacity: 0; }
    8% { opacity: 0.75; transform: translateY(-6vh) translateX(-22px) scale(0.8); }
    45% { opacity: 0.65; transform: translateY(-50vh) translateX(18px) scale(1.08); }
    78% { opacity: 0.5; transform: translateY(-88vh) translateX(-8px) scale(0.78); }
    100% { transform: translateY(-110vh) translateX(14px) scale(0.48); opacity: 0; }
  }
`;

// ============================================================
// 🎨 أنماط CSS مخصصة للعناصر التي يصعب تنفيذها بـ Tailwind
// ============================================================
const CUSTOM_CSS = `
  .glass-card-inner::before {
    content: '';
    position: absolute;
    inset: 8px;
    border-radius: 28px;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.4) 0%,
      rgba(150, 205, 240, 0.1) 80%
    );
    pointer-events: none;
    z-index: 0;
  }

  .btn-shine::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0);
    transition: background 0.25s;
    border-radius: 56px;
  }
  .btn-shine:hover::after {
    background: rgba(255, 255, 255, 0.12);
  }

  /* 📱 تصحيح حجم الشخصية على الشاشات الصغيرة */
  @media (max-width: 680px) {
    .character-container-resp {
      width: 150px !important;
      height: 140px !important;
      transform: translate(-50%, -70%) !important;
    }
    .character-img-resp {
      max-height: 110px !important;
    }
  }
  @media (max-width: 480px) {
    .character-container-resp {
      width: 125px !important;
      height: 120px !important;
      transform: translate(-50%, -68%) !important;
    }
  }
`;

// ============================================================
// 🎯 المكون الرئيسي: WelcomePage
// ============================================================
const WelcomePage: React.FC = () => {
  const glassCardRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef<HTMLDivElement>(null);
  const floatingLayerRef = useRef<HTMLDivElement>(null);

  const isTouchDevice = useRef(
    typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0),
  );

  const animationPool = useRef([
    "floatSoft1",
    "floatSoft2",
    "floatSoft3",
    "floatSoft4",
  ]);

  const floatingIcons = useMemo(() => {
    const TOTAL_ICONS = 9;
    const icons = [];
    for (let i = 0; i < TOTAL_ICONS; i++) {
      icons.push({
        id: i,
        leftPos: 2 + Math.random() * 88,
        size: 42 + Math.random() * 32,
        duration: 8 + Math.random() * 9,
        delay: Math.random() * 3,
        animName:
          animationPool.current[
            Math.floor(Math.random() * animationPool.current.length)
          ],
      });
    }
    return icons;
  }, []);

  const MAX_TILT = 5;

  const resetTilt = useCallback(() => {
    const card = glassCardRef.current;
    const character = characterRef.current;
    if (!card) return;
    card.style.transform = "rotateX(0deg) rotateY(0deg) translateZ(0)";
    if (character && !isTouchDevice.current) {
      character.style.transform = "translate(-50%, -75%)";
      character.style.animation = "none";
      void character.offsetHeight;
      character.style.animation = "characterFloat 3.8s ease-in-out infinite";
    }
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isTouchDevice.current) return;
      const card = glassCardRef.current;
      const character = characterRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) / (rect.width / 2);
      const deltaY = (e.clientY - centerY) / (rect.height / 2);
      const clampX = Math.min(1, Math.max(-1, deltaX));
      const clampY = Math.min(1, Math.max(-1, deltaY));

      const rotY = clampX * MAX_TILT;
      const rotX = -clampY * MAX_TILT;
      card.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(2px)`;

      if (character) {
        const moveX = clampX * 6;
        const moveY = clampY * 4;
        character.style.transform = `translate(calc(-50% + ${moveX}px), calc(-75% + ${moveY}px))`;
        character.style.animation = "none";
      }
    },
    [resetTilt],
  );

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const card = glassCardRef.current;
      if (!card || isTouchDevice.current) return;

      const rect = card.getBoundingClientRect();
      const buffer = 150;
      const isNear =
        e.clientX > rect.left - buffer &&
        e.clientX < rect.right + buffer &&
        e.clientY > rect.top - buffer &&
        e.clientY < rect.bottom + buffer;

      if (isNear) {
        handleMouseMove(e);
      } else {
        resetTilt();
      }
    };

    document.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mouseleave", resetTilt);
    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseleave", resetTilt);
    };
  }, [handleMouseMove, resetTilt]);

  useEffect(() => {
    const handleResize = () => resetTilt();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [resetTilt]);

  const navigate = useNavigate(); // 2. تعريف الدالة

  const handleChildClick = useCallback(() => {
    navigate("/child-dashboard/1");
  }, [navigate]);

  const handleParentClick = useCallback(() => {
    navigate("/Father-Dashboard");
  }, [navigate]);

  return (
    <>
      <style>
        {CSS_VARIABLES}
        {KEYFRAMES_CSS}
        {CUSTOM_CSS}
      </style>

      <div
        dir="rtl"
        lang="ar"
        className="
          relative min-h-screen flex items-center justify-start
          bg-[#f5faff20] overflow-x-hidden cursor-default
          font-[Tajawal,'Segoe_UI',Inter,system-ui,sans-serif]
        "
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        {/* خلفية الصورة */}
        <div
          className="fixed inset-0"
          style={{
            backgroundImage: "url('bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            zIndex: -30, // ✅ تأكد من هذا
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />

        {/* الموجات السفلية */}
        <div
          className="fixed bottom-0 left-0 w-full z-[2] pointer-events-none"
          style={{ height: "clamp(180px, 28vh, 340px)" }}
          aria-hidden="true"
        >
          <div
            className="absolute bottom-[-20px] left-1/2 w-[80%] h-[140px] -translate-x-1/2 z-0"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(100,185,235,0.6) 0%, rgba(70,160,210,0.3) 40%, transparent 75%)",
              filter: "blur(38px)",
              animation: "glowPulseBlue 7s ease-in-out infinite",
            }}
          />
          <svg
            className="absolute bottom-[-5px] left-0 w-full h-full"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* ✅ تم إضافة التدرج الأول الذي كان مفقودًا في الكود الأصلي */}
              <linearGradient
                id="blueWaveGrad1"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#c4e0fa" stopOpacity="0.55" />
                <stop offset="50%" stopColor="#91c9ed" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#b3daf5" stopOpacity="0.5" />
              </linearGradient>
              <linearGradient
                id="blueWaveGrad2"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#b8defa" stopOpacity="0.5" />
                <stop offset="60%" stopColor="#7fc1e6" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#a4d2f0" stopOpacity="0.45" />
              </linearGradient>
            </defs>
            <path
              fill="url(#blueWaveGrad1)"
              fillOpacity="0.9"
              d="M0,224 C320,180 420,260 720,200 C980,150 1120,220 1440,180 L1440,320 L0,320 Z"
            />
            <path
              fill="url(#blueWaveGrad2)"
              fillOpacity="0.65"
              d="M0,256 C280,220 460,300 760,250 C1050,210 1250,270 1440,230 L1440,320 L0,320 Z"
              transform="translate(0, 12)"
            />
          </svg>
        </div>

        {/* الأيقونات العائمة */}
        <div
          ref={floatingLayerRef}
          className="fixed inset-0 z-[3] pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          {floatingIcons.map((icon) => (
            <img
              key={icon.id}
              src="assest/mony.png"
              alt="عملة طافية"
              loading="lazy"
              className="absolute rounded-[30%] object-contain opacity-0"
              style={{
                bottom: "-80px",
                left: `${icon.leftPos}%`,
                width: `${icon.size}px`,
                height: `${icon.size}px`,
                animationName: icon.animName,
                animationDuration: `${icon.duration}s`,
                animationDelay: `${icon.delay}s`,
                animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite",
                willChange: "transform, opacity",
                filter: "drop-shadow(0 6px 14px rgba(50, 130, 180, 0.4))",
              }}
            />
          ))}
        </div>

        {/* ✅ تم تصحيح حشوة الحاوية الرئيسية لتطابق الأصل تمامًا */}
        <div
          className="
            relative z-10 w-full flex justify-start items-center
            min-h-screen
            pt-[60px] pb-[40px] pr-[30px] pl-[18%]
            max-sm:pt-[50px] max-sm:pb-[40px] max-sm:pr-[20px] max-sm:pl-[5%]
            max-[480px]:pt-[40px] max-[480px]:pb-[30px] max-[480px]:pr-[16px] max-[480px]:pl-[4%]
          "
          style={{ perspective: "1000px" }}
        >
          {/* البطاقة الزجاجية */}
          <div
            ref={glassCardRef}
            className="
              glass-card-inner
              relative w-full max-w-[600px]
              rounded-[36px]
              border-[1.5px] border-solid
              px-[38px] pt-[86px] pb-[42px]
              transition-transform duration-400 ease-out
              max-sm:max-w-[90vw] max-sm:rounded-[28px] max-sm:px-[22px] max-sm:pt-[38px] max-sm:pb-[32px]
              max-[480px]:px-[18px] max-[480px]:pt-[30px] max-[480px]:pb-[24px]
              max-[380px]:px-[14px] max-[380px]:pt-[24px] max-[380px]:pb-[20px]
            "
            style={{
              background: `linear-gradient(145deg,
                var(--blue-glass-light) 0%,
                var(--blue-glass-mid) 35%,
                rgba(220, 240, 255, 0.6) 70%,
                rgba(200, 228, 250, 0.55) 100%)`,
              backdropFilter: "blur(20px) saturate(150%)",
              WebkitBackdropFilter: "blur(20px) saturate(150%)",
              borderColor: "var(--blue-glass-border)",
              boxShadow:
                "var(--shadow-soft), var(--shadow-glow), inset 0 1px 2px rgba(255,255,255,0.6)",
              willChange: "transform",
            }}
          >
            {/* شخصية البنك */}
            <div
              ref={characterRef}
              className="
                character-container-resp
                absolute top-0 left-1/2 z-[25] pointer-events-none
                w-[300px] h-[290px] flex items-end justify-center
              "
              style={{
                transform: "translate(-50%, -75%)",
                filter: "drop-shadow(0 10px 18px rgba(50, 120, 160, 0.35))",
                animation: "characterFloat 3.8s ease-in-out infinite",
              }}
            >
              <img
                src="assest/logo.png"
                alt="تميمة بنك الجيل الواعد"
                title="شخصية البنك"
                className="character-img-resp w-full max-h-[240px] object-contain object-bottom block"
              />
            </div>

            {/* محتوى البطاقة */}
            <div className="relative z-[2]">
              <div className="text-center mb-[34px]">
                <div className="flex items-center justify-center gap-[8px] mb-[12px]">
                  <span
                    className="w-[10px] h-[10px] rounded-full inline-block"
                    style={{
                      background: "#3f9cdb",
                      animation: "dotPulseBlue 2s infinite ease-in-out",
                    }}
                  />
                  <span
                    className="w-[10px] h-[10px] rounded-full inline-block"
                    style={{
                      background: "#5aa9dd",
                      animation: "dotPulseBlue 2s infinite ease-in-out",
                      animationDelay: "0.3s",
                    }}
                  />
                  <span
                    className="w-[10px] h-[10px] rounded-full inline-block"
                    style={{
                      background: "#85c1f0",
                      animation: "dotPulseBlue 2s infinite ease-in-out",
                      animationDelay: "0.6s",
                    }}
                  />
                </div>

                <h1
                  className="
                    text-[3rem] font-bold m-0 mb-[5px]
                    max-sm:text-[1.6rem] max-[480px]:text-[1.4rem]
                    max-[380px]:text-[1.25rem]
                  "
                  style={{
                    color: "var(--text-dark)",
                    letterSpacing: "-0.5px",
                    textShadow: "0 1px 2px rgba(255,255,255,0.4)",
                    fontWeight: 700,
                  }}
                >
                  بنك الجيل الواعد
                </h1>
                <p
                  className="text-[1.8rem] font-normal"
                  style={{
                    color: "var(--text-muted)",
                    fontWeight: 450,
                  }}
                >
                  مستقبل ذكي بأموال آمنة
                </p>
              </div>

              {/* الأزرار */}
              <div className="flex gap-[28px] mt-[12px] flex-wrap max-sm:flex-col max-sm:gap-[14px]">
                {/* زر الأطفال */}
                <button
                  type="button"
                  onClick={handleChildClick}
                  className="
                    btn-shine
                    flex-1 min-w-[130px] max-sm:w-full
                    py-[20px] px-[30px] max-[480px]:py-[12px] max-[480px]:px-[14px]
                    rounded-[56px] border-none
                    text-white text-[30px] font-semibold max-[480px]:text-[0.85rem]
                    text-center cursor-pointer
                    transition-all duration-300
                    active:scale-[0.96]
                    relative overflow-hidden
                  "
                  style={{
                    fontFamily: "inherit",
                    letterSpacing: "0.3px",
                    background: "var(--child-btn-gradient)",
                    backgroundSize: "250% 250%",
                    animation: "shimmerMove 4s ease infinite",
                    boxShadow:
                      "0 8px 24px rgba(0, 0, 0, 0.15), 0 7px 22px rgba(255, 140, 80, 0.45), 0 2px 8px rgba(255, 215, 0, 0.3)",
                    outline: "none",
                  }}
                  onMouseEnter={(e) => {
                    const target = e.currentTarget;
                    target.style.background = "var(--child-btn-hover)";
                    target.style.backgroundSize = "250% 250%";
                    target.style.transform = "translateY(-3px)";
                    target.style.boxShadow =
                      "0 14px 30px rgba(236, 110, 90, 0.5), 0 8px 24px rgba(0, 0, 0, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    const target = e.currentTarget;
                    target.style.background = "var(--child-btn-gradient)";
                    target.style.backgroundSize = "250% 250%";
                    target.style.transform = "";
                    target.style.boxShadow =
                      "0 8px 24px rgba(0, 0, 0, 0.15), 0 7px 22px rgba(255, 140, 80, 0.45), 0 2px 8px rgba(255, 215, 0, 0.3)";
                  }}
                >
                  قسم الأطفال
                </button>

                {/* زر الآباء */}
                <button
                  type="button"
                  onClick={handleParentClick}
                  className="
                    btn-shine
                    flex-1 min-w-[130px] max-sm:w-full
                    py-[20px] px-[30px] max-[480px]:py-[12px] max-[480px]:px-[14px]
                    rounded-[56px] border-none
                    text-white text-[30px] font-bold max-[480px]:text-[0.85rem]
                    text-center cursor-pointer
                    transition-all duration-300
                    active:scale-[0.96]
                    relative overflow-hidden
                  "
                  style={{
                    fontFamily: "inherit",
                    letterSpacing: "0.3px",
                    background: "var(--parent-btn-gradient)",
                    boxShadow:
                      "0 8px 24px rgba(0, 0, 0, 0.15), 0 6px 18px rgba(10, 0, 151, 0.45)",
                    outline: "none",
                    fontWeight: 700,
                  }}
                  onMouseEnter={(e) => {
                    const target = e.currentTarget;
                    target.style.background = "var(--parent-btn-hover)";
                    target.style.transform = "translateY(-3px)";
                    target.style.boxShadow =
                      "0 12px 28px rgba(0, 42, 193, 0.55), 0 8px 24px rgba(0, 0, 0, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    const target = e.currentTarget;
                    target.style.background = "var(--parent-btn-gradient)";
                    target.style.transform = "";
                    target.style.boxShadow =
                      "0 8px 24px rgba(0, 0, 0, 0.15), 0 6px 18px rgba(10, 0, 151, 0.45)";
                  }}
                >
                  قسم الآباء
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WelcomePage;
