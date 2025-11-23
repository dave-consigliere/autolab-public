"use client";

import React, { useRef, useCallback } from 'react';
import { Chart as ChartJS, LinearScale, PointElement, LineElement, Tooltip, Legend, Title } from 'chart.js';
import { Scatter } from 'react-chartjs-2';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend, Title);

export default function BlackChart({ phase, magnitude }: { phase: number[], magnitude: number[] }) {
  // CORRECTION ICI : On précise que c'est un Chart de type "scatter"
  const chartRef = useRef<ChartJS<"scatter">>(null);

  const handleDownload = useCallback(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const link = document.createElement('a');
    link.href = chart.toBase64Image('image/png', 1.0);
    link.download = `autolab_black_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const data = {
    datasets: [{
      label: 'Lieu de Black',
      data: phase.map((p, i) => ({ x: p, y: magnitude[i] })),
      borderColor: 'rgb(147, 51, 234)',
      backgroundColor: 'transparent',
      borderWidth: 2,
      showLine: true,
      pointRadius: 0,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { title: { display: true, text: 'Phase (°)' }, grid: { color: '#e5e7eb' }, max: 0, min: -270 },
      y: { title: { display: true, text: 'Gain (dB)' }, grid: { color: '#e5e7eb' } },
    },
    plugins: { title: { display: true, text: 'Diagramme de Black-Nichols' } }
  };

  return (
    <div className="h-full w-full relative group">
      <button onClick={handleDownload} className="absolute top-2 right-2 z-20 bg-white/90 p-1.5 rounded-lg shadow-sm border border-slate-100 text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100">📷</button>
      <Scatter ref={chartRef} options={options} data={data} />
    </div>
  );
}