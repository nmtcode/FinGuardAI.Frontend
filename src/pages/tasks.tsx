/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

// ============================================================
// Types & Interfaces
// ============================================================

interface Task {
  id: number;
  title: string;
  imgSrc: string;
  reward: number;
}

interface TaskState {
  status: "available" | "pending" | "approved";
  rewardPaid: boolean;
}

interface Theme {
  overlayColor: string;
  textTheme: {
    titleGradient: string;
    balanceIconColor: string;
    balanceTextColor: string;
    balanceAmountColor: string;
    balanceCurrencyColor: string;
    balanceBg: string;
    balanceBorderColor: string;
    footerColor: string;
  };
}

interface ChildData {
  id: number;
  parentId: number;
  name: string;
  age: number;
  level: number;
  avatarUrl: string;
  savingsBalance: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Quest {
  id: number;
  childId: number;
  parentId: number;
  title: string;
  description: string;
  amount: number;
  emoji: string;
  status: number;
  createdAt: string;
}

interface ApiResponse<T> {
  data: T;
  message: string;
  code: string;
}

// ============================================================
// Constants
// ============================================================

const COIN_IMG_URL = "/assest/mony.png";
const COIN_COUNT = 48;
const LOCAL_STORAGE_STATUS_KEY = "tasksStatusMap";
const LOCAL_STORAGE_MONEY_KEY = "childMoney";
const REWARD_VIDEO_URL = "/assest/فيديو_الجائزة.mp4";
const API_BASE_URL = "http://promising-generationapi.runasp.net/api";

// Default tasks (5 tasks with images)
const DEFAULT_TASKS: Task[] = [
  {
    id: 1,
    title: "الذهاب الى البقالة مع الوالد",
    imgSrc: "/assest/البقالة.png",
    reward: 10,
  },
  {
    id: 2,
    title: "اساعد امي باعمال المنزل",
    imgSrc: "/assest/تنظيف.png",
    reward: 15,
  },
  {
    id: 3,
    title: "مساعدة اختي بطبخ العشاء",
    imgSrc: "/assest/قدر_طبخ.png",
    reward: 20,
  },
  {
    id: 4,
    title: "مشاهدة فيديو عن الرياضيات",
    imgSrc: "/assest/مشاهدة_فيديو.png",
    reward: 25,
  },
  { id: 5, title: "غسل اطباق العشاء", imgSrc: "/assest/مطبخ.png", reward: 18 },
];

// Theme Gallery (5 colors)
const THEME_GALLERY: Theme[] = [
  {
    overlayColor: "#7ec8e0",
    textTheme: {
      titleGradient: "linear-gradient(135deg, #002b55, #005c99, #003d6b)",
      balanceIconColor: "#0077aa",
      balanceTextColor: "#003355",
      balanceAmountColor: "#002244",
      balanceCurrencyColor: "#003355",
      balanceBg: "linear-gradient(125deg, #d4f0ff, #b8e4f8)",
      balanceBorderColor: "#90d0f0",
      footerColor: "#1a4a60",
    },
  },
  {
    overlayColor: "#D7AE81",
    textTheme: {
      titleGradient: "linear-gradient(135deg, #3b1f0b, #5c3b1f, #4a2c10)",
      balanceIconColor: "#b8863c",
      balanceTextColor: "#5c3b1f",
      balanceAmountColor: "#3e2210",
      balanceCurrencyColor: "#5c3b1f",
      balanceBg: "linear-gradient(125deg, #faead7, #f5dcc0)",
      balanceBorderColor: "#ddb88a",
      footerColor: "#5c3b1f",
    },
  },
  {
    overlayColor: "#a3e4b7",
    textTheme: {
      titleGradient: "linear-gradient(135deg, #0a2e1a, #1e5a2f, #144a20)",
      balanceIconColor: "#3a8a4a",
      balanceTextColor: "#1a4a2a",
      balanceAmountColor: "#0f3a1a",
      balanceCurrencyColor: "#1a4a2a",
      balanceBg: "linear-gradient(125deg, #d4f5dc, #b8eac4)",
      balanceBorderColor: "#90d0a0",
      footerColor: "#1a4a2a",
    },
  },
  {
    overlayColor: "#ffb7c5",
    textTheme: {
      titleGradient: "linear-gradient(135deg, #4a0a1a, #a82d5a, #6b1a3a)",
      balanceIconColor: "#c85070",
      balanceTextColor: "#6b1a3a",
      balanceAmountColor: "#4a102a",
      balanceCurrencyColor: "#6b1a3a",
      balanceBg: "linear-gradient(125deg, #ffe0ea, #ffccda)",
      balanceBorderColor: "#f0a0b8",
      footerColor: "#6b1a3a",
    },
  },
  {
    overlayColor: "#ffe28a",
    textTheme: {
      titleGradient: "linear-gradient(135deg, #3a2a00, #6a4a00, #5a3a00)",
      balanceIconColor: "#c0a000",
      balanceTextColor: "#5a4200",
      balanceAmountColor: "#3a2a00",
      balanceCurrencyColor: "#5a4200",
      balanceBg: "linear-gradient(125deg, #fff8d0, #ffefb0)",
      balanceBorderColor: "#e0c860",
      footerColor: "#5a4200",
    },
  },
];

// ============================================================
// Main Component
// ============================================================

const TasksApp: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const childIdNumber = childId ? parseInt(childId) : 1;

