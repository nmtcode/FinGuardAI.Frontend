/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faPlusCircle,
  faSignOutAlt,
  faChild,
  faHourglassHalf,
  faWallet,
  faTrophy,
  faImages,
  faRobot,
  faLightbulb,
  faHandSparkles,
  faBullseye,
  faCheckCircle,
  faListCheck,
  faHourglassStart,
  faShieldAlt,
  faTasks,
  faBroom,
  faBook,
  faBed,
  faPenFancy,
  faStar,
  faDumbbell,
  faCamera,
  faTrashAlt,
  faPaperPlane,
  faUserCircle,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import ApiService from "../ApiService";
import {useNavigate } from "react-router";

interface SavingJourney {
  goalName: string;
  childName: string;
  amount: number;
  currentAmount?: number; // إذا كان الـ API يرجع المبلغ الحالي
  targetAmount?: number; // إذا كان الـ API يرجع المبلغ المستهدف
  progressPercentage?: number; // إذا كان الـ API يرجع النسبة
}
// -------------------- تعريف أنواع البيانات --------------------
interface Child {
  id: number;
  name: string;
  age: number;
  balance: number;
  avatar: string | null;
  level?: number;
  parentId?: number;
}

interface Quest {
  id: number;
  childId: number;
  parentId: number;
  title: string;
  description: string;
  amount: number;
  status: number; // 0 = Pending, 1 = Completed, 2 = Approved
  emoji?: string;
  createdAt: string;
}

interface SavingsGoal {
  id: number;
  childId: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  imageUrl?: string;
  isCompleted: boolean;
  progressPercentage: number;
}

interface Achievement {
  id: number;
  childId: number;
  title: string;
  amount: number;
  createdAt: string;
}

interface CompletedGoal {
  childName: string;
  goalName: string;
  targetAmount: number;
  completedDate?: string; // إذا كان الـ API يرجع التاريخ
}

