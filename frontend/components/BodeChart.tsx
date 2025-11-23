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

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface BodeChartProps {
  omega: number[];
  magnitude: number[];
  phase: number[];
}

export default function BodeChart({ omega, magnitude, phase }: BodeChartProps) {
  
  // 1. Deux références : une pour chaque graphique
  const gainRef = useRef<ChartJS>(null);
  const phaseRef = useRef<ChartJS>(null);

  // 2. Fonction générique de téléchargement
  const handleDownload = useCallback((ref: React.RefObject<ChartJS>, suffix: string) => {
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

  // --- Données Gain ---
  const dataMag = {
    labels: omega,
    datasets: [{
      label: 'Gain (dB)',
      data: magnitude.map((v, i) => ({ x: omega[i], y: v })),
      borderColor: 'rgb(220, 38, 38)', // Rouge
      borderWidth: 2, pointRadius: 0,
    }],
  };

  // --- Données Phase ---
  const dataPhase = {
    labels: omega,
    datasets: [{
      label: 'Phase (°)',
      data: phase.map((v, i) => ({ x: omega[i], y: v })),
      borderColor: 'rgb(22, 163, 74)', // Vert
      borderWidth: 2, pointRadius: 0,
    }],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'logarithmic' as const,
        title: { display: true, text: 'Fréquence (rad/s)' },
        min: 0.1, max: 100
      },
    },
    interaction: { mode: 'index' as const, intersect: false },
    layout: { padding: 10 }
  };

  // Composant Bouton pour éviter la répétition
  const DownloadBtn = ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} className="absolute top-2 right-2 z-20 bg-white/90 p-1.5 rounded-lg shadow-sm border border-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-white transition-all opacity-0 group-hover:opacity-100" title="Exporter en PNG">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>
    </button>
  );

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Graphique Gain */}
      <div className="flex-1 min-h-[200px] border-b border-slate-100 pb-2 relative group">
        <DownloadBtn onClick={() => handleDownload(gainRef, 'gain')} />
        <Line ref={gainRef} data={dataMag} options={{ ...commonOptions, plugins: { title: { display: true, text: 'Diagramme de Gain' } }, scales: { ...commonOptions.scales, y: { title: { display: true, text: 'Gain (dB)' } } } }} />
      </div>
      {/* Graphique Phase */}
      <div className="flex-1 min-h-[200px] relative group">
        <DownloadBtn onClick={() => handleDownload(phaseRef, 'phase')} />
        <Line ref={phaseRef} data={dataPhase} options={{ ...commonOptions, plugins: { title: { display: true, text: 'Diagramme de Phase' } }, scales: { ...commonOptions.scales, y: { title: { display: true, text: 'Phase (°)' } } } }} />
      </div>
    </div>
  );
}