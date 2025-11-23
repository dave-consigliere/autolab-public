import React from 'react';

interface SliderControlProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  helpText?: string;
}

export default function SliderControl({ 
  label, 
  value, 
  onChange, 
  min = 0, 
  max = 10, 
  step = 0.1, 
  unit = '', 
  helpText 
}: SliderControlProps) {
  
  // Gestion sécurisée des valeurs (évite le NaN)
  const safeValue = isNaN(value) ? 0 : value;

  return (
    <div className="mb-4">
      {/* Label + Valeur affichée */}
      <div className="flex justify-between items-center mb-1">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
        <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
          {safeValue} {unit}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Le Slider (Range) */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={safeValue}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500 transition-all"
        />

        {/* L'Input Numérique (pour la précision) */}
        <input
          type="number"
          value={isNaN(value) ? '' : value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          step={step}
          className="w-20 p-1 text-sm text-center border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
        />
      </div>

      {/* Petit texte d'aide optionnel */}
      {helpText && (
        <p className="text-[10px] text-slate-400 mt-1 italic">
          {helpText}
        </p>
      )}
    </div>
  );
}