/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

// ============================================================
// Styles Injection (دمج التنسيقات داخل المكون)
// ============================================================

const injectStyles = () => {
  const styleId = "child-dashboard-styles";
  if (document.getElementById(styleId)) return;

  const styles = `
    /* Reinitialize with prevent selection */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      user-select: none;
    }

    body {
      min-height: 100vh;
      font-family: 'Tajawal', 'Segoe UI', system-ui, sans-serif;
      overflow-x: hidden;
      position: relative;
      background: linear-gradient(135deg, #ffffff 0%, #f5f7fe 100%);
    }

    /* Dynamic background overlay */
    .dynamic-overlay {
      position: fixed;
      inset: 0;
      transition: background 0.5s cubic-bezier(0.2, 0.9, 0.4, 1.1);
      z-index: 0;
      pointer-events: none;
    }

    /* Floating coins layer */
    .coins-layer {
      position: fixed;
      inset: 0;
      z-index: 1;
      pointer-events: none;
      overflow: hidden;
    }

    .floating-coin {
      position: absolute;
      bottom: -80px;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      opacity: 0.65;
      animation: flyCoin linear infinite;
      filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.08));
    }

    @keyframes flyCoin {
      0% {
        transform: translateY(0) rotate(0deg);
        opacity: 0;
      }
      15% {
        opacity: 0.75;
      }
      85% {
        opacity: 0.75;
      }
      100% {
        transform: translateY(-120vh) rotate(360deg);
        opacity: 0;
      }
    }

    /* Button effects - shake and spin */
    .shake-image {
      animation: shakeImage 0.25s infinite alternate;
    }

    @keyframes shakeImage {
      100% {
        transform: translateX(-6px) rotate(-3deg);
      }
    }

    .spin-image {
      animation: spinImage 0.9s infinite linear;
    }

    @keyframes spinImage {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    /* Gradient shimmer animation */
    @keyframes shimmerMove {
      0% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0% 50%;
      }
    }

    /* Text gradient clip */
    .text-gradient-clip {
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
    }

    /* Responsive design */
    @media (max-width: 880px) {
      .dashboard-split {
        flex-direction: column-reverse !important;
      }
      .content-left {
        align-items: center !important;
        text-align: center !important;
      }
      .buttons-group {
        justify-content: center !important;
      }
      .big-question {
        border-right: none !important;
        padding-right: 0 !important;
      }
    }

    @media (max-width: 550px) {
      .glass-master {
        padding: 20px !important;
      }
      .header {
        padding: 8px 18px !important;
      }
      .balance-card {
        padding: 4px 16px !important;
      }
    }
  `;

  const styleSheet = document.createElement("style");
  styleSheet.id = styleId;
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
};

// ============================================================
// TypeScript Interfaces
// ============================================================

interface ChildData {
  id: number;
  parentId: number;
  name: string;
  age: number;
  level: number;
  avatarUrl: string;
  savingsBalance: number;
}

interface ApiResponse {
  data: ChildData;
  message: string;
  code: string;
}

// ============================================================
// Constants - مسارات الصور (public/assest)
// ============================================================

const COIN_IMG_URL = "/assest/mony.png";
const API_BASE_URL = "http://promising-generationapi.runasp.net/api";

// 🆕 معرض الشخصيات (يتغير مع كل ضغطة على الصورة)
const CHARACTER_GALLERY = [
  { src: "/assest/ابن_ازرق.png", name: "ولد أزرق", color: "#7ec8e0" },
  { src: "/assest/بنت_برتقالي.png", name: "بنت برتقالي", color: "#D7AE81" },
  { src: "/assest/ابن_اخضر.png", name: "ولد أخضر", color: "#a3e4b7" },
  { src: "/assest/بنت_وردي.png", name: "بنت وردي", color: "#ffb7c5" },
  { src: "/assest/ابن_اصفر.png", name: "ولد أصفر", color: "#ffe28a" },
];

// روابط الصور الثابتة
const IMAGES = {
  logo: "/assest/شعار ازرق.png",
  missionIcon: "/assest/tanpih.png",
  goalIcon: "/assest/gool.png",
};