  // State
  const [tasksMaster, setTasksMaster] = useState<Task[]>([...DEFAULT_TASKS]);
  const [tasksStatus, setTasksStatus] = useState<Map<number, TaskState>>(
    new Map(),
  );
  const [userMoney, setUserMoney] = useState<number>(500);
  const [childName, setChildName] = useState<string>("الطفل");
  const [currentThemeIndex, setCurrentThemeIndex] = useState<number>(0);
  const [showRewardModal, setShowRewardModal] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>("");
  const [showWrongToast, setShowWrongToast] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Refs
  const coinsContainerRef = useRef<HTMLDivElement | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const colorOverlayRef = useRef<HTMLDivElement | null>(null);
  const titleGradientRef = useRef<HTMLHeadingElement | null>(null);
  const balanceIconRef = useRef<HTMLElement | null>(null);
  const balanceLabelRef = useRef<HTMLDivElement | null>(null);
  const balanceAmountRef = useRef<HTMLDivElement | null>(null);
  const balanceCurrencyRef = useRef<HTMLDivElement | null>(null);
  const balanceCardRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLElement | null>(null);

  // ============================================================
  // Helper Functions
  // ============================================================

  const applyTextTheme = useCallback((theme: Theme["textTheme"]) => {
    if (titleGradientRef.current) {
      titleGradientRef.current.style.background = theme.titleGradient;
      titleGradientRef.current.style.backgroundClip = "text";
      titleGradientRef.current.style.webkitBackgroundClip = "text";
      titleGradientRef.current.style.color = "transparent";
    }
    if (balanceIconRef.current)
      balanceIconRef.current.style.color = theme.balanceIconColor;
    if (balanceLabelRef.current)
      balanceLabelRef.current.style.color = theme.balanceTextColor;
    if (balanceAmountRef.current)
      balanceAmountRef.current.style.color = theme.balanceAmountColor;
    if (balanceCurrencyRef.current)
      balanceCurrencyRef.current.style.color = theme.balanceCurrencyColor;
    if (balanceCardRef.current) {
      balanceCardRef.current.style.background = theme.balanceBg;
      balanceCardRef.current.style.borderColor = theme.balanceBorderColor;
    }
    if (footerRef.current) footerRef.current.style.color = theme.footerColor;
  }, []);

  const changeColorTheme = useCallback(() => {
    setCurrentThemeIndex((prev) => (prev + 1) % THEME_GALLERY.length);
  }, []);

