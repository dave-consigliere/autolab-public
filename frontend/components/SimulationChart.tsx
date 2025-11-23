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

// Enregistrement des composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type ComparisonData = {
  time: number[];
  amplitude: number[];
  label: string;
};

interface SimulationChartProps {
  timeData: number[];
  amplitudeData: number[];
  title: string;
  comparisons?: ComparisonData[]; 
}

export default function SimulationChart({ timeData, amplitudeData, title, comparisons = [] }: SimulationChartProps) {
  
  // 1. Création de la référence pour accéder au graphique
  const chartRef = useRef<ChartJS>(null);

  // 2. Fonction de téléchargement
  const handleDownload = useCallback(() => {
    const chart = chartRef.current;
    if (!chart) return;

    // a. Convertir le graphique en image (URL base64)
    const imgUrl = chart.toBase64Image('image/png', 1.0);

    // b. Créer un lien de téléchargement temporaire
    const link = document.createElement('a');
    link.href = imgUrl;
    // Nom du fichier avec un timestamp pour qu'il soit unique
    link.download = `autolab_simulation_${new Date().toISOString().slice(0,19).replace(/:/g,"-")}.png`;
    
    // c. Simuler le clic et nettoyer
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // Préparation des données (identique à avant)
  const comparisonDatasets = comparisons.map((comp, index) => ({
    label: comp.label || `Mémoire ${index + 1}`,
    data: comp.amplitude,
    borderColor: 'rgba(156, 163, 175, 0.5)',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderDash: [5, 5],
    pointRadius: 0,
    tension: 0.4,
  }));

  const activeDataset = {
    label: 'Simulation Actuelle',
    data: amplitudeData,
    borderColor: 'rgb(79, 70, 229)',
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    borderWidth: 3,
    pointRadius: 0,
    tension: 0.4,
  };

  const data = {
    labels: timeData.map((t) => t.toFixed(2)),
    datasets: [...comparisonDatasets, activeDataset],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      // On cache le titre natif de ChartJS car on l'a déjà dans l'interface
      title: { display: false, text: title }, 
    },
    scales: {
      x: { 
        title: { display: true, text: 'Temps (s)' },
        grid: { display: false }
      },
      y: { 
        title: { display: true, text: 'Amplitude' },
        grid: { color: '#f3f4f6' } 
      },
    },
    interaction: { mode: 'index' as const, intersect: false },
    // Important pour que le fond soit blanc lors de l'export PNG (sinon il est transparent)
    layout: { padding: 20 }
  };

  return (
    <div className="h-full w-full relative group">
        {/* 3. Le Bouton de Téléchargement (Caméra) */}
        <button 
            onClick={handleDownload}
            className="absolute top-2 right-2 z-20 bg-white/90 p-2 rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-md transition-all opacity-0 group-hover:opacity-100"
            title="Exporter le graphique en PNG"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>
        </button>

        {/* On attache la référence (ref={chartRef}) au composant Line */}
        <Line ref={chartRef} options={options} data={data} />
    </div>
  );
}