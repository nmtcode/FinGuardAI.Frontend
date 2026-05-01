// ============================================================
// child-dashboard-api.js
// ملف منفصل للتواصل مع API وإدارة منطق لوحة تحكم الطفل
// ============================================================

(function () {
  // ==================== الثوابت ====================
  const API_BASE_URL = "http://promising-generationapi.runasp.net/api";
  const COIN_IMG_URL = "assest/mony.png";
  const COIN_COUNT = 42;

  // معرض الصور والألوان
  const IMAGE_GALLERY = [
    {
      src: "assest/ابن_ازرق.png",
      strongColor: "#7ec8e0",
      name: "أزرق",
      textTheme: {
        titleGradient: "linear-gradient(135deg, #002b55, #005c99, #003d6b)",
        greetingGradient: "linear-gradient(125deg, #004466, #0077aa)",
        greetingSpanGradient: "linear-gradient(125deg, #002244, #005588)",
        questionColor: "#003344",
        questionBorderColor: "#0088bb",
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
      src: "assest/بنت_برتقالي.png",
      strongColor: "#D7AE81",
      name: "بني دافئ",
      textTheme: {
        titleGradient: "linear-gradient(135deg, #3b1f0b, #5c3b1f, #4a2c10)",
        greetingGradient: "linear-gradient(125deg, #5c3b1f, #8b5a2b)",
        greetingSpanGradient: "linear-gradient(125deg, #4a2c10, #7a4a20)",
        questionColor: "#4a2c10",
        questionBorderColor: "#b8863c",
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
      src: "assest/ابن_اخضر.png",
      strongColor: "#a3e4b7",
      name: "أخضر",
      textTheme: {
        titleGradient: "linear-gradient(135deg, #0a2e1a, #1e5a2f, #144a20)",
        greetingGradient: "linear-gradient(125deg, #1a4a2a, #2d6a3f)",
        greetingSpanGradient: "linear-gradient(125deg, #0f3a1a, #1f5a2f)",
        questionColor: "#1a3a1a",
        questionBorderColor: "#3a8a4a",
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
      src: "assest/بنت_وردي.png",
      strongColor: "#ffb7c5",
      name: "وردي",
      textTheme: {
        titleGradient: "linear-gradient(135deg, #4a0a1a, #a82d5a, #6b1a3a)",
        greetingGradient: "linear-gradient(125deg, #6b1a3a, #a82d5a)",
        greetingSpanGradient: "linear-gradient(125deg, #4a102a, #8a1a4a)",
        questionColor: "#4a102a",
        questionBorderColor: "#c85070",
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
      src: "assest/ابن_اصفر.png",
      strongColor: "#ffe28a",
      name: "أصفر",
      textTheme: {
        titleGradient: "linear-gradient(135deg, #3a2a00, #6a4a00, #5a3a00)",
        greetingGradient: "linear-gradient(125deg, #5a4200, #8a6500)",
        greetingSpanGradient: "linear-gradient(125deg, #3a2a00, #6a4a00)",
        questionColor: "#3a2a00",
        questionBorderColor: "#c0a000",
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

  // ==================== المتغيرات العامة ====================
  let currentImageIndex = 0;
  let childId = null;
  let childData = null;

  // ==================== الحصول على childId من الرابط ====================
  function getChildIdFromUrl() {
    // طريقة 1: من المسار /Child-Dashboard/1
    const pathParts = window.location.pathname.split("/");
    const lastPart = pathParts[pathParts.length - 1];
    if (lastPart && !isNaN(lastPart)) {
      return parseInt(lastPart);
    }

    // طريقة 2: من query parameter ?id=1
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get("id");
    if (idParam && !isNaN(idParam)) {
      return parseInt(idParam);
    }

    // طريقة 3: من localStorage
    const savedId = localStorage.getItem("childId");
    if (savedId && !isNaN(savedId)) {
      return parseInt(savedId);
    }

    // القيمة الافتراضية
    return 1;
  }

  // ==================== دوال API ====================
  async function apiGet(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`API GET Error: ${endpoint}`, error);
      return null;
    }
  }

  // جلب بيانات الطفل
  async function fetchChildData() {
    try {
      const result = await apiGet(`/Children/${childId}/Get`);

      if (result?.code === "FOUND" && result?.data) {
        childData = result.data;

        // تحديث اسم الطفل
        const nameSpan = document.getElementById("childNameDisplay");
        if (nameSpan) nameSpan.innerText = childData.name;

        // تحديث الرصيد
        const balanceAmount = document.getElementById("balanceAmount");
        if (balanceAmount) balanceAmount.innerText = childData.savingsBalance;

        // حفظ في localStorage
        localStorage.setItem("childName", childData.name);
        localStorage.setItem("childId", childId);

        return childData;
      } else {
        console.warn("لم يتم العثور على بيانات الطفل");
        // استخدام البيانات المخزنة مؤقتاً
        const savedName = localStorage.getItem("childName");
        if (savedName) {
          const nameSpan = document.getElementById("childNameDisplay");
          if (nameSpan) nameSpan.innerText = savedName;
        }
        return null;
      }
    } catch (error) {
      console.error("Error fetching child data:", error);
      showToast("فشل في تحميل البيانات", 3000);
      return null;
    }
  }

  // تحديث رصيد الطفل (يمكن استدعاؤها من أي مكان)
  window.updateChildBalance = function (newBalance) {
    const balanceAmount = document.getElementById("balanceAmount");
    if (balanceAmount) balanceAmount.innerText = newBalance;
    if (childData) childData.savingsBalance = newBalance;
  };

  // ==================== دوال التأثيرات البصرية ====================
  function createFloatingCoins() {
    const container = document.getElementById("coinsLayer");
    if (!container) return;

    container.innerHTML = "";
    for (let i = 0; i < COIN_COUNT; i++) {
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
  }

  function applyTextTheme(theme) {
    const elements = {
      titleGradient: document.getElementById("titleGradient"),
      greetingText: document.getElementById("greetingText"),
      childNameDisplay: document.getElementById("childNameDisplay"),
      bigQuestion1: document.getElementById("bigQuestion1"),
      bigQuestion2: document.getElementById("bigQuestion2"),
      balanceIcon: document.getElementById("balanceIcon"),
      balanceLabel: document.getElementById("balanceLabel"),
      balanceAmount: document.getElementById("balanceAmount"),
      balanceCurrency: document.getElementById("balanceCurrency"),
      balanceCard: document.getElementById("balanceCard"),
      footerText: document.getElementById("footerText"),
    };

    if (elements.titleGradient) {
      elements.titleGradient.style.background = theme.titleGradient;
      elements.titleGradient.style.backgroundClip = "text";
      elements.titleGradient.style.webkitBackgroundClip = "text";
      elements.titleGradient.style.color = "transparent";
    }

    if (elements.greetingText) {
      elements.greetingText.style.background = theme.greetingGradient;
      elements.greetingText.style.backgroundClip = "text";
      elements.greetingText.style.webkitBackgroundClip = "text";
      elements.greetingText.style.color = "transparent";
    }

    if (elements.childNameDisplay) {
      elements.childNameDisplay.style.background = theme.greetingSpanGradient;
      elements.childNameDisplay.style.backgroundClip = "text";
      elements.childNameDisplay.style.webkitBackgroundClip = "text";
      elements.childNameDisplay.style.color = "transparent";
    }

    if (elements.bigQuestion1) {
      elements.bigQuestion1.style.color = theme.questionColor;
      elements.bigQuestion1.style.borderRightColor = theme.questionBorderColor;
    }

    if (elements.bigQuestion2) {
      elements.bigQuestion2.style.color = theme.questionColor;
      elements.bigQuestion2.style.borderRightColor = theme.questionBorderColor;
    }

    if (elements.balanceIcon)
      elements.balanceIcon.style.color = theme.balanceIconColor;
    if (elements.balanceLabel)
      elements.balanceLabel.style.color = theme.balanceTextColor;
    if (elements.balanceAmount)
      elements.balanceAmount.style.color = theme.balanceAmountColor;
    if (elements.balanceCurrency)
      elements.balanceCurrency.style.color = theme.balanceCurrencyColor;

    if (elements.balanceCard) {
      elements.balanceCard.style.background = theme.balanceBg;
      elements.balanceCard.style.borderColor = theme.balanceBorderColor;
    }

    if (elements.footerText)
      elements.footerText.style.color = theme.footerColor;
  }

  function changeBackgroundAndImage() {
    currentImageIndex = (currentImageIndex + 1) % IMAGE_GALLERY.length;
    const newItem = IMAGE_GALLERY[currentImageIndex];

    const giantImg = document.getElementById("giantImg");
    const colorOverlay = document.getElementById("colorOverlay");

    if (giantImg) {
      giantImg.src = newItem.src;
      giantImg.style.transform = "scale(1.02)";
      setTimeout(() => {
        if (giantImg) giantImg.style.transform = "scale(1)";
      }, 150);
    }

    if (colorOverlay) {
      colorOverlay.style.backgroundColor = newItem.strongColor;
    }

    applyTextTheme(newItem.textTheme);

    const header = document.getElementById("mainHeader");
    if (header) {
      header.style.transition = "background 0.2s";
      header.style.background = "rgba(255,255,255,0.95)";
      setTimeout(() => {
        if (header) header.style.background = "rgba(255,255,255,0.9)";
      }, 200);
    }

    console.log(`✅ تم تغيير الثيم إلى: ${newItem.name}`);
  }

  function addSpark(e, emoji = "⭐✨") {
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
  }

  function showToast(msg, duration = 2500) {
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
  }

  // ==================== تأثيرات الحركة (Mouse Effects) ====================
  function setupMouseEffects() {
    const giantWrapper = document.getElementById("giantImageWrapper");
    const missionBtn = document.getElementById("missionBtnNew");
    const goalBtn = document.getElementById("goalBtnNew");
    const missionImg = document.getElementById("missionImgNew");
    const goalImg = document.getElementById("goalImgNew");

    // حركة الصورة مع الماوس
    if (giantWrapper) {
      window.addEventListener("mousemove", (e) => {
        const w = window.innerWidth,
          h = window.innerHeight;
        let x = (e.clientX / w) * 2 - 1;
        let y = (e.clientY / h) * 2 - 1;
        x = Math.min(Math.max(x, -0.7), 0.7);
        y = Math.min(Math.max(y, -0.5), 0.5);
        giantWrapper.style.transform = `translate(${x * 25}px, ${y * 18}px)`;
      });

      window.addEventListener("mouseleave", () => {
        if (giantWrapper) giantWrapper.style.transform = "translate(0px,0px)";
      });
    }

    // تأثير اهتزاز زر المهمة
    if (missionBtn && missionImg) {
      missionBtn.addEventListener("mouseenter", () =>
        missionImg.classList.add("shake-image"),
      );
      missionBtn.addEventListener("mouseleave", () =>
        missionImg.classList.remove("shake-image"),
      );
    }

    // تأثير دوران زر الهدف
    if (goalBtn && goalImg) {
      goalBtn.addEventListener("mouseenter", () =>
        goalImg.classList.add("spin-image"),
      );
      goalBtn.addEventListener("mouseleave", () =>
        goalImg.classList.remove("spin-image"),
      );
    }

    // تأثير 3D Tilt للأزرار
    window.addEventListener("mousemove", (e) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = (e.clientY / window.innerHeight) * 2 - 1;

      if (missionBtn && !missionBtn.matches(":hover")) {
        const rotY = normX * 4,
          rotX = normY * -2;
        missionBtn.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(2px)`;
      } else if (missionBtn && missionBtn.matches(":hover")) {
        missionBtn.style.transform = "scale(0.98)";
      }

      if (goalBtn && !goalBtn.matches(":hover")) {
        const rotY = normX * 4,
          rotX = normY * -2;
        goalBtn.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(2px)`;
      } else if (goalBtn && goalBtn.matches(":hover")) {
        goalBtn.style.transform = "scale(0.98)";
      }
    });

    if (missionBtn) {
      missionBtn.addEventListener(
        "mouseleave",
        () => (missionBtn.style.transform = ""),
      );
    }
    if (goalBtn) {
      goalBtn.addEventListener(
        "mouseleave",
        () => (goalBtn.style.transform = ""),
      );
    }
  }

  // ==================== التنقل بين الصفحات ====================
  function setupNavigation() {
    const missionBtn = document.getElementById("missionBtnNew");
    const goalBtn = document.getElementById("goalBtnNew");
    const exitBtn = document.getElementById("exitAppBtn");
    const giantImg = document.getElementById("giantImg");

    if (missionBtn) {
      missionBtn.addEventListener("click", (e) => {
        addSpark(e);
        window.location.href = `child-tasks.html?id=${childId}`;
      });
    }

    if (goalBtn) {
      goalBtn.addEventListener("click", (e) => {
        addSpark(e);
        window.location.href = `child-goals.html?id=${childId}`;
      });
    }

    if (exitBtn) {
      exitBtn.addEventListener("click", () => {
        if (confirm("✨ هل تريد العودة إلى الشاشة الرئيسية؟ ✨")) {
          window.location.href = "welcome.html";
        }
      });
    }

    if (giantImg) {
      giantImg.addEventListener("click", (e) => {
        e.stopPropagation();
        changeBackgroundAndImage();
        addSpark(e, "🎨🌈");
      });
    }
  }

  // ==================== التهيئة ====================
  async function init() {
    // إظهار حالة التحميل
    const balanceAmount = document.getElementById("balanceAmount");
    if (balanceAmount) balanceAmount.innerText = "...";

    // الحصول على childId
    childId = getChildIdFromUrl();
    console.log(`📌 Child ID: ${childId}`);

    // إنشاء العملات الطائرة
    createFloatingCoins();

    // جلب بيانات الطفل من API
    await fetchChildData();

    // تطبيق الثيم الابتدائي
    const colorOverlay = document.getElementById("colorOverlay");
    if (colorOverlay) {
      colorOverlay.style.backgroundColor = IMAGE_GALLERY[0].strongColor;
    }
    applyTextTheme(IMAGE_GALLERY[0].textTheme);

    // إعداد التأثيرات والتنقل
    setupMouseEffects();
    setupNavigation();

    console.log("✅ Child Dashboard initialized successfully!");
  }

  // بدء التشغيل
  init();
})();