  const showToast = useCallback((msg: string, duration = 2000) => {
    const toast = document.createElement("div");
    toast.innerText = msg;
    toast.style.cssText = `
      position:fixed; bottom:30px; left:50%; transform:translateX(-50%);
      background:#2c5a42dd; backdrop-filter:blur(10px); color:#fff;
      padding:8px 18px; border-radius:60px; z-index:9999;
      font-weight:bold; font-size:0.9rem; white-space:nowrap;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
  }, []);

  const showWrongToastMessage = useCallback(() => {
    setShowWrongToast(true);
    setTimeout(() => setShowWrongToast(false), 2100);
  }, []);

  const addSparkEffect = useCallback((e: React.MouseEvent) => {
    const spark = document.createElement("div");
    spark.innerHTML = "⭐✨";
    spark.style.cssText = `
      position:fixed; left:${e.clientX}px; top:${e.clientY}px; font-size:28px;
      pointer-events:none; z-index:9999; opacity:1;
      transform:translate(-50%, -50%); transition:all 0.3s;
    `;
    document.body.appendChild(spark);
    setTimeout(() => {
      spark.style.opacity = "0";
      spark.style.transform = "translate(-50%, -50%) scale(1.6)";
      setTimeout(() => spark.remove(), 300);
    }, 20);
  }, []);

  const triggerConfetti = useCallback(() => {
    const canvas = document.createElement("canvas");
    canvas.style.cssText = `
      position:fixed; top:0; left:0; width:100%; height:100%;
      pointer-events:none; z-index:9999;
    `;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const colors = [
      "#f39c12",
      "#e74c3c",
      "#2ecc71",
      "#3498db",
      "#f1c40f",
      "#e67e22",
      "#ff66cc",
    ];
    const particles = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 100,
      size: 4 + Math.random() * 9,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedX: (Math.random() - 0.5) * 3,
      speedY: -5 - Math.random() * 12,
      rotation: Math.random() * 360,
      spin: (Math.random() - 0.5) * 12,
    }));

    let animId: number;
    const start = performance.now();
    const draw = (now: number) => {
      if (now - start > 3000) {
        cancelAnimationFrame(animId);
        canvas.remove();
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.spin;
        if (p.y < -50) p.y = canvas.height + 20;
        if (p.x > canvas.width + 50) p.x = -50;
        if (p.x < -50) p.x = canvas.width + 50;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
      animId = requestAnimationFrame(draw);
    };
    animId = requestAnimationFrame(draw);
  }, []);

  const showRewardModalWithVideo = useCallback(
    (message: string, withConfetti = true) => {
      setModalMessage(message);
      setShowRewardModal(true);

      setTimeout(() => {
        if (videoContainerRef.current) {
          videoContainerRef.current.innerHTML = "";
          const video = document.createElement("video");
          video.autoplay = true;
          video.loop = true;
          video.muted = true;
          video.playsInline = true;
          video.style.width = "100%";
          video.style.maxHeight = "130px";
          video.style.borderRadius = "20px";
          const source = document.createElement("source");
          source.src = REWARD_VIDEO_URL;
          source.type = "video/mp4";
          video.appendChild(source);
          videoContainerRef.current.appendChild(video);
          video
            .play()
            .catch((e) => console.log("تعذر تشغيل الفيديو تلقائياً", e));
        }
      }, 100);

      setTimeout(() => setShowRewardModal(false), 8000);
      if (withConfetti) triggerConfetti();
    },
    [triggerConfetti],
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const addMoneyAndPersist = useCallback(
    (amount: number) => {
      setUserMoney((prev) => {
        const newMoney = prev + amount;
        showToast(`🎉 +${amount} ريال! رصيدك الآن ${newMoney} ريال`, 2200);
        return newMoney;
      });
    },
    [showToast],
  );

  const persistState = useCallback(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_STATUS_KEY,
        JSON.stringify(Array.from(tasksStatus.entries())),
      );
      localStorage.setItem(LOCAL_STORAGE_MONEY_KEY, userMoney.toString());
    } catch (e) {
      console.warn("فشل حفظ localStorage:", e);
    }
  }, [tasksStatus, userMoney]);

  const loadPersistedState = useCallback(() => {
    try {
      const savedStatus = localStorage.getItem(LOCAL_STORAGE_STATUS_KEY);
      if (savedStatus) {
        const parsed = JSON.parse(savedStatus) as [number, TaskState][];
        setTasksStatus(new Map(parsed));
      }
      const savedMoney = localStorage.getItem(LOCAL_STORAGE_MONEY_KEY);
      if (savedMoney !== null) setUserMoney(parseInt(savedMoney));
    } catch (e) {
      console.warn("فشل قراءة localStorage:", e);
    }
  }, []);

  // ============================================================
  // API Functions
  // ============================================================

  const fetchChildData = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/Children/${childIdNumber}/Get`,
      );
      if (response.ok) {
        const result: ApiResponse<ChildData> = await response.json();
        if (result.code === "FOUND") {
          setChildName(result.data.name);
          setUserMoney(result.data.savingsBalance);
        }
      }
    } catch (err) {
      console.error("Error fetching child data:", err);
    }
  }, [childIdNumber]);

  const sendTaskToParentForApproval = useCallback(
    async (task: Task) => {
      console.log(
        `[POST] يتم إرسال المهمة للموافقة: ${task.title} (ID: ${task.id}) بمكافأة ${task.reward} ريال`,
      );
      // TODO: استبدلي ب fetch حقيقي
      // const response = await fetch('https://api.parent-dashboard.com/tasks/approval-request', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ taskId: task.id, childId: childIdNumber, reward: task.reward })
      // });
      return true;
    },
    [childIdNumber],
  );

  const fetchNewTasksFromParent = useCallback(async () => {
    try {
      // TODO: استبدلي بـ API حقيقي
      // const response = await fetch(`${API_BASE_URL}/Quests/GetChildQuestsById?childId=${childIdNumber}`);
      // const result: ApiResponse<Quest[]> = await response.json();

      // محاكاة مهام جديدة
      const newMockTasks: Task[] = [
        {
          id: 6,
          title: "ترتيب سريري كل صباح",
          imgSrc: "/assest/ترتيب_سرير.png",
          reward: 12,
        },
        {
          id: 7,
          title: "قراءة قصة قبل النوم",
          imgSrc: "/assest/قراءة.png",
          reward: 22,
        },
      ];

      let added = false;
      setTasksMaster((prev) => {
        const newTasks = [...prev];
        for (const newTask of newMockTasks) {
          if (!newTasks.some((t) => t.id === newTask.id)) {
            newTasks.push(newTask);
            added = true;
          }
        }
        return newTasks;
      });

      if (added) {
        setTasksStatus((prev) => {
          const newMap = new Map(prev);
          newMockTasks.forEach((nt) => {
            if (!newMap.has(nt.id)) {
              newMap.set(nt.id, { status: "available", rewardPaid: false });
            }
          });
          return newMap;
        });
        showToast("✨ تمت إضافة مهام جديدة من والديك! ✨", 2500);
      }
    } catch (err) {
      console.error("Error fetching new tasks:", err);
    }
  }, [childIdNumber, showToast]);

  // ============================================================
  // Task Handlers
  // ============================================================

  const handleTaskCorrect = useCallback(
    async (taskId: number, e: React.MouseEvent) => {
      const task = tasksMaster.find((t) => t.id === taskId);
      if (!task) return;

      const state = tasksStatus.get(taskId);
      if (!state || state.status !== "available") {
        showToast(
          `⚠️ هذه المهمة ${state?.status === "pending" ? "بانتظار الموافقة" : "مكتملة بالفعل"}`,
          1600,
        );
        return;
      }

      // عرض التهنئة
      showRewardModalWithVideo(
        `🌟 أحسنت يا بطل! 🌟<br><br>⏳ سيتم إضافة ${task.reward} ريال بعد موافقة والديك`,
        true,
      );

      // تغيير الحالة إلى pending
      setTasksStatus((prev) => {
        const newMap = new Map(prev);
        newMap.set(taskId, { status: "pending", rewardPaid: false });
        return newMap;
      });

      // إرسال إشعار للأهل
      await sendTaskToParentForApproval(task);
      await persistState();

      addSparkEffect(e);
    },
    [
      tasksMaster,
      tasksStatus,
      showRewardModalWithVideo,
      sendTaskToParentForApproval,
      persistState,
      addSparkEffect,
      showToast,
    ],
  );

  const handleTaskWrong = useCallback(
    (e: React.MouseEvent) => {
      showWrongToastMessage();
      addSparkEffect(e);
    },
    [showWrongToastMessage, addSparkEffect],
  );

  const approveTaskByParent = useCallback(
    async (taskId: number) => {
      const task = tasksMaster.find((t) => t.id === taskId);
      if (!task) return;

      setTasksStatus((prev) => {
        const state = prev.get(taskId);
        if (!state || state.status !== "pending") {
          showToast("⚠️ هذه المهمة ليست في انتظار الموافقة!", 1500);
          return prev;
        }
        const newMap = new Map(prev);
        newMap.set(taskId, { status: "approved", rewardPaid: true });
        return newMap;
      });

      await fetchChildData(); // تحديث الرصيد من API
      showRewardModalWithVideo(
        `🎉 وافق والديك! حصلت على ${task.reward} ريال 🎉`,
        true,
      );
      await persistState();
    },
    [
      tasksMaster,
      fetchChildData,
      showRewardModalWithVideo,
      persistState,
      showToast,
    ],
  );

  // Expose approveTaskByParent to window for parent dashboard
  useEffect(() => {
    (window as any).approveTaskByParent = approveTaskByParent;
    return () => {
      delete (window as any).approveTaskByParent;
    };
  }, [approveTaskByParent]);

  // ============================================================
  // Effects
  // ============================================================

  // تحميل البيانات الأولية
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      loadPersistedState();

      // تهيئة حالة المهام الافتراضية
      setTasksStatus((prev) => {
        const newMap = new Map(prev);
        DEFAULT_TASKS.forEach((task) => {
          if (!newMap.has(task.id)) {
            newMap.set(task.id, { status: "available", rewardPaid: false });
          }
        });
        return newMap;
      });

      await Promise.all([fetchChildData(), fetchNewTasksFromParent()]);
      setLoading(false);
    };
    init();
  }, [loadPersistedState, fetchChildData, fetchNewTasksFromParent]);

  // حفظ الحالة عند التغيير
  useEffect(() => {
    persistState();
  }, [tasksStatus, userMoney, persistState]);

  // تطبيق الثيم الحالي
  useEffect(() => {
    const theme = THEME_GALLERY[currentThemeIndex];
    if (colorOverlayRef.current) {
      colorOverlayRef.current.style.backgroundColor = theme.overlayColor;
    }
    applyTextTheme(theme.textTheme);
  }, [currentThemeIndex, applyTextTheme]);

  // إنشاء العملات الطائرة
  useEffect(() => {
    const container = coinsContainerRef.current;
    if (!container) return;
    container.innerHTML = "";
    for (let i = 0; i < COIN_COUNT; i++) {
      const coin = document.createElement("div");
      coin.className = "floating-coin";
      coin.style.backgroundImage = `url('${COIN_IMG_URL}')`;
      const size = 22 + Math.random() * 30;
      coin.style.width = `${size}px`;
      coin.style.height = `${size}px`;
      coin.style.left = `${Math.random() * 100}%`;
      coin.style.animationDuration = `${10 + Math.random() * 20}s`;
      coin.style.animationDelay = `${Math.random() * 14}s`;
      container.appendChild(coin);
    }
  }, []);

  // تأثير Tilt للبطاقات (يتم تطبيقه بعد التصيير)
  useEffect(() => {
    const cards = document.querySelectorAll(".task-card");
    const handleMouseMove = (e: MouseEvent, card: Element) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 8;
      const rotateX = ((rect.height / 2 - y) / (rect.height / 2)) * 5;
      (card as HTMLElement).style.transform =
        `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(3px)`;
    };
    const handleMouseLeave = (card: Element) => {
      (card as HTMLElement).style.transform =
        "perspective(700px) rotateX(0deg) rotateY(0deg)";
      (card as HTMLElement).style.transition = "transform 0.3s";
    };

    cards.forEach((card) => {
      const onMouseMove = (e: MouseEvent) => handleMouseMove(e, card);
      const onMouseLeave = () => handleMouseLeave(card);
      card.addEventListener("mousemove", onMouseMove as EventListener);
      card.addEventListener("mouseleave", onMouseLeave);
      return () => {
        card.removeEventListener("mousemove", onMouseMove as EventListener);
        card.removeEventListener("mouseleave", onMouseLeave);
      };
    });
  }, [tasksMaster]);

  if (loading) {
    return (
      <div
        className="flex justify-center items-center min-h-screen"
        style={{ fontFamily: "'Tajawal', sans-serif" }}
      >
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-[#236b48] mb-4" />
          <p className="text-[#236b48] text-lg">جاري تحميل المهام...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ========== Styles ========== */}
      <style>{`
        .floating-coin {
          position: absolute; bottom: -80px;
          background-size: contain; background-repeat: no-repeat; background-position: center;
          opacity: 0.65; animation: flyCoin linear infinite;
          filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.08));
        }
        @keyframes flyCoin {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          15% { opacity: 0.75; } 85% { opacity: 0.75; }
          100% { transform: translateY(-120vh) rotate(360deg); opacity: 0; }
        }
        @keyframes shimmerMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes bouncePop {
          0% { transform: scale(0.7); opacity: 0; }
          80% { transform: scale(1.02); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes twinkleStar {
          0% { transform: scale(1); text-shadow: 0 0 5px gold; opacity: 0.7; }
          100% { transform: scale(1.2); text-shadow: 0 0 20px #ffb300; opacity: 1; }
        }
        .task-card {
          transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
          transform-style: preserve-3d;
        }
        .task-card:hover {
          box-shadow: 0 24px 36px -12px rgba(0, 0, 0, 0.3);
          transform: translateY(-4px);
        }
        .status-pending {
          background: rgba(160, 160, 160, 0.55);
          backdrop-filter: blur(12px);
          filter: grayscale(0.15);
          border-color: #aaaaaa;
        }
        .status-approved {
          background: rgba(65, 140, 85, 0.35);
          backdrop-filter: blur(12px);
          border-color: #8bc34a;
        }
        .toast-wrong {
          position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%) scale(0.9);
          background: rgba(0,0,0,0.8); backdrop-filter: blur(16px); color: #ffdd99;
          padding: 12px 24px; border-radius: 80px; font-size: 1rem; font-weight: 700;
          z-index: 2000; text-align: center; white-space: nowrap;
          opacity: 0; transition: all 0.3s ease; pointer-events: none;
          border: 1px solid #ffaa66;
        }
        .toast-wrong.show {
          opacity: 1; transform: translateX(-50%) scale(1);
        }
        @media (max-width: 1100px) { .tasks-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 850px) { .tasks-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 580px) { .tasks-grid { grid-template-columns: 1fr; } }
      `}</style>

      {/* ========== Dynamic Overlay ========== */}
      <div
        ref={colorOverlayRef}
        className="fixed inset-0 transition-colors duration-500 pointer-events-none z-0"
      />

      {/* ========== Coins Layer ========== */}
      <div
        ref={coinsContainerRef}
        className="fixed inset-0 z-[1] pointer-events-none overflow-hidden"
      />

      {/* ========== Main Container ========== */}
      <div className="relative z-[15] max-w-[1400px] mx-auto px-5 md:px-7 pb-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-5 mb-7 rounded-[80px] px-7 py-3 shadow-[0_12px_28px_rgba(0,0,0,0.05)] border border-[#e6e6fa99] bg-white/50 backdrop-blur-[20px]">
          <div className="flex items-center gap-4">
            <img
              className="w-14 h-14 object-contain drop-shadow-md hover:scale-[1.03] hover:rotate-1 transition-transform"
              src="/assest/شعار ازرق.png"
              alt="شعار بنك الجيل"
            />
            <div>
              <h1
                ref={titleGradientRef}
                className="text-2xl md:text-[1.8rem] font-extrabold bg-clip-text text-transparent"
              >
                بنك الجيل الواعد
              </h1>
              <p className="text-xs text-[#4a7a5c]">مرحباً {childName} 👋</p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={changeColorTheme}
              className="flex items-center gap-2 px-5 py-2 rounded-[60px] text-white font-extrabold text-sm border border-[#fff5c8cc] shadow-[0_6px_12px_rgba(0,0,0,0.2)] hover:scale-95 transition-transform"
              style={{
                background:
                  "linear-gradient(135deg, #ff6b8a, #ff8e53, #ffb347, #ffd166, #a0e7a0, #6ec6f5, #c77dff)",
                backgroundSize: "250% 250%",
                animation: "shimmerMove 4s ease infinite",
                textShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }}
            >
              <i className="fas fa-palette" /> <span>غير اللون</span>
            </button>

            <button
              onClick={() => navigate(`/Child-Dashboard/${childIdNumber}`)}
              className="flex items-center gap-2 px-7 py-2.5 rounded-[60px] font-extrabold text-base border border-[#8cc8a080] hover:translate-x-[5px] transition-transform bg-white/50 text-[#2c5a42]"
            >
              <i className="fas fa-arrow-right" /> رجوع
            </button>

            <div
              ref={balanceCardRef}
              className="flex items-center gap-3 px-6 py-2 rounded-[60px] shadow-[0_8px_16px_rgba(0,0,0,0.05)] border border-[#ffe0a3] bg-gradient-to-br from-amber-50 to-amber-100"
            >
              <i
                ref={balanceIconRef}
                className="fas fa-coins text-2xl"
                style={{ color: "#e6a017" }}
              />
              <div
                ref={balanceLabelRef}
                className="font-extrabold text-base"
                style={{ color: "#7a5300" }}
              >
                رصيدك :
              </div>
              <div
                ref={balanceAmountRef}
                className="text-2xl md:text-[1.8rem] font-black tracking-wider ltr inline-block"
                style={{ color: "#1f543e" }}
              >
                {userMoney}
              </div>
              <div
                ref={balanceCurrencyRef}
                className="text-base font-bold mr-[5px]"
                style={{ color: "#7a5300" }}
              >
                ريال
              </div>
            </div>

            <button
              onClick={() => navigate("/welcome")}
              className="flex items-center gap-2 px-7 py-2.5 rounded-[60px] font-extrabold text-base border border-[#c85a4633] hover:bg-red-600 hover:text-white active:scale-95 transition-all bg-red-500/40 backdrop-blur-sm text-gray-800"
            >
              <i className="fas fa-sign-out-alt" /> خروج
            </button>
          </div>
        </div>

        {/* Tasks Container */}
        <div className="rounded-[70px] p-8 md:p-[38px] mb-7 shadow-[0_30px_45px_-20px_rgba(0,0,0,0.1)] border border-[#fffff5b3] bg-white/60 backdrop-blur-[18px]">
          <div className="tasks-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center items-stretch">
            {tasksMaster.map((task) => {
              const state = tasksStatus.get(task.id) || {
                status: "available",
                rewardPaid: false,
              };
              const isPending = state.status === "pending";
              const isApproved = state.status === "approved";

              return (
                <div
                  key={task.id}
                  className={`task-card w-full max-w-[280px] flex flex-col rounded-[32px] overflow-hidden shadow-[0_16px_28px_-10px_rgba(0,0,0,0.2)] border backdrop-blur-[12px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_36px_-12px_rgba(0,0,0,0.3)] ${
                    isPending
                      ? "status-pending bg-gray-500/50 border-gray-400"
                      : isApproved
                        ? "status-approved bg-green-700/30 border-green-400"
                        : "bg-transparent border-amber-100/60"
                  }`}
                >
                  <div className="relative w-full aspect-square overflow-hidden bg-transparent">
                    <img
                      className="w-full h-full object-cover transition-transform duration-400 hover:scale-105"
                      src={task.imgSrc}
                      alt={task.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/assest/مذاكرة.jpg";
                      }}
                    />
                  </div>

                  <div className="flex justify-between items-center flex-wrap gap-2 px-3.5 py-3 border-t border-amber-200/50 bg-amber-50/60 backdrop-blur-sm">
                    <span className="text-sm font-extrabold text-[#2d3e2b] bg-white/50 px-2.5 py-1 rounded-[40px]">
                      {task.title}
                    </span>
                    <span className="flex items-center gap-1.5 bg-amber-100/70 px-3 py-1 rounded-[40px] text-sm">
                      <i className="fas fa-coins text-amber-500 text-sm" />
                      <span className="font-black text-amber-700 text-base">
                        {task.reward}
                      </span>
                    </span>
                  </div>

                  {state.status === "available" ? (
                    <div className="flex gap-3 p-3.5 justify-center bg-black/5">
                      <button
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-0 rounded-[60px] text-white font-extrabold text-base bg-gradient-to-r from-emerald-500 to-green-600 shadow-md hover:scale-95 transition-transform"
                        onClick={(e) => handleTaskCorrect(task.id, e)}
                      >
                        <i className="fas fa-check-circle" /> صح
                      </button>
                      <button
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-0 rounded-[60px] text-white font-extrabold text-base bg-gradient-to-r from-red-500 to-red-700 shadow-md hover:scale-95 transition-transform"
                        onClick={handleTaskWrong}
                      >
                        <i className="fas fa-times-circle" /> خطأ
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`m-3.5 p-3 rounded-[40px] text-center font-extrabold text-sm flex items-center justify-center gap-2 backdrop-blur-md ${
                        isPending
                          ? "bg-amber-50/90 text-amber-800"
                          : "bg-green-100/90 text-green-800"
                      }`}
                    >
                      <i
                        className={`fas ${isPending ? "fa-hourglass-half" : "fa-check-circle"}`}
                      />
                      {isPending
                        ? "🕒 في انتظار موافقة الأهل"
                        : "✓ تمت المكافأة"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <footer
          ref={footerRef}
          className="inline-block mx-auto mt-5 px-5 py-2 rounded-[40px] text-sm font-bold backdrop-blur-md bg-white/40"
        >
          <i className="fas fa-star-of-life" /> أتمنى لك يوماً مليئاً بالإنجازات
          | <i className="fas fa-smile-wink" /> بنك الجيل الواعد
        </footer>
      </div>

      {/* Reward Modal */}
      <div
        className={`fixed inset-0 z-[2000] flex items-center justify-center transition-all duration-300 ${
          showRewardModal ? "visible opacity-100" : "invisible opacity-0"
        }`}
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(12px)" }}
        onClick={() => setShowRewardModal(false)}
      >
        <div
          className="bg-gradient-to-br from-amber-50/98 to-amber-300/95 rounded-[48px] max-w-[380px] w-[85%] p-5 pb-7 text-center border-2 border-yellow-400 animate-[bouncePop_0.4s_ease]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-center gap-2 text-2xl mb-2">
            <i
              className="fas fa-star-of-life"
              style={{ animation: "twinkleStar 0.8s infinite alternate" }}
            />
            <i
              className="fas fa-star"
              style={{ animation: "twinkleStar 0.8s infinite alternate 0.2s" }}
            />
            <i
              className="fas fa-crown"
              style={{ animation: "twinkleStar 0.8s infinite alternate 0.4s" }}
            />
            <i
              className="fas fa-star"
              style={{ animation: "twinkleStar 0.8s infinite alternate 0.6s" }}
            />
            <i
              className="fas fa-star-of-life"
              style={{ animation: "twinkleStar 0.8s infinite alternate 0.8s" }}
            />
          </div>
          <div
            className="text-xl font-black text-amber-800 my-2"
            dangerouslySetInnerHTML={{ __html: modalMessage }}
          />
          <div ref={videoContainerRef} className="my-2" />
          <button
            className="mt-2 px-6 py-2 rounded-[50px] border-none text-white font-extrabold text-sm cursor-pointer bg-orange-500 hover:bg-orange-600 transition-colors"
            onClick={() => setShowRewardModal(false)}
          >
            ✨ إغلاق ✨
          </button>
        </div>
      </div>

      {/* Wrong Toast */}
      <div className={`toast-wrong ${showWrongToast ? "show" : ""}`}>
        لا بأس... حاول غداً! أنا أثق بك 🤍
      </div>
    </>
  );
};

export default TasksApp;
