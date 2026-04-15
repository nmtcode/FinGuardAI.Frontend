// FinGuardAIAnalyzer.tsx
// مكون React + TypeScript لتحليل الطلبات المالية باستخدام محاكاة RAG

import React, { useState, useRef, useEffect } from 'react';

// --------------------------------------------------------------
// 1. تعريف أنواع البيانات (Interfaces)
// --------------------------------------------------------------

// واجهة سياسة الشركة
interface Policy {
  id: number;
  title: string;
  content: string;
  keywords: string[];
  threshold: number;
  unit: string;
}

// واجهة نتيجة التحليل
interface AnalysisResult {
  status: 'متوافق' | 'مخالف' | 'مراجعة';
  decision: string;
  reason: string;
  policyTitle: string;
  quote: string;
  threshold: number | null;
}

// --------------------------------------------------------------
// 2. قاعدة بيانات السياسات (محاكاة RAG)
// --------------------------------------------------------------
const policiesDB: Policy[] = [
  {
    id: 1,
    title: 'سياسة المشتريات التقنية',
    content:
      'أي مشتريات تقنية (أجهزة، لابتوبات، خوادم) تتجاوز قيمتها 3000 دولار تتطلب موافقة مسبقة من المدير التقني CTO. المخالفة تؤدي إلى رفض الطلب.',
    keywords: ['لابتوب', 'اجهزة', 'خوادم', 'تقنية', 'كمبيوتر', 'pc', 'notebook', 'خادم'],
    threshold: 3000,
    unit: 'USD',
  },
  {
    id: 2,
    title: 'سياسة مكافحة غسيل الأموال (AML)',
    content:
      'أي تحويل أو دفعة تتجاوز 2500 دولار لطرف خارجي غير معتمد مسبقاً يجب أن تمر بمراجعة مسؤول الامتثال. الدفعات المتكررة لنفس المستفيد خلال 30 يومًا تستدعي التدقيق.',
    keywords: ['استشارات', 'تحويل', 'دفعة', 'مورد خارجي', 'قانونية', 'محامي'],
    threshold: 2500,
    unit: 'USD',
  },
  {
    id: 3,
    title: 'سياسة السفر والإقامة',
    content:
      'تذاكر السفر والإقامة للفنادق يجب ألا تتجاوز 4000 دولار للرحلة الواحدة دون موافقة المدير المالي. الرحلات الدولية تتطلب موافقة إضافية.',
    keywords: ['سفر', 'تذكرة', 'فندق', 'إقامة', 'رحلة', 'طيران'],
    threshold: 4000,
    unit: 'USD',
  },
  {
    id: 4,
    title: 'سياسة المصروفات الإدارية',
    content:
      'المصروفات الإدارية (قرطاسية، أدوات مكتبية) حتى 500 دولار معفاة من المراجعة، ما بين 500 و 1500 تحتاج مدير القسم، فوق 1500 تحتاج المدير المالي.',
    keywords: ['قرطاسية', 'أدوات مكتبية', 'طابعة', 'أحبار', 'مكتبية', 'دفتر'],
    threshold: 1500,
    unit: 'USD',
  },
  {
    id: 5,
    title: 'سياسة التسويق والفعاليات',
    content:
      'حملات التسويق الرقمي والفعاليات يجب ألا تتجاوز 5000$ دون موافقة إدارة التسويق التنفيذية، وتتطلب تقييم العائد على الاستثمار.',
    keywords: ['تسويق', 'حملة', 'إعلانات', 'مؤثرين', 'فعالية', 'معرض'],
    threshold: 5000,
    unit: 'USD',
  },
];