// أضف هذا الـ Interface مع باقي الـ Interfaces في بداية الملف
interface SuggestionItem {
  id: number;
  description: string;
  reward: number;
  category: string;
  targetAge: string;
  fullDescription: string;
}
// أضف هذا الـ Interface مع باقي الـ Interfaces
interface AllowedGoal {
  id: number;
  name: string;
  image: string;
  price: number;
}
// -------------------- المكون الرئيسي --------------------
const FatherDashboard: React.FC = () => {
  // ------ State declarations ------
  const [children, setChildren] = useState<Child[]>([]);
  const [pendingTasks, setPendingTasks] = useState<Quest[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Quest[]>([]);
  const [achievedGoals, setAchievedGoals] = useState<Achievement[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [sentWisdom, setSentWisdom] = useState<Set<number>>(new Set());
  // أضف هذا مع باقي الـ State declarations
  const [isGenerating, setIsGenerating] = useState(false);
  // استبدل الـ State declaration الموجود بهذا
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [completedGoals, setCompletedGoals] = useState<CompletedGoal[]>([]);
  // ------ Loading states ------
  const [isLoading, setIsLoading] = useState({
    children: true,
    tasks: true,
    goals: true,
    stats: true,
  });

  // ------ UI state for modals ------
  const [isChildModalOpen, setIsChildModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isChildSelectModalOpen, setIsChildSelectModalOpen] = useState(false);
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [childSelectCallback, setChildSelectCallback] = useState<
    ((childId: number) => void) | null
  >(null);

  // New child form data
  const [newChildName, setNewChildName] = useState("");
  const [newChildAge, setNewChildAge] = useState<number>(3);
  const [newChildAvatar, setNewChildAvatar] = useState<string | null>(null);
  const [newChildLevel, setNewChildLevel] = useState<number>(1);

  // New task form data
  const [taskChildId, setTaskChildId] = useState<number | undefined>(undefined);
  const [taskDescription, setTaskDescription] = useState("");
  const [taskReward, setTaskReward] = useState<number>(0);
  const [selectedIcon, setSelectedIcon] = useState("fa-broom");

  // AI suggestions
  const [aiPrompt, setAiPrompt] = useState("");
  const [specifiedAmount, setSpecifiedAmount] = useState<number | "">("");
  // const [suggestions, setSuggestions] = useState<
  //   {
  //     category: import("react/jsx-runtime").JSX.Element;
  //     description: string;
  //     reward: number;
  //   }[]
  // >([]);

  // New goal form data
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalPrice, setNewGoalPrice] = useState<number>(0);
  const [newGoalImage, setNewGoalImage] = useState<string | null>(null);
  const [newGoalEmoji, setNewGoalEmoji] = useState<string>("🎁"); // ✅ جديد
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false); // ✅ جديد
  const [emojiSearchTerm, setEmojiSearchTerm] = useState(""); // ✅ جديد
  const [allowedGoals, setAllowedGoals] = useState<AllowedGoal[]>([]); // ✅ أضف هذا

  // Stats from API
  const [savingJourneys, setSavingJourneys] = useState<SavingJourney[]>([]);
  // ✅ جلب رحلات الادخار للأبناء
  const fetchSavingJourneys = async () => {
    try {
      const response = await ApiService.getAll<any>(
        `/SavingsGoals/GetSavingJourneys?parentId=${parentId}`,
      );
      console.log("📈 Saving Journeys Response:", response);

      if (response?.code === "SUCCESS" && response?.data) {
        setSavingJourneys(response.data);
      }
    } catch (error) {
      console.error("Error fetching saving journeys:", error);
    }
  };
  const [activeChildrenCount, setActiveChildrenCount] = useState<number>(0);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [weeklyEarningsAmount, setWeeklyEarningsAmount] = useState<number>(0);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);
  const [richestChild, setRichestChild] = useState<Child | null>(null);

  // Refs for scroll behavior
  const childrenSectionRef = useRef<HTMLDivElement>(null);
  const tasksSectionRef = useRef<HTMLDivElement>(null);
  const suggestionsSectionRef = useRef<HTMLDivElement>(null);
  const goalsSectionRef = useRef<HTMLDivElement>(null);

  const parentId = Number(localStorage.getItem("parentId")) || 1;

  // ==================== 1. دوال ChildrenController ====================
  const renderAchievedGoals = () => {
    if (completedGoals.length === 0) {
      return (
        <div
          className="empty-state"
          style={{ textAlign: "center", padding: "20px" }}
        >
          🏆 لا توجد أهداف محققة بعد
        </div>
      );
    }

    return completedGoals.map((goal, index) => (
      <div key={index} className="achievement-item">
        <div className="task-col" style={{ flex: 1, textAlign: "right" }}>
          <strong>{goal.childName}</strong>
        </div>
        <div className="task-col" style={{ flex: 1, textAlign: "center" }}>
          {goal.goalName}
        </div>
        <div className="amount-col" style={{ flex: 1, textAlign: "left" }}>
          <span style={{ fontWeight: "bold", color: "#00a86b" }}>
            {goal.targetAmount} ريال
          </span>
          {goal.completedDate && (
            <div className="timestamp">
              {new Date(goal.completedDate).toLocaleDateString("ar-EG")}
            </div>
          )}
        </div>
      </div>
    ));
  };

  // ✅ جلب الأهداف المحققة
  const fetchCompletedGoals = async () => {
    try {
      // ملاحظة: استخدم الـ parentId أو أي معرّف مناسب
      const response = await ApiService.getAll<any>(
        `/SavingsGoals/GetCompletedGoals?id=${parentId}`,
      );
      console.log("🏆 Completed Goals Response:", response);

      if (response?.code === "SUCCESS" && response?.data) {
        setCompletedGoals(response.data);
      }
    } catch (error) {
      console.error("Error fetching completed goals:", error);
    }
  };

  // ✅ جلب عدد الأطفال النشطين
  const fetchActiveChildrenCount = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, stats: true }));
      const response = await ApiService.getAll<any>(
        `/Children/GetActiveChildrenCount?parentId=${parentId}`,
      );
      if (response?.code == "SUCCESS") {
        setActiveChildrenCount(response.data);
      }
      return response;
    } catch (error) {
      console.error("Error fetching active children count:", error);
      showToast("فشل في جلب عدد الأطفال");
    } finally {
      setIsLoading((prev) => ({ ...prev, stats: false }));
    }
  };

  const fetchAllChildren = async () => {
    try {
      const response = await ApiService.getAll<any>(
        `/Children/GetAll?parentId=${parentId}`,
      );
      if (response?.code === "SUCCESS" && response?.data) {
        const formattedChildren = response.data.map((child: any) => ({
          id: child.id,
          name: child.name,
          age: child.age,
          balance: child.savingsBalance || 0,
          avatar: child.avatarUrl,
          level: child.level,
          parentId: child.parentId,
        }));
        setChildren(formattedChildren);
      }
    } catch (error) {
      console.error("Error fetching children:", error);
    }
  };
  // ✅ جلب أغنى طفل
  const fetchRichestChild = async () => {
    try {
      const response = await ApiService.getAll<any>(`/Children/Richest`);
      if (
        (response?.code == "SUCCESS" || response?.code == "FOUND") &&
        response?.data
      ) {
        setRichestChild({
          id: response.data.id,
          name: response.data.name,
          age: response.data.age,
          balance: response.data.savingsBalance,
          avatar: response.data.avatarUrl,
          level: response.data.level,
          parentId: response.data.parentId,
        });
      }
      return response;
    } catch (error) {
      console.error("Error fetching richest child:", error);
    }
  };

  // ✅ إضافة طفل جديد
  const addChildToAPI = async (childData: {
    parentId: number;
    name: string;
    age: number;
    level: number;
    avatarUrl: string;
    savingsBalance: number;
  }) => {
    try {
      const response = await ApiService.post<any>(`/Children/Add`, childData);
      if (response?.code == "SUCCESS") {
        showToast(`✅ تم إضافة ${childData.name} بنجاح`);
        const newChild = response.data;
        setChildren((prev) => [
          ...prev,
          {
            id: newChild.id,
            name: newChild.name,
            age: newChild.age,
            balance: newChild.savingsBalance || 0,
            avatar: newChild.avatarUrl,
            level: newChild.level,
            parentId: newChild.parentId,
          },
        ]);
        await fetchActiveChildrenCount();
        await fetchRichestChild();
      }
      return response;
    } catch (error) {
      console.error("Error adding child:", error);
      showToast("❌ فشل في إضافة الطفل");
      throw error;
    }
  };

  // ✅ تحديث بيانات طفل
  const updateChildInAPI = async (id: number, childData: any) => {
    try {
      const response = await ApiService.put<any>(
        `/Children/Update`,
        id,
        childData,
      );
      if (response?.code == "SUCCESS") {
        showToast(`✅ تم تحديث البيانات بنجاح`);
        setChildren((prev) =>
          prev.map((c) => (c.id === id ? { ...c, ...childData } : c)),
        );
      }
      return response;
    } catch (error) {
      console.error(`Error updating child ${id}:`, error);
      showToast("❌ فشل في تحديث بيانات الطفل");
      throw error;
    }
  };

  // ✅ حذف طفل
  const deleteChildFromAPI = async (id: number) => {
    try {
      const response = await ApiService.delete<any>(`/Children/Delete`, id);
      if (response?.code == "SUCCESS") {
        showToast(`✅ تم حذف الطفل بنجاح`);
        setChildren((prev) => prev.filter((c) => c.id !== id));
        await fetchActiveChildrenCount();
        await fetchRichestChild();
      }
      return response;
    } catch (error) {
      console.error(`Error deleting child ${id}:`, error);
      showToast("❌ فشل في حذف الطفل");
      throw error;
    }
  };

  // ==================== 2. دوال QuestsController ====================

  // ✅ جلب جميع المهام الخاصة بالوالد
  // مثال لدالة fetchAllQuests
  const fetchAllQuests = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, tasks: true }));
      const response = await ApiService.getAll<any>(
        `/Quests/GetParentQuestsByParentId?parentId=${parentId}`,
      );

      if (response?.code == "SUCCESS" && response?.data) {
        const allQuests: Quest[] = response.data;
        const pending = allQuests.filter((q) => q.status === 1);
        const completed = allQuests.filter((q) => q.status === 2);

        setPendingTasks(pending);
        setCompletedTasks(completed);
      } else {
        console.log("❌ No data or SUCCESS false");
      }
      return response;
    } catch (error) {
      console.error("Error fetching quests:", error);
      showToast("فشل في جلب المهام");
    } finally {
      setIsLoading((prev) => ({ ...prev, tasks: false }));
    }
  };

  // ✅ جلب عدد المهام التي تنتظر الموافقة
  const fetchPendingApprovalsCount = async () => {
    try {
      const response = await ApiService.getAll<any>(
        `/Quests/GetPendingApprovalsCount?parentId=${parentId}`,
      );
      if (response?.code == "SUCCESS") {
        setPendingApprovalsCount(response.data);
      }
      return response;
    } catch (error) {
      console.error("Error fetching pending approvals count:", error);
    }
  };

  // ✅ جلب أرباح هذا الأسبوع
  const fetchWeeklyEarnings = async () => {
    try {
      const response = await ApiService.getAll<any>(
        `/Quests/GetEarnedThisWeekFromQuests?parentId=${parentId}`,
      );
      if (response?.code == "SUCCESS") {
        setWeeklyEarningsAmount(response.data);
      }
      return response;
    } catch (error) {
      console.error("Error fetching weekly earnings:", error);
    }
  };

  // ✅ جلب إجمالي رصيد العائلة
  const fetchTotalFamilyBalance = async () => {
    try {
      const response = await ApiService.getAll<any>(
        `/Quests/GetTotalFamilyBalance?parentId=${parentId}`,
      );
      if (response?.code == "SUCCESS") {
        setTotalBalance(response.data);
      }
      return response;
    } catch (error) {
      console.error("Error fetching family balance:", error);
    }
  };

  // ✅ إضافة مهمة جديدة
  const addTaskToAPI = async (taskData: {
    childId: number;
    parentId: number;
    title: string;
    description: string;
    amount: number;
    emoji?: string;
  }) => {
    try {
      const response = await ApiService.post<any>(`/Quests/Add`, taskData);
      if (response?.code == "SUCCESS") {
        showToast(`✅ تم إضافة المهمة بنجاح`);
        await fetchAllQuests();
        await fetchPendingApprovalsCount();
      }
      return response;
    } catch (error) {
      console.error("Error adding task:", error);
      showToast("❌ فشل في إضافة المهمة");
      throw error;
    }
  };

  // ✅ حذف مهمة
  const deleteTaskFromAPI = async (taskId: number) => {
    try {
      const response = await ApiService.delete<any>(`/Quests/Delete`, taskId);
      if (response?.code == "SUCCESS") {
        showToast(`✅ تم حذف المهمة بنجاح`);
        await fetchAllQuests();
        await fetchPendingApprovalsCount();
      }
      return response;
    } catch (error) {
      console.error("Error deleting task:", error);
      showToast("❌ فشل في حذف المهمة");
      throw error;
    }
  };

  // ✅ إكمال مهمة (بواسطة الطفل)
  const completeTaskInAPI = async (taskId: number) => {
    try {
      const response = await ApiService.put<any>(
        `/Quests/${taskId}/Complete`,
        taskId,
        {},
      );
      if (response?.code == "SUCCESS") {
        showToast(`✅ تم إكمال المهمة بنجاح`);
        await fetchAllQuests();
        await fetchPendingApprovalsCount();
      }
      return response;
    } catch (error) {
      console.error("Error completing task:", error);
      showToast("❌ فشل في إكمال المهمة");
      throw error;
    }
  };

  // ✅ اعتماد مهمة (بواسطة الأب)
  const approveTaskInAPI = async (taskId: number) => {
    try {
      const response = await ApiService.put<any>(
        `/Quests/${taskId}/Approve`,
        taskId,
        {},
      );
      if (response?.code == "SUCCESS") {
        showToast(`✅ تم اعتماد المهمة بنجاح`);
        await fetchAllQuests();
        await fetchTotalFamilyBalance();
        await fetchWeeklyEarnings();
        await fetchRichestChild();
        await fetchPendingApprovalsCount();
      }
      return response;
    } catch (error) {
      console.error("Error approving task:", error);
      showToast("❌ فشل في اعتماد المهمة");
      throw error;
    }
  };

  // ✅ توليد مهام باستخدام AI
  const generateQuestsWithAI = async (message: string, sessionId?: string) => {
    try {
      const response = await ApiService.post<any>(`/Quests/generate`, {
        message,
        sessionId: sessionId || undefined,
      });
      if (response?.code == "SUCCESS") {
        showToast(`🤖 تم توليد مهام جديدة بنجاح`);
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Error generating quests:", error);
      showToast("❌ فشل في توليد المهام");
      throw error;
    }
  };

  // ==================== 3. دوال SavingsGoalsController ====================

  // ✅ جلب أهداف الادخار لطفل معين
  const fetchChildSavingsGoals = async (childId: number) => {
    try {
      const response = await ApiService.getAll<any>(
        `/SavingsGoals/GetChildGoals?childId=${childId}`,
      );
      if (response?.code == "SUCCESS" && response?.data) {
        setSavingsGoals(response.data);
      }
      return response;
    } catch (error) {
      console.error(`Error fetching goals for child ${childId}:`, error);
    }
  };

  // ✅ دالة إضافة مهمة جديدة (سواء من AI أو من الإدخال اليدوي)
  const addTaskToChild = async (
    childId: number,
    suggestion: Pick<
      SuggestionItem,
      "description" | "fullDescription" | "reward"
    >,
  ) => {
    if (!childId || !suggestion.description.trim() || suggestion.reward <= 0) {
      showToast("الرجاء تحديد مكافأة صحيحة للمهمة");
      return false;
    }

    try {
      const response = await addTaskToAPI({
        childId: childId,
        parentId: parentId,
        title: suggestion.description,
        description: suggestion.fullDescription || suggestion.description,
        amount: suggestion.reward,
        emoji: "fa-star",
      });

      if (response?.code === "SUCCESS") {
        showToast(
          `✅ تم تعيين المهمة "${suggestion.description}" بـ ${suggestion.reward} ريال`,
        );
        // اختياري: حذف المهمة من الـ suggestions بعد الإضافة
        setSuggestions((prev) =>
          prev.filter((s) => s.description !== suggestion.description),
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error adding task to child:", error);
      showToast("❌ فشل في تعيين المهمة");
      return false;
    }
  };

  // ✅ إضافة هدف ادخار جديد
  const addSavingsGoalToAPI = async (goalData: {
    childId: number;
    name: string;
    targetAmount: number;
    imageUrl?: string;
  }) => {
    try {
      const response = await ApiService.post<any>(
        `/SavingsGoals/Add`,
        goalData,
      );
      if (response?.code == "SUCCESS") {
        showToast(`🎯 تم إضافة هدف الادخار بنجاح`);
        if (goalData.childId) {
          await fetchChildSavingsGoals(goalData.childId);
        }
      }
      return response;
    } catch (error) {
      console.error("Error adding savings goal:", error);
      showToast("❌ فشل في إضافة هدف الادخار");
      throw error;
    }
  };

  // قائمة الإيموجيات المقترحة
  const emojiList = [
    { emoji: "🚲", name: "دراجة" },
    { emoji: "📱", name: "آيفون" },
    { emoji: "🎮", name: "ألعاب" },
    { emoji: "🛴", name: "سكوتر" },
    { emoji: "⌚", name: "ساعة" },
    { emoji: "📷", name: "كاميرا" },
    { emoji: "🎒", name: "حقيبة" },
    { emoji: "🚁", name: "درون" },
    { emoji: "👟", name: "حذاء" },
    { emoji: "🎧", name: "سماعات" },
    { emoji: "🧸", name: "دمية" },
    { emoji: "⚽", name: "كرة" },
    { emoji: "🎨", name: "ألوان" },
    { emoji: "📚", name: "كتب" },
    { emoji: "💻", name: "لابتوب" },
    { emoji: "📸", name: "كاميرا تصوير" },
    { emoji: "🎸", name: "جيتار" },
    { emoji: "🏀", name: "كرة سلة" },
    { emoji: "🚗", name: "سيارة" },
    { emoji: "🐶", name: "كلب" },
  ];

  const Navigate = useNavigate();
  // فلترة الإيموجيات حسب البحث
  const filteredEmojis = emojiList.filter(
    (item) =>
      item.name.includes(emojiSearchTerm) ||
      item.emoji.includes(emojiSearchTerm),
  );
  // ✅ المساهمة في هدف ادخار
  // const contributeToGoalAPI = async (goalId: number, amount: number) => {
  //   try {
  //     const response = await ApiService.patch<any>(
  //       `/SavingsGoals/ContributeToGoal?id=${goalId}`,
  //       amount,
  //     );
  //     if (response?.code == "SUCCESS") {
  //       showToast(`💰 تمت المساهمة بنجاح`);
  //       return response.data;
  //     }
  //     return null;
  //   } catch (error) {
  //     console.error("Error contributing to goal:", error);
  //     showToast("❌ فشل في المساهمة");
  //     throw error;
  //   }
  // };

  // ==================== 4. دوال TransactionsController ====================

  // ✅ جلب الإنجازات المحققة
  const fetchAchievements = async () => {
    try {
      const response = await ApiService.getAll<any>(
        `/Transactions/Achievements`,
      );
      if (response?.code == "SUCCESS" && response?.data) {
        setAchievedGoals(response.data);
      }
      return response;
    } catch (error) {
      console.error("Error fetching achievements:", error);
    }
  };

  // ==================== تحميل البيانات الأولية ====================
  useEffect(() => {
    const loadAllData = async () => {
      await Promise.all([
        fetchAllQuests(),
        fetchTotalFamilyBalance(),
        fetchActiveChildrenCount(),
        fetchRichestChild(),
        fetchAchievements(),
        fetchWeeklyEarnings(),
        fetchPendingApprovalsCount(),
        fetchAllChildren(),
        fetchCompletedGoals(), // ✅ أضف هذا
        fetchSavingJourneys(), // ✅ أضف هذا
      ]);
    };
    loadAllData();
  }, []);

  const renderSavingJourneys = () => {
    if (savingJourneys.length === 0) {
      return (
        <div
          className="empty-state"
          style={{ textAlign: "center", padding: "20px" }}
        >
          📈 لا توجد رحلات ادخار حالياً
        </div>
      );
    }

    return savingJourneys.map((journey, index) => (
      <div key={index} className="achievement-item">
        <div className="task-col" style={{ flex: 1, textAlign: "right" }}>
          <strong>{journey.childName}</strong>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {journey.goalName}
          </div>
        </div>
        <div className="amount-col" style={{ textAlign: "left" }}>
          <span style={{ fontWeight: "bold", color: "#0035e0" }}>
            {journey.amount} ريال
          </span>
          {journey.progressPercentage && (
            <div className="timestamp">
              <div
                style={{
                  width: `${journey.progressPercentage}%`,
                  height: "4px",
                  background: "#00a86b",
                  borderRadius: "2px",
                  marginTop: "4px",
                }}
              />
              {journey.progressPercentage}%
            </div>
          )}
        </div>
      </div>
    ));
  };

  // -------------------- دوال حساب الإحصائيات --------------------
  const getChildName = (childId: number) => {
    const child = children.find((c) => c.id === childId);
    return child?.name || "طفل";
  };

  const getTopChild = useCallback(() => {
    return richestChild;
  }, [richestChild]);

  // -------------------- دوال معالجة الأحداث --------------------

  const addNewChild = async (
    name: string,
    age: number,
    avatarBase64: string | null,
  ) => {
    if (!name || age < 3) {
      showToast("الاسم وعمر 3+ مطلوب");
      return false;
    }

    const childData = {
      parentId: parentId,
      name: name,
      age: age,
      level: newChildLevel,
      avatarUrl: avatarBase64 || "",
      savingsBalance: 0,
    };

    try {
      await addChildToAPI(childData);
      return true;
    } catch (error) {
      return false;
    }
  };

  const addNewTask = async (
    childId: number,
    description: string,
    reward: number,
    icon: string,
  ) => {
    if (!childId || !description.trim() || reward <= 0) {
      showToast("بيانات غير صالحة");
      return false;
    }

    try {
      await addTaskToAPI({
        childId: childId,
        parentId: parentId,
        title: description,
        description: description,
        amount: reward,
        emoji: icon,
      });
      return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return false;
    }
  };

  const approveTask = async (taskId: number) => {
    await approveTaskInAPI(taskId);
  };

  const rejectTask = async (taskId: number) => {
    if (confirm("هل أنت متأكد من رفض هذه المهمة؟")) {
      await deleteTaskFromAPI(taskId);
    }
  };

  const addAchievedGoal = async (
    childId: number,
    goalName: string,
    amount: number,
  ) => {
    // ملاحظة: إضافة هدف محقق ليس لها Endpoint مباشر
    // يمكن استخدام SavingsGoals/Add مع isCompleted = true
    showToast(`🎯 تم تسجيل هدف "${goalName}" للطفل`);
  };

  const sendWisdomMessage = async (childId: number) => {
    if (sentWisdom.has(childId)) return;
    setSentWisdom((prev) => new Set(prev).add(childId));
    const child = children.find((c) => c.id === childId);
    if (child) {
      const message = "عمل رائع يا صغيري";
      showToast(`📩 تم إرسال رسالة إلى ${child.name}: "${message}"`);
    }
  };

  const showToast = (msg: string) => {
    const toast = document.createElement("div");
    toast.innerText = msg;
    toast.style.cssText =
      "position:fixed;bottom:120px;left:50%;transform:translateX(-50%);background:#0035e0;color:#fff;padding:12px 28px;border-radius:60px;z-index:9999;font-weight:800;font-size:0.85rem;box-shadow:0 8px 24px rgba(0,30,200,0.35);letter-spacing:0.2px;animation:fadeInUp 0.3s ease;";
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.3s";
      setTimeout(() => toast.remove(), 300);
    }, 2200);
  };

  // // توليد اقتراحات المهام
  // const generateSuggestions = (prompt: string, totalAmount: number) => {
  //   const keywords: Record<string, string[]> = {
  //     نوم: ["ترتيب السرير", "قراءة قصة قبل النوم", "تنظيف الأسنان"],
  //     مدرسة: ["حل واجب الرياضيات", "قراءة درس العلوم", "تحضير حقيبة المدرسة"],
  //     ترتيب: ["ترتيب غرفة النوم", "تنظيم المكتب", "طي الملابس"],
  //     رياضة: ["تمارين الصباح", "الجري في الحديقة", "تمارين الضغط"],
  //   };

  //   let tasks: string[] = [];
  //   const lowerPrompt = prompt.toLowerCase();
  //   for (const key in keywords) {
  //     if (lowerPrompt.includes(key)) tasks = keywords[key];
  //   }
  //   if (tasks.length === 0)
  //     tasks = ["مساعدة في المطبخ", "قراءة كتاب", "تنظيف المنزل"];
  //   const amount = totalAmount && totalAmount > 0 ? totalAmount : 30;
  //   const base = amount / tasks.length;
  //   return tasks.map((desc) => ({
  //     description: desc,
  //     reward: Math.round((base * 0.8 + Math.random() * base * 0.4) * 10) / 10,
  //   }));
  // };

  const openChildSelectModal = (callback: (childId: number) => void) => {
    if (children.length === 0) {
      showToast("لا يوجد أطفال مسجلين");
      return;
    }
    setChildSelectCallback(() => callback);
    setIsChildSelectModalOpen(true);
  };

  const handleAddGoal = async () => {
    if (!newGoalName || newGoalPrice <= 0) {
      showToast("يرجى إدخال اسم وسعر صحيح");
      return;
    }

    // إنشاء هدف جديد
    const newGoal = {
      id: Date.now(),
      name: newGoalName,
      image: newGoalEmoji,
      price: newGoalPrice,
    };

    // إضافة إلى State
    setAllowedGoals((prev) => {
      const updatedGoals = [...prev, newGoal];
      // حفظ في localStorage
      localStorage.setItem("app_allowed_goals", JSON.stringify(updatedGoals));
      return updatedGoals;
    });

    // إعادة تعيين الحقول
    setNewGoalName("");
    setNewGoalPrice(0);
    setNewGoalEmoji("🎁");
    setEmojiSearchTerm("");
    setIsEmojiPickerOpen(false);
    setIsAddGoalModalOpen(false);

    showToast(`✅ تم إضافة هدف "${newGoalName}" بنجاح`);
  };

  const handleAddChild = async () => {
    const SUCCESS = await addNewChild(
      newChildName,
      newChildAge,
      newChildAvatar,
    );
    if (SUCCESS) {
      setIsChildModalOpen(false);
      setNewChildName("");
      setNewChildAge(3);
      setNewChildAvatar(null);
      setNewChildLevel(1);
    }
  };

  const handleUploadPicture = async (childId: number) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (ev) => {
          const avatarUrl = ev.target?.result as string;
          const child = children.find((c) => c.id === childId);
          if (child) {
            const updatedChild = {
              id: child.id,
              parentId: child.parentId || parentId,
              name: child.name,
              age: child.age,
              level: child.level || 1,
              avatarUrl: avatarUrl,
              savingsBalance: child.balance,
            };
            await updateChildInAPI(childId, updatedChild);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleDeleteChild = async (childId: number) => {
    if (confirm("حذف الطفل سيؤدي لحذف جميع مهامه")) {
      await deleteChildFromAPI(childId);
    }
  };

  const handleGenerateSuggestions = async () => {
    if (!aiPrompt.trim()) {
      showToast("اكتب وصفاً للمهمة أولاً");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await generateQuestsWithAI(aiPrompt);

      if (response && response.quests && Array.isArray(response.quests)) {
        const formattedSuggestions: SuggestionItem[] = response.quests.map(
          (quest: any, index: number) => ({
            id: Date.now() + index,
            description: quest.title || quest.description,
            reward: 10, // قيمة افتراضية
            category: quest.category || "عام",
            targetAge: quest.targetAge || "جميع الأعمار",
            fullDescription: quest.description || quest.title,
          }),
        );
        setSuggestions(formattedSuggestions);
        showToast(`🤖 تم توليد ${response.quests.length} مهمة جديدة`);
      } else {
        showToast("لم يتم العثور على مهام، حاول مرة أخرى");
      }
    } catch (error) {
      console.error("Error in handleGenerateSuggestions:", error);
      showToast("❌ فشل في توليد المهام");
    } finally {
      setIsGenerating(false);
    }
  };

  // دالة تحديث السعر لمهمة معينة
  const updateSuggestionReward = (id: number, newReward: number) => {
    setSuggestions((prev: SuggestionItem[]) =>
      prev.map((s: SuggestionItem) =>
        s.id === id ? { ...s, reward: newReward } : s,
      ),
    );
  };

  const onChildAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setNewChildAvatar(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onGoalImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setNewGoalImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // ==================== دوال العرض ====================
  useEffect(() => {
    // تحميل الأهداف من localStorage أو بيانات افتراضية
    const storedGoals = localStorage.getItem("app_allowed_goals");
    if (storedGoals) {
      setAllowedGoals(JSON.parse(storedGoals));
    } else {
      // بيانات افتراضية للبدء
      setAllowedGoals([
        { id: 1, name: "دراجة", image: "🚲", price: 200 },
        { id: 2, name: "آيباد", image: "📱", price: 500 },
        { id: 3, name: "ألعاب", image: "🎮", price: 150 },
        { id: 4, name: "سكوتر", image: "🛴", price: 350 },
        { id: 5, name: "ساعة", image: "⌚", price: 250 },
      ]);
    }
  }, []);
  const renderAllowedGoals = () => {
    // ✅ صحيح: تستخدم allowedGoals من الـ State
    if (allowedGoals.length === 0) {
      return (
        <div
          className="empty-state"
          style={{ gridColumn: "1/-1", textAlign: "center", padding: "20px" }}
        >
          🎯 لا توجد أهداف مسموحة. أضف هدفاً جديداً!
        </div>
      );
    }

    return allowedGoals.map((goal) => (
      <div
        key={goal.id}
        className="allowed-goal-item"
        onClick={() =>
          openChildSelectModal((childId) =>
            addAchievedGoal(childId, goal.name, goal.price),
          )
        }
      >
        <span
          style={{ fontSize: "48px", display: "block", marginBottom: "8px" }}
        >
          {goal.image}
        </span>
        <span
          style={{
            fontWeight: "bold",
            fontSize: "0.8rem",
            color: "#0a1a5e",
            marginBottom: "4px",
          }}
        >
          {goal.name}
        </span>
        <span
          style={{
            fontWeight: "bold",
            fontSize: "0.7rem",
            color: "#0035e0",
            background: "rgba(0, 53, 224, 0.1)",
            padding: "2px 8px",
            borderRadius: "20px",
          }}
        >
          {goal.price} ريال
        </span>
      </div>
    ));
  };

  const renderChildrenGallery = () => {
    if (children.length === 0) {
      return (
        <div className="empty-state">
          👶 لا يوجد أطفال مسجلين. أضف طفلاً جديداً!
        </div>
      );
    }

    return children.map((child) => {
      const avatarHtml = child.avatar ? (
        <img src={child.avatar} alt={child.name} />
      ) : (
        <FontAwesomeIcon icon={faUserCircle} size="3x" />
      );
      return (
        <div key={child.id} className="child-card-pro">
          <div className="child-avatar-lg">{avatarHtml}</div>
          <div className="child-name">{child.name}</div>
          <div className="child-balance">
            💰 {child.balance.toFixed(2)} ريال
          </div>
          <div className="mini-badge">🎯 مستوى {child.level || 1}</div>
          <div className="child-actions-pro">
            <button
              className="icon-btn"
              onClick={() => handleUploadPicture(child.id)}
              title="تغيير الصورة"
            >
              <FontAwesomeIcon icon={faCamera} />
            </button>
            <button
              className="icon-btn"
              onClick={() => handleDeleteChild(child.id)}
              title="حذف الطفل"
            >
              <FontAwesomeIcon icon={faTrashAlt} />
            </button>
          </div>
        </div>
      );
    });
  };

  const renderWisdomGrid = () => {
    if (children.length === 0) {
      return (
        <div className="wisdom-empty-state">
          👶 أضف أطفالاً أولاً لبدء التحفيز السريع
        </div>
      );
    }
    const availableChildren = children.filter((c) => !sentWisdom.has(c.id));
    if (availableChildren.length === 0) {
      return (
        <div className="wisdom-empty-state">
          ✨ تم إرسال تحفيز لجميع الأطفال! رائع.
        </div>
      );
    }
    return availableChildren.map((child) => {
      const avatarHtml = child.avatar ? (
        <img src={child.avatar} alt={child.name} />
      ) : (
        <FontAwesomeIcon icon={faChild} />
      );
      return (
        <div
          key={child.id}
          className="wisdom-child-square"
          onClick={() => sendWisdomMessage(child.id)}
        >
          <div className="wisdom-child-avatar">{avatarHtml}</div>
          <div className="wisdom-child-name">{child.name}</div>
          <div className="wisdom-send-icon">
            <FontAwesomeIcon icon={faPaperPlane} />
          </div>
        </div>
      );
    });
  };

  const renderCompletedTasks = () => {
    if (completedTasks.length === 0) {
      return (
        <tr>
          <td colSpan={4} style={{ textAlign: "center" }}>
            لا توجد مهام مكتملة حتى الآن
          </td>
        </tr>
      );
    }
    return completedTasks.slice(0, 15).map((task) => (
      <tr key={task.id}>
        <td>{getChildName(task.childId)}</td>
        <td>{task.title}</td>
        <td>{task.amount.toFixed(2)}</td>
        <td>{new Date(task.createdAt).toLocaleDateString("ar-EG")}</td>
      </tr>
    ));
  };

  // const renderAchievedGoals = () => {
  //   if (achievedGoals.length === 0) {
  //     return <div className="empty-state">🏆 لا توجد أهداف محققة بعد</div>;
  //   }
  //   return achievedGoals.slice(0, 10).map((goal) => (
  //     <div key={goal.id} className="achievement-item">
  //       <div className="task-col">
  //         <strong>{getChildName(goal.childId)}</strong>
  //       </div>
  //       <div className="task-col">{goal.title}</div>
  //       <div className="amount-col">
  //         <span>{goal.amount} ريال</span>
  //         <div className="timestamp">
  //           {new Date(goal.createdAt).toLocaleDateString("ar-EG")}
  //         </div>
  //       </div>
  //     </div>
  //   ));
  // };

  const renderPendingTasks = () => {
    if (pendingTasks.length === 0) {
      return (
        <tr>
          <td colSpan={5} style={{ textAlign: "center" }}>
            لا توجد مهام معلقة
          </td>
        </tr>
      );
    }
    return pendingTasks.map((task) => (
      <tr key={task.id}>
        <td>{getChildName(task.childId)}</td>
        <td>{task.title}</td>
        <td>{task.amount.toFixed(2)}</td>
        <td>
          <span
            style={{
              background: "#fff8d6",
              padding: "4px 14px",
              borderRadius: "40px",
              fontWeight: 700,
              fontSize: "0.78rem",
            }}
          >
            ⏳ تنتظر الاعتماد
          </span>
        </td>
        <td>
          <button className="approve-task" onClick={() => approveTask(task.id)}>
            اعتماد
          </button>
          <button className="reject-task" onClick={() => rejectTask(task.id)}>
            رفض
          </button>
        </td>
      </tr>
    ));
  };

  const iconOptions = [
    { name: "fa-broom", icon: faBroom },
    { name: "fa-book", icon: faBook },
    { name: "fa-bed", icon: faBed },
    { name: "fa-pen-fancy", icon: faPenFancy },
    { name: "fa-star", icon: faStar },
    { name: "fa-dumbbell", icon: faDumbbell },
  ];

  // ------------------------------------------------------------
  // JSX الرئيسي (نفس الكود الأصلي مع تعديل القيم الديناميكية)
  // ------------------------------------------------------------
  return (
    <div
      className="dashboard"
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        position: "relative",
        zIndex: 3,
        display: "flex",
        flexDirection: "column",
        gap: "1.6rem",
      }}
    >
      {/* HEADER */}
      <div className="header">
        <div className="brand">
          <img
            className="logo-img"
            src="assest/logo.png"
            alt="logo"
            onError={(e) =>
              (e.currentTarget.src = "https://via.placeholder.com/44?text=🏦")
            }
          />
          <div className="brand-text">
            <h1>بنك الجيل الواعد</h1>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="btn-primary-premium"
            onClick={() => setIsTaskModalOpen(true)}
          >
            <FontAwesomeIcon icon={faPlusCircle} /> إضافة مهمة
          </button>
          <button
            className="exit-btn"
            onClick={() => {
               Navigate("/");
            }}
          >
            <FontAwesomeIcon icon={faSignOutAlt} /> خروج
          </button>
        </div>
      </div>
      {/* بطاقات إحصائية */}
      <div className="stats-grid">
        <div className="stat-card-premium">
          <div className="stat-header">
            <div className="stat-icon">
              <FontAwesomeIcon icon={faChild} />
            </div>
            <div className="stat-value">{activeChildrenCount}</div>
          </div>
          <div className="stat-label">الأطفال المسجلين</div>
          <div className="stat-footer">
            <FontAwesomeIcon icon={faUserPlus} /> أضف طفلاً لبدء التحفيز
          </div>
        </div>
        <div className="stat-card-premium">
          <div className="stat-header">
            <div className="stat-icon">
              <FontAwesomeIcon icon={faHourglassHalf} />
            </div>
            <div className="stat-value">{pendingApprovalsCount}</div>
          </div>
          <div className="stat-label">مهام تنتظر الاعتماد</div>
          <div className="stat-footer">
            <FontAwesomeIcon icon={faHourglassHalf} /> قم بمراجعتها الآن
          </div>
        </div>
        <div className="stat-card-premium">
          <div className="stat-header">
            <div className="stat-icon">
              <FontAwesomeIcon icon={faWallet} />
            </div>
            <div className="stat-value">{totalBalance.toFixed(2)}</div>
          </div>
          <div className="stat-label">إجمالي الرصيد</div>
          <div className="stat-footer">
            <FontAwesomeIcon icon={faWallet} /> أرباح الأسبوع:{" "}
            <span>{weeklyEarningsAmount.toFixed(2)}</span> ريال
          </div>
        </div>
        <div className="stat-card-premium">
          <div className="stat-header">
            <div className="stat-icon">
              <FontAwesomeIcon icon={faTrophy} />
            </div>
            <div className="stat-value">{richestChild?.name || "—"}</div>
          </div>
          <div className="stat-label">بطل الأسبوع 🏆</div>
          <div className="stat-footer">
            <FontAwesomeIcon icon={faStar} /> أكثر طفل مكافآت هذا الأسبوع
          </div>
        </div>
      </div>
      {/* معرض الأطفال */}
      <div className="children-showcase" ref={childrenSectionRef}>
        <div className="flex-header">
          <div className="section-title">
            <FontAwesomeIcon icon={faImages} /> أطفالي · معرض الصور والمحفظة
          </div>
          <button
            className="btn-outline-premium"
            onClick={() => setIsChildModalOpen(true)}
          >
            <FontAwesomeIcon icon={faUserPlus} /> إضافة طفل
          </button>
        </div>
        <div className="children-cards">{renderChildrenGallery()}</div>
      </div>
      {/* القسم الأوسط */}
      <div className="bottom-flex" ref={suggestionsSectionRef}>
        {/* قسم المهام الذكية */}
        <div className="ai-suggestion-box">
          <div className="section-title">
            <FontAwesomeIcon icon={faRobot} /> مقترحات المهام الذكية
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <img
              src="assest/AI.png"
              alt="AI"
              style={{ width: "40px", height: "40px" }}
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>
              مساعد المهام
            </span>
          </div>
          <div className="ai-suggestion-inputs">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="مثال: نوم، مدرسة، ترتيب..."
            />
            {/* <input
              type="number"
              value={specifiedAmount}
              onChange={(e) =>
                setSpecifiedAmount(
                  e.target.value === "" ? "" : parseFloat(e.target.value),
                )
              }
              placeholder="المبلغ المخصص للمهام"
              step="0.5"
              min="1"
            /> */}
          </div>
          <button
            className="btn-primary-premium"
            style={{ alignSelf: "flex-start", minWidth: "150px" }}
            onClick={handleGenerateSuggestions}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <span className="spinner"></span> جاري التوليد...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faLightbulb} /> اقتراح مهام
              </>
            )}
          </button>

          <div className="suggestion-cards">
            {suggestions.length === 0 && !isGenerating && (
              <div className="empty-suggestions">
                🤖 اضغط على "اقتراح مهام" لتبدأ
              </div>
            )}

            {isGenerating && (
              <div className="loading-suggestions">
                <div className="spinner-large"></div>
                <p>جاري توليد مهام ذكية...</p>
              </div>
            )}

            {suggestions.map((s: SuggestionItem) => (
              <div key={s.id} className="suggestion-card">
                <div className="task-desc">
                  📌 {s.description}
                  <br />
                  {s.category && (
                    <small className="category-badge">{s.fullDescription}</small>
                  )}
                </div>

                <div className="reward-input-group">
                  <label>💰 المكافأة (ريال):</label>
                  <input
                    type="number"
                    value={s.reward}
                    onChange={(e) =>
                      updateSuggestionReward(s.id, Number(e.target.value))
                    }
                    min="1"
                    step="1"
                    className="reward-input-field"
                  />
                </div>

                <button
                  className="assign-task-btn"
                  disabled={s.reward <= 0}
                  onClick={() => {
                    if (s.reward <= 0) {
                      showToast("الرجاء تحديد مكافأة صحيحة للمهمة");
                      return;
                    }
                    openChildSelectModal(async (childId) => {
                      await addTaskToChild(childId, {
                        description: s.description,
                        fullDescription: s.fullDescription,
                        reward: s.reward,
                      });
                    });
                  }}
                >
                  تعيين مهمة
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* قسم التحفيز السريع */}
        <div className="wisdom-box">
          <div className="section-title">
            <FontAwesomeIcon icon={faHandSparkles} /> تحفيز سريع
          </div>
          <div className="wisdom-grid">{renderWisdomGrid()}</div>
          <div className="wisdom-footer-msg">
            👆 اضغط على أي طفل لإرسال تحفيز له
          </div>
        </div>

        {/* قسم الأهداف المسموحة */}
        <div className="allowed-goals-box" ref={goalsSectionRef}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div className="section-title">
              <FontAwesomeIcon icon={faBullseye} /> تحديد أهداف مسموحة
            </div>
            <button
              className="btn-outline-premium"
              style={{ gap: "5px" }}
              onClick={() => setIsAddGoalModalOpen(true)}
            >
              <FontAwesomeIcon icon={faPlus} /> إضافة هدف
            </button>
          </div>
          <div className="allowed-goals-grid">{renderAllowedGoals()}</div>
        </div>
      </div>
      {/* جداول المهام والإنجازات */}
      <div id="tasksSection" ref={tasksSectionRef}>
        <div className="tasks-split">
          <div className="task-panel">
            <div className="section-title" style={{ marginBottom: "1rem" }}>
              <FontAwesomeIcon icon={faCheckCircle} /> الإنجازات المحققة
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="cyber-table">
                <thead>
                  <tr>
                    <th>الطفل</th>
                    <th>المهمة</th>
                    <th>المكافأة</th>
                    <th>التاريخ</th>
                  </tr>
                </thead>
                <tbody>{renderCompletedTasks()}</tbody>
              </table>
            </div>
          </div>
          <div className="task-panel">
            <div className="section-title" style={{ marginBottom: "1rem" }}>
              <FontAwesomeIcon icon={faTrophy} /> الأهداف المحققة
            </div>
            <div className="achievement-list">{renderAchievedGoals()}</div>
          </div>
        </div>
        <div className="tasks-split">
          <div className="task-panel">
            <div className="section-title" style={{ marginBottom: "1rem" }}>
              <FontAwesomeIcon icon={faListCheck} /> مهام معلقة
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="cyber-table">
                <thead>
                  <tr>
                    <th>الطفل</th>
                    <th>المهمة</th>
                    <th>المكافأة</th>
                    <th>الحالة</th>
                    <th>إجراء</th>
                  </tr>
                </thead>
                <tbody>{renderPendingTasks()}</tbody>
              </table>
            </div>
          </div>
          <div className="task-panel">
            <div className="section-title" style={{ marginBottom: "1rem" }}>
              <FontAwesomeIcon icon={faHourglassStart} /> رحلة الادخار للأبناء
            </div>
            <div className="achievement-list">{renderSavingJourneys()}</div>
          </div>
        </div>
      </div>
      <footer>
        <FontAwesomeIcon icon={faShieldAlt} /> بنك الجيل الواعد 2026
      </footer>
      {/* شريط سفلي */}
      <div className="bottom-dock">
        <div
          className="dock-item"
          onClick={() =>
            childrenSectionRef.current?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <FontAwesomeIcon icon={faChild} />
          <span>الأطفال</span>
        </div>
        <div
          className="dock-item"
          onClick={() =>
            tasksSectionRef.current?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <FontAwesomeIcon icon={faTasks} />
          <span>المهام</span>
        </div>
        <div
          className="dock-item"
          onClick={() =>
            suggestionsSectionRef.current?.scrollIntoView({
              behavior: "smooth",
            })
          }
        >
          <FontAwesomeIcon icon={faLightbulb} />
          <span>المقترحات</span>
        </div>
        <div
          className="dock-item"
          onClick={() =>
            goalsSectionRef.current?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <FontAwesomeIcon icon={faBullseye} />
          <span>الأهداف</span>
        </div>
      </div>
      {/* المودالات... (نفس الكود الأصلي) */}
      {/* مودال إضافة طفل */}
      {isChildModalOpen && (
        <div
          className="modal-glass active"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsChildModalOpen(false);
          }}
        >
          <div className="modal-card">
            <h3 style={{ color: "#002eff", marginBottom: "12px" }}>
              <FontAwesomeIcon icon={faChild} /> إضافة طفل جديد
            </h3>
            <input
              type="text"
              value={newChildName}
              onChange={(e) => setNewChildName(e.target.value)}
              placeholder="الاسم الكامل"
            />
            <input
              type="number"
              value={newChildAge}
              onChange={(e) => setNewChildAge(parseInt(e.target.value) || 3)}
              placeholder="العمر (3 سنوات فأكثر)"
              min="3"
            />
            <div
              style={{
                margin: "10px 0",
                fontWeight: 700,
                color: "var(--text-secondary)",
              }}
            >
              📸 صورة شخصية (اختياري):
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={onChildAvatarFileChange}
            />
            <div className="modal-actions">
              <button
                className="btn-primary-premium"
                style={{ width: "100%" }}
                onClick={handleAddChild}
              >
                إضافة الطفل
              </button>
              <button
                className="btn-outline-premium"
                style={{ width: "100%" }}
                onClick={() => setIsChildModalOpen(false)}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
      {/* مودال إضافة مهمة */}
      {isTaskModalOpen && (
        <div
          className="modal-glass active"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsTaskModalOpen(false);
          }}
        >
          <div className="modal-card">
            <h3 style={{ color: "#002eff", marginBottom: "12px" }}>
              <FontAwesomeIcon icon={faTasks} /> مهمة تحفيزية جديدة
            </h3>
            <select
              value={taskChildId}
              onChange={(e) => setTaskChildId(parseInt(e.target.value))}
            >
              <option value="">اختر الطفل</option>
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </select>
            <textarea
              rows={2}
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="وصف المهمة"
            ></textarea>
            <input
              type="number"
              value={taskReward}
              onChange={(e) => setTaskReward(parseFloat(e.target.value) || 0)}
              placeholder="المكافأة (ريال)"
              step="0.5"
              min="1"
            />
            <div className="icon-picker">
              {iconOptions.map((opt) => (
                <div
                  key={opt.name}
                  className={`icon-opt ${selectedIcon === opt.name ? "selected" : ""}`}
                  onClick={() => setSelectedIcon(opt.name)}
                >
                  <FontAwesomeIcon icon={opt.icon} />
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button
                className="btn-primary-premium"
                style={{ width: "100%" }}
                onClick={() => {
                  if (taskChildId && taskDescription && taskReward > 0) {
                    addNewTask(
                      taskChildId,
                      taskDescription,
                      taskReward,
                      selectedIcon,
                    );
                    setIsTaskModalOpen(false);
                    setTaskDescription("");
                    setTaskReward(0);
                    setTaskChildId(undefined);
                  } else {
                    showToast("يرجى ملء جميع الحقول");
                  }
                }}
              >
                إنشاء المهمة
              </button>
              <button
                className="btn-outline-premium"
                style={{ width: "100%" }}
                onClick={() => setIsTaskModalOpen(false)}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
      {/* مودال اختيار الطفل */}
      {isChildSelectModalOpen && (
        <div
          className="modal-glass active"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsChildSelectModalOpen(false);
          }}
        >
          <div className="modal-card">
            <h3 style={{ color: "#002eff", marginBottom: "20px" }}>
              <FontAwesomeIcon icon={faChild} /> اختر الطفل المناسب
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {children.map((child) => (
                <button
                  key={child.id}
                  className="btn-outline-premium"
                  style={{ width: "100%" }}
                  onClick={() => {
                    if (childSelectCallback) childSelectCallback(child.id);
                    setIsChildSelectModalOpen(false);
                    setChildSelectCallback(null);
                  }}
                >
                  {child.name}
                </button>
              ))}
            </div>
            <button
              className="btn-outline-premium"
              style={{ marginTop: "15px", width: "100%" }}
              onClick={() => setIsChildSelectModalOpen(false)}
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
      {/* مودال إضافة هدف مسموح */}
      {isAddGoalModalOpen && (
        <div
          className="modal-glass active"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddGoalModalOpen(false);
          }}
        >
          <div className="modal-card" style={{ maxWidth: "550px" }}>
            <h3 style={{ color: "#002eff", marginBottom: "12px" }}>
              <FontAwesomeIcon icon={faBullseye} /> إضافة هدف مسموح
            </h3>

            {/* اسم الهدف */}
            <input
              type="text"
              value={newGoalName}
              onChange={(e) => setNewGoalName(e.target.value)}
              placeholder="اسم الهدف (مثال: دراجة هوائية)"
            />

            {/* سعر الهدف */}
            <input
              type="number"
              value={newGoalPrice}
              onChange={(e) => setNewGoalPrice(parseFloat(e.target.value) || 0)}
              placeholder="سعر الهدف (ريال)"
              step="0.5"
              min="1"
            />

            {/* اختيار الإيموجي */}
            <div style={{ margin: "15px 0 10px" }}>
              <div
                style={{
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                  marginBottom: "8px",
                }}
              >
                😀 اختر إيموجي للهدف:
              </div>

              {/* الإيموجي المحدد حالياً */}
              <div
                onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "rgba(255,255,255,0.8)",
                  border: "1px solid var(--accent)",
                  borderRadius: "50px",
                  padding: "10px 16px",
                  cursor: "pointer",
                  marginBottom: "10px",
                }}
              >
                <span style={{ fontSize: "28px" }}>{newGoalEmoji}</span>
                <span style={{ color: "var(--accent)", fontSize: "12px" }}>
                  {isEmojiPickerOpen
                    ? "▲ اضغط للإغلاق"
                    : "▼ اضغط لاختيار إيموجي"}
                </span>
              </div>

              {/* قائمة الإيموجيات للاختيار */}
              {isEmojiPickerOpen && (
                <div
                  style={{
                    background: "rgba(255,255,255,0.95)",
                    borderRadius: "20px",
                    border: "1px solid var(--accent)",
                    padding: "12px",
                    maxHeight: "250px",
                    overflowY: "auto",
                  }}
                >
                  {/* حقل البحث */}
                  <input
                    type="text"
                    value={emojiSearchTerm}
                    onChange={(e) => setEmojiSearchTerm(e.target.value)}
                    placeholder="🔍 ابحث عن إيموجي..."
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      marginBottom: "12px",
                      borderRadius: "30px",
                      border: "1px solid #ccc",
                    }}
                  />

                  {/* شبكة الإيموجيات */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(65px, 1fr))",
                      gap: "8px",
                    }}
                  >
                    {filteredEmojis.map((item) => (
                      <div
                        key={item.emoji}
                        onClick={() => {
                          setNewGoalEmoji(item.emoji);
                          setIsEmojiPickerOpen(false);
                          setEmojiSearchTerm("");
                        }}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          padding: "8px",
                          borderRadius: "12px",
                          cursor: "pointer",
                          background:
                            newGoalEmoji === item.emoji
                              ? "rgba(0,53,224,0.1)"
                              : "transparent",
                          border:
                            newGoalEmoji === item.emoji
                              ? "1px solid var(--accent)"
                              : "1px solid transparent",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(0,53,224,0.05)";
                        }}
                        onMouseLeave={(e) => {
                          if (newGoalEmoji !== item.emoji) {
                            e.currentTarget.style.background = "transparent";
                          }
                        }}
                      >
                        <span style={{ fontSize: "32px" }}>{item.emoji}</span>
                        <span style={{ fontSize: "10px", marginTop: "4px" }}>
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  {filteredEmojis.length === 0 && (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "20px",
                        color: "gray",
                      }}
                    >
                      لا توجد نتائج لـ "{emojiSearchTerm}"
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                className="btn-primary-premium"
                style={{ width: "100%" }}
                onClick={handleAddGoal}
              >
                إضافة الهدف
              </button>
              <button
                className="btn-outline-premium"
                style={{ width: "100%" }}
                onClick={() => {
                  setIsAddGoalModalOpen(false);
                  setEmojiSearchTerm("");
                  setIsEmojiPickerOpen(false);
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
      {/* CSS (نفس الكود الأصلي) */}
      <style>{`
        :root {
            --glass-bg: rgba(255, 255, 255, 0.38);
            --glass-bg-hover: rgba(255, 255, 255, 0.55);
            --glass-border: rgba(255, 255, 255, 0.55);
            --glass-blur: blur(22px) saturate(1.3);
            --accent: #0035e0;
            --accent-light: #4d7aff;
            --accent-glow: rgba(0, 53, 224, 0.25);
            --text-primary: #0a1a5e;
            --text-secondary: #3b4f8a;
            --text-muted: #5c6fa0;
            --radius-xl: 44px;
            --radius-lg: 32px;
            --radius-md: 22px;
            --shadow-sm: 0 4px 14px rgba(0, 0, 0, 0.04);
            --shadow-md: 0 10px 28px rgba(0, 0, 0, 0.06);
            --shadow-lg: 0 18px 40px rgba(0, 0, 0, 0.08);
            --transition-fast: 0.2s cubic-bezier(0.25, 0.8, 0.25, 1.2);
            --transition-smooth: 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            background: linear-gradient(160deg, #e8efff 0%, #d6e3ff 30%, #eef3ff 60%, #e0eaff 100%);
            font-family: 'Cairo', system-ui, sans-serif;
            min-height: 100vh;
            padding: 1.5rem;
            position: relative;
            color: var(--text-primary);
        }
        body::before {
            content: "";
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: radial-gradient(circle at 12% 35%, rgba(0, 60, 255, 0.035) 1.6px, transparent 1.6px), radial-gradient(circle at 78% 65%, rgba(0, 80, 255, 0.03) 2px, transparent 2px), radial-gradient(circle at 45% 18%, rgba(100, 140, 255, 0.04) 1.2px, transparent 1.2px);
            background-size: 48px 48px, 64px 64px, 40px 40px;
            pointer-events: none;
            z-index: 0;
        }
        .header {
            background: var(--glass-bg);
            backdrop-filter: var(--glass-blur);
            border-radius: 60px;
            padding: 0.5rem 1.6rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
            border: 1px solid var(--glass-border);
            box-shadow: var(--shadow-md);
            transition: var(--transition-smooth);
        }
        .header:hover {
            background: var(--glass-bg-hover);
            box-shadow: var(--shadow-lg);
        }
        .brand {
            display: flex;
            align-items: center;
            gap: 14px;
        }
        .logo-img {
            width: 44px;
            height: 44px;
            filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.08));
            transition: var(--transition-fast);
        }
        .logo-img:hover {
            transform: scale(1.07);
        }
        .brand-text h1 {
            font-size: 1.6rem;
            font-weight: 900;
            background: linear-gradient(130deg, #001faa, #3b6aff);
            background-clip: text;
            -webkit-background-clip: text;
            color: transparent;
            letter-spacing: -0.3px;
            line-height: 1.1;
        }
        .brand-text p {
            font-size: 0.65rem;
            color: var(--text-muted);
            font-weight: 600;
            letter-spacing: 0.2px;
        }
        .header-actions {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .btn-primary-premium {
            background: linear-gradient(115deg, #0028e8, #1a4aff);
            border: none;
            padding: 11px 26px;
            border-radius: 100px;
            color: #fff;
            font-weight: 800;
            font-size: 0.9rem;
            cursor: pointer;
            transition: var(--transition-fast);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 9px;
            box-shadow: 0 8px 22px rgba(0, 40, 220, 0.35);
            white-space: nowrap;
            letter-spacing: 0.3px;
        }
        .btn-primary-premium:hover {
            transform: translateY(-3px) scale(1.03);
            background: #001fcc;
            box-shadow: 0 16px 30px rgba(0, 30, 200, 0.45);
        }
        .btn-primary-premium:active {
            transform: scale(0.97);
        }
        .exit-btn {
            background: rgba(0, 50, 200, 0.08);
            border: 1.5px solid rgba(0, 40, 200, 0.5);
            padding: 10px 24px;
            border-radius: 50px;
            color: var(--accent);
            font-weight: 700;
            cursor: pointer;
            transition: var(--transition-fast);
            font-size: 0.88rem;
            white-space: nowrap;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }
        .exit-btn:hover {
            background: var(--accent);
            color: #fff;
            box-shadow: 0 6px 18px var(--accent-glow);
            border-color: var(--accent);
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1.3rem;
        }
        .stat-card-premium {
            background: var(--glass-bg);
            backdrop-filter: var(--glass-blur);
            border-radius: var(--radius-xl);
            padding: 1.2rem 1.1rem;
            border: 1px solid var(--glass-border);
            transition: var(--transition-smooth);
            box-shadow: var(--shadow-sm);
            display: flex;
            flex-direction: column;
            gap: 7px;
            cursor: default;
        }
        .stat-card-premium:hover {
            transform: translateY(-5px);
            background: var(--glass-bg-hover);
            border-color: rgba(0, 60, 220, 0.5);
            box-shadow: var(--shadow-lg), 0 0 40px var(--accent-glow);
        }
        .stat-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .stat-icon {
            font-size: 2rem;
            color: var(--accent);
            opacity: 0.85;
            transition: var(--transition-fast);
        }
        .stat-card-premium:hover .stat-icon {
            opacity: 1;
            transform: scale(1.1);
        }
        .stat-value {
            font-size: 2.3rem;
            font-weight: 900;
            color: var(--text-primary);
            font-family: 'JetBrains Mono', 'Cairo', monospace;
            line-height: 1;
            letter-spacing: -0.5px;
        }
        .stat-label {
            font-size: 0.78rem;
            font-weight: 700;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.8px;
        }
        .stat-footer {
            font-size: 0.7rem;
            color: var(--accent-light);
            display: flex;
            align-items: center;
            gap: 6px;
            margin-top: 6px;
            border-top: 1px dashed rgba(0, 60, 200, 0.2);
            padding-top: 6px;
            font-weight: 600;
        }
        .children-showcase {
            background: var(--glass-bg);
            backdrop-filter: var(--glass-blur);
            border-radius: var(--radius-xl);
            padding: 1.6rem;
            border: 1px solid var(--glass-border);
            box-shadow: var(--shadow-md);
            transition: var(--transition-smooth);
        }
        .children-showcase:hover {
            box-shadow: var(--shadow-lg);
        }
        .flex-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            margin-bottom: 1.5rem;
            gap: 1rem;
        }
        .section-title {
            font-weight: 900;
            font-size: 1.2rem;
            display: flex;
            gap: 10px;
            align-items: center;
            color: var(--text-primary);
            border-right: 4px solid var(--accent);
            padding-right: 0.9rem;
            letter-spacing: -0.2px;
        }
        .btn-outline-premium {
            background: transparent;
            border: 1.5px solid var(--accent);
            padding: 8px 22px;
            border-radius: 60px;
            font-weight: 700;
            color: var(--accent);
            cursor: pointer;
            transition: var(--transition-fast);
            font-size: 0.85rem;
            display: inline-flex;
            justify-content: center;
            align-items: center;
            gap: 7px;
        }
        .btn-outline-premium:hover {
            background: var(--accent);
            color: #fff;
            box-shadow: 0 6px 20px var(--accent-glow);
        }
        .children-cards {
            display: flex;
            flex-wrap: wrap;
            gap: 1.5rem;
            justify-content: flex-start;
        }
        .child-card-pro {
            background: rgba(255, 255, 255, 0.6);
            backdrop-filter: blur(14px);
            border-radius: 38px;
            width: 225px;
            padding: 1.1rem;
            text-align: center;
            box-shadow: var(--shadow-sm);
            transition: var(--transition-smooth);
            border: 1px solid rgba(255, 255, 255, 0.7);
            cursor: default;
        }
        .child-card-pro:hover {
            transform: translateY(-7px);
            border-color: rgba(0, 53, 224, 0.5);
            box-shadow: var(--shadow-lg), 0 0 35px rgba(0, 53, 224, 0.12);
            background: rgba(255, 255, 255, 0.75);
        }
        .child-avatar-lg {
            width: 90px;
            height: 90px;
            border-radius: 50%;
            margin: 0 auto 10px;
            background: #eef3ff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.6rem;
            color: var(--accent);
            overflow: hidden;
            border: 3px solid rgba(255, 255, 255, 0.8);
            box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
            transition: var(--transition-fast);
        }
        .child-card-pro:hover .child-avatar-lg {
            border-color: var(--accent-light);
            box-shadow: 0 8px 24px rgba(0, 53, 224, 0.18);
        }
        .child-avatar-lg img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .child-name {
            font-size: 1.2rem;
            font-weight: 900;
            color: var(--text-primary);
            letter-spacing: -0.3px;
        }
        .child-balance {
            font-weight: 700;
            color: var(--accent);
            margin: 5px 0;
            font-size: 0.95rem;
        }
        .mini-badge {
            background: #eef3ff;
            border-radius: 50px;
            padding: 4px 11px;
            font-size: 0.68rem;
            display: inline-block;
            margin-top: 5px;
            font-weight: 700;
            color: var(--text-secondary);
        }
        .child-actions-pro {
            margin-top: 10px;
            display: flex;
            justify-content: center;
            gap: 14px;
        }
        .icon-btn {
            background: rgba(0, 50, 200, 0.06);
            border: 1px solid transparent;
            font-size: 1.1rem;
            cursor: pointer;
            color: #3d5c9e;
            padding: 7px 10px;
            border-radius: 50%;
            transition: var(--transition-fast);
        }
        .icon-btn:hover {
            background: rgba(0, 40, 200, 0.12);
            color: var(--accent);
            border-color: rgba(0, 40, 200, 0.25);
            transform: scale(1.12);
        }
        #tasksSection {
            display: flex;
            flex-direction: column;
            gap: 1.6rem;
        }
        .tasks-split {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.6rem;
        }
        .task-panel {
            background: var(--glass-bg);
            backdrop-filter: var(--glass-blur);
            border-radius: var(--radius-xl);
            padding: 1.3rem;
            border: 1px solid var(--glass-border);
            box-shadow: var(--shadow-md);
            transition: var(--transition-smooth);
            overflow-x: auto;
        }
        .task-panel:hover {
            box-shadow: var(--shadow-lg);
        }
        .cyber-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0 8px;
        }
        .cyber-table th, .cyber-table td {
            text-align: center;
        }
        .cyber-table th {
            font-weight: 800;
            color: var(--text-primary);
            padding: 0.5rem 0.4rem;
            border-bottom: 2px solid rgba(0, 53, 224, 0.35);
            font-size: 0.82rem;
            letter-spacing: 0.3px;
            text-transform: uppercase;
        }
        .cyber-table td {
            background: rgba(255, 255, 255, 0.55);
            padding: 0.65rem 0.5rem;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--text-primary);
            transition: var(--transition-fast);
        }
        .cyber-table tr:hover td {
            background: rgba(255, 255, 255, 0.8);
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
        }
        .approve-task {
            background: var(--accent);
            color: #fff;
            border: none;
            padding: 5px 16px;
            border-radius: 40px;
            font-weight: 700;
            cursor: pointer;
            margin-left: 5px;
            font-size: 0.78rem;
            transition: var(--transition-fast);
            box-shadow: 0 4px 12px rgba(0, 40, 200, 0.25);
        }
        .approve-task:hover {
            background: #001fcc;
            transform: scale(1.05);
            box-shadow: 0 6px 18px rgba(0, 30, 200, 0.4);
        }
        .reject-task {
            background: #ff5c7a;
            border: none;
            border-radius: 40px;
            padding: 5px 14px;
            color: #fff;
            cursor: pointer;
            font-weight: 700;
            font-size: 0.78rem;
            transition: var(--transition-fast);
            box-shadow: 0 4px 12px rgba(255, 80, 110, 0.25);
        }
        .reject-task:hover {
            background: #e04860;
            transform: scale(1.05);
        }
        .bottom-flex {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr;
            gap: 1.6rem;
        }
        .ai-suggestion-box {
            background: var(--glass-bg);
            backdrop-filter: var(--glass-blur);
            border-radius: var(--radius-xl);
            padding: 1.4rem;
            border: 1px solid var(--glass-border);
            box-shadow: var(--shadow-md);
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .ai-suggestion-box .section-title {
            border-right-color: #ffb800;
        }
        .ai-suggestion-inputs {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        .ai-suggestion-inputs input {
            flex: 1 1 auto;
            min-width: 150px;
        }
        .suggestion-cards {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 8px;
        }
        .suggestion-card {
            background: rgba(255, 255, 255, 0.7);
            border-radius: 22px;
            padding: 10px;
            flex: 1 1 0;
            min-width: 150px;
            border: 1px solid rgba(0,0,0,0.04);
            box-shadow: var(--shadow-sm);
            display: flex;
            flex-direction: column;
            gap: 6px;
            font-size: 0.8rem;
            font-weight: 700;
            color: var(--text-primary);
        }
        .suggestion-card .task-desc {
            flex: 1;
        }
        .suggestion-card .assign-task-btn {
            align-self: flex-end;
            background: var(--accent);
            color: #fff;
            border: none;
            border-radius: 40px;
            padding: 4px 16px;
            font-weight: 700;
            font-size: 0.8rem;
            cursor: pointer;
            transition: var(--transition-fast);
        }
        .suggestion-card .assign-task-btn:hover {
            background: #001fcc;
            box-shadow: 0 4px 10px rgba(0,30,200,0.3);
        }
        .wisdom-box {
            background: var(--glass-bg);
            backdrop-filter: var(--glass-blur);
            border-radius: var(--radius-xl);
            padding: 1.3rem;
            border: 1px solid var(--glass-border);
            box-shadow: var(--shadow-md);
            display: flex;
            flex-direction: column;
            gap: 12px;
            transition: var(--transition-smooth);
        }
        .wisdom-box .section-title {
            font-size: 1rem;
            border-right: 3px solid #ffb800;
            margin-bottom: 2px;
        }
        .wisdom-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
            gap: 10px;
            max-height: 240px;
            overflow-y: auto;
        }
        .wisdom-child-square {
            background: rgba(255, 255, 255, 0.55);
            border-radius: 20px;
            padding: 10px 6px;
            text-align: center;
            cursor: pointer;
            transition: var(--transition-fast);
            border: 2px solid rgba(255, 255, 255, 0.6);
            box-shadow: var(--shadow-sm);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            position: relative;
            user-select: none;
        }
        .wisdom-child-square:hover {
            transform: translateY(-4px) scale(1.04);
            border-color: #ffb800;
            box-shadow: 0 10px 22px rgba(255, 170, 0, 0.2);
            background: rgba(255, 255, 255, 0.8);
        }
        .wisdom-child-square.sent {
            animation: sendAway 0.55s cubic-bezier(0.55, 0, 0.1, 1) forwards;
            pointer-events: none;
        }
        @keyframes sendAway {
            0% { transform: scale(1); opacity: 1; filter: brightness(1); }
            40% { transform: scale(1.15); opacity: 0.8; filter: brightness(1.4); }
            100% { transform: scale(0.3); opacity: 0; filter: brightness(2); }
        }
        .wisdom-child-avatar {
            width: 46px;
            height: 46px;
            border-radius: 50%;
            background: #eef3ff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            color: var(--accent);
            overflow: hidden;
            border: 2px solid rgba(255, 255, 255, 0.7);
        }
        .wisdom-child-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .wisdom-child-name {
            font-size: 0.68rem;
            font-weight: 800;
            color: var(--text-primary);
            line-height: 1.1;
        }
        .wisdom-send-icon {
            font-size: 0.6rem;
            color: #ffb800;
            opacity: 0.8;
            transition: var(--transition-fast);
        }
        .wisdom-child-square:hover .wisdom-send-icon {
            opacity: 1;
            transform: scale(1.3);
        }
        .wisdom-empty-state {
            text-align: center;
            padding: 1rem;
            color: var(--text-muted);
            font-weight: 600;
            font-size: 0.8rem;
            grid-column: 1/-1;
        }
        .wisdom-footer-msg {
            text-align: center;
            font-size: 0.72rem;
            font-weight: 700;
            color: var(--text-secondary);
            background: rgba(255, 255, 255, 0.4);
            border-radius: 30px;
            padding: 7px 12px;
            margin-top: 2px;
        }
        .allowed-goals-box {
            background: var(--glass-bg);
            backdrop-filter: var(--glass-blur);
            border-radius: var(--radius-xl);
            padding: 1.3rem;
            border: 1px solid var(--glass-border);
            box-shadow: var(--shadow-md);
            display: flex;
            flex-direction: column;
            gap: 12px;
            transition: var(--transition-smooth);
        }
        .allowed-goals-box .section-title {
            border-right-color: #00a86b;
        }
        .allowed-goals-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }
        .allowed-goal-item {
            background: rgba(255, 255, 255, 0.55);
            border-radius: 20px;
            padding: 10px;
            text-align: center;
            cursor: pointer;
            transition: var(--transition-fast);
            border: 2px solid rgba(255,255,255,0.6);
            box-shadow: var(--shadow-sm);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
        }
        .allowed-goal-item:hover {
            transform: translateY(-3px);
            border-color: #00a86b;
            background: rgba(255, 255, 255, 0.8);
        }
        .allowed-goal-item img {
            width: 42px;
            height: 42px;
            object-fit: contain;
            border-radius: 12px;
            background: #eef3ff;
            padding: 4px;
        }
        .allowed-goal-price {
            font-weight: 800;
            font-size: 0.75rem;
            color: var(--text-primary);
        }
        .achievement-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .achievement-item {
            background: rgba(255,255,255,0.55);
            border-radius: 18px;
            padding: 8px 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.85rem;
            font-weight: 700;
        }
        .achievement-item .task-col, .achievement-item .amount-col {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }
        .amount-positive {
            color: #00a86b;
            font-weight: 900;
        }
        .amount-negative {
            color: #e04860;
            font-weight: 900;
        }
        .achievement-item .timestamp {
            font-size: 0.65rem;
            color: var(--text-muted);
            margin-top: 2px;
        }
        .bottom-dock {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--glass-bg);
            backdrop-filter: var(--glass-blur);
            border-radius: 80px;
            padding: 0.5rem 2rem;
            display: flex;
            gap: 2rem;
            border: 1px solid var(--glass-border);
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            transition: var(--transition-smooth);
        }
        .bottom-dock:hover {
            background: var(--glass-bg-hover);
        }
        .dock-item {
            background: none;
            border: none;
            display: flex;
            flex-direction: column;
            align-items: center;
            font-weight: 700;
            color: var(--text-primary);
            cursor: pointer;
            transition: var(--transition-fast);
            padding: 0 10px;
            font-size: 0.7rem;
            gap: 2px;
        }
        .dock-item i {
            font-size: 1.5rem;
            color: var(--accent);
            transition: var(--transition-fast);
        }
        .dock-item:hover {
            color: var(--accent);
            transform: translateY(-3px);
        }
        .dock-item:hover i {
            transform: scale(1.2);
            color: #001faa;
        }
        .modal-glass {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.45);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            visibility: visible;
            opacity: 1;
        }
        .modal-card {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(24px) saturate(1.3);
            border-radius: 48px;
            max-width: 520px;
            width: 92%;
            padding: 2rem;
            text-align: center;
            border: 2px solid rgba(255, 255, 255, 0.7);
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.2);
        }
        .modal-actions {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-top: 12px;
        }
        .icon-picker {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            justify-content: center;
            margin: 1rem 0;
        }
        .icon-opt {
            background: #eceeff;
            padding: 10px;
            border-radius: 50px;
            width: 48px;
            text-align: center;
            cursor: pointer;
            border: 2px solid transparent;
            transition: var(--transition-fast);
            font-size: 1.1rem;
        }
        .icon-opt:hover {
            background: #dde5ff;
            transform: scale(1.08);
        }
        .icon-opt.selected {
            border-color: var(--accent);
            background: #fff;
            box-shadow: 0 0 16px var(--accent-glow);
        }
        input, select, textarea {
            border-radius: 50px;
            padding: 11px 16px;
            border: 1.5px solid rgba(0, 50, 220, 0.25);
            font-family: 'Cairo', sans-serif;
            width: 100%;
            margin: 7px 0;
            background: rgba(255, 255, 255, 0.55);
            backdrop-filter: blur(8px);
            font-size: 0.88rem;
            font-weight: 600;
            color: var(--text-primary);
            transition: var(--transition-fast);
            outline: none;
        }
        input:focus, select:focus, textarea:focus {
            border-color: var(--accent);
            box-shadow: 0 0 0 5px rgba(0, 53, 224, 0.08);
            background: rgba(255, 255, 255, 0.8);
        }
        textarea {
            border-radius: 28px;
            resize: vertical;
            min-height: 70px;
        }
        select {
            cursor: pointer;
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%230035e0' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: left 16px center;
            padding-left: 36px;
        }
        footer {
            text-align: center;
            font-size: 0.7rem;
            color: var(--text-muted);
            margin-top: 0.5rem;
            font-weight: 600;
            letter-spacing: 0.3px;
        }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: rgba(0, 50, 200, 0.2); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0, 50, 200, 0.4); }
        @media (max-width: 1000px) {
            .stats-grid { grid-template-columns: repeat(2, 1fr); }
            .tasks-split { grid-template-columns: 1fr; }
            .bottom-flex { grid-template-columns: 1fr; }
            body { padding: 0.8rem; }
            .bottom-dock { gap: 1rem; padding: 0.4rem 1.2rem; }
            .header { padding: 0.5rem 1rem; gap: 0.6rem; }
            .brand-text h1 { font-size: 1.3rem; }
            .btn-primary-premium { padding: 9px 18px; font-size: 0.8rem; }
            .exit-btn { padding: 8px 16px; font-size: 0.78rem; }
            .wisdom-grid { grid-template-columns: repeat(auto-fill, minmax(58px, 1fr)); gap: 7px; }
            .wisdom-child-avatar { width: 38px; height: 38px; font-size: 1.2rem; }
            .wisdom-child-name { font-size: 0.6rem; }
        }
        @media (max-width: 600px) {
            .stats-grid { grid-template-columns: 1fr; }
            .children-cards { justify-content: center; }
            .child-card-pro { width: 180px; padding: 0.9rem; }
            .header-actions { gap: 6px; }
            .btn-primary-premium { padding: 8px 14px; font-size: 0.75rem; gap: 5px; }
            .exit-btn { padding: 7px 12px; font-size: 0.7rem; }
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateX(-50%) translateY(20px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>{" "}
    </div>
  );
};

export default FatherDashboard;
