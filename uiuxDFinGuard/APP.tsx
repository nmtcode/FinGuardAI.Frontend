import { useEffect, useRef, useState } from 'react';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import 'tailwindcss/tailwind.css'; // تأكد من استيراد Tailwind

// تسجيل مكونات Chart.js مرة واحدة
Chart.register(...registerables);

// --------------------------------------------------------------
// مكون البطاقة الإحصائية (KPI)
// --------------------------------------------------------------
interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  icon: string;
  borderColor: string;
  iconBg: string;
  iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, icon, borderColor, iconBg, iconColor }) => (
  <div className={`stat-card-elegant bg-white rounded-2xl p-5 shadow-md border-r-4 ${borderColor}`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <p className="text-3xl font-extrabold text-gray-800 mt-1">{value}</p>
        {trend && <p className="text-xs mt-2" dangerouslySetInnerHTML={{ __html: trend }} />}
      </div>
      <div className={`${iconBg} w-12 h-12 rounded-full flex items-center justify-center`}>
        <i className={`${icon} ${iconColor} text-2xl`}></i>
      </div>
    </div>
  </div>
);

// --------------------------------------------------------------
// مكون الجدول (أحدث الطلبات)
// --------------------------------------------------------------
interface RequestRow {
  id: string;
  employee: string;
  purpose: string;
  amount: number;
  date: string;
  status: { label: string; type: 'compliant' | 'violation' | 'pending'; icon: string };
  aiAction: string;
  quickNote: string;
}

const requestsData: RequestRow[] = [
  { id: '#F-1024', employee: 'سارة الخالدي', purpose: 'شراء أجهزة لابتوب', amount: 5200, date: '2025-04-12', status: { label: 'مخالف', type: 'violation', icon: 'fa-ban' }, aiAction: '<i class="fas fa-stop-circle text-red-500 ml-1"></i> رفض - تجاوز حد CTO', quickNote: 'اقتباس RAG: شرط الموافقة المسبقة' },
  { id: '#F-1023', employee: 'عمر القحطاني', purpose: 'اشتراك SaaS سنوي', amount: 2400, date: '2025-04-11', status: { label: 'متوافق', type: 'compliant', icon: 'fa-check-circle' }, aiAction: '<i class="fas fa-check-circle text-green-600"></i> معتمد تلقائياً', quickNote: 'ضمن حدود السياسة' },
  { id: '#F-1022', employee: 'لينا حسين', purpose: 'تجهيز معرض تسويقي', amount: 8750, date: '2025-04-10', status: { label: 'مراجعة', type: 'pending', icon: 'fa-hourglass-half' }, aiAction: '<i class="fas fa-user-check"></i> انتظار مدير', quickNote: 'توصية بمراجعة بشرية' },
  { id: '#F-1021', employee: 'خالد المطيري', purpose: 'رسوم استشارات قانونية', amount: 3200, date: '2025-04-09', status: { label: 'اشتباه AML', type: 'violation', icon: 'fa-skull-crosswalk' }, aiAction: '<i class="fas fa-ban text-red-500"></i> تجميد + إخطار', quickNote: 'نمط مشبوه لطرف خارجي' },
  { id: '#F-1020', employee: 'نورة العمري', purpose: 'أدوات برمجية HR', amount: 1150, date: '2025-04-08', status: { label: 'متوافق', type: 'compliant', icon: 'fa-check-circle' }, aiAction: '<i class="fas fa-stamp"></i> موثق', quickNote: 'متوافق مع سياسة الشراء' },
];

// --------------------------------------------------------------
// مكون الرسم البياني الدائري (Pie Chart)
// شرح للمهندس نواف:
// - يستخدم Chart.js لرسم دائرة تمثل توزيع حالات الامتثال.
// - يتم تمرير البيانات عبر props (labels, data, colors).
// - يمكن استبدال البيانات الثابتة أدناه بقيم من API.
// - لتحديث الرسم البياني عند تغير البيانات، استخدم useEffect مع إعادة إنشاء الرسم البياني.
// --------------------------------------------------------------
interface PieChartProps {
  labels: string[];
  data: number[];
  colors: string[];
}

const CompliancePieChart: React.FC<PieChartProps> = ({ labels, data, colors }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    // تدمير الرسم البياني السابق إن وجد
    if (chartInstance.current) chartInstance.current.destroy();
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    chartInstance.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 8 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { position: 'bottom', labels: { font: { family: 'Cairo', size: 12 } } },
          tooltip: { bodyFont: { family: 'Cairo' } },
        },
      },
    });
    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [labels, data, colors]);

  return <canvas ref={chartRef} style={{ maxHeight: '240px', width: '100%' }} />;
};

