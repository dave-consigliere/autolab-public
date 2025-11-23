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

// Enregistrement des composants nécessaires de Chart.js
ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title
);

interface NyquistChartProps {
  real: number[];
  imag: number[];
}

export default function NyquistChart({ real, imag }: NyquistChartProps) {
  const chartRef = useRef<ChartJS>(null);

  // Fonction de téléchargement (export PNG)
  const handleDownload = useCallback(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const imgUrl = chart.toBase64Image('image/png', 1.0);
    const link = document.createElement('a');
    link.href = imgUrl;
    // Nom du fichier avec timestamp
    link.download = `autolab_nyquist_${new Date().toISOString().slice(0,19).replace(/:/g,"-")}.png`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const data = {
    datasets: [
      {
        // Dataset 1 : La courbe de Nyquist (Bleue)
        label: 'Lieu de Nyquist',
        data: real.map((r, i) => ({ x: r, y: imag[i] })),
        borderColor: 'rgb(79, 70, 229)', // Indigo-600
        backgroundColor: 'transparent',
        borderWidth: 2,
        showLine: true, // Important : relier les points
        pointRadius: 0, // On cache les points de la courbe pour que ce soit lisse
      },
      {
        // Dataset 2 : Le Point Critique (Rouge)
        label: 'Point Critique (-1, 0)',
        data: [{ x: -1, y: 0 }],
        // --- CORRECTION ICI ---
        borderColor: 'red',     // La couleur des traits de la croix
        backgroundColor: 'red', // Remplissage (au cas où)
        borderWidth: 3,         // Épaisseur des traits de la croix pour la visibilité
        pointRadius: 8,         // Taille globale du point plus grande
        // ----------------------
        pointStyle: 'crossRot', // Style "Croix tournée" (X)
        showLine: false         // Juste un point, pas de ligne
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: { display: true, text: 'Partie Réelle' },
        grid: { color: '#e5e7eb' }, // Gris clair pour la grille
        // On s'assure que le point -1 est toujours bien visible
        suggestedMin: -1.5,
        suggestedMax: 0.5
      },
      y: {
        title: { display: true, text: 'Partie Imaginaire' },
        grid: { color: '#e5e7eb' }
      },
    },
    plugins: {
      title: { display: true, text: 'Diagramme de Nyquist (Polaire)' },
      legend: { position: 'top' as const },
      tooltip: {
        callbacks: {
          // Personnalisation de l'infobulle pour afficher Réel/Imag
          label: (context: any) => {
            const pt = context.raw;
            return `Réel: ${pt.x.toFixed(2)}, Imag: ${pt.y.toFixed(2)}`;
          }
        }
      }
    },
    layout: { padding: 10 }
  };

  return (
    <div className="h-full w-full relative group">
      {/* Bouton de téléchargement (Caméra) */}
      <button 
          onClick={handleDownload}
          className="absolute top-2 right-2 z-20 bg-white/90 p-1.5 rounded-lg shadow-sm border border-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
          title="Exporter en PNG"
      >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
          </svg>
      </button>

      <Scatter ref={chartRef} options={options} data={data} />
    </div>
  );
}