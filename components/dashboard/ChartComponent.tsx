"use client";

import { useEffect, useRef } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from "chart.js";
import { Line } from "react-chartjs-2";
import { Role } from "@/store/useAppStore";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartComponentProps {
  role: Role;
}

export default function ChartComponent({ role }: ChartComponentProps) {
  const chartRef = useRef(null);

  // Generate role-specific data
  const getChartData = () => {
    const labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
    
    let dataset1, dataset2, label1, label2;

    switch (role) {
      case "consultant":
        label1 = "Portfolio Value";
        label2 = "ROI";
        dataset1 = [65, 72, 78, 85];
        dataset2 = [45, 52, 58, 65];
        break;
      case "psychologist":
        label1 = "Patient Sessions";
        label2 = "Progress Score";
        dataset1 = [12, 15, 18, 22];
        dataset2 = [70, 75, 80, 85];
        break;
      case "patient":
        label1 = "Deals Closed";
        label2 = "Pipeline Value";
        dataset1 = [8, 12, 15, 18];
        dataset2 = [120, 145, 160, 180];
        break;
      case "manager":
        label1 = "Team Efficiency";
        label2 = "Revenue";
        dataset1 = [75, 80, 85, 90];
        dataset2 = [200, 250, 300, 350];
        break;
      default:
        label1 = "Metric A";
        label2 = "Metric B";
        dataset1 = [50, 60, 70, 80];
        dataset2 = [40, 50, 60, 70];
    }

    return {
      labels,
      datasets: [
        {
          label: label1,
          data: dataset1,
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
          fill: true,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: "rgb(59, 130, 246)",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
        },
        {
          label: label2,
          data: dataset2,
          borderColor: "rgb(168, 85, 247)",
          backgroundColor: "rgba(168, 85, 247, 0.1)",
          tension: 0.4,
          fill: true,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: "rgb(168, 85, 247)",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
        },
      ],
    };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: "Plus Jakarta Sans, sans-serif",
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        titleFont: {
          family: "Plus Jakarta Sans, sans-serif",
          size: 14,
          weight: "bold" as const,
        },
        bodyFont: {
          family: "Inter, sans-serif",
          size: 13,
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(148, 163, 184, 0.1)",
          drawBorder: false,
        },
        ticks: {
          font: {
            family: "Inter, sans-serif",
            size: 11,
          },
          color: "#64748b",
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "Inter, sans-serif",
            size: 11,
          },
          color: "#64748b",
        },
      },
    },
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
  };

  return (
    <div className="h-96 w-full">
      <Line ref={chartRef} data={getChartData()} options={options} />
    </div>
  );
}
