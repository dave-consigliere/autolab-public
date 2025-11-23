"use client";

import React, { useRef, useCallback } from 'react';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend, Title);

interface NyquistChartProps {
  real: number[];
  imag: number[];
}

export default function NyquistChart({ real, imag }: NyquistChartProps) {
  // CORRECTION ICI : On précise que c'est un Chart de type "scatter"
  const chartRef = useRef<ChartJS<"scatter">>(null);

  const handleDownload = useCallback(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const link = document.createElement('a');
    link.href = chart.toBase64Image('image/png', 1.0);
    link.download = `autolab_nyquist_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const data = {
    datasets: [
      {
        label: 'Lieu de Nyquist',
        data: real.map((r, i) => ({ x: r, y: imag[i] })),
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'transparent',
        borderWidth: 2,
        showLine: true,
        pointRadius: 0,
      },
      {
        label: 'Point Critique',
        data: [{ x: -1, y: 0 }],
        borderColor: 'red',
        backgroundColor: 'red',
        borderWidth: 3,
        pointRadius: 8,
        pointStyle: 'crossRot',
        showLine: false
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { title: { display: true, text: 'Partie Réelle' }, grid: { color: '#e5e7eb' }, suggestedMin: -1.5, suggestedMax: 0.5 },
      y: { title: { display: true, text: 'Partie Imaginaire' }, grid: { color: '#e5e7eb' } },
    },
    plugins: {
      title: { display: true, text: 'Diagramme de Nyquist' },
      tooltip: { callbacks: { label: (c: any) => `R: ${c.raw.x.toFixed(2)}, I: ${c.raw.y.toFixed(2)}` } }
    },
    layout: { padding: 10 }
  };

  return (
    <div className="h-full w-full relative group">
      <button onClick={handleDownload} className="absolute top-2 right-2 z-20 bg-white/90 p-1.5 rounded-lg shadow-sm border border-slate-100 text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100">📷</button>
      <Scatter ref={chartRef} options={options} data={data} />
    </div>
  );
}