// --------------------------------------------------------------
// مكون الرسم البياني الخطي (Line Chart) - اتجاه المخالفات
// شرح للمهندس نواف:
// - يمثل تغير عدد المخالفات عبر أسابيع.
// - يمكن ربطه بـ API يجلب البيانات الأسبوعية.
// - خاصية `tension` تجعل الخط منحنياً، و `fill` تملأ المساحة تحت الخط.
// --------------------------------------------------------------
interface LineChartProps {
  labels: string[];
  data: number[];
  borderColor: string;
  backgroundColor: string;
}

const WeeklyViolationsChart: React.FC<LineChartProps> = ({ labels, data, borderColor, backgroundColor }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'عدد المخالفات',
          data,
          borderColor,
          backgroundColor,
          borderWidth: 3,
          tension: 0.3,
          fill: true,
          pointBackgroundColor: '#e2584b',
          pointBorderColor: '#fff',
          pointRadius: 5,
          pointHoverRadius: 7,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { position: 'top', labels: { font: { family: 'Cairo' } } } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#e9eef3' }, title: { display: true, text: 'عدد المخالفات', font: { family: 'Cairo' } } },
          x: { ticks: { font: { family: 'Cairo' } } },
        },
      },
    });
    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [labels, data, borderColor, backgroundColor]);

  return <canvas ref={chartRef} style={{ maxHeight: '240px', width: '100%' }} />;
};