// --------------------------------------------------------------
// 3. دالة التحليل الذكي (RAG)
// --------------------------------------------------------------
function analyzeRequest(purpose: string, amount: number): AnalysisResult {
  const lowerPurpose = purpose.toLowerCase();
  let matchedPolicy: Policy | null = null;

  // البحث عن أول سياسة تطابق أي كلمة مفتاحية
  for (const policy of policiesDB) {
    const found = policy.keywords.some((keyword) => lowerPurpose.includes(keyword));
    if (found) {
      matchedPolicy = policy;
      break;
    }
  }

  // حالة عدم وجود سياسة محددة
  if (!matchedPolicy) {
    if (amount > 3000) {
      return {
        status: 'مراجعة',
        decision: 'معلق (مراجعة بشرية)',
        reason:
          'لم يتم العثور على سياسة محددة لهذا الغرض، ولكن المبلغ يتجاوز الحد العام للتدقيق التلقائي. يُوصى بعرض الطلب على المدقق المالي.',
        policyTitle: 'سياسة عامة (مراجعة يدوية)',
        quote: 'لا يوجد اقتباس محدد من السياسات لهذا النوع من المصروفات. يرجى التحقق من دليل السياسات الشامل.',
        threshold: null,
      };
    } else {
      return {
        status: 'متوافق',
        decision: 'معتمد تلقائياً',
        reason:
          'لم يتم العثور على سياسة مقيدة تنطبق على هذا الطلب، والمبلغ ضمن الحدود المقبولة للنظام. يعتبر الطلب متوافقاً.',
        policyTitle: 'لا توجد سياسة مقيدة',
        quote: 'لا توجد بنود تقييدية لهذا النوع من المصروفات ضمن الحدود الطبيعية.',
        threshold: null,
      };
    }
  }

  // سياسة مطابقة: فحص تجاوز الحد
  if (amount > matchedPolicy.threshold) {
    return {
      status: 'مخالف',
      decision: 'مرفوض - تجاوز الحد المسموح',
      reason: `الطلب يخالف ${matchedPolicy.title} حيث أن المبلغ (${amount}$) يتجاوز الحد المسموح (${matchedPolicy.threshold}$) بدون موافقة مسبقة. يتطلب تدقيقاً فورياً من جهة الاختصاص.`,
      policyTitle: matchedPolicy.title,
      quote: matchedPolicy.content,
      threshold: matchedPolicy.threshold,
    };
  } else {
    return {
      status: 'متوافق',
      decision: 'معتمد تلقائياً',
      reason: `الطلب متوافق مع ${matchedPolicy.title} حيث أن المبلغ (${amount}$) لا يتجاوز الحد المسموح (${matchedPolicy.threshold}$). الإجراء آمن ومطابق للسياسة المالية.`,
      policyTitle: matchedPolicy.title,
      quote: matchedPolicy.content,
      threshold: matchedPolicy.threshold,
    };
  }
}

