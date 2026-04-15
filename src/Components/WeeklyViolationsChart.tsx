import { Chart } from "chart.js";
import { useRef, useEffect } from "react";
import type { LineChartProps } from "../types/LineChartProps";

export const WeeklyViolationsChart: React.FC<LineChartProps> = ({
  labels,
  data,
  borderColor,
  backgroundColor,
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();
    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;
    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "عدد المخالفات",
            data,
            borderColor,
            backgroundColor,
            borderWidth: 3,
            tension: 0.3,
            fill: true,
            pointBackgroundColor: "#e2584b",
            pointBorderColor: "#fff",
            pointRadius: 5,
            pointHoverRadius: 7,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { position: "top", labels: { font: { family: "Cairo" } } },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: "#e9eef3" },
            title: {
              display: true,
              text: "عدد المخالفات",
              font: { family: "Cairo" },
            },
          },
          x: { ticks: { font: { family: "Cairo" } } },
        },
      },
    });
    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [labels, data, borderColor, backgroundColor]);

  return (
    <canvas ref={chartRef} style={{ maxHeight: "240px", width: "100%" }} />
  );
};
