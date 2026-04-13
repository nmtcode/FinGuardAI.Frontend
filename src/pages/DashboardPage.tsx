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
import { Chart, registerables } from "chart.js";
import { CompliancePieChart } from "../Components/CompliancePieChart";
import { StatCard } from "../Components/StatCard";
import { WeeklyViolationsChart } from "../Components/WeeklyViolationsChart";

// تسجيل مكونات Chart.js
Chart.register(...registerables);

// تعريف الواجهات للبيانات
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
          trend='<i class="fas fa-clock text-red-500"></i> عاجل'
          icon="fas fa-exclamation-triangle"
          borderColor="border-red-400"
          iconBg="bg-red-50"
          iconColor="text-red-500"
        />
        <StatCard
          title="نسبة الامتثال"
          value="75.7%"
          trend='<i class="fas fa-check-circle text-green-600"></i> جيدة جداً'
          icon="fas fa-check-circle"
          borderColor="border-green-400"
          iconBg="bg-green-50"
          iconColor="text-green-600"
        />
        <StatCard
          title="سياسات RAG"
          value="34"
          trend='<i class="fas fa-database text-purple-600"></i> محدثة'
          icon="fas fa-file-alt"
          borderColor="border-purple-400"
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
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
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4">إجراء AI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {requestsData.map((req, idx) => (
                <tr key={idx} className="hover:bg-gray-50/80 transition">
                  <td className="px-6 py-4 font-bold text-gray-700">
                    {req.id}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{req.employee}</td>
                  <td className="px-6 py-4 text-gray-600">{req.purpose}</td>
                  <td className="px-6 py-4 font-mono font-bold text-teal-700">
                    ${req.amount.toLocaleString()}
                  </td>
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
                      <FontAwesomeIcon
                        icon={req.status.icon}
                        className="text-[10px]"
                      />
                      {req.status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className={`flex items-center gap-2 font-bold ${req.aiAction.color}`}
                    >
                      <FontAwesomeIcon icon={req.aiAction.icon} />
                      {req.aiAction.text}
                    </div>
                  </td>
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
          <CompliancePieChart
            labels={pieLabels}
            data={pieData}
            colors={pieColors}
          />
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <i className="fas fa-chart-line text-teal-600"></i> اتجاه المخالفات
          </h3>
          <WeeklyViolationsChart
            labels={lineLabels}
            data={lineData}
            borderColor="#c23d2e"
            backgroundColor="rgba(194,61,46,0.05)"
          />
        </div>
      </div>

      {/* 4. قسم RAG الذكي */}
      <div className="bg-[#0a2e3b] text-white rounded-3xl p-8 relative overflow-hidden shadow-xl">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-teal-500/20 p-3 rounded-2xl">
              <FontAwesomeIcon
                icon={faUserCheck}
                className="text-teal-400 text-xl"
              />
            </div>
            <h3 className="font-black text-xl">رؤى AI الفورية (RAG Engine)</h3>
          </div>
          <div className="grid gap-4">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <p className="text-teal-300 text-xs font-bold mb-1 uppercase tracking-wider">
                آخر تحليل استرجاعي:
              </p>
              <p className="text-sm leading-relaxed text-gray-200">
                بناءً على "سياسة المشتريات v2.1"، تم اكتشاف أن الطلب{" "}
                <span className="text-white font-bold">#F-1024</span> يفتقد
                لنموذج الجدوى التقنية المطلوب للمشتريات التي تتجاوز 5000$.
              </p>
            </div>
          </div>
        </div>
        {/* خلفية جمالية */}
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default DashboardPage;
