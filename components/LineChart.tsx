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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip
)

interface LineChartProps {
  className?: string
  labels?: string[]
  dataPoints: number[]
  lineColor: string
  gradientColorStart: string
  gradientColorEnd: string
  datasetLabel: string
}

const LineChart: React.FC<LineChartProps> = ({
  className,
  labels,
  dataPoints,
  lineColor,
  gradientColorStart,
  gradientColorEnd,
  datasetLabel,
}) => {
  // Chart.js options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 5000,
    },
    plugins: {
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { display: false },
      },
      y: {
        grid: { display: false },
        ticks: {
          color: "#fff",
          font: {
            size: 10, // Set font size for Y-axis
          },
        },
      },
    },
  }

  // Data and gradient
  const data = {
    labels,
    datasets: [
      {
        label: datasetLabel,
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
            const gradient = ctx.createLinearGradient(0, top, 0, bottom)
            gradient.addColorStop(0, gradientColorStart)
            gradient.addColorStop(1, gradientColorEnd)
            chart.gradient = gradient
          }
          return chart.gradient
        },
        tension: 0.5,
        pointRadius: 7,
        pointBackgroundColor: "#0f0f0f",
        pointBorderWidth: 2,
        borderWidth: 2,
        Tooltip: true,
      },
    ],
  }

  return (
    <div className={className}>
      <Line options={options} data={data} className='w-full' />
    </div>
  )
}

export default LineChart