// ألوان الخلفية الثابتة (تتطابق مع ألوان الشخصيات)
const BACKGROUND_COLORS = [
  "#7ec8e0", // أزرق
  "#D7AE81", // بني دافئ
  "#a3e4b7", // أخضر
  "#ffb7c5", // وردي
  "#ffe28a", // أصفر
];

// const COLOR_NAMES = ["أزرق", "بني دافئ", "أخضر", "وردي", "أصفر"];

// ============================================================
// Main Component
// ============================================================

const ChildDashboard: React.FC = () => {
  // Get childId from URL params
  const { id } = useParams<{ id: string }>();
  const childId = id ? parseInt(id) : 1;

  const navigate = useNavigate();

  // Inject styles on mount
  useEffect(() => {
    injectStyles();
  }, []);

  // Refs
  const coinsLayerRef = useRef<HTMLDivElement>(null);
  const colorOverlayRef = useRef<HTMLDivElement>(null);
  const giantImgRef = useRef<HTMLImageElement>(null);
  const giantWrapperRef = useRef<HTMLDivElement>(null);
  const missionBtnRef = useRef<HTMLDivElement>(null);
  const goalBtnRef = useRef<HTMLDivElement>(null);
  const missionImgRef = useRef<HTMLImageElement>(null);
  const goalImgRef = useRef<HTMLImageElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const balanceAmountRef = useRef<HTMLSpanElement>(null);

  // State
  const [childName, setChildName] = useState<string>("");
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);
  const [colorIndex, setColorIndex] = useState<number>(0);
  // 🆕 مؤشر الشخصية الحالية في المعرض
  const [characterIndex, setCharacterIndex] = useState<number>(0);

  // Fetch child data from API
  useEffect(() => {
    const fetchChildData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/Children/${childId}/Get`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ApiResponse = await response.json();

        if (result.code === "FOUND" && result.data) {
          setChildName(result.data.name);
          setBalance(result.data.savingsBalance);

          // Save to storage for persistence
          localStorage.setItem("childName", result.data.name);
          localStorage.setItem("childId", childId.toString());
        } else {
          setError(result.message || "Failed to load child data");
        }
      } catch (err) {
        console.error("Error fetching child data:", err);
        setError("Failed to connect to server");
        // Fallback to stored name if available
        const savedName = localStorage.getItem("childName");
        if (savedName) {
          setChildName(savedName);
        } else {
          setChildName("الطفل");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchChildData();
  }, [childId]);

  // 🆕 تغيير الصورة الشخصية ولون الخلفية معاً
  const changeCharacterAndColor = useCallback(() => {
    // تدوير إلى الصورة التالية
    const nextIndex = (characterIndex + 1) % CHARACTER_GALLERY.length;
    setCharacterIndex(nextIndex);
    setColorIndex(nextIndex);

    const newCharacter = CHARACTER_GALLERY[nextIndex];

    // تغيير الصورة الشخصية مع تأثير نبض
    if (giantImgRef.current) {
      giantImgRef.current.src = newCharacter.src;
      giantImgRef.current.style.transform = "scale(1.05)";
      setTimeout(() => {
        if (giantImgRef.current) {
          giantImgRef.current.style.transform = "scale(1)";
        }
      }, 200);
    }

    // تغيير لون الخلفية مع تأثير
    if (colorOverlayRef.current) {
      colorOverlayRef.current.style.backgroundColor = newCharacter.color;
      // تأثير وميض سريع
      colorOverlayRef.current.style.opacity = "0.25";
      setTimeout(() => {
        if (colorOverlayRef.current) {
          colorOverlayRef.current.style.opacity = "1";
        }
      }, 300);
    }

    console.log(`🎨 تم تغيير الثيم إلى: ${newCharacter.name}`);
  }, [characterIndex]);

  // Add spark effect on button click
  const addSpark = useCallback(
    (e: React.MouseEvent, emoji: string = "⭐✨") => {
      const sparkDiv = document.createElement("div");
      sparkDiv.innerHTML = emoji;
      sparkDiv.style.position = "fixed";
      sparkDiv.style.left = e.clientX + "px";
      sparkDiv.style.top = e.clientY + "px";
      sparkDiv.style.fontSize = "34px";
      sparkDiv.style.pointerEvents = "none";
      sparkDiv.style.zIndex = "9999";
      sparkDiv.style.opacity = "1";
      sparkDiv.style.transform = "translate(-50%, -50%)";
      sparkDiv.style.transition = "all 0.4s ease";
      document.body.appendChild(sparkDiv);

      setTimeout(() => {
        sparkDiv.style.opacity = "0";
        sparkDiv.style.transform = "translate(-50%, -50%) scale(1.6)";
        setTimeout(() => sparkDiv.remove(), 400);
      }, 20);
    },
    [],
  );

  // Create floating coins
  useEffect(() => {
    const container = coinsLayerRef.current;
    if (!container) return;

    for (let i = 0; i < 42; i++) {
      const coin = document.createElement("div");
      coin.className = "floating-coin";
      coin.style.backgroundImage = `url('${COIN_IMG_URL}')`;
      const size = 26 + Math.random() * 32;
      coin.style.width = size + "px";
      coin.style.height = size + "px";
      coin.style.left = Math.random() * 100 + "%";
      coin.style.animationDuration = 12 + Math.random() * 24 + "s";
      coin.style.animationDelay = Math.random() * 12 + "s";
      container.appendChild(coin);
    }

    return () => {
      if (container) container.innerHTML = "";
    };
  }, []);

  // Hover effects on buttons (shake and spin)
  useEffect(() => {
    const missionBtn = missionBtnRef.current;
    const goalBtn = goalBtnRef.current;
    const missionImg = missionImgRef.current;
    const goalImg = goalImgRef.current;

    const handleMissionEnter = () => missionImg?.classList.add("shake-image");
    const handleMissionLeave = () =>
      missionImg?.classList.remove("shake-image");
    const handleGoalEnter = () => goalImg?.classList.add("spin-image");
    const handleGoalLeave = () => goalImg?.classList.remove("spin-image");

    missionBtn?.addEventListener("mouseenter", handleMissionEnter);
    missionBtn?.addEventListener("mouseleave", handleMissionLeave);
    goalBtn?.addEventListener("mouseenter", handleGoalEnter);
    goalBtn?.addEventListener("mouseleave", handleGoalLeave);

    return () => {
      missionBtn?.removeEventListener("mouseenter", handleMissionEnter);
      missionBtn?.removeEventListener("mouseleave", handleMissionLeave);
      goalBtn?.removeEventListener("mouseenter", handleGoalEnter);
      goalBtn?.removeEventListener("mouseleave", handleGoalLeave);
    };
  }, []);

  // Mouse move effect for giant image
  useEffect(() => {
    const wrapper = giantWrapperRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      if (!wrapper) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      let x = (e.clientX / w) * 2 - 1;
      let y = (e.clientY / h) * 2 - 1;
      x = Math.min(Math.max(x, -0.7), 0.7);
      y = Math.min(Math.max(y, -0.5), 0.5);
      wrapper.style.transform = `translate(${x * 25}px, ${y * 18}px)`;
    };

    const handleMouseLeave = () => {
      if (wrapper) wrapper.style.transform = "translate(0px,0px)";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // 3D tilt effect for buttons
  useEffect(() => {
    const missionBtn = missionBtnRef.current;
    const goalBtn = goalBtnRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = (e.clientY / window.innerHeight) * 2 - 1;

      if (missionBtn && !missionBtn.matches(":hover")) {
        const rotY = normX * 4;
        const rotX = normY * -2;
        missionBtn.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(2px)`;
      } else if (missionBtn && missionBtn.matches(":hover")) {
        missionBtn.style.transform = "scale(0.98)";
      }

      if (goalBtn && !goalBtn.matches(":hover")) {
        const rotY = normX * 4;
        const rotX = normY * -2;
        goalBtn.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(2px)`;
      } else if (goalBtn && goalBtn.matches(":hover")) {
        goalBtn.style.transform = "scale(0.98)";
      }
    };

    const resetMissionTransform = () => {
      if (missionBtn) missionBtn.style.transform = "";
    };
    const resetGoalTransform = () => {
      if (goalBtn) goalBtn.style.transform = "";
    };

    window.addEventListener("mousemove", handleMouseMove);
    missionBtn?.addEventListener("mouseleave", resetMissionTransform);
    goalBtn?.addEventListener("mouseleave", resetGoalTransform);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      missionBtn?.removeEventListener("mouseleave", resetMissionTransform);
      goalBtn?.removeEventListener("mouseleave", resetGoalTransform);
    };
  }, []);

  // Expose balance update function to window
  useEffect(() => {
    (window as any).updateChildBalance = (newBalance: number) => {
      setBalance(newBalance);
    };
    return () => {
      delete (window as any).updateChildBalance;
    };
  }, []);

  // 🆕 Event Handlers - تغيير الصورة عند النقر عليها
  const handleGiantImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    changeCharacterAndColor();

    // تأثير الألوان المنبثقة
    const colorSpark = document.createElement("div");
    colorSpark.innerHTML = "🎨🌈✨";
    colorSpark.style.position = "fixed";
    colorSpark.style.left = e.clientX + "px";
    colorSpark.style.top = e.clientY + "px";
    colorSpark.style.fontSize = "42px";
    colorSpark.style.pointerEvents = "none";
    colorSpark.style.zIndex = "9999";
    colorSpark.style.opacity = "0.9";
    colorSpark.style.transition = "all 0.3s";
    document.body.appendChild(colorSpark);

    setTimeout(() => {
      colorSpark.style.opacity = "0";
      colorSpark.style.transform = "scale(1.8)";
      setTimeout(() => colorSpark.remove(), 300);
    }, 20);
  };

  // Navigate to tasks page with childId parameter
  const handleMissionClick = (e: React.MouseEvent) => {
    addSpark(e, "⭐✨");
    navigate(`/Child-Tasks/${childId}`);
  };

  // Navigate to goals page with childId parameter
  const handleGoalClick = (e: React.MouseEvent) => {
    addSpark(e, "⭐✨");
    navigate(`/Child-Goals/${childId}`);
  };

  const handleExitClick = () => {
    navigate("/welcome");
  };

  const getRainbowButtonStyle = (): React.CSSProperties => ({
    background:
      "linear-gradient(135deg, #ff6b8a, #ff8e53, #ffb347, #ffd166, #a0e7a0, #6ec6f5, #c77dff)",
    backgroundSize: "250% 250%",
    animation: "shimmerMove 4s ease infinite",
    boxShadow:
      "0 16px 24px -12px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255,255,255,0.3)",
    border: "1.5px solid rgba(255,245,200,0.9)",
  });

  // المؤشر الحالي للشخصية والخلفية
  const currentCharacter = CHARACTER_GALLERY[characterIndex];
  const currentBgColor = BACKGROUND_COLORS[colorIndex];

  // Show loading state
  if (loading) {
    return (
      <div
        className="loading-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          fontSize: "1.5rem",
          color: "#236b48",
          fontFamily: "'Tajawal', sans-serif",
        }}
      >
        <i className="fas fa-spinner fa-spin" style={{ marginLeft: "10px" }} />
        جاري تحميل البيانات...
      </div>
    );
  }

  return (
    <>
      {/* Dynamic overlay for background */}
      <div
        className="dynamic-overlay"
        ref={colorOverlayRef}
        style={{ backgroundColor: currentBgColor }}
      />

      {/* Floating coins layer */}
      <div className="coins-layer" ref={coinsLayerRef} />

      {/* Main container */}
      <div
        className="app-container"
        style={{
          position: "relative",
          zIndex: 15,
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "20px 28px 40px",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          className="header"
          id="mainHeader"
          ref={headerRef}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
            marginBottom: "36px",
            background: "rgba(255, 255, 255, 0.537)",
            backdropFilter: "blur(20px)",
            borderRadius: "80px",
            padding: "12px 28px",
            boxShadow:
              "0 12px 28px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255,255,255,0.8)",
            border: "1px solid rgba(230, 230, 250, 0.6)",
            transition: "background 0.4s",
          }}
        >
          {/* Logo and brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <img
              className="logo-img"
              src={IMAGES.logo}
              alt="شعار بنك الجيل"
              style={{
                width: "56px",
                height: "56px",
                objectFit: "contain",
                filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.05))",
                transition: "transform 0.2s",
              }}
              onError={(e) => {
                console.error("خطأ في تحميل الشعار:", IMAGES.logo);
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div>
              <h1
                id="titleGradient"
                className="text-gradient-clip"
                style={{
                  fontSize: "1.8rem",
                  fontWeight: 800,
                  letterSpacing: "-0.3px",
                  transition: "background 0.5s",
                  background:
                    "linear-gradient(135deg, #002b55, #005c99, #003d6b)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
                dir="rtl"
              >
                بنك الجيل الواعد
              </h1>
              <p
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#4a7a5c",
                  transition: "color 0.5s",
                }}
                dir="rtl"
              >
                مصرف المستقبل الذكي
              </p>
            </div>
          </div>

          {/* Header actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {/* Balance card */}
            <div
              className="balance-card"
              id="balanceCard"
              style={{
                background: "linear-gradient(125deg, #fff3cf, #ffeab3)",
                borderRadius: "60px",
                padding: "8px 24px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                boxShadow: "0 8px 16px rgba(0,0,0,0.05)",
                border: "1px solid #ffe0a3",
                transition: "background 0.5s, border-color 0.5s",
              }}
            >
              <i
                className="fas fa-coins"
                id="balanceIcon"
                style={{
                  fontSize: "1.8rem",
                  color: "#e6a017",
                  transition: "color 0.5s",
                }}
              />
              <span
                id="balanceLabel"
                style={{
                  fontWeight: 800,
                  fontSize: "1rem",
                  color: "#7a5300",
                  transition: "color 0.5s",
                }}
                dir="rtl"
              >
                رصيدك:
              </span>
              <span
                ref={balanceAmountRef}
                id="balanceAmount"
                style={{
                  fontSize: "1.8rem",
                  fontWeight: 900,
                  color: "#1f543e",
                  letterSpacing: "1px",
                  direction: "ltr",
                  display: "inline-block",
                  transition: "color 0.5s",
                }}
                dir="ltr"
              >
                {balance}
              </span>
              <span
                id="balanceCurrency"
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  marginRight: "5px",
                  transition: "color 0.5s",
                }}
                dir="rtl"
              >
                ريال
              </span>
            </div>

            {/* Exit button */}
            <button
              className="exit-btn"
              onClick={handleExitClick}
              style={{
                background: "rgba(255, 0, 0, 0.381)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(200, 90, 70, 0.3)",
                padding: "10px 28px",
                borderRadius: "60px",
                fontWeight: 800,
                fontSize: "1rem",
                fontFamily: "'Tajawal', sans-serif",
                color: "#0d0d0da2",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#d21919";
                e.currentTarget.style.color = "white";
                e.currentTarget.style.transform = "scale(0.96)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 0, 0, 0.381)";
                e.currentTarget.style.color = "#0d0d0da2";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <i className="fas fa-sign-out-alt" />
              <span dir="rtl">خروج</span>
            </button>
          </div>
        </div>

        {/* Main glass card */}
        <div
          className="glass-master"
          style={{
            background: "rgba(255, 255, 255, 0.6)",
            backdropFilter: "blur(18px)",
            borderRadius: "70px",
            padding: "32px 38px",
            boxShadow:
              "0 30px 45px -20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255,255,255,0.6)",
            border: "1px solid rgba(255,255,245,0.7)",
            transition: "all 0.3s",
            marginBottom: "25px",
          }}
        >
          <div
            className="dashboard-split"
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: "40px",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Left content */}
            <div
              className="content-left"
              style={{
                flex: "1.2",
                minWidth: "280px",
                display: "flex",
                flexDirection: "column",
                gap: "28px",
              }}
            >
              {/* Welcome message */}
              <div className="welcome-text">
                <div
                  id="greetingText"
                  className="text-gradient-clip"
                  style={{
                    fontSize: "3rem",
                    fontWeight: 900,
                    marginBottom: "10px",
                    letterSpacing: "-0.5px",
                    transition: "background 0.5s",
                    background: "linear-gradient(125deg, #004466, #0077aa)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  }}
                  dir="rtl"
                >
                  مرحباً{" "}
                  <span
                    id="childNameDisplay"
                    className="text-gradient-clip"
                    style={{
                      fontSize: "3.2rem",
                      transition: "background 0.5s",
                      background: "linear-gradient(125deg, #002244, #005588)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      color: "transparent",
                    }}
                    dir="rtl"
                  >
                    {childName}
                  </span>
                </div>
                <div
                  id="bigQuestion1"
                  className="big-question"
                  style={{
                    fontSize: "1.9rem",
                    fontWeight: 800,
                    color: "#003344",
                    margin: "12px 0 8px 0",
                    lineHeight: "1.3",
                    borderRight: "6px solid #0088bb",
                    paddingRight: "18px",
                    transition: "color 0.5s, border-color 0.5s",
                  }}
                  dir="rtl"
                >
                  كن مستعد لتحصل على المال وتحقق أهدافك
                </div>
                <div
                  id="bigQuestion2"
                  className="big-question"
                  style={{
                    fontSize: "1.9rem",
                    fontWeight: 800,
                    color: "#003344",
                    margin: "12px 0 8px 0",
                    lineHeight: "1.3",
                    borderRight: "6px solid #0088bb",
                    paddingRight: "18px",
                    transition: "color 0.5s, border-color 0.5s",
                  }}
                  dir="rtl"
                >
                  ابدأ رحلتك: نفذ المهمات، احصل على الربح، وحقق الأهداف
                </div>
              </div>

              {/* Buttons group */}
              <div
                className="buttons-group"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "32px",
                  marginTop: "20px",
                }}
              >
                {/* Mission button */}
                <div
                  className="cute-action-btn"
                  id="missionBtnNew"
                  ref={missionBtnRef}
                  onClick={handleMissionClick}
                  style={{
                    ...getRainbowButtonStyle(),
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    padding: "8px 28px",
                    borderRadius: "100px",
                    cursor: "pointer",
                    transition: "all 0.25s cubic-bezier(0.2, 0.9, 0.4, 1.2)",
                    minWidth: "220px",
                    justifyContent: "center",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, #ff5278, #ff7a3a, #ffa52e, #ffc94d, #88dd88, #55b8f0, #b966ff)";
                    e.currentTarget.style.backgroundSize = "250% 250%";
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow =
                      "0 20px 30px -10px rgba(236, 110, 90, 0.4), 0 0 0 1px rgba(255,255,255,0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, #ff6b8a, #ff8e53, #ffb347, #ffd166, #a0e7a0, #6ec6f5, #c77dff)";
                    e.currentTarget.style.backgroundSize = "250% 250%";
                    e.currentTarget.style.transform = "";
                    e.currentTarget.style.boxShadow =
                      "0 16px 24px -12px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255,255,255,0.3)";
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = "scale(0.96)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 14px rgba(0,0,0,0.18)";
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow =
                      "0 20px 30px -10px rgba(236, 110, 90, 0.4), 0 0 0 1px rgba(255,255,255,0.5)";
                  }}
                >
                  <img
                    ref={missionImgRef}
                    src={IMAGES.missionIcon}
                    alt="مهمة"
                    style={{
                      width: "62px",
                      height: "62px",
                      objectFit: "contain",
                      filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.1))",
                    }}
                    onError={(e) => {
                      console.error(
                        "خطأ في تحميل أيقونة المهمة:",
                        IMAGES.missionIcon,
                      );
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <span
                    className="btn-label-modern"
                    style={{
                      fontSize: "2.1rem",
                      fontWeight: 800,
                      fontFamily: "'Tajawal', sans-serif",
                      color: "#ffffff",
                      textShadow: "0 2px 6px rgba(0,0,0,0.25)",
                      letterSpacing: "0.8px",
                    }}
                    dir="rtl"
                  >
                    المهمة
                  </span>
                </div>

                {/* Goal button */}
                <div
                  className="cute-action-btn"
                  id="goalBtnNew"
                  ref={goalBtnRef}
                  onClick={handleGoalClick}
                  style={{
                    ...getRainbowButtonStyle(),
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    padding: "8px 28px",
                    borderRadius: "100px",
                    cursor: "pointer",
                    transition: "all 0.25s cubic-bezier(0.2, 0.9, 0.4, 1.2)",
                    minWidth: "220px",
                    justifyContent: "center",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, #ff5278, #ff7a3a, #ffa52e, #ffc94d, #88dd88, #55b8f0, #b966ff)";
                    e.currentTarget.style.backgroundSize = "250% 250%";
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow =
                      "0 20px 30px -10px rgba(236, 110, 90, 0.4), 0 0 0 1px rgba(255,255,255,0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, #ff6b8a, #ff8e53, #ffb347, #ffd166, #a0e7a0, #6ec6f5, #c77dff)";
                    e.currentTarget.style.backgroundSize = "250% 250%";
                    e.currentTarget.style.transform = "";
                    e.currentTarget.style.boxShadow =
                      "0 16px 24px -12px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255,255,255,0.3)";
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = "scale(0.96)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 14px rgba(0,0,0,0.18)";
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow =
                      "0 20px 30px -10px rgba(236, 110, 90, 0.4), 0 0 0 1px rgba(255,255,255,0.5)";
                  }}
                >
                  <img
                    ref={goalImgRef}
                    src={IMAGES.goalIcon}
                    alt="هدف"
                    style={{
                      width: "62px",
                      height: "62px",
                      objectFit: "contain",
                      filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.1))",
                    }}
                    onError={(e) => {
                      console.error(
                        "خطأ في تحميل أيقونة الهدف:",
                        IMAGES.goalIcon,
                      );
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <span
                    className="btn-label-modern"
                    style={{
                      fontSize: "2.1rem",
                      fontWeight: 800,
                      fontFamily: "'Tajawal', sans-serif",
                      color: "#ffffff",
                      textShadow: "0 2px 6px rgba(0,0,0,0.25)",
                      letterSpacing: "0.8px",
                    }}
                    dir="rtl"
                  >
                    الهدف
                  </span>
                </div>
              </div>
            </div>

            {/* Right content - Interactive image 🆕 تتغير عند النقر */}
            <div
              className="image-right"
              style={{
                flex: "1",
                minWidth: "280px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div
                className="monster-card"
                ref={giantWrapperRef}
                onClick={handleGiantImageClick}
                style={{
                  width: "100%",
                  maxWidth: "480px",
                  transition: "transform 0.2s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  const img = e.currentTarget.querySelector("img");
                  if (img) img.style.transform = "scale(1.01)";
                }}
                onMouseLeave={(e) => {
                  const img = e.currentTarget.querySelector("img");
                  if (img) img.style.transform = "scale(1)";
                }}
              >
                <img
                  ref={giantImgRef}
                  className="giant-monster-img"
                  src={currentCharacter.src}
                  alt="صورة تفاعلية - اضغط لتغيير اللون والشخصية"
                  style={{
                    width: "100%",
                    height: "auto",
                    filter: "drop-shadow(0 20px 28px rgba(0, 0, 0, 0.15))",
                    borderRadius: "48px",
                    transition: "transform 0.2s",
                  }}
                  onError={(e) => {
                    console.error("خطأ في تحميل الصورة:", currentCharacter.src);
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/480x480?text=اضغط+لتغيير+الشخصية";
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Instructional hint - محدث */}
        <div
          className="instruction-hint"
          style={{
            marginTop: "24px",
            textAlign: "center",
            fontSize: "0.9rem",
            fontWeight: 700,
            background: "rgba(240, 248, 255, 0.8)",
            backdropFilter: "blur(8px)",
            borderRadius: "80px",
            width: "fit-content",
            marginRight: "auto",
            marginLeft: "auto",
            padding: "8px 28px",
            color: "#236b48",
          }}
          dir="rtl"
        >
          🎨 اضغط على الصورة لتغيير الشخصية والألوان! 🎨
        </div>

        {/* Footer */}
        <footer
          id="footerText"
          style={{
            marginTop: "30px",
            textAlign: "center",
            fontSize: "0.75rem",
            color: "#4a7b62",
            fontWeight: 600,
            transition: "color 0.5s",
          }}
          dir="rtl"
        >
          <i className="fas fa-chart-line" /> تعلم، ادخر، ازدهر |
          <i className="fas fa-hand-holding-usd" /> بنك الجيل الواعد
        </footer>
      </div>
    </>
  );
};

export default ChildDashboard;
