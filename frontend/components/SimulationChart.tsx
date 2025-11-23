"use client";

import React, { useRef, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface SimulationChartProps {
  timeData: number[];
  amplitudeData: number[];
  title: string;
  comparisons?: any[]; 
}

export default function SimulationChart({ timeData, amplitudeData, title, comparisons = [] }: SimulationChartProps) {
  
  // CORRECTION : Type "line" explicite
  const chartRef = useRef<ChartJS<"line">>(null);

  const handleDownload = useCallback(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const imgUrl = chart.toBase64Image('image/png', 1.0);
    const link = document.createElement('a');
    link.href = imgUrl;
    link.download = `autolab_simulation_${new Date().toISOString().slice(0,19).replace(/:/g,"-")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const comparisonDatasets = comparisons.map((comp, index) => ({
    label: comp.label || `Mémoire ${index + 1}`,
    data: comp.amplitude,
    borderColor: 'rgba(156, 163, 175, 0.5)',
    backgroundColor: 'transparent',
    borderWidth: 2, borderDash: [5, 5], pointRadius: 0, tension: 0.4,
  }));

  const activeDataset = {
    label: 'Simulation Actuelle',
    data: amplitudeData,
    borderColor: 'rgb(79, 70, 229)',
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    borderWidth: 3, pointRadius: 0, tension: 0.4,
  };

  const data = {
    labels: timeData.map((t) => t.toFixed(2)),
    datasets: [...comparisonDatasets, activeDataset],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' as const }, title: { display: false, text: title } },
    scales: { x: { title: { display: true, text: 'Temps (s)' }, grid: { display: false } }, y: { title: { display: true, text: 'Amplitude' }, grid: { color: '#f3f4f6' } } },
    interaction: { mode: 'index' as const, intersect: false },
    layout: { padding: 20 }
  };

  return (
    <div className="h-full w-full relative group">
        <button onClick={handleDownload} className="absolute top-2 right-2 z-20 bg-white/90 p-2 rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-white opacity-0 group-hover:opacity-100">📷</button>
        <Line ref={chartRef} options={options} data={data} />
    </div>
  );
}