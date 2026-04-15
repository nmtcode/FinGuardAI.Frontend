// FinancialRequestsDashboard.tsx
// مكون لوحة إدارة الطلبات المالية مع تدقيق RAG فوري

import React, { useState, useEffect, useCallback, useMemo } from 'react';

// -------------------------------
// 1. تعريف الواجهات (Interfaces) لأنواع البيانات
// -------------------------------

// واجهة بيانات الطلب الواحد
interface RequestItem {
  id: string;          // رقم الطلب
  employee: string;    // اسم الموظف
  dept: string;        // القسم
  purpose: string;     // الغرض من الصرف
  amount: number;      // المبلغ بالدولار
  date: string;        // التاريخ بصيغة YYYY-MM-DD
  status: string;      // الحالة: "متوافق", "مخالف", "مراجعة"
  risk: string;        // المخاطر: "منخفض", "متوسط", "عالي"
  aiNote: string;      // تقييم الذكاء الاصطناعي
  ragRef: string;      // مرجع سياسة RAG (يستخدم في التفاصيل)
}

// -------------------------------
// 2. البيانات الأولية (محاكاة API)
// -------------------------------
const initialRequestsData: RequestItem[] = [
  { id: "#F-3001", employee: "سارة الخالدي", dept: "التسويق", purpose: "حملة إعلانات رقمية", amount: 4850, date: "2025-04-14", status: "مخالف", risk: "عالي", aiNote: "تجاوز الميزانية المخصصة للقسم بدون تفويض", ragRef: "الحد الأقصى 3000$" },
  { id: "#F-3002", employee: "أحمد المنصوري", dept: "تقنية المعلومات", purpose: "تراخيص برمجية سنوية", amount: 2250, date: "2025-04-13", status: "متوافق", risk: "منخفض", aiNote: "متوافق مع سياسة المشتريات التقنية", ragRef: "ضمن حدود البند 4.2" },
  { id: "#F-3003", employee: "لينا حسين", dept: "الموارد البشرية", purpose: "تجهيز مؤتمر تطوير", amount: 6700, date: "2025-04-12", status: "مراجعة", risk: "متوسط", aiNote: "يتطلب موافقة المدير التنفيذي", ragRef: "قيمة تتجاوز 5000$ تحتاج توقيع إداري" },
  { id: "#F-3004", employee: "خالد المطيري", dept: "العمليات", purpose: "صيانة عاجلة لآلات", amount: 12500, date: "2025-04-11", status: "مخالف", risk: "عالي", aiNote: "انتهاك لسياسة الشراء الموحد", ragRef: "يجب طرح منافسة لأكثر من 10,000$" },
  { id: "#F-3005", employee: "نورة العمري", dept: "المالية", purpose: "اشتراك منصة تحليلات", amount: 1890, date: "2025-04-10", status: "متوافق", risk: "منخفض", aiNote: "تلقائي معتمد - خدمة معتمدة", ragRef: "منصة ضمن القائمة البيضاء" },
  { id: "#F-3006", employee: "عمر القحطاني", dept: "المبيعات", purpose: "استضافة فعالية عملاء", amount: 9350, date: "2025-04-09", status: "مراجعة", risk: "متوسط", aiNote: "مراجعة بشرية مطلوبة", ragRef: "سياسة الفعاليات التجارية" },
  { id: "#F-3007", employee: "ريم الفهد", dept: "الحوكمة", purpose: "استشارات قانونية", amount: 3200, date: "2025-04-08", status: "مخالف", risk: "عالي", aiNote: "اشتباه AML - طرف خارجي غير معتمد", ragRef: "إجراءات مكافحة غسيل الأموال" },
  { id: "#F-3008", employee: "فهد السبيعي", dept: "التسويق", purpose: "تصميم جرافيكي", amount: 1200, date: "2025-04-07", status: "متوافق", risk: "منخفض", aiNote: "مطابق لحدود البند", ragRef: "سياسة المشتريات الصغرى" },
  { id: "#F-3009", employee: "مها العتيبي", dept: "تقنية المعلومات", purpose: "أجهزة لابتوب", amount: 5400, date: "2025-04-06", status: "مراجعة", risk: "متوسط", aiNote: "يتطلب موافقة CTO", ragRef: "سياسة الأجهزة" },
  { id: "#F-3010", employee: "عبدالله الرشيد", dept: "العمليات", purpose: "توريد قرطاسية", amount: 350, date: "2025-04-05", status: "متوافق", risk: "منخفض", aiNote: "معفى من المراجعة", ragRef: "إنفاق تشغيلي صغير" },
  { id: "#F-3011", employee: "هند الدوسري", dept: "التسويق", purpose: "حملة مؤثرين", amount: 7200, date: "2025-04-04", status: "مراجعة", risk: "متوسط", aiNote: "مراجعة العائد على الاستثمار", ragRef: "سياسة التسويق الرقمي" },
  { id: "#F-3012", employee: "ياسر القحطاني", dept: "تقنية المعلومات", purpose: "خوادم سحابية", amount: 11200, date: "2025-04-03", status: "مخالف", risk: "عالي", aiNote: "تجاوز الميزانية الربعية", ragRef: "موافقة مسبقة من الإدارة العليا" }
];