// --------------------------------------------------------------
// المكون الرئيسي App
// --------------------------------------------------------------
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // --- بيانات ثابتة للرسوم البيانية (يمكن استبدالها بـ API) ---
  const pieLabels = ['طلبات متوافقة (187)', 'مخالفات نشطة (32)', 'قيد المراجعة (28)'];
  const pieData = [187, 32, 28];
  const pieColors = ['#2c8f9b', '#e2584b', '#f4b942'];

  const lineLabels = ['الأسبوع 1', 'الأسبوع 2', 'الأسبوع 3', 'هذا الأسبوع'];
  const lineData = [12, 9, 15, 7];
  const lineBorderColor = '#c23d2e';
  const lineBgColor = 'rgba(194,61,46,0.05)';

  // وظيفة محاكاة لطلب جديد
  const handleNewRequest = () => {
    alert("✨ سيتم فتح نموذج إنشاء طلب مالي جديد (تكامل مع RAG وفحص فوري).\nهذه نسخة توضيحية للواجهة المتكاملة.");
  };

  // إغلاق السايدبار عند النقر على رابط (للأجهزة المحمولة)
  const closeSidebarMobile = () => {
    if (window.innerWidth <= 768) setSidebarOpen(false);
  };

  return (
    <div className="relative font-cairo bg-gray-50 min-h-screen" style={{ fontFamily: 'Cairo, sans-serif' }}>
      {/* زر القائمة للهواتف */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 bg-teal-700 text-white p-2 rounded-full shadow-lg md:hidden"
      >
        <i className="fas fa-bars text-xl"></i>
      </button>

      {/* السايدبار */}
      <aside
        className={`sidebar-modern fixed right-0 top-0 bottom-0 z-40 w-64 bg-gradient-to-b from-[#0a2e3b] to-[#07212b] text-white transition-transform duration-300 overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        }`}
        style={{ boxShadow: '-8px 0 25px rgba(0,0,0,0.08)' }}
      >
        <div className="p-6 pb-4 border-b border-teal-800/40">
          <div className="flex items-center gap-3">
            <i className="fas fa-shield-alt text-3xl text-teal-300"></i>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">FinGuard AI</h2>
              <p className="text-xs text-teal-200/80">مدقق مالي ذكي | RegTech</p>
            </div>
          </div>
        </div>
        <nav className="mt-4 px-2">
          {['لوحة التحكم', 'الطلبات المالية', 'تحليل AI', 'كتيب السياسات', 'سجل التدقيق', 'الامتثال'].map((item, idx) => (
            <a
              key={idx}
              href="#"
              onClick={closeSidebarMobile}
              className={`flex items-center gap-4 px-5 py-3 my-1 rounded-2xl transition-all ${
                idx === 0 ? 'bg-teal-700 text-white shadow-lg' : 'text-teal-100 hover:bg-teal-800 hover:text-white hover:-translate-x-1'
              }`}
            >
              <i className={`${
                idx === 0 ? 'fas fa-tachometer-alt' : 
                idx === 1 ? 'fas fa-file-invoice-dollar' :
                idx === 2 ? 'fas fa-robot' :
                idx === 3 ? 'fas fa-book' :
                idx === 4 ? 'fas fa-history' : 'fas fa-chart-line'
              } w-6 text-lg`}></i>
              <span>{item}</span>
              {idx === 2 && <span className="mr-auto bg-teal-700 text-white text-[10px] px-2 py-0.5 rounded-full">ذكي</span>}
            </a>
          ))}
        </nav>
        <div className="absolute bottom-6 w-full text-center text-teal-200/40 text-xs hidden md:block">
          <i className="fas fa-microchip"></i> RAG v2.4
        </div>
      </aside>

      {/* المحتوى الرئيسي */}
      <div className="md:mr-64 transition-all duration-300">
        {/* الهيدر */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 md:px-8 py-3 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-5">
            <div className="bg-teal-100 p-2 rounded-full">
              <i className="fas fa-robot text-teal-700 text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">لوحة التحكم الرئيسية</h1>
              <p className="text-xs text-gray-500">تدقيق فوري | RAG & AI Auditor</p>
            </div>
            <div className="hidden lg:flex items-center bg-gray-100 rounded-full px-5 py-2 gap-2 w-72">
              <i className="fas fa-search text-gray-400 text-sm"></i>
              <input type="text" placeholder="ابحث عن طلب، سياسة، أو تقرير..." className="bg-transparent outline-none text-sm w-full" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleNewRequest} className="hidden md:flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-md transition">
              <i className="fas fa-plus-circle"></i> <span>طلب جديد</span>
            </button>
            <div className="relative cursor-pointer">
              <i className="fas fa-bell text-gray-500 text-xl hover:text-teal-600"></i>
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">3</span>
            </div>
            <div className="flex items-center gap-3 bg-gray-100 rounded-full px-3 py-1.5 cursor-pointer hover:bg-gray-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center text-white text-sm font-bold">أ</div>
              <span className="font-semibold text-gray-700 hidden md:inline">أحمد المنصوري</span>
              <i className="fas fa-chevron-down text-xs text-gray-500"></i>
            </div>
          </div>
        </header>

        <main className="p-5 md:p-8">
          {/* بطاقات KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard title="إجمالي الطلبات (شهر)" value="247" trend='<i class="fas fa-arrow-up text-green-600"></i> +12% عن السابق' icon="fas fa-receipt" borderColor="border-teal-400" iconBg="bg-teal-50" iconColor="text-teal-600" />
            <StatCard title="مخالفات نشطة" value="32" trend='<i class="fas fa-clock text-red-500"></i> تتطلب تدقيقاً عاجلاً' icon="fas fa-exclamation-triangle" borderColor="border-red-400" iconBg="bg-red-50" iconColor="text-red-500" />
            <StatCard title="نسبة الامتثال" value="75.7%" trend='<i class="fas fa-check-circle text-green-600"></i> متوافق 187 من 247' icon="fas fa-check-circle" borderColor="border-green-400" iconBg="bg-green-50" iconColor="text-green-600" />
            <StatCard title="سياسات RAG نشطة" value="34" trend='<i class="fas fa-database text-purple-600"></i> قاعدة متجهات محدثة' icon="fas fa-file-alt" borderColor="border-purple-400" iconBg="bg-purple-50" iconColor="text-purple-600" />
          </div>

          {/* الجدول */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden mb-10">
            <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-800"><i className="fas fa-list-ul ml-2 text-teal-600"></i> أحدث الطلبات المالية</h3>
              <a href="#" className="text-teal-600 text-sm hover:underline">عرض الكل <i className="fas fa-arrow-left mr-1"></i></a>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 border-b">
                  <tr><th className="px-5 py-4 text-right">رقم الطلب</th><th className="px-3 py-4">الموظف</th><th className="px-3 py-4">الغرض</th><th className="px-3 py-4">المبلغ ($)</th><th className="px-3 py-4">التاريخ</th><th className="px-3 py-4">حالة الامتثال</th><th className="px-3 py-4">إجراء AI</th><th className="px-3 py-4">شرح سريع</th></tr>
                </thead>
                <tbody>
                  {requestsData.map((req, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition border-b border-gray-100">
                      <td className="px-5 py-4 font-medium">{req.id}</td>
                      <td className="px-3 py-4">{req.employee}</td>
                      <td className="px-3 py-4">{req.purpose}</td>
                      <td className="px-3 py-4">${req.amount.toLocaleString()}</td>
                      <td className="px-3 py-4">{req.date}</td>
                      <td className="px-3 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                          req.status.type === 'compliant' ? 'bg-green-100 text-green-800' :
                          req.status.type === 'violation' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          <i className={`fas ${req.status.icon} text-xs`}></i> {req.status.label}
                        </span>
                      </td>
                      <td className="px-3 py-4" dangerouslySetInnerHTML={{ __html: req.aiAction }}></td>
                      <td className="px-3 py-4 text-xs text-gray-500">{req.quickNote}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* الرسوم البيانية */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            <div className="bg-white p-5 rounded-2xl shadow-md border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-3"><i className="fas fa-chart-pie text-teal-600 ml-2"></i> توزيع الامتثال (آخر 30 يوم)</h3>
              <CompliancePieChart labels={pieLabels} data={pieData} colors={pieColors} />
              <div className="flex justify-center gap-6 mt-4 text-sm">
                <div><span className="inline-block w-3 h-3 rounded-full bg-[#2c8f9b] ml-1"></span> متوافق: 187</div>
                <div><span className="inline-block w-3 h-3 rounded-full bg-[#e2584b] ml-1"></span> مخالف: 32</div>
                <div><span className="inline-block w-3 h-3 rounded-full bg-[#f4b942] ml-1"></span> قيد المراجعة: 28</div>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-md border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-3"><i className="fas fa-chart-line text-teal-600 ml-2"></i> اتجاه المخالفات الأسبوعية</h3>
              <WeeklyViolationsChart labels={lineLabels} data={lineData} borderColor={lineBorderColor} backgroundColor={lineBgColor} />
              <p className="text-xs text-center text-gray-500 mt-3">انخفاض بنسبة 53% هذا الأسبوع بفضل تدقيق AI الفوري</p>
            </div>
          </div>

          {/* قسم RAG الذكي */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-8">
            <div className="flex items-center gap-2 mb-5 border-b border-gray-100 pb-3">
              <i className="fas fa-brain text-teal-600 text-2xl"></i>
              <h3 className="font-bold text-xl text-gray-800">تدقيق AI الذكي | استدعاء السياسات (RAG)</h3>
              <span className="bg-teal-100 text-teal-800 text-xs px-3 py-1 rounded-full mr-auto"><i className="fas fa-microchip"></i> توليد معزز بالاسترجاع</span>
            </div>
            <div className="space-y-5">
              <div className="bg-gradient-to-r from-red-50/30 to-transparent p-4 rounded-xl border-r-4 border-red-400 shadow-sm">
                <div className="flex items-start gap-3">
                  <i className="fas fa-quote-right text-red-400 text-xl mt-1"></i>
                  <div>
                    <p className="font-semibold text-gray-800">الطلب #F-1024 (أجهزة لابتوب - 5,200$)</p>
                    <p className="text-sm text-gray-700 mt-1">🔍 استرجع AI من قاعدة المعرفة (RAG): <span className="bg-gray-100 px-2 py-0.5 rounded-md text-teal-800 font-mono text-xs">"بند رقم 4: أي مشتريات تقنية تتجاوز 3000$ تتطلب موافقة مسبقة من المدير التقني (CTO) وإلا تعتبر مخالفة للسياسة المالية."</span></p>
                    <div className="mt-2 flex items-center gap-2 text-sm"><i className="fas fa-gavel text-red-500"></i> <span className="font-medium text-red-700">⚡ قرار AI: رفض مؤقت + إشعار للمدير التقني. الاقتباس من الصفحة 12، "سياسة المشتريات التقنية v2.pdf".</span></div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-amber-50/30 to-transparent p-4 rounded-xl border-r-4 border-amber-400 shadow-sm">
                <div className="flex items-start gap-3">
                  <i className="fas fa-shield-alt text-amber-500 text-xl mt-1"></i>
                  <div>
                    <p className="font-semibold text-gray-800">الطلب #F-1021 (رسوم استشارات قانونية - 3,200$)</p>
                    <p className="text-sm text-gray-700 mt-1">🧠 تحليل AML: كشف AI نمط تحويلات متكررة لطرف خارجي غير معتمد وفق بند مكافحة غسيل الأموال (AML) من السياسة رقم 7.</p>
                    <div className="mt-2 flex items-center gap-2 text-sm"><i className="fas fa-handcuffs text-amber-600"></i> <span className="font-medium text-amber-800">قرار AI: تجميد الطلب تلقائياً وإخطار مسؤول الامتثال البشري للمراجعة.</span></div>
                  </div>
                </div>
              </div>
              <div className="bg-teal-50/60 p-3 rounded-lg flex items-center gap-2 text-teal-800 text-sm">
                <i className="fas fa-lightbulb text-teal-600"></i> 
                <span>نظام FinGuard AI يعمل كمساعد تدقيق فوري، مع إمكانية التتبع الكامل للقرارات عبر الاقتباس المباشر من مستندات السياسات. دقة الامتثال ارتفعت 34% منذ تفعيل RAG.</span>
              </div>
            </div>
          </div>

          <footer className="text-center text-gray-400 text-sm py-5 border-t border-gray-200 mt-4">
            <i className="fas fa-shield-alt text-teal-500 ml-1"></i> FinGuard AI — تدقيق فوري قائم على RAG + SQL | الامتثال الذكي RegTech & Spend Management
          </footer>
        </main>
      </div>
    </div>
  );
}

export default App;