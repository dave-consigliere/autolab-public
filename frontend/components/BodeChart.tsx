"use client";

import React, { useRef, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, LogarithmicScale, PointElement, LineElement, Title, Tooltip, Legend);

interface BodeChartProps {
  omega: number[];
  magnitude: number[];
  phase: number[];
}

export default function BodeChart({ omega, magnitude, phase }: BodeChartProps) {
  
  // CORRECTION : On précise le type "line"
  const gainRef = useRef<ChartJS<"line">>(null);
  const phaseRef = useRef<ChartJS<"line">>(null);

  // On utilise 'any' ici pour la ref passée en argument, c'est plus simple et sûr pour TypeScript
  const handleDownload = useCallback((ref: any, suffix: string) => {
    const chart = ref.current;
    if (!chart) return;
    
    const imgUrl = chart.toBase64Image('image/png', 1.0);
    const link = document.createElement('a');
    link.href = imgUrl;
    link.download = `autolab_bode_${suffix}_${new Date().toISOString().slice(0,19).replace(/:/g,"-")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // ... (Reste des données identique)
  const dataMag = {
    labels: omega,
    datasets: [{
      label: 'Gain (dB)',
      data: magnitude.map((v, i) => ({ x: omega[i], y: v })),
      borderColor: 'rgb(220, 38, 38)', borderWidth: 2, pointRadius: 0,
    }],
  };

  const dataPhase = {
    labels: omega,
    datasets: [{
      label: 'Phase (°)',
      data: phase.map((v, i) => ({ x: omega[i], y: v })),
      borderColor: 'rgb(22, 163, 74)', borderWidth: 2, pointRadius: 0,
    }],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { type: 'logarithmic' as const, title: { display: true, text: 'Fréquence (rad/s)' }, min: 0.1, max: 100 },
    },
    interaction: { mode: 'index' as const, intersect: false },
    layout: { padding: 10 }
  };

  const DownloadBtn = ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} className="absolute top-2 right-2 z-20 bg-white/90 p-1.5 rounded-lg shadow-sm border border-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-white transition-all opacity-0 group-hover:opacity-100">📷</button>
  );

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex-1 min-h-[200px] border-b border-slate-100 pb-2 relative group">
        <DownloadBtn onClick={() => handleDownload(gainRef, 'gain')} />
        <Line ref={gainRef} data={dataMag} options={{ ...commonOptions, plugins: { title: { display: true, text: 'Diagramme de Gain' } }, scales: { ...commonOptions.scales, y: { title: { display: true, text: 'Gain (dB)' } } } }} />
      </div>
      <div className="flex-1 min-h-[200px] relative group">
        <DownloadBtn onClick={() => handleDownload(phaseRef, 'phase')} />
        <Line ref={phaseRef} data={dataPhase} options={{ ...commonOptions, plugins: { title: { display: true, text: 'Diagramme de Phase' } }, scales: { ...commonOptions.scales, y: { title: { display: true, text: 'Phase (°)' } } } }} />
      </div>
    </div>
  );
}