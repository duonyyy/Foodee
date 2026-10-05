"use client";

import { EmptyState } from "@/components/ui/feedback-state";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import React from "react";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface BarChartProps {
  data: number[];
  labels: string[];
  label: string;
  unit?: string;
  maxValue?: number;
  backgroundColor?: string;
  borderRadius?: number;
  barThickness?: number;
  emptyMessage?: string;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  labels,
  label,
  unit = "",
  maxValue,
  backgroundColor = "#059669", // Emerald green with WCAG AA contrast
  borderRadius = 6,
  barThickness = 28,
  emptyMessage = "Chưa có dữ liệu cột trong kỳ này",
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
        backgroundColor,
        borderRadius,
        barThickness,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
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

  return <Bar data={chartData} options={options} />;
};

export default BarChart;
