// frontend/components/Footer.tsx
import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-12 py-8 border-t border-slate-200">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-slate-500 text-sm">
          © 2025 <span className="font-bold text-indigo-600">AutoLab</span>. 
          Plateforme de simulation éducative.
        </p>
        <p className="text-slate-400 text-xs mt-2">
          Conçu et développé par <span className="font-semibold text-slate-600">David TIENDREBEOGO</span> 🇧🇫
        </p>
      </div>
    </footer>
  );
}