// --------------------------------------------------------------
// 4. المكون الرئيسي
// --------------------------------------------------------------
const FinGuardAIAnalyzer: React.FC = () => {
  // حالات المدخلات
  const [employeeName, setEmployeeName] = useState<string>('سارة الخالدي');
  const [requestPurpose, setRequestPurpose] = useState<string>('شراء أجهزة لابتوب');
  const [requestAmount, setRequestAmount] = useState<string>('5200');

  // حالات النتيجة
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);

  // مرجع للمربع الخارجي لتطبيق الاهتزاز
  const outerCardRef = useRef<HTMLDivElement>(null);

  // ------------------------------------------------------------
  // دالة تحديث الواجهة بناءً على نتيجة التحليل
  // ------------------------------------------------------------
  const updateResultUI = (analysis: AnalysisResult) => {
    setResult(analysis);
    setShowResult(true);

    // تطبيق الاهتزاز إذا كانت النتيجة "مخالف"
    if (analysis.status === 'مخالف' && outerCardRef.current) {
      outerCardRef.current.classList.add('shake-border');
      setTimeout(() => {
        if (outerCardRef.current) outerCardRef.current.classList.remove('shake-border');
      }, 600);
    }
  };

  // ------------------------------------------------------------
  // دالة التحليل الرئيسية
  // ------------------------------------------------------------
  const performAnalysis = () => {
    const purpose = requestPurpose.trim();
    const amount = parseFloat(requestAmount);

    // التحقق من صحة المدخلات
    if (!purpose) {
      alert('الرجاء إدخال الغرض من الطلب.');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      alert('الرجاء إدخال مبلغ صحيح (أكبر من صفر).');
      return;
    }

    // استدعاء محرك RAG
    const analysis = analyzeRequest(purpose, amount);
    updateResultUI(analysis);

    // تمرير سلس للنتيجة
    setTimeout(() => {
      document.getElementById('resultContainer')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // ------------------------------------------------------------
  // دالة إنشاء طلب جديد (إعادة تعيين جزئي)
  // ------------------------------------------------------------
  const handleNewRequest = () => {
    alert('✨ فتح نموذج إنشاء طلب مالي جديد (متكامل مع RAG). يمكنك إدخال بيانات تجريبية للتحليل الفوري.');
    setEmployeeName('أحمد المنصوري');
    setRequestPurpose('اشتراك منصة تحليلات');
    setRequestAmount('1890');
    setShowResult(false);
    setResult(null);
  };

  // ------------------------------------------------------------
  // دالة الدردشة العائمة
  // ------------------------------------------------------------
  const handleChatFabClick = () => {
    alert('💬 مساعد FinGuard AI الذكي قادم قريباً! يمكنك الآن استخدام أداة التحليل أعلاه للتدقيق الفوري.');
  };

  // ------------------------------------------------------------
  // تأثير تلقائي لعرض تحليل أولي عند تحميل الصفحة
  // ------------------------------------------------------------
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!showResult) {
        const demoAnalysis = analyzeRequest(requestPurpose, parseFloat(requestAmount));
        updateResultUI(demoAnalysis);
      }
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // يتم التشغيل مرة واحدة فقط

  // ------------------------------------------------------------
  // تحديد لون الحدود بناءً على حالة النتيجة
  // ------------------------------------------------------------
  const getBorderColor = () => {
    if (!result) return 'border-gray-200';
    switch (result.status) {
      case 'متوافق':
        return 'border-green-500';
      case 'مخالف':
        return 'border-red-500';
      case 'مراجعة':
        return 'border-yellow-500';
      default:
        return 'border-gray-200';
    }
  };

  // ------------------------------------------------------------
  // تحديد الظل المناسب
  // ------------------------------------------------------------
  const getBoxShadow = () => {
    if (!result) return 'shadow-xl';
    switch (result.status) {
      case 'متوافق':
        return 'shadow-xl shadow-green-100';
      case 'مخالف':
        return 'shadow-xl shadow-red-100';
      case 'مراجعة':
        return 'shadow-xl shadow-yellow-100';
      default:
        return 'shadow-xl';
    }
  };

  // ------------------------------------------------------------
  // عرض التوصية مع أيقونة
  // ------------------------------------------------------------
  const renderRecommendation = () => {
    if (!result) return '-';
    const icon =
      result.status === 'متوافق' ? (
        <i className="fas fa-check-circle text-green-600 ml-1"></i>
      ) : result.status === 'مخالف' ? (
        <i className="fas fa-exclamation-triangle text-red-600 ml-1"></i>
      ) : (
        <i className="fas fa-clock text-yellow-600 ml-1"></i>
      );
    return (
      <>
        {icon} {result.decision}
      </>
    );
  };

  // ------------------------------------------------------------
  // عرض الاقتباس إن وجد
  // ------------------------------------------------------------
  const renderPolicyQuote = () => {
    if (!result) return null;
    if (
      result.policyTitle !== 'لا توجد سياسة مقيدة' &&
      result.policyTitle !== 'سياسة عامة (مراجعة يدوية)' &&
      result.quote
    ) {
      return (
        <div className="text-xs text-gray-500 mt-2 italic border-r-2 border-gray-200 pr-2">
          "{result.quote.substring(0, 140)}{result.quote.length > 140 ? '...' : ''}"
        </div>
      );
    } else if (result.policyTitle === 'سياسة عامة (مراجعة يدوية)') {
      return (
        <div className="text-xs text-gray-500 mt-2 italic border-r-2 border-gray-200 pr-2">
          لا يوجد اقتباس مباشر، يوصى بالمراجعة البشرية.
        </div>
      );
    }
    return null;
  };

  // ------------------------------------------------------------
  // عرض معلومات الحد (إن وجدت)
  // ------------------------------------------------------------
  const renderThresholdInfo = () => {
    if (result && result.threshold) {
      return (
        <div className="text-xs text-gray-400 mt-2">
          <i className="fas fa-chart-line ml-1"></i> الحد المسموح في السياسة: {result.threshold}$
        </div>
      );
    }
    return null;
  };

  // ------------------------------------------------------------
  // JSX الرئيسي للمكون
  // ------------------------------------------------------------
  return (
    <div className="antialiased" dir="rtl">
      {/* المحتوى الرئيسي بدون سايدبار */}
      <main className="max-w-[1400px] mx-auto p-5 md:p-8">
        {/* رأس الصفحة */}
        <div className="flex flex-wrap justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
              <i className="fas fa-microchip text-[#1f6e7a] text-3xl"></i>
              تحليل AI
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              تدقيق فوري باستخدام RAG (استرجاع معزز) مع اقتباسات من سياسات الشركة
            </p>
          </div>
          <div className="flex gap-3 mt-3 md:mt-0">
            <button
              onClick={handleNewRequest}
              className="bg-[#1f6e7a] hover:bg-[#0f5c68] text-white px-5 py-2 rounded-full text-sm font-semibold shadow-md transition flex items-center gap-2"
            >
              <i className="fas fa-plus-circle"></i> طلب مالي جديد
            </button>
          </div>
        </div>

        {/* بطاقة الإدخال */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-8">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-5">
            <i className="fas fa-clipboard-list text-[#1f6e7a] text-lg"></i>
            <h2 className="text-lg font-bold text-gray-800">بيانات الطلب للتدقيق الذكي</h2>
            <span className="bg-teal-50 text-[#1f6e7a] text-xs px-3 py-1 rounded-full mr-auto">
              <i className="fas fa-robot ml-1"></i> RAG Auditor
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                <i className="fas fa-user-circle ml-1 text-[#1f6e7a]"></i> الموظف / مقدم الطلب
              </label>
              <input
                type="text"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                className="input-modern"
                placeholder="الاسم"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                <i className="fas fa-bullhorn ml-1 text-[#1f6e7a]"></i> الغرض من الطلب
              </label>
              <input
                type="text"
                value={requestPurpose}
                onChange={(e) => setRequestPurpose(e.target.value)}
                className="input-modern"
                placeholder="مثال: تراخيص برمجية، أجهزة، سفر..."
                onKeyPress={(e) => e.key === 'Enter' && performAnalysis()}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                <i className="fas fa-dollar-sign ml-1 text-[#1f6e7a]"></i> المبلغ ($)
              </label>
              <input
                type="number"
                value={requestAmount}
                onChange={(e) => setRequestAmount(e.target.value)}
                className="input-modern"
                placeholder="القيمة بالدولار"
                onKeyPress={(e) => e.key === 'Enter' && performAnalysis()}
              />
            </div>
          </div>
          <div className="mt-7 flex justify-center">
            <button
              onClick={performAnalysis}
              className="bg-[#1f6e7a] hover:bg-[#0f5c68] text-white px-8 py-3 rounded-xl text-base font-bold shadow-md transition flex items-center gap-2"
            >
              <i className="fas fa-brain"></i> تحليل باستخدام الذكاء الاصطناعي
            </button>
          </div>
        </div>

        {/* حاوية عرض النتيجة */}
        {showResult && result && (
          <div id="resultContainer" className="transition-all duration-300">
            <div
              ref={outerCardRef}
              className={`rounded-2xl border-4 ${getBorderColor()} bg-white p-5 md:p-7 ${getBoxShadow()} transition-all`}
            >
              {/* الكروت المستطيلة الثلاثة */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* 1. البند المقترح */}
                <div className="inner-rect-card">
                  <div className="flex items-center gap-2 mb-3 border-b border-gray-100 pb-2">
                    <i className="fas fa-file-contract text-[#1f6e7a] text-lg"></i>
                    <span className="font-bold text-gray-800 text-sm uppercase tracking-wide">
                      البند المقترح
                    </span>
                  </div>
                  <div className="text-gray-700 text-sm leading-relaxed font-medium">
                    {result.policyTitle}
                  </div>
                  {renderPolicyQuote()}
                </div>

                {/* 2. التوصية */}
                <div className="inner-rect-card">
                  <div className="flex items-center gap-2 mb-3 border-b border-gray-100 pb-2">
                    <i className="fas fa-gavel text-[#1f6e7a] text-lg"></i>
                    <span className="font-bold text-gray-800 text-sm uppercase tracking-wide">
                      التوصية
                    </span>
                  </div>
                  <div className="text-gray-800 font-semibold text-base">
                    {renderRecommendation()}
                  </div>
                </div>

                {/* 3. التبرير */}
                <div className="inner-rect-card">
                  <div className="flex items-center gap-2 mb-3 border-b border-gray-100 pb-2">
                    <i className="fas fa-brain text-[#1f6e7a] text-lg"></i>
                    <span className="font-bold text-gray-800 text-sm uppercase tracking-wide">
                      التبرير
                    </span>
                  </div>
                  <div className="text-gray-600 text-sm leading-relaxed">{result.reason}</div>
                  {renderThresholdInfo()}
                </div>
              </div>

              {/* تذييل */}
              <div className="mt-5 pt-3 text-center text-xs text-gray-400 border-t border-gray-100 flex justify-between items-center">
                <span>
                  <i className="fas fa-database text-[#1f6e7a] ml-1"></i> مستند من قاعدة السياسات الذكية (RAG)
                </span>
                <span>
                  <i className="fas fa-clock ml-1"></i> تدقيق فوري بالاسترجاع المعزز
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* زر الدردشة العائم */}
      <div
        onClick={handleChatFabClick}
        className="fixed bottom-6 left-6 bg-[#1f6e7a] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg cursor-pointer transition hover:bg-[#0f5c68] z-20"
      >
        <i className="fas fa-comment-dots text-2xl"></i>
      </div>

      {/* أنماط مخصصة (نفس النمط الأصلي) */}
      <style>{`
        .input-modern {
          border-radius: 56px;
          border: 1px solid #e2e8f0;
          background: white;
          transition: all 0.2s;
          padding: 0.6rem 1rem;
          width: 100%;
        }
        .input-modern:focus {
          border-color: #1f6e7a;
          box-shadow: 0 0 0 3px rgba(31, 110, 122, 0.2);
          outline: none;
        }
        .inner-rect-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 1rem 1.2rem;
          border: 1px solid #1b364d;
          transition: all 0.2s;
          height: 100%;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }
        .inner-rect-card:hover {
          border-color: #cbdde6;
          background-color: #fefefe;
        }
        @keyframes gentleShake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
          100% { transform: translateX(0); }
        }
        .shake-border {
          animation: gentleShake 0.3s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
};

export default FinGuardAIAnalyzer;