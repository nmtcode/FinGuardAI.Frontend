import { Chart } from "chart.js";
import { useRef, useEffect } from "react";
import type { PieChartProps } from "../types/PieChartProps";

export const CompliancePieChart: React.FC<PieChartProps> = ({
  labels,
  data,
  colors,
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    // تدمير الرسم البياني السابق إن وجد
    if (chartInstance.current) chartInstance.current.destroy();
    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;
    chartInstance.current = new Chart(ctx, {
      type: "pie",
      data: {
        labels,
        datasets: [
          { data, backgroundColor: colors, borderWidth: 0, hoverOffset: 8 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: { font: { family: "Cairo", size: 12 } },
          },
          tooltip: { bodyFont: { family: "Cairo" } },
        },
      },
    });
    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [labels, data, colors]);

  return (
    <canvas ref={chartRef} style={{ maxHeight: "240px", width: "100%" }} />
  );
};
