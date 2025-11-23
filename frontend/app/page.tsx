"use client";

import { useState } from 'react';
import axios from 'axios';
import SimulationChart from '../components/SimulationChart';
import BodeChart from '../components/BodeChart';
import NyquistChart from '../components/NyquistChart';
import BlackChart from '../components/BlackChart';
import SliderControl from '../components/SliderControl';
import Footer from '../components/Footer';
import { clsx } from 'clsx';

export default function Home() {
  // --- ÉTATS ---
  const [systemType, setSystemType] = useState<'first' | 'second' | 'general' | 'pid' | 'bode' | 'nyquist' | 'black'>('first');
  
  // Paramètres
  const [gain, setGain] = useState<number>(2);
  const [tau, setTau] = useState<number>(1.5);
  const [duration, setDuration] = useState<number>(10);
  const [omega, setOmega] = useState<number>(5);
  const [zeta, setZeta] = useState<number>(0.4);
  const [kp, setKp] = useState<number>(2.0);
  const [ki, setKi] = useState<number>(1.0);
  const [kd, setKd] = useState<number>(0.0);
  const [distTime, setDistTime] = useState<number>(5.0);
  const [distAmp, setDistAmp] = useState<number>(-1.0);

  // Paramètres Ordre Général (Texte)
  const [numStr, setNumStr] = useState<string>("1");
  const [denStr, setDenStr] = useState<string>("1, 2, 5");

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [comparisons, setComparisons] = useState<Array<any>>([]);

  // --- LOGIQUE SIMULATION ---
  const handleSimulate = async () => {
    setLoading(true);
    try {
      let url = '';
      let payload = {};
      const safe = (val: number) => isNaN(val) ? 0 : val;

      if (systemType === 'first') { 
        url = 'https://autolab-api.onrender.com/simulate/first-order'; 
        payload = { K: safe(gain), tau: safe(tau), duration: safe(duration) }; 
      }
      else if (systemType === 'second') { 
        url = 'https://autolab-api.onrender.com/simulate/second-order'; 
        payload = { K: safe(gain), omega_n: safe(omega), zeta: safe(zeta), duration: safe(duration) }; 
      }
      else if (systemType === 'general') {
        url = 'https://autolab-api.onrender.com/simulate/general';
        const numArr = numStr.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
        const denArr = denStr.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
        if (numArr.length === 0 || denArr.length === 0) { alert("Coefficients invalides"); setLoading(false); return; }
        payload = { num: numArr, den: denArr, duration: safe(duration) };
      }
      else if (systemType === 'pid') { 
        url = 'https://autolab-api.onrender.com/simulate/pid'; 
        payload = { process_K: safe(gain), process_tau: safe(tau), Kp: safe(kp), Ki: safe(ki), Kd: safe(kd), duration: safe(duration), dist_time: safe(distTime), dist_amp: safe(distAmp) }; 
      }
      else { 
        url = 'https://autolab-api.onrender.com/simulate/frequency'; 
        payload = { K: safe(gain), omega_n: safe(omega), zeta: safe(zeta) }; 
      }

      const response = await axios.post(url, payload);
      setResult(response.data);
    } catch (error) { console.error(error); alert("Erreur Backend !"); } finally { setLoading(false); }
  };

  const handleFreeze = () => {
    if (!result) return;
    if (isFreqMode) return; 
    let label = "Mémoire";
    if (systemType === 'first') label = `1er (K=${gain})`;
    if (systemType === 'second') label = `2nd (ζ=${zeta})`;
    if (systemType === 'general') label = `Ordre N`;
    if (systemType === 'pid') label = `PID (Kp=${kp})`;
    setComparisons([...comparisons, { time: result.time, amplitude: result.amplitude, label: label }]);
  };

  const handleClearComparisons = () => setComparisons([]);

  const handleExportCSV = () => {
    if (!result) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    let filename = "autolab_data.csv";
    if (isFreqMode) {
        csvContent += "Frequence (rad/s),Gain (dB),Phase (deg),Reel,Imaginaire\n";
        result.omega.forEach((w: number, index: number) => {
            csvContent += `${w},${result.magnitude[index]},${result.phase[index]},${result.real[index]},${result.imag[index]}\n`;
        });
    } else {
        csvContent += "Temps (s),Amplitude\n";
        result.time.forEach((t: number, index: number) => {
            csvContent += `${t},${result.amplitude[index]}\n`;
        });
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isFreqMode = ['bode', 'nyquist', 'black'].includes(systemType);

  // RENDU
  const MetricCard = ({ label, value, unit, color }: any) => (
    <div className={`flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-${color}-100 shadow-sm transition-transform hover:scale-105`}>
        <span className={`text-[10px] font-bold text-${color}-500 uppercase tracking-widest mb-1`}>{label}</span>
        <span className={`text-xl font-black text-${color}-600`}>{value} <span className="text-xs font-medium text-slate-400">{unit}</span></span>
    </div>
  );

  const SectionTitle = ({ title, icon }: { title: string, icon: string }) => (
    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
      <span className="text-base">{icon}</span> {title}
    </h3>
  );

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-12">
      
      {/* --- HEADER NAVIGATION --- */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 px-6 py-3 shadow-sm">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">
            
            {/* Logo & Titre */}
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">A</div>
                <h1 className="text-lg font-bold text-slate-800">AutoLab <span className="text-indigo-600 text-[10px] align-top bg-indigo-50 px-1.5 py-0.5 rounded-full border border-indigo-100">Pro</span></h1>
            </div>

            {/* --- NOUVEAU : VERSION CLASSE & SIGNATURE --- */}
            <div className="flex items-center gap-5">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full shadow-sm transition-all hover:border-indigo-200 hover:bg-indigo-50/30">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-600 tracking-widest font-mono">V1.0.0</span>
                </div>
                <div className="hidden md:block w-px h-4 bg-slate-200"></div>
                <span className="text-xs font-bold text-slate-400">Mr David</span>
            </div>
            
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* GAUCHE */}
          <div className="lg:col-span-3 lg:sticky lg:top-24 flex flex-col gap-6 max-h-[calc(100vh-120px)] overflow-y-auto pr-2 custom-scrollbar">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
              <SectionTitle title="Système" icon="🎛️" />
              <div className="grid grid-cols-2 gap-2 mb-2">
                  {['first', 'second', 'general', 'pid'].map(m => (
                      <button key={m} onClick={() => { setSystemType(m as any); setResult(null); setComparisons([]); }}
                          className={clsx("py-2 text-[10px] font-bold rounded-lg transition-all border capitalize", 
                          systemType === m ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm" : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50 hover:border-slate-300")}>
                          {m === 'first' ? '1er Ordre' : m === 'second' ? '2nd Ordre' : m === 'general' ? 'Ordre N' : 'PID'}
                      </button>
                  ))}
              </div>
              <h3 className="text-[9px] font-bold text-slate-300 uppercase mt-4 mb-2">Fréquentiel</h3>
              <div className="grid grid-cols-3 gap-2">
                 <button onClick={() => { setSystemType('bode'); setResult(null); }} className={clsx("py-2 text-[10px] font-bold rounded-lg border", systemType === 'bode' ? "bg-violet-50 border-violet-200 text-violet-700" : "bg-white border-slate-100 text-slate-500")}>Bode</button>
                 <button onClick={() => { setSystemType('nyquist'); setResult(null); }} className={clsx("py-2 text-[10px] font-bold rounded-lg border", systemType === 'nyquist' ? "bg-violet-50 border-violet-200 text-violet-700" : "bg-white border-slate-100 text-slate-500")}>Nyquist</button>
                 <button onClick={() => { setSystemType('black'); setResult(null); }} className={clsx("py-2 text-[10px] font-bold rounded-lg border", systemType === 'black' ? "bg-violet-50 border-violet-200 text-violet-700" : "bg-white border-slate-100 text-slate-500")}>Black</button>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex-1">
               <SectionTitle title="Paramètres" icon="🎚️" />
               <div className="space-y-1">
                  
                  {(systemType === 'first' || systemType === 'pid') && (
                    <>
                     <SliderControl label="Gain (K)" value={gain} onChange={setGain} min={0.1} max={10} step={0.1} />
                     <SliderControl label="Tau (τ)" value={tau} onChange={setTau} min={0.1} max={10} step={0.1} unit="s" />
                    </>
                  )}

                  {(systemType === 'second' || isFreqMode) && (
                    <>
                        <SliderControl label="Gain (K)" value={gain} onChange={setGain} min={0.1} max={10} step={0.1} />
                        <SliderControl label="Amortissement (ζ)" value={zeta} onChange={setZeta} min={0.01} max={2} step={0.05} />
                        <SliderControl label="Fréquence (ωn)" value={omega} onChange={setOmega} min={1} max={20} step={0.5} unit="rad/s" />
                    </>
                  )}

                  {systemType === 'general' && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">Numérateur</label>
                            <input type="text" value={numStr} onChange={(e)=>setNumStr(e.target.value)} 
                                className="w-full p-2 text-sm border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-indigo-50/30 font-mono" placeholder="Ex: 1, 2" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">Dénominateur</label>
                            <input type="text" value={denStr} onChange={(e)=>setDenStr(e.target.value)} 
                                className="w-full p-2 text-sm border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-indigo-50/30 font-mono" placeholder="Ex: 1, 3, 2" />
                        </div>
                    </div>
                  )}

                  {systemType === 'pid' && (
                    <div className="mt-6 pt-4 border-t border-slate-100">
                        <div className="mb-4">
                            <label className="text-xs font-bold text-indigo-600 mb-3 flex items-center gap-1">🧠 PID</label>
                            <SliderControl label="Kp" value={kp} onChange={setKp} min={0} max={20} step={0.1} />
                            <SliderControl label="Ki" value={ki} onChange={setKi} min={0} max={10} step={0.1} />
                            <SliderControl label="Kd" value={kd} onChange={setKd} min={0} max={5} step={0.01} />
                        </div>
                        <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100 mt-2">
                            <label className="text-[10px] font-bold text-amber-600 mb-2 block uppercase tracking-wider">⚡ Perturbation</label>
                            <div className="grid grid-cols-2 gap-3">
                                <input type="number" value={isNaN(distTime)?'':distTime} onChange={(e)=>setDistTime(parseFloat(e.target.value))} className="w-full p-1.5 text-xs font-bold border border-amber-200/50 rounded-lg text-center bg-white"/>
                                <input type="number" step="0.1" value={isNaN(distAmp)?'':distAmp} onChange={(e)=>setDistAmp(parseFloat(e.target.value))} className="w-full p-1.5 text-xs font-bold border border-amber-200/50 rounded-lg text-center bg-white"/>
                            </div>
                        </div>
                    </div>
                  )}
                  
                  {!isFreqMode && <div className="pt-6 mt-2 border-t border-slate-50"><SliderControl label="Durée" value={duration} onChange={setDuration} min={5} max={50} step={1} unit="s" /></div>}

                  <button onClick={handleSimulate} disabled={loading} 
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 mt-4 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0">
                    {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <span>LANCER LE CALCUL 🚀</span>}
                  </button>
               </div>
            </div>
          </div>

          {/* DROITE */}
          <div className="lg:col-span-9 flex flex-col gap-6">
            
            {result && result.metrics && (systemType === 'second' || systemType === 'general') && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in-up">
                    <MetricCard label="Dépassement" value={result.metrics.overshoot} unit="%" color="rose" />
                    <MetricCard label="Temps Montée" value={result.metrics.tm} unit="s" color="blue" />
                    <MetricCard label="Temps Réponse" value={result.metrics.tr_5} unit="s" color="emerald" />
                </div>
            )}

            <div className="bg-white p-1 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                <div className="bg-slate-50/50 p-6 rounded-[20px] h-[600px] relative flex flex-col">
                    <div className="absolute top-6 right-8 flex items-center gap-2 z-10 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
                        <span className={`w-2 h-2 rounded-full ${result ? 'bg-emerald-500' : 'bg-slate-300'} ${result ? 'animate-pulse' : ''}`}></span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{result ? 'LIVE' : 'STANDBY'}</span>
                    </div>
                    <div className="flex-1 w-full h-full relative">
                        {result ? (
                            (() => {
                                switch(systemType) {
                                    case 'bode': return <BodeChart omega={result.omega} magnitude={result.magnitude} phase={result.phase} />;
                                    case 'nyquist': return <NyquistChart real={result.real} imag={result.imag} />;
                                    case 'black': return <BlackChart phase={result.phase} magnitude={result.magnitude} />;
                                    default: return <SimulationChart timeData={result.time} amplitudeData={result.amplitude} comparisons={comparisons} title={systemType === 'pid' ? "Régulation" : (systemType === 'general' ? "Système Ordre N" : "Réponse Temporelle")} />;
                                }
                            })()
                        ) : (
                             <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 select-none"><p className="text-lg font-bold text-slate-400">Prêt à simuler</p></div>
                        )}
                    </div>
                </div>
            </div>

            {/* TOOLBAR */}
            {result && (
                <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center shadow-2xl shadow-slate-400/20 gap-4">
                    <div className="flex items-center gap-4">
                        {!isFreqMode ? (
                            <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                                <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider mb-0.5">Mémoire</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-white">{comparisons.length}</span>
                                    <span className="text-xs text-slate-500">courbes</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-slate-300 text-sm"><span>📈 Mode Fréquentiel</span></div>
                        )}
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button onClick={handleExportCSV} className="flex-1 sm:flex-none px-5 py-3 text-xs font-bold text-emerald-300 hover:text-emerald-100 hover:bg-slate-800 rounded-xl transition-colors border border-slate-700 hover:border-emerald-500 flex items-center justify-center gap-2">
                            EXCEL .CSV
                        </button>
                        {!isFreqMode && comparisons.length > 0 && (
                            <button onClick={handleClearComparisons} className="px-4 py-3 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">VIDER</button>
                        )}
                        {!isFreqMode && (
                            <button onClick={handleFreeze} className="flex-1 sm:flex-none px-8 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2">
                                <span>❄️ FIGER</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
          </div>

        </div>
        <div className="mt-12"><Footer /></div>
      </div>
    </main>
  );
}