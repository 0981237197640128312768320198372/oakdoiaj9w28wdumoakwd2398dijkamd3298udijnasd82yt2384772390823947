/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react"
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
} from "chart.js"
import { Line } from "react-chartjs-2"

// Register required Chart.js elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip
)

interface LineChartProps {
  labels: string[]
  dataPoints: number[]
  lineColor: string
  gradientColorStart: string
  gradientColorEnd: string
}

const LineChartWithGradient: React.FC<LineChartProps> = ({
  labels,
  dataPoints,
  lineColor,
  gradientColorStart,
  gradientColorEnd,
}) => {
  // Chart.js options
  const options = {
    responsive: true,
    plugins: {
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#fff" },
      },
      y: {
        grid: { display: false },
        ticks: { color: "#fff" },
      },
    },
  }

  // Data and gradient
  const data = {
    labels,
    datasets: [
      {
        label: "Deposit Amount",
        data: dataPoints,
        fill: true,
        borderColor: lineColor,
        backgroundColor: (context: any) => {
          const chart = context.chart
          const {
            ctx,
            chartArea: { top, bottom },
          } = chart

          if (!chart.gradient) {
            // Create gradient
            const gradient = ctx.createLinearGradient(0, top, 0, bottom)
            gradient.addColorStop(0, gradientColorStart)
            gradient.addColorStop(1, gradientColorEnd)
            chart.gradient = gradient // Cache the gradient
          }
          return chart.gradient
        },
        tension: 0.4, // Smooth curve
        pointRadius: 3,
        pointBackgroundColor: "#0f0f0f",
        pointBorderWidth: 1,
        borderWidth: 1,
      },
    ],
  }

  return <Line options={options} data={data} />
}

export default LineChartWithGradient
