/* eslint-disable react-hooks/preserve-manual-memoization */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

// ==================== الأنواع (Types) ====================
interface GoalItem {
  src: string;
  overlayColor: string;
  themeKey: ThemeKey;
  name: string;
  id: string;
  cost: number;
}

interface ShopItem {
  id: string;
  name: string;
  price: number;
  img: string;
  overlayColor: string;
  themeKey: ThemeKey;
}

interface CompletedGoal {
  childName: string;
  goalName: string;
  targetAmount: number;
  completedDate?: string;
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

interface ApiResponse<T> {
  data: T;
  message: string;
  code: string;
}

type ThemeKey = "green" | "blue" | "brown" | "pink" | "gold";

interface ThemeColors {
  titleGrad: string;
  balanceIcon: string;
  balanceText: string;
  balanceAmountC: string;
  balanceBg: string;
  balanceBorder: string;
  footerColor: string;
}

// ==================== الثوابت (Constants) ====================
const MAX_POINTS: number = 1000;
const COIN_IMG_URL: string = "/assest/mony.png";
const COIN_COUNT: number = 52;
const API_BASE_URL = "http://promising-generationapi.runasp.net/api";

// الأهداف الافتراضية المملوكة
const DEFAULT_GALLERY: GoalItem[] = [
  {
    src: "/assest/ايباد.png",
    overlayColor: "#7ec8e0",
    themeKey: "blue",
    name: "آيباد",
    id: "default_ipad",
    cost: 0,
  },
  {
    src: "/assest/ساعة_ذكية.png",
    overlayColor: "#D7AE81",
    themeKey: "brown",
    name: "ساعة ذكية",
    id: "default_watch",
    cost: 0,
  },
  {
    src: "/assest/كمبيوتر.png",
    overlayColor: "#a3e4b7",
    themeKey: "green",
    name: "كمبيوتر محمول",
    id: "default_laptop",
    cost: 0,
  },
  {
    src: "/assest/مصباح.png",
    overlayColor: "#ffb7c5",
    themeKey: "pink",
    name: "مصباح مكتبي",
    id: "default_lamp",
    cost: 0,
  },
  {
    src: "/assest/جيتار.png",
    overlayColor: "#ffe28a",
    themeKey: "gold",
    name: "جيتار",
    id: "default_guitar",
    cost: 0,
  },
];

// متجر الأهداف
const DEFAULT_SHOP: ShopItem[] = [
  {
    id: "shop_bicycle",
    name: "دراجة هوائية",
    price: 450,
    img: "/assest/Bicycle.png",
    overlayColor: "#a8d8ea",
    themeKey: "blue",
  },
  {
    id: "shop_football",
    name: "كرة قدم جديدة",
    price: 300,
    img: "/assest/كرة.png",
    overlayColor: "#d5f5d0",
    themeKey: "green",
  },
  {
    id: "shop_book",
    name: "كتاب جديد",
    price: 250,
    img: "/assest/مذاكرة.jpg",
    overlayColor: "#fce4c8",
    themeKey: "brown",
  },
  {
    id: "shop_headset",
    name: "سماعة ألعاب",
    price: 700,
    img: "/assest/سماعة.png",
    overlayColor: "#e8d5f5",
    themeKey: "pink",
  },
];

// إعدادات الثيمات اللونية
const TEXT_THEMES: Record<ThemeKey, ThemeColors> = {
  green: {
    titleGrad: "linear-gradient(135deg, #0a2e1a, #1e5a2f)",
    balanceIcon: "#1e7a3a",
    balanceText: "#1a4a2a",
    balanceAmountC: "#0f3a1a",
    balanceBg: "linear-gradient(125deg, #d4f5dc, #b8eac4)",
    balanceBorder: "#90d0a0",
    footerColor: "#1a4a2a",
  },
  blue: {
    titleGrad: "linear-gradient(135deg, #002b55, #005c99)",
    balanceIcon: "#0077aa",
    balanceText: "#003355",
    balanceAmountC: "#002244",
    balanceBg: "linear-gradient(125deg, #d4f0ff, #b8e4f8)",
    balanceBorder: "#90d0f0",
    footerColor: "#1a4a60",
  },
  brown: {
    titleGrad: "linear-gradient(135deg, #3b1f0b, #5c3b1f)",
    balanceIcon: "#b8863c",
    balanceText: "#5c3b1f",
    balanceAmountC: "#3e2210",
    balanceBg: "linear-gradient(125deg, #faead7, #f5dcc0)",
    balanceBorder: "#ddb88a",
    footerColor: "#5c3b1f",
  },
  pink: {
    titleGrad: "linear-gradient(135deg, #4a0a1a, #a82d5a)",
    balanceIcon: "#c85070",
    balanceText: "#6b1a3a",
    balanceAmountC: "#4a102a",
    balanceBg: "linear-gradient(125deg, #ffe0ea, #ffccda)",
    balanceBorder: "#f0a0b8",
    footerColor: "#6b1a3a",
  },
  gold: {
    titleGrad: "linear-gradient(135deg, #3a2a00, #6a4a00)",
    balanceIcon: "#c0a000",
    balanceText: "#5a4200",
    balanceAmountC: "#3a2a00",
    balanceBg: "linear-gradient(125deg, #fff8d0, #ffefb0)",
    balanceBorder: "#e0c860",
    footerColor: "#5a4200",
  },
};

// ==================== المكون الرئيسي ====================
const GoalsApp: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const childIdNumber = childId ? parseInt(childId) : 1;

