/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  faBan,
  faStopCircle,
  faCheckCircle,
  faHourglassHalf,
  faUserCheck,
  faSkullCrossbones,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Chart from 'chart.js/auto';
import { CompliancePieChart } from "../Components/CompliancePieChart";
import { StatCard } from "../Components/StatCard";
import { WeeklyViolationsChart } from "../Components/WeeklyViolationsChart";

interface RequestRow {
  id: string;
  employee: string;
  purpose: string;
  amount: number;
  date: string;
  status: {
    label: string;
    type: "violation" | "compliant" | "pending";
    icon: any;
  };
  aiAction: { icon: any; text: string; color: string };
  quickNote: string;
}

const DashboardPage = () => {
  const requestsData: RequestRow[] = [
    {
      id: "#F-1024",
      employee: "سارة الخالدي",
      purpose: "شراء أجهزة لابتوب",
      amount: 5200,
      date: "2025-04-12",
      status: { label: "مخالف", type: "violation", icon: faBan },
      aiAction: {
        icon: faStopCircle,
        text: "رفض - تجاوز حد CTO",
        color: "text-red-500",
      },
      quickNote: "اقتباس RAG: شرط الموافقة المسبقة",
    },
    {
      id: "#F-1023",
      employee: "عمر القحطاني",
      purpose: "اشتراك SaaS سنوي",
      amount: 2400,
      date: "2025-04-11",
      status: { label: "متوافق", type: "compliant", icon: faCheckCircle },
      aiAction: {
        icon: faCheckCircle,
        text: "معتمد تلقائياً",
        color: "text-green-600",
      },
      quickNote: "ضمن حدود السياسة",
    },
    {
      id: "#F-1022",
      employee: "لينا حسين",
      purpose: "تجهيز معرض تسويقي",
      amount: 8750,
      date: "2025-04-10",
      status: { label: "مراجعة", type: "pending", icon: faHourglassHalf },
      aiAction: {
        icon: faUserCheck,
        text: "انتظار مدير",
        color: "text-blue-500",
      },
      quickNote: "توصية بمراجعة بشرية",
    },
    {
      id: "#F-1021",
      employee: "خالد المطيري",
      purpose: "رسوم استشارات قانونية",
      amount: 3200,
      date: "2025-04-09",
      status: {
        label: "اشتباه AML",
        type: "violation",
        icon: faSkullCrossbones,
      },
      aiAction: { icon: faBan, text: "تجميد + إخطار", color: "text-red-500" },
      quickNote: "نمط مشبوه لطرف خارجي",
    },
    {
      id: "#F-1020",
      employee: "نورة العمري",
      purpose: "أدوات برمجية HR",
      amount: 1150,
      date: "2025-04-08",
      status: { label: "متوافق", type: "compliant", icon: faCheckCircle },
      aiAction: { icon: faCheckCircle, text: "موثق", color: "text-green-600" },
      quickNote: "متوافق مع سياسة الشراء",
    },
  ];

  const pieLabels = [
    "طلبات متوافقة (187)",
    "مخالفات نشطة (32)",
    "قيد المراجعة (28)",
  ];
  const pieData = [187, 32, 28];
  const pieColors = ["#2c8f9b", "#e2584b", "#f4b942"];

  const lineLabels = ["الأسبوع 1", "الأسبوع 2", "الأسبوع 3", "هذا الأسبوع"];
  const lineData = [12, 9, 15, 7];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. بطاقات KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="إجمالي الطلبات (شهر)"
          value="247"
          trend='<i class="fas fa-arrow-up text-green-600"></i> +12% عن السابق'
          icon="fas fa-receipt"
          borderColor="border-teal-400"
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
        />
        <StatCard
          title="مخالفات نشطة"
          value="32"
          trend='<i class="fas fa-clock text-amber-500"></i> عاجل'
          icon="fas fa-exclamation-triangle"
          borderColor="border-amber-400"
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          title="نسبة الامتثال"
          value="75.7%"
          trend='<i class="fas fa-check-circle text-teal-600"></i> جيدة جداً'
          icon="fas fa-check-circle"
          borderColor="border-teal-400"
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
        />
        <StatCard
          title="سياسات RAG"
          value="34"
          trend='<i class="fas fa-database text-teal-600"></i> محدثة'
          icon="fas fa-file-alt"
          borderColor="border-teal-400"
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
        />
      </div>

      {/* 2. الجدول */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <div className="w-2 h-6 bg-teal-600 rounded-full"></div>
            أحدث الطلبات المالية
          </h3>
          <button className="text-teal-600 text-sm font-bold hover:bg-teal-50 px-3 py-1 rounded-lg transition">
            عرض الكل
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-right">
            <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-4">رقم الطلب</th>
                <th className="px-6 py-4">الموظف</th>
                <th className="px-6 py-4">الغرض</th>
                <th className="px-6 py-4">المبلغ</th>
                <th className="px-6 py-4">التاريخ</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4">إجراء AI</th>
                <th className="px-6 py-4">شرح سريع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {requestsData.map((req, idx) => (
                <tr key={idx} className="hover:bg-gray-50/80 transition">
                  <td className="px-6 py-4 font-bold text-gray-700">{req.id}</td>
                  <td className="px-6 py-4 text-gray-600">{req.employee}</td>
                  <td className="px-6 py-4 text-gray-600">{req.purpose}</td>
                  <td className="px-6 py-4 font-mono font-bold text-teal-700">
                    ${req.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{req.date}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-2 w-fit
                      ${
                        req.status.type === "compliant"
                          ? "bg-green-100 text-green-700"
                          : req.status.type === "violation"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      <FontAwesomeIcon icon={req.status.icon} className="text-[10px]" />
                      {req.status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-2 font-bold ${req.aiAction.color}`}>
                      <FontAwesomeIcon icon={req.aiAction.icon} />
                      {req.aiAction.text}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">{req.quickNote}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <i className="fas fa-chart-pie text-teal-600"></i> توزيع الامتثال
          </h3>
          <CompliancePieChart labels={pieLabels} data={pieData} colors={pieColors} />
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div><span className="inline-block w-3 h-3 rounded-full bg-[#2c8f9b] ml-1"></span> متوافق: 187</div>
            <div><span className="inline-block w-3 h-3 rounded-full bg-[#e2584b] ml-1"></span> مخالف: 32</div>
            <div><span className="inline-block w-3 h-3 rounded-full bg-[#f4b942] ml-1"></span> قيد المراجعة: 28</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <i className="fas fa-chart-line text-teal-600"></i> اتجاه المخالفات
          </h3>
          <WeeklyViolationsChart
            labels={lineLabels}
            data={lineData}
            borderColor="#2c8f9b"
            backgroundColor="rgba(44,143,155,0.05)"
          />
          <p className="text-xs text-center text-gray-500 mt-3">
            انخفاض بنسبة 53% هذا الأسبوع بفضل تدقيق AI الفوري
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;