// -------------------------------
// 3. المكون الرئيسي
// -------------------------------
const FinancialRequestsDashboard: React.FC = () => {
  // حالات الفلاتر والبحث
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  // مجموعة معرفات الطلبات المحددة (للإجراءات الجماعية)
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(new Set());

  // -------------------------------
  // دوال مساعدة للإحصائيات
  // -------------------------------
  
  // حساب إجمالي الطلبات
  const totalRequests = useMemo(() => initialRequestsData.length, []);
  
  // حساب إجمالي المبالغ
  const totalAmount = useMemo(() => 
    initialRequestsData.reduce((sum, req) => sum + req.amount, 0), []);
  
  // عدد الطلبات قيد المراجعة
  const pendingCount = useMemo(() => 
    initialRequestsData.filter(req => req.status === "مراجعة").length, []);
  
  // عدد الطلبات المخالفة
  const violationCount = useMemo(() => 
    initialRequestsData.filter(req => req.status === "مخالف").length, []);

  // -------------------------------
  // دالة تصفية الطلبات بناءً على الفلاتر الحالية
  // -------------------------------
  const getFilteredRequests = useCallback((): RequestItem[] => {
    let filtered = [...initialRequestsData];
    
    // تصفية حسب الحالة
    if (statusFilter !== "all") {
      filtered = filtered.filter(req => req.status === statusFilter);
    }
    
    // تصفية حسب المخاطر
    if (riskFilter !== "all") {
      filtered = filtered.filter(req => req.risk === riskFilter);
    }
    
    // تصفية حسب البحث (رقم الطلب، الموظف، القسم، الغرض)
    if (searchTerm.trim() !== "") {
      const term = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(req =>
        req.id.toLowerCase().includes(term) ||
        req.employee.toLowerCase().includes(term) ||
        req.dept.toLowerCase().includes(term) ||
        req.purpose.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [statusFilter, riskFilter, searchTerm]);

  // الطلبات المفلترة (للعرض)
  const filteredRequests = getFilteredRequests();

  // -------------------------------
  // دالة لإعادة تعيين جميع الفلاتر
  // -------------------------------
  const clearAllFilters = () => {
    setStatusFilter("all");
    setRiskFilter("all");
    setSearchTerm("");
    // يمكن إعادة تعيين التحديدات إذا أردت، لكن الأفضل إبقاؤها أو مسحها حسب UX
    // setSelectedRequests(new Set());
  };

  // -------------------------------
  // دالة تصدير البيانات إلى ملف CSV
  // -------------------------------
  const exportToCSV = () => {
    if (filteredRequests.length === 0) {
      alert("لا توجد بيانات للتصدير");
      return;
    }
    
    // تعريف أعمدة CSV
    const headers = ["رقم الطلب", "الموظف", "القسم", "الغرض", "المبلغ ($)", "التاريخ", "الحالة", "المخاطر", "تقييم الذكاء الاصطناعي"];
    const rows = filteredRequests.map(req => [
      req.id, req.employee, req.dept, req.purpose, req.amount, req.date, req.status, req.risk, req.aiNote
    ]);
    
    // تحويل إلى نص CSV مع دعم العربية (BOM)
    const csvContent = [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(",")
    ).join("\n");
    
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", "FinGuard_requests.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // -------------------------------
  // دالة الموافقة الجماعية (محاكاة)
  // -------------------------------
  const bulkApprove = () => {
    if (selectedRequests.size === 0) {
      alert("يرجى تحديد طلب واحد على الأقل للموافقة الجماعية.");
      return;
    }
    alert(`📌 تم إرسال ${selectedRequests.size} طلب للموافقة الجماعية. سيتم تطبيق قواعد RAG والتدقيق الذكي.`);
  };

  // -------------------------------
  // دالة تبديل تحديد طلب فردي
  // -------------------------------
  const toggleRequestSelection = (id: string, checked: boolean) => {
    setSelectedRequests(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  // -------------------------------
  // دالة تحديد / إلغاء تحديد الكل
  // -------------------------------
  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      // إضافة جميع الطلبات المفلترة (وليس كل البيانات الأصلية)
      const allFilteredIds = filteredRequests.map(req => req.id);
      setSelectedRequests(new Set(allFilteredIds));
    } else {
      setSelectedRequests(new Set());
    }
  };

  // تحديث حالة "تحديد الكل" (للcheckbox الرئيسي)
  const isAllSelected = filteredRequests.length > 0 && filteredRequests.every(req => selectedRequests.has(req.id));
  const isSomeSelected = filteredRequests.some(req => selectedRequests.has(req.id));

  // -------------------------------
  // دوال إجراءات الصف (عرض، تعديل، موافقة، إخطار)
  // -------------------------------
  const handleView = (id: string) => {
    alert(`📄 تفاصيل الطلب ${id}\n\nسيتم فتح لوحة تدقيق كاملة مع اقتباسات RAG.`);
  };
  
  const handleEdit = (id: string) => {
    alert(`✏️ تعديل الطلب ${id}\n(محاكاة) يمكنك تحديث البيانات وإعادة فحص الامتثال.`);
  };
  
  const handleApprove = (id: string) => {
    alert(`✅ تمت الموافقة المبدئية على الطلب ${id}، وسيتم إشعار المدقق البشري.`);
  };
  
  const handleFlag = (id: string) => {
    alert(`🚩 تم رفع إشارة للطلب المخالف ${id} إلى فريق الامتثال.`);
  };

  // -------------------------------
  // JSX: واجهة المستخدم (نفس التصميم الأصلي 100%)
  // -------------------------------
  return (
    <div className="antialiased font-['Cairo',sans-serif] bg-[#f4f7fc] min-h-screen">
      <main className="p-5 md:p-8 max-w-[1600px] mx-auto">
        
        {/* رأس الصفحة */}
        <div className="flex flex-wrap justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
              <i className="fas fa-file-invoice-dollar text-[#1f6e7a] text-3xl"></i>
              الطلبات المالية
            </h1>
            <p className="text-gray-500 text-sm mt-1">إدارة جميع طلبات الصرف مع تدقيق AI فوري (RAG) وإجراءات سريعة</p>
          </div>
          <button 
            onClick={() => alert("✨ فتح نموذج طلب جديد مع تحليل RAG فوري ومسارات الموافقة الذكية.")}
            className="mt-3 md:mt-0 bg-[#1f6e7a] hover:bg-[#0f5c68] text-white px-5 py-2 rounded-full text-sm font-semibold shadow-md transition flex items-center gap-2"
          >
            <i className="fas fa-plus-circle"></i> طلب جديد
          </button>
        </div>

        {/* البطاقات الإحصائية */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat-card-elegant bg-white rounded-2xl p-5 shadow-md border-r-4 border-[#1f6e7a]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">إجمالي الطلبات</p>
                <p className="text-3xl font-extrabold text-gray-800 mt-1">{totalRequests}</p>
              </div>
              <div className="bg-teal-50 w-12 h-12 rounded-full flex items-center justify-center">
                <i className="fas fa-receipt text-[#1f6e7a] text-2xl"></i>
              </div>
            </div>
          </div>
          <div className="stat-card-elegant bg-white rounded-2xl p-5 shadow-md border-r-4 border-blue-400">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">إجمالي المبالغ ($)</p>
                <p className="text-3xl font-extrabold text-gray-800 mt-1">{totalAmount.toLocaleString()}</p>
              </div>
              <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center">
                <i className="fas fa-dollar-sign text-blue-600 text-2xl"></i>
              </div>
            </div>
          </div>
          <div className="stat-card-elegant bg-white rounded-2xl p-5 shadow-md border-r-4 border-amber-400">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">قيد المراجعة</p>
                <p className="text-3xl font-extrabold text-gray-800 mt-1">{pendingCount}</p>
              </div>
              <div className="bg-amber-50 w-12 h-12 rounded-full flex items-center justify-center">
                <i className="fas fa-hourglass-half text-amber-600 text-2xl"></i>
              </div>
            </div>
          </div>
          <div className="stat-card-elegant bg-white rounded-2xl p-5 shadow-md border-r-4 border-red-400">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">مخالفات نشطة</p>
                <p className="text-3xl font-extrabold text-gray-800 mt-1">{violationCount}</p>
              </div>
              <div className="bg-red-50 w-12 h-12 rounded-full flex items-center justify-center">
                <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* شريط البحث والتصفية */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 mb-8 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
              <div className="relative flex-1 min-w-[220px]">
                <i className="fas fa-search absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="بحث برقم الطلب، الموظف، القسم أو الغرض..."
                  className="w-full py-2.5 pr-10 pl-4 text-sm bg-white rounded-full border border-gray-200 focus:border-[#1f6e7a] focus:ring-2 focus:ring-[#1f6e7a]/20 outline-none transition"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none py-2.5 px-5 pr-4 bg-white rounded-full text-sm font-medium cursor-pointer border border-gray-200 focus:border-[#1f6e7a] focus:ring-2 focus:ring-[#1f6e7a]/20 outline-none"
              >
                <option value="all">جميع الحالات</option>
                <option value="متوافق">✅ متوافق</option>
                <option value="مخالف">⚠️ مخالف</option>
                <option value="مراجعة">⏳ قيد المراجعة</option>
              </select>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="appearance-none py-2.5 px-5 pr-4 bg-white rounded-full text-sm font-medium cursor-pointer border border-gray-200 focus:border-[#1f6e7a] focus:ring-2 focus:ring-[#1f6e7a]/20 outline-none"
              >
                <option value="all">مستوى المخاطر</option>
                <option value="منخفض">🟢 منخفض</option>
                <option value="متوسط">🟠 متوسط</option>
                <option value="عالي">🔴 عالي</option>
              </select>
              <button
                onClick={clearAllFilters}
                className="text-gray-500 text-sm bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 transition"
              >
                <i className="fas fa-eraser ml-1"></i> مسح الكل
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportToCSV}
                className="text-[#1f6e7a] text-sm bg-teal-50 hover:bg-teal-100 rounded-full px-4 py-2 transition"
              >
                <i className="fas fa-file-export ml-1"></i> تصدير CSV
              </button>
              <button
                onClick={bulkApprove}
                className="text-white text-sm bg-[#1f6e7a] hover:bg-[#0f5c68] rounded-full px-4 py-2 transition shadow-sm"
              >
                <i className="fas fa-check-double ml-1"></i> موافقة جماعية
              </button>
            </div>
          </div>
        </div>

        {/* الجدول الرئيسي */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm w-full">
              <thead className="bg-[#fafdff]">
                <tr>
                  <th className="text-right w-10 px-4">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = !isAllSelected && isSomeSelected;
                      }}
                      onChange={(e) => toggleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-[#1f6e7a] focus:ring-[#1f6e7a]"
                    />
                  </th>
                  <th className="text-right font-bold text-[#2c5a6e] border-b-2 border-[#ecf3f9] py-3 px-4">رقم الطلب</th>
                  <th className="text-right font-bold text-[#2c5a6e] border-b-2 border-[#ecf3f9] py-3 px-4">الموظف / القسم</th>
                  <th className="text-right font-bold text-[#2c5a6e] border-b-2 border-[#ecf3f9] py-3 px-4">الغرض</th>
                  <th className="text-right font-bold text-[#2c5a6e] border-b-2 border-[#ecf3f9] py-3 px-4">المبلغ ($)</th>
                  <th className="text-right font-bold text-[#2c5a6e] border-b-2 border-[#ecf3f9] py-3 px-4">التاريخ</th>
                  <th className="text-right font-bold text-[#2c5a6e] border-b-2 border-[#ecf3f9] py-3 px-4">حالة الامتثال</th>
                  <th className="text-right font-bold text-[#2c5a6e] border-b-2 border-[#ecf3f9] py-3 px-4">المخاطر</th>
                  <th className="text-right font-bold text-[#2c5a6e] border-b-2 border-[#ecf3f9] py-3 px-4">تقييم AI</th>
                  <th className="text-right font-bold text-[#2c5a6e] border-b-2 border-[#ecf3f9] py-3 px-4">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-16 text-gray-400">
                      <i className="fas fa-inbox text-4xl text-gray-300 mb-2 block"></i>
                      لا توجد طلبات تطابق المعايير
                      <button onClick={clearAllFilters} className="mt-2 text-[#1f6e7a] text-sm underline">إعادة تعيين الفلاتر</button>
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => {
                    // تحديد كلاس الحالة والأيقونة
                    let statusClass = "", statusIcon = "";
                    if (req.status === "متوافق") { statusClass = "bg-[#e0f2e9] text-[#0b6e4f]"; statusIcon = "<i class='fas fa-check-circle'></i>"; }
                    else if (req.status === "مخالف") { statusClass = "bg-[#fee9e7] text-[#bc3f2e]"; statusIcon = "<i class='fas fa-ban'></i>"; }
                    else { statusClass = "bg-[#eef2ff] text-[#4f46e5]"; statusIcon = "<i class='fas fa-user-check'></i>"; }
                    
                    // عرض المخاطر
                    let riskHtml = "";
                    if (req.risk === "منخفض") riskHtml = "<span class='bg-[#e0f2e9] text-[#0b6e4f] inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs'><i class='fas fa-leaf text-[10px]'></i> منخفض</span>";
                    else if (req.risk === "متوسط") riskHtml = "<span class='bg-[#fff0db] text-[#c97e0a] inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs'><i class='fas fa-chart-line text-xs'></i> متوسط</span>";
                    else riskHtml = "<span class='bg-[#fee9e7] text-[#bc3f2e] inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs'><i class='fas fa-exclamation-triangle'></i> عالي</span>";
                    
                    return (
                      <tr key={req.id} className="border-b border-[#ecf3f9] hover:bg-[#f0f7fa] transition">
                        <td className="text-center px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedRequests.has(req.id)}
                            onChange={(e) => toggleRequestSelection(req.id, e.target.checked)}
                            className="rounded border-gray-300 text-[#1f6e7a] focus:ring-[#1f6e7a]"
                          />
                        </td>
                        <td className="font-bold text-[#1f6e7a] text-sm px-4 py-3">{req.id}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-800">{req.employee}</div>
                          <div className="text-[11px] text-gray-400">{req.dept}</div>
                        </td>
                        <td className="text-gray-600 max-w-[180px] truncate px-4 py-3" title={req.purpose}>{req.purpose}</td>
                        <td className="font-mono font-bold text-gray-800 px-4 py-3">${req.amount.toLocaleString()}</td>
                        <td className="text-gray-500 text-sm px-4 py-3">{req.date}</td>
                        <td className="px-4 py-3">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`}>
                            <span dangerouslySetInnerHTML={{ __html: statusIcon }}></span> {req.status}
                          </div>
                        </td>
                        <td className="px-4 py-3" dangerouslySetInnerHTML={{ __html: riskHtml }}></td>
                        <td className="px-4 py-3">
                          <div className="text-xs bg-gray-100 text-gray-700 rounded-xl px-2 py-1 inline-flex items-center gap-1 max-w-[200px]">
                            <i className="fas fa-brain text-[#1f6e7a] text-[10px]"></i>
                            <span className="truncate">{req.aiNote}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => handleView(req.id)} className="bg-[#f1f5f9] hover:bg-[#d4eaf0] rounded-full px-3 py-1 text-xs font-medium transition" title="عرض التفاصيل">
                              <i className="fas fa-eye text-[#1f6e7a]"></i>
                            </button>
                            <button onClick={() => handleEdit(req.id)} className="bg-[#f1f5f9] hover:bg-[#d4eaf0] rounded-full px-3 py-1 text-xs font-medium transition" title="تعديل">
                              <i className="fas fa-pen text-gray-500"></i>
                            </button>
                            {req.status === "مراجعة" && (
                              <button onClick={() => handleApprove(req.id)} className="bg-teal-100 hover:bg-teal-200 rounded-full px-3 py-1 text-xs font-medium transition" title="موافقة سريعة">
                                <i className="fas fa-check text-[#1f6e7a]"></i>
                              </button>
                            )}
                            {req.status === "مخالف" && (
                              <button onClick={() => handleFlag(req.id)} className="bg-red-50 hover:bg-red-100 rounded-full px-3 py-1 text-xs font-medium transition" title="إخطار الامتثال">
                                <i className="fas fa-flag-checkered text-red-600"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50/50 px-6 py-3 flex justify-between items-center text-xs text-gray-500 border-t">
            <div><i className="fas fa-filter ml-1"></i> عرض {filteredRequests.length} من {totalRequests} طلب</div>
            <div><i className="fas fa-microchip ml-1 text-[#1f6e7a]"></i> تدقيق RAG v3 · لحظي</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FinancialRequestsDashboard;