  // ---------- الحالات (State) ----------
  const [galleryItems, setGalleryItems] = useState<GoalItem[]>(DEFAULT_GALLERY);
  const [shopItems] = useState<ShopItem[]>(DEFAULT_SHOP);
  const [goalProgressMap, setGoalProgressMap] = useState<Map<string, number>>(
    () => {
      const map = new Map<string, number>();
      DEFAULT_GALLERY.forEach((item) => map.set(item.src, 0));
      return map;
    },
  );
  const [userMoney, setUserMoney] = useState<number>(0);
  const [childName, setChildName] = useState<string>("الطفل");
  const [activeGoal, setActiveGoal] = useState<GoalItem | null>(
    DEFAULT_GALLERY[0],
  );
  const [showWinModal, setShowWinModal] = useState<boolean>(false);
  const [winMessage, setWinMessage] = useState<string>("");
  const [showRefundModal, setShowRefundModal] = useState<boolean>(false);
  const [refundMessage, setRefundMessage] = useState<string>("");
  const [saveAmount, setSaveAmount] = useState<number>(50);
  const [loading, setLoading] = useState<boolean>(true);
  const [completedGoals, setCompletedGoals] = useState<CompletedGoal[]>([]);

  // ---------- المراجع (Refs) ----------
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const coinsContainerRef = useRef<HTMLDivElement | null>(null);
  const progressCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // ==================== دوال API ====================

  // جلب بيانات الطفل (الاسم والرصيد)
  const fetchChildData = async () => {
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
  };

