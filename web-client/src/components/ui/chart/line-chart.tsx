"use client";

import { EmptyState } from "@/components/ui/feedback-state";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import React from "react";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

interface LineChartProps {
  data: number[];
  labels: string[];
  label: string;
  unit?: string;
  maxValue?: number;
  color?: string;
  fillColor?: string;
  emptyMessage?: string;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  labels,
  label,
  unit = "",
  maxValue,
  color = "#2563EB", // Primary Blue with WCAG AA contrast
  fillColor = "rgba(37, 99, 235, 0.1)",
  emptyMessage = "Chưa có dữ liệu thống kê trong kỳ này",
}) => {
  const hasData = data.length > 0 && data.some((v) => v > 0);

  if (!hasData) {
    return (
      <div className="py-8">
        <EmptyState
          title="Chưa có dữ liệu biểu đồ"
          description={emptyMessage}
        />
      </div>
    );
  }

  const calculatedMax =
    maxValue !== undefined ? maxValue : Math.max(...data, 10) * 1.15;

  const chartData = {
    labels,
    datasets: [
      {
        label,
        data,
        borderColor: color,
        backgroundColor: fillColor,
        tension: 0.35,
        fill: true,
        pointBackgroundColor: color,
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: { family: "inherit", size: 12, weight: 600 },
          color: "#4B5563",
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.95)",
        titleFont: { size: 13, weight: "bold" as const },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context: {
            dataset: { label?: string };
            parsed: { y: number | null };
          }) => {
            const val = context.parsed.y ?? 0;
            const formatted = val.toLocaleString("vi-VN");
            return `${context.dataset.label || "Giá trị"}: ${formatted} ${unit}`.trim();
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: calculatedMax,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: { size: 11 },
          color: "#6B7280",
          callback: (tickValue: string | number) => {
            const num = Number(tickValue);
            return `${num.toLocaleString("vi-VN")} ${unit}`.trim();
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 11 },
          color: "#6B7280",
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default LineChart;