  // جلب الأهداف المحققة
  const fetchCompletedGoals = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/SavingsGoals/GetCompletedGoals?id=${childIdNumber}`,
      );
      if (response.ok) {
        const result: ApiResponse<CompletedGoal[]> = await response.json();
        if (result.code === "SUCCESS" && result.data) {
          setCompletedGoals(result.data);
        }
      }
    } catch (err) {
      console.error("Error fetching completed goals:", err);
    }
  };

  // جلب أهداف الادخار الخاصة بالطفل
  const fetchChildSavingsGoals = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/SavingsGoals/GetChildGoals?childId=${childIdNumber}`,
      );
      if (response.ok) {
        const result: ApiResponse<any[]> = await response.json();
        if (
          result.code === "SUCCESS" &&
          result.data &&
          result.data.length > 0
        ) {
          // تحويل أهداف API إلى GalleryItems
          const apiGoals: GoalItem[] = result.data.map((goal, index) => ({
            src: goal.imageUrl || `/assest/هدف${index + 1}.png`,
            overlayColor: `hsl(${Math.random() * 360}, 60%, 70%)`,
            themeKey: "blue" as ThemeKey,
            name: goal.name,
            id: `api_${goal.id}`,
            cost: goal.targetAmount,
          }));
          setGalleryItems((prev) => [...prev, ...apiGoals]);
        }
      }
    } catch (err) {
      console.error("Error fetching savings goals:", err);
    }
  };

  // تحديث رصيد الطفل في API
  const updateChildBalance = async (newBalance: number) => {
    try {
      const child = await fetch(
        `${API_BASE_URL}/Children/${childIdNumber}/Get`,
      ).then((res) => res.json());
      if (child?.data) {
        const updatedChild = {
          ...child.data,
          savingsBalance: newBalance,
        };
        await fetch(`${API_BASE_URL}/Children/Update`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedChild),
        });
      }
    } catch (err) {
      console.error("Error updating balance:", err);
    }
  };

  // إضافة هدف ادخار جديد إلى API
  const addSavingsGoalToAPI = async (goalData: {
    childId: number;
    name: string;
    targetAmount: number;
    imageUrl?: string;
  }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/SavingsGoals/Add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goalData),
      });
      const result = await response.json();
      return result.code === "SUCCESS";
    } catch (err) {
      console.error("Error adding savings goal:", err);
      return false;
    }
  };

  // إكمال هدف ادخار (تسجيل كهدف محقق)
  const completeSavingsGoal = async (goalId: number, amount: number) => {
    try {
      // تسجيل المعاملة
      const transactionData = {
        childId: childIdNumber,
        amount: amount,
        type: "GoalCompleted",
        description: `إكمال هدف ادخار`,
      };
      await fetch(`${API_BASE_URL}/Transactions/Add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionData),
      });
      return true;
    } catch (err) {
      console.error("Error completing goal:", err);
      return false;
    }
  };

  // ==================== دوال مساعدة ====================

  const createFloatingCoins = useCallback(() => {
    const container = coinsContainerRef.current;
    if (!container) return;
    container.innerHTML = "";
    for (let i = 0; i < COIN_COUNT; i++) {
      const coin = document.createElement("div");
      coin.className = "floating-coin";
      coin.style.backgroundImage = `url('${COIN_IMG_URL}')`;
      const size = 24 + Math.random() * 38;
      coin.style.width = `${size}px`;
      coin.style.height = `${size}px`;
      coin.style.left = `${Math.random() * 100}%`;
      coin.style.animationDuration = `${10 + Math.random() * 22}s`;
      coin.style.animationDelay = `${Math.random() * 14}s`;
      container.appendChild(coin);
    }
  }, []);

  const drawProgressCircle = useCallback((percent: number) => {
    const canvas = progressCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, 200, 200);
    const startAngle = -0.5 * Math.PI;
    const endAngle = startAngle + (percent / 100) * 2 * Math.PI;

    ctx.beginPath();
    ctx.arc(100, 100, 80, 0, 2 * Math.PI);
    ctx.strokeStyle = "#e0e7e6";
    ctx.lineWidth = 16;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(100, 100, 80, startAngle, endAngle);
    const grad = ctx.createLinearGradient(40, 40, 160, 160);
    grad.addColorStop(0, "#ffb347");
    grad.addColorStop(1, "#ffd166");
    ctx.strokeStyle = grad;
    ctx.lineWidth = 16;
    ctx.stroke();
  }, []);

  const updateUIForCurrentGoal = useCallback(() => {
    if (!activeGoal) {
      drawProgressCircle(0);
      return;
    }
    const points = goalProgressMap.get(activeGoal.src) || 0;
    const percent = Math.min(100, Math.max(0, (points / MAX_POINTS) * 100));
    drawProgressCircle(percent);
  }, [activeGoal, goalProgressMap, drawProgressCircle]);

  const clearMainGoalDisplay = useCallback(() => {
    setActiveGoal(null);
    drawProgressCircle(0);
  }, [drawProgressCircle]);

  const setMainGoal = useCallback(
    (goal: GoalItem) => {
      setActiveGoal(goal);
      if (!goalProgressMap.has(goal.src)) {
        setGoalProgressMap((prev) => {
          const newMap = new Map(prev);
          newMap.set(goal.src, 0);
          return newMap;
        });
      }
    },
    [goalProgressMap],
  );

  const showToast = (msg: string, duration: number = 2500) => {
    const toast = document.createElement("div");
    toast.innerText = msg;
    toast.style.cssText = `
      position:fixed; bottom:30px; left:50%; transform:translateX(-50%);
      background:#2c5a42dd; backdrop-filter:blur(12px); color:#fff;
      padding:12px 24px; border-radius:60px; z-index:9999;
      font-weight:bold; font-family:'Tajawal',sans-serif;
      white-space:nowrap; font-size:0.9rem;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
  };

  const triggerConfetti = useCallback(() => {
    const canvas = document.createElement("canvas");
    canvas.style.cssText =
      "position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:9998;";
    document.body.appendChild(canvas);
    const ctxConf = canvas.getContext("2d");
    if (!ctxConf) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Particle {
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rot: number;
      spin: number;
    }
    const particles: Particle[] = [];
    for (let i = 0; i < 180; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 80,
        size: 5 + Math.random() * 12,
        color: `hsl(${Math.random() * 360},75%,60%)`,
        speedX: (Math.random() - 0.5) * 3.5,
        speedY: -7 - Math.random() * 12,
        rot: 0,
        spin: (Math.random() - 0.5) * 14,
      });
    }

    let animId: number;
    const start = performance.now();
    const draw = (now: number) => {
      if ((now - start) / 1000 > 2.8) {
        cancelAnimationFrame(animId);
        canvas.remove();
        return;
      }
      ctxConf.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rot += p.spin;
        if (p.y < -50) p.y = canvas.height + 30;
        if (p.x > canvas.width + 60) p.x = -60;
        if (p.x < -60) p.x = canvas.width + 60;
        ctxConf.save();
        ctxConf.translate(p.x, p.y);
        ctxConf.rotate((p.rot * Math.PI) / 180);
        ctxConf.fillStyle = p.color;
        ctxConf.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctxConf.restore();
      });
      animId = requestAnimationFrame(draw);
    };
    animId = requestAnimationFrame(draw);
  }, []);

  const getPercentText = (): string => {
    if (!activeGoal) return "0%";
    const points = goalProgressMap.get(activeGoal.src) || 0;
    return `${Math.floor((points / MAX_POINTS) * 100)}%`;
  };

  const getProgressLabel = (): string => {
    if (!activeGoal) return "🛒 لا يوجد هدف نشط. اختر من المتجر أدناه";
    return `📈 تقدم هدف: ${activeGoal.name}`;
  };

  // ==================== الأحداث (Handlers) ====================

  const handleChangeGoalImage = useCallback(() => {
    if (galleryItems.length === 0) {
      showToast("⚠️ لا توجد أهداف في القائمة. أضف هدفاً من المتجر!", 2500);
      return;
    }
    if (!activeGoal) {
      setMainGoal(galleryItems[0]);
      return;
    }
    const currentIndex = galleryItems.findIndex(
      (item) => item.src === activeGoal.src,
    );
    const nextIndex = (currentIndex + 1) % galleryItems.length;
    const nextGoal = galleryItems[nextIndex];
    setMainGoal(nextGoal);
    showToast(`✅ تم تغيير الهدف إلى: ${nextGoal.name}`, 1500);
  }, [galleryItems, activeGoal, setMainGoal]);

  const handleSaving = useCallback(async () => {
    if (!activeGoal) {
      showToast("❌ لا يوجد هدف لإضافة التوفير إليه!");
      return;
    }
    const amount = saveAmount;
    if (isNaN(amount) || amount <= 0) {
      showToast("❌ أدخل مبلغ صحيح أكبر من صفر");
      return;
    }
    if (amount > userMoney) {
      showToast(`❌ رصيدك غير كافٍ! رصيدك الحالي: ${userMoney} ريال`);
      return;
    }

    const newBalance = userMoney - amount;
    setUserMoney(newBalance);
    await updateChildBalance(newBalance);

    const points = goalProgressMap.get(activeGoal.src) || 0;
    const newPoints = Math.min(MAX_POINTS, points + amount);
    setGoalProgressMap((prev) => {
      const newMap = new Map(prev);
      newMap.set(activeGoal.src, newPoints);
      return newMap;
    });

    setSaveAmount(50);
    showToast(`💰 تم ادخار ${amount} ريال وتحويلها إلى نقاط تقدم!`);

    if (newPoints >= MAX_POINTS) {
      showToast(
        "🎉 مبروك! اكتمل الهدف، اضغط على 'الحصول على الهدف' الآن 🎉",
        3000,
      );
    }
  }, [
    activeGoal,
    saveAmount,
    userMoney,
    goalProgressMap,
    updateChildBalance,
    showToast,
  ]);

  const handleClaimReward = useCallback(async () => {
    if (!activeGoal) {
      showToast("⚠️ لا يوجد هدف نشط لإكماله!");
      return;
    }
    const src = activeGoal.src;
    const points = goalProgressMap.get(src) || 0;
    if (points < MAX_POINTS) {
      showToast("⚠️ لم يكتمل الهدف بعد! أكمل التقدم أولاً (1000 نقطة) ⚠️");
      return;
    }

    const refundAmount = points;
    const newBalance = userMoney + refundAmount;
    setUserMoney(newBalance);
    await updateChildBalance(newBalance);
    await completeSavingsGoal(
      parseInt(activeGoal.id) || Date.now(),
      refundAmount,
    );

    setGalleryItems((prev) => {
      const index = prev.findIndex((item) => item.src === src);
      if (index !== -1) {
        const newItems = [...prev];
        newItems.splice(index, 1);
        return newItems;
      }
      return prev;
    });

    setGoalProgressMap((prev) => {
      const newMap = new Map(prev);
      newMap.delete(src);
      return newMap;
    });

    setWinMessage(
      `🎉 أنجزت "${activeGoal.name}"!<br><br>🗑️ الهدف أُزيل من قائمتك.<br><br>💰 تمت إضافة ${refundAmount} ريال إلى رصيدك!`,
    );
    setShowWinModal(true);
    triggerConfetti();
    clearMainGoalDisplay();
    await fetchCompletedGoals();
    showToast("🎯 تم إنجاز الهدف وحذفه. أضف هدفاً جديداً من المتجر!");
  }, [
    activeGoal,
    goalProgressMap,
    userMoney,
    updateChildBalance,
    completeSavingsGoal,
    triggerConfetti,
    clearMainGoalDisplay,
    fetchCompletedGoals,
    showToast,
    setGalleryItems,
    setGoalProgressMap,
    setWinMessage,
    setShowWinModal,
  ]);

  const handleDeleteCurrentGoal = useCallback(async () => {
    if (!activeGoal) {
      showToast("⚠️ لا يوجد هدف لحذفه!");
      return;
    }
    const src = activeGoal.src;
    const savedPoints = goalProgressMap.get(src) || 0;
    const goalToDelete = galleryItems.find((item) => item.src === src);
    if (!goalToDelete) {
      showToast("الهدف غير موجود");
      return;
    }

    if (
      !window.confirm(
        `⚠️ هل أنت متأكد من حذف هدف "${goalToDelete.name}" نهائياً؟\n\n💰 سيتم استرداد ${savedPoints} ريال إلى حصالتك.`,
      )
    )
      return;

    const newBalance = userMoney + savedPoints;
    setUserMoney(newBalance);
    await updateChildBalance(newBalance);

    setGalleryItems((prev) => {
      const index = prev.findIndex((item) => item.src === src);
      if (index !== -1) {
        const newItems = [...prev];
        newItems.splice(index, 1);
        return newItems;
      }
      return prev;
    });

    setGoalProgressMap((prev) => {
      const newMap = new Map(prev);
      newMap.delete(src);
      return newMap;
    });

    setRefundMessage(
      `💰 تم استرداد <strong>${savedPoints} ريال</strong> إلى حصالتك!<br>رصيدك الآن: <strong>${newBalance} ريال</strong><br><br>🗑️ تم حذف هدف "${goalToDelete.name}" بنجاح.`,
    );
    setShowRefundModal(true);
    clearMainGoalDisplay();
    showToast("🗑️ تم الحذف بنجاح. اختر هدفاً جديداً من المتجر.");
  }, [
    activeGoal,
    goalProgressMap,
    galleryItems,
    userMoney,
    updateChildBalance,
    clearMainGoalDisplay,
    showToast,
    setUserMoney,
    setGalleryItems,
    setGoalProgressMap,
    setRefundMessage,
    setShowRefundModal,
  ]);

  const handleAddStoreGoal = useCallback(
    async (shopItem: ShopItem) => {
      if (userMoney < shopItem.price) {
        showToast(
          `❌ رصيدك غير كافٍ! تحتاج ${shopItem.price} ريال لشراء هذا الهدف`,
        );
        return;
      }

      const newBalance = userMoney - shopItem.price;
      setUserMoney(newBalance);
      await updateChildBalance(newBalance);

      const success = await addSavingsGoalToAPI({
        childId: childIdNumber,
        name: shopItem.name,
        targetAmount: shopItem.price,
        imageUrl: shopItem.img,
      });

      if (success) {
        const newGoal: GoalItem = {
          src: shopItem.img,
          overlayColor: shopItem.overlayColor,
          themeKey: shopItem.themeKey,
          name: shopItem.name,
          id: `${shopItem.id}_${Date.now()}`,
          cost: shopItem.price,
        };

        setGalleryItems((prev) => [...prev, newGoal]);
        setGoalProgressMap((prev) => {
          const newMap = new Map(prev);
          newMap.set(newGoal.src, 0);
          return newMap;
        });

        setMainGoal(newGoal);
        triggerConfetti();
        showToast(`🎉 تمت إضافة "${shopItem.name}" كهدف رئيسي!`);
      } else {
        showToast("❌ فشل في إضافة الهدف، يرجى المحاولة مرة أخرى");
      }
    },
    [userMoney, childIdNumber, setMainGoal, triggerConfetti],
  );

  const addSpark = (e: React.MouseEvent) => {
    const d = document.createElement("div");
    d.innerHTML = "✨⭐";
    d.style.cssText = `
      position:fixed; left:${e.clientX}px; top:${e.clientY}px;
      font-size:32px; pointer-events:none; z-index:10000;
      transition:0.3s; opacity:1;
    `;
    document.body.appendChild(d);
    setTimeout(() => {
      d.style.opacity = "0";
      d.style.transform = "scale(1.5)";
      setTimeout(() => d.remove(), 300);
    }, 20);
  };

  // ==================== التأثيرات الجانبية ====================

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchChildData(),
        fetchCompletedGoals(),
        fetchChildSavingsGoals(),
      ]);
      setLoading(false);
    };
    loadData();
  }, [childIdNumber]);

  useEffect(() => {
    createFloatingCoins();
  }, [createFloatingCoins]);

  useEffect(() => {
    updateUIForCurrentGoal();
  }, [activeGoal, goalProgressMap, updateUIForCurrentGoal]);

  const getCurrentTheme = (): ThemeColors => {
    if (!activeGoal) return TEXT_THEMES.blue;
    return TEXT_THEMES[activeGoal.themeKey] || TEXT_THEMES.blue;
  };

  const theme = getCurrentTheme();

  if (loading) {
    return (
      <div
        className="flex justify-center items-center min-h-screen"
        style={{ fontFamily: "'Tajawal', sans-serif" }}
      >
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-[#236b48] mb-4" />
          <p className="text-[#236b48] text-lg">جاري تحميل الأهداف...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .floating-coin {
          position: absolute; bottom: -80px;
          background-size: contain; background-repeat: no-repeat; background-position: center;
          opacity: 0.65;
          animation: flyCoin linear infinite;
          filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.08));
        }
        @keyframes flyCoin {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          15% { opacity: 0.75; }
          85% { opacity: 0.75; }
          100% { transform: translateY(-120vh) rotate(360deg); opacity: 0; }
        }
        @keyframes shimmerMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes redShimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes bounceWin {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.04); }
          100% { transform: scale(1); opacity: 1; }
        }
        .shimmer-btn {
          background-size: 250% 250% !important;
          animation: shimmerMove 4s ease infinite !important;
        }
        .red-shimmer {
          background-size: 200% 200% !important;
          animation: redShimmer 3s ease infinite !important;
        }
        .win-anim {
          animation: bounceWin 0.45s ease;
        }
      `}</style>

      <div
        className="fixed inset-0 transition-colors duration-500 pointer-events-none z-0"
        style={{ backgroundColor: activeGoal?.overlayColor || "#c8e6df" }}
      />

      <div
        ref={coinsContainerRef}
        className="fixed inset-0 z-[1] pointer-events-none overflow-hidden"
      />

      <div className="relative z-[15] max-w-[1400px] mx-auto px-5 md:px-7 pb-10 min-h-screen flex flex-col">
        <header
          className="flex justify-between items-center flex-wrap gap-5 mb-7 rounded-[80px] px-7 py-3 shadow-[0_12px_28px_rgba(0,0,0,0.05)] border border-[#e6e6fa99] transition-all duration-400"
          style={{
            background: "rgba(255,255,255,0.537)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="flex items-center gap-4">
            <img
              className="w-14 h-14 object-contain drop-shadow-md hover:scale-[1.03] hover:rotate-1 transition-transform"
              src="/assest/شعار ازرق.png"
              alt="شعار بنك الجيل"
            />
            <div>
              <h1
                className="text-2xl md:text-[1.8rem] font-extrabold tracking-tight bg-clip-text text-transparent"
                style={{ backgroundImage: theme.titleGrad }}
              >
                بنك الجيل الواعد
              </h1>
              <p className="text-xs text-[#4a7a5c]">مرحباً {childName} 👋</p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => navigate(`/Child-Dashboard/${childIdNumber}`)}
              className="flex items-center gap-2 px-7 py-2.5 rounded-[60px] font-extrabold text-base border border-[#8cc8a080] transition-all duration-200 hover:translate-x-[5px]"
              style={{
                background: "rgba(255,255,255,0.55)",
                color: "#2c5a42",
              }}
            >
              <i className="fas fa-arrow-right" /> رجوع
            </button>

            <div
              className="flex items-center gap-3 px-6 py-2 rounded-[60px] shadow-[0_8px_16px_rgba(0,0,0,0.05)] border transition-all duration-500"
              style={{
                background: theme.balanceBg,
                borderColor: theme.balanceBorder,
              }}
            >
              <i
                className="fas fa-coins text-2xl"
                style={{ color: theme.balanceIcon }}
              />
              <span
                className="font-extrabold text-base"
                style={{ color: theme.balanceText }}
              >
                رصيدك :
              </span>
              <span
                className="text-2xl md:text-[1.8rem] font-black tracking-wider ltr inline-block"
                style={{ color: theme.balanceAmountC }}
              >
                {userMoney}
              </span>
              <span
                className="text-base font-bold mr-[5px]"
                style={{ color: theme.balanceText }}
              >
                ريال
              </span>
            </div>

            <button
              onClick={() => navigate("/welcome")}
              className="flex items-center gap-2 px-7 py-2.5 rounded-[60px] font-extrabold text-base border border-[#c85a4633] transition-all duration-200 hover:bg-[#d21919] hover:text-white active:scale-95"
              style={{
                background: "rgba(255,0,0,0.381)",
                backdropFilter: "blur(8px)",
                color: "#0d0d0da2",
              }}
            >
              <i className="fas fa-sign-out-alt" /> خروج
            </button>
          </div>
        </header>

        <div
          className="rounded-[70px] p-8 md:p-[38px] mb-7 shadow-[0_30px_45px_-20px_rgba(0,0,0,0.1)] border border-[#fffff5b3]"
          style={{
            background: "rgba(255,255,255,0.6)",
            backdropFilter: "blur(18px)",
          }}
        >
          <div className="flex gap-[50px] flex-wrap items-center justify-center">
            <div className="flex-1 min-w-[280px] flex justify-center">
              <div
                className="rounded-[64px] p-[30px_25px] text-center border-2 border-[#ffd700cc] shadow-[0_20px_35px_rgba(0,0,0,0.2)] w-full max-w-[420px] transition-transform"
                style={{
                  background: "rgba(255,255,255,0.5)",
                  backdropFilter: "blur(12px)",
                }}
              >
                {activeGoal ? (
                  <>
                    <img
                      id="goalImage"
                      className="w-full max-h-[280px] object-contain cursor-pointer hover:scale-[1.02] transition-transform drop-shadow-xl rounded-[32px]"
                      src={activeGoal.src}
                      alt={activeGoal.name}
                      onClick={handleChangeGoalImage}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/assest/جوائز.png";
                      }}
                    />
                    <div
                      className="mt-4 mx-auto inline-flex items-center gap-3 px-5 py-2 rounded-[60px] text-sm font-extrabold cursor-pointer border border-[#ffb42899]"
                      style={{
                        background: "rgba(255,200,60,0.45)",
                        backdropFilter: "blur(8px)",
                        color: "#4a2e00",
                      }}
                      onClick={handleChangeGoalImage}
                    >
                      <i className="fas fa-hand-peace" /> اضغط لتغيير الهدف{" "}
                      <i className="fas fa-image" />
                    </div>
                  </>
                ) : (
                  <div
                    className="mt-4 mx-auto inline-flex items-center gap-3 px-5 py-2 rounded-[60px] text-sm font-extrabold cursor-pointer border border-[#ffb42899]"
                    style={{
                      background: "rgba(255,200,60,0.45)",
                      backdropFilter: "blur(8px)",
                      color: "#4a2e00",
                    }}
                  >
                    <i className="fas fa-store" /> لا يوجد هدف – أضف من متجر
                    الأهداف <i className="fas fa-store" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex-[1.2] min-w-[300px] flex flex-col gap-7">
              <div
                className="rounded-[56px] p-6 text-center border border-[#ffffffe6]"
                style={{
                  background: "rgba(255,255,255,0.6)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <div className="relative w-[200px] h-[200px] mx-auto mb-4">
                  <canvas
                    ref={progressCanvasRef}
                    width={200}
                    height={200}
                    className="w-full h-full block"
                  />
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[2.3rem] font-black drop-shadow-md"
                    style={{ color: "#2c5a42" }}
                  >
                    {getPercentText()}
                  </div>
                </div>
                <span
                  className="inline-block text-base font-extrabold px-5 py-1.5 rounded-[60px]"
                  style={{ background: "#fff5e0", color: "#3e6b55" }}
                >
                  {getProgressLabel()}
                </span>

                <div
                  className="mt-6 rounded-[48px] p-4 flex flex-wrap items-center justify-center gap-4"
                  style={{ background: "rgba(235,245,255,0.7)" }}
                >
                  <input
                    type="number"
                    className="flex-[2] min-w-[130px] bg-white border-none py-3 px-5 rounded-[60px] font-bold text-center text-base outline-none shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
                    placeholder="المبلغ"
                    value={saveAmount}
                    min={1}
                    onChange={(e) =>
                      setSaveAmount(parseInt(e.target.value) || 0)
                    }
                  />
                  <button
                    onClick={(e) => {
                      addSpark(e);
                      handleSaving();
                    }}
                    className="shimmer-btn flex items-center gap-2 px-7 py-2.5 rounded-[60px] text-white font-extrabold shadow-[0_8px_16px_rgba(0,0,0,0.15)] transition-all duration-200 hover:-translate-y-1 active:scale-95"
                    style={{
                      background:
                        "linear-gradient(135deg, #ff6b8a, #ff8e53, #ffb347, #ffd166, #a0e7a0, #6ec6f5, #c77dff)",
                      textShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }}
                  >
                    <i className="fas fa-piggy-bank" /> ادخار
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-5 justify-center mt-1.5">
                <button
                  onClick={(e) => {
                    addSpark(e);
                    handleClaimReward();
                  }}
                  className="shimmer-btn flex-1 min-w-[160px] flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-[60px] text-white font-extrabold text-base shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition-all duration-200 hover:-translate-y-1 active:scale-95"
                  style={{
                    background:
                      "linear-gradient(135deg, #ff6b8a, #ff8e53, #ffb347, #ffd166, #a0e7a0, #6ec6f5, #c77dff)",
                    textShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }}
                >
                  <i className="fas fa-gift" /> الحصول على الهدف
                </button>

                <button
                  id="deleteGoalBtn"
                  onClick={(e) => {
                    addSpark(e);
                    handleDeleteCurrentGoal();
                  }}
                  className="red-shimmer flex-1 min-w-[160px] flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-[60px] text-white font-extrabold text-base border-2 border-[#a93226] shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(231,76,60,0.4)] active:scale-95"
                  style={{
                    background:
                      "linear-gradient(135deg, #e74c3c, #c0392b, #e74c3c)",
                    textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                  }}
                >
                  <i className="fas fa-trash-alt" /> إلغاء الهدف
                </button>

                <button
                  onClick={(e) => {
                    addSpark(e);
                    navigate(`/Child-Tasks/${childIdNumber}`);
                  }}
                  className="shimmer-btn flex-1 min-w-[160px] flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-[60px] text-white font-extrabold text-base shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition-all duration-200 hover:-translate-y-1 active:scale-95"
                  style={{
                    background:
                      "linear-gradient(135deg, #ff6b8a, #ff8e53, #ffb347, #ffd166, #a0e7a0, #6ec6f5, #c77dff)",
                    textShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }}
                >
                  <i className="fas fa-coins" /> الحصول على مال
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          className="rounded-[64px] p-[30px_25px] border border-[#ffd70059]"
          style={{
            background: "rgba(255,255,255,0.45)",
            backdropFilter: "blur(14px)",
          }}
        >
          <div className="text-center">
            <h2
              className="inline-block text-2xl font-extrabold mb-5 px-8 py-2 rounded-[60px] mx-auto"
              style={{
                background: "rgba(255,245,200,0.8)",
                backdropFilter: "blur(4px)",
                color: "#3e6b55",
              }}
            >
              <i className="fas fa-store" /> متجر الأهداف
            </h2>
            <p
              className="text-sm font-semibold mt-1"
              style={{ color: "#5a7a65" }}
            >
              🛒 اضغط على أي هدف لإضافته إلى قائمتك وتعيينه كهدف رئيسي
            </p>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-[26px] mt-3">
            {shopItems.length === 0 ? (
              <div
                className="text-center py-8 font-bold"
                style={{ color: "#7a9a85" }}
              >
                🛍️ لا توجد أهداف في المتجر حاليًا.
              </div>
            ) : (
              shopItems.map((item) => (
                <div
                  key={item.id}
                  className="shop-item flex flex-col text-center rounded-[44px] overflow-hidden border border-[#ffdc6499] cursor-pointer transition-all duration-250 hover:-translate-y-1.5 hover:shadow-[0_18px_32px_rgba(0,0,0,0.16)]"
                  style={{
                    background: "rgba(255,255,255,0.6)",
                    backdropFilter: "blur(10px)",
                  }}
                  onClick={(e) => {
                    addSpark(e);
                    handleAddStoreGoal(item);
                  }}
                >
                  <img
                    className="w-full aspect-[1/0.85] object-cover border-b-[3px] border-[gold]"
                    style={{ background: "#fef0d8" }}
                    src={item.img}
                    alt={item.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assest/جوائز.png";
                    }}
                  />
                  <div className="p-[14px_12px_18px]">
                    <div
                      className="text-xl font-extrabold"
                      style={{ color: "#1f543e" }}
                    >
                      {item.name}
                    </div>
                    <div
                      className="text-[1.3rem] font-black mt-2"
                      style={{ color: "#f39c12" }}
                    >
                      💰 {item.price} ريال
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* عرض الأهداف المحققة من API */}
        {completedGoals.length > 0 && (
          <div
            className="rounded-[64px] p-[30px_25px] mt-6 border border-[#00a86b59]"
            style={{
              background: "rgba(255,255,255,0.45)",
              backdropFilter: "blur(14px)",
            }}
          >
            <div className="text-center">
              <h2
                className="inline-block text-2xl font-extrabold mb-5 px-8 py-2 rounded-[60px] mx-auto"
                style={{
                  background: "rgba(200,255,220,0.8)",
                  backdropFilter: "blur(4px)",
                  color: "#2c5a42",
                }}
              >
                <i className="fas fa-trophy" /> الأهداف المحققة 🏆
              </h2>
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              {completedGoals.map((goal, index) => (
                <div
                  key={index}
                  className="bg-white/50 backdrop-blur-sm rounded-[32px] p-4 text-center min-w-[200px] border border-green-300"
                >
                  <div className="text-4xl mb-2">🏆</div>
                  <div className="font-extrabold text-[#1f543e]">
                    {goal.childName}
                  </div>
                  <div className="text-lg font-bold text-[#f39c12]">
                    {goal.goalName}
                  </div>
                  <div className="text-sm font-semibold text-green-600">
                    {goal.targetAmount} ريال
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <footer
          className="mt-7 text-center text-sm font-bold"
          style={{ color: theme.footerColor }}
        >
          <i className="fas fa-chart-line" /> ادخر لتحقيق أحلامك | بنك الجيل
          الواعد
        </footer>
      </div>

      <div
        className={`fixed inset-0 z-[2000] flex items-center justify-center transition-all duration-300 ${
          showWinModal ? "visible opacity-100" : "invisible opacity-0"
        }`}
        style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)" }}
        onClick={() => setShowWinModal(false)}
      >
        <div
          className="bg-gradient-to-br from-[#fff8e7] to-[#ffe6b3] rounded-[56px] p-8 text-center max-w-[450px] w-[90%] border-[3px] border-[gold] win-anim"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-[2.3rem]">🎉🏆🎉</div>
          <h2>✨ أنجزت الهدف العملاق! ✨</h2>
          <p dangerouslySetInnerHTML={{ __html: winMessage }} />
          <button
            className="mt-4 px-8 py-3 rounded-[60px] border-none font-extrabold cursor-pointer text-white text-base"
            style={{ background: "#ff9800" }}
            onClick={() => setShowWinModal(false)}
          >
            رائع
          </button>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-[2000] flex items-center justify-center transition-all duration-300 ${
          showRefundModal ? "visible opacity-100" : "invisible opacity-0"
        }`}
        style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)" }}
        onClick={() => setShowRefundModal(false)}
      >
        <div
          className="bg-gradient-to-br from-[#fff8e7] to-[#ffe6b3] rounded-[56px] p-8 text-center max-w-[450px] w-[90%] border-[3px] border-[#e74c3c] win-anim"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-[2rem]">💰🔄</div>
          <h2>تم استرداد المال!</h2>
          <p dangerouslySetInnerHTML={{ __html: refundMessage }} />
          <button
            className="mt-4 px-8 py-3 rounded-[60px] border-none font-extrabold cursor-pointer text-white text-base"
            style={{ background: "#e74c3c" }}
            onClick={() => setShowRefundModal(false)}
          >
            حسنًا
          </button>
        </div>
      </div>
    </>
  );
};

export default GoalsApp;
