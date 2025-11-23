from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List # Nécessaire pour les listes
import numpy as np
import control as ct

app = FastAPI(title="AutoLab API Ultimate")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Modèles ---
class FirstOrderParams(BaseModel):
    K: float; tau: float; duration: float = 10.0

class SecondOrderParams(BaseModel):
    K: float; omega_n: float; zeta: float; duration: float = 10.0

class PIDParams(BaseModel):
    process_K: float; process_tau: float
    Kp: float; Ki: float; Kd: float
    duration: float = 10.0; dist_time: float = 5.0; dist_amp: float = 0.0

class FreqParams(BaseModel):
    K: float; omega_n: float; zeta: float

# NOUVEAU : Modèle pour ordre N (Listes de coefficients)
class GeneralParams(BaseModel):
    num: List[float] # Ex: [1, 2] pour s + 2
    den: List[float] # Ex: [1, 3, 2] pour s^2 + 3s + 2
    duration: float = 10.0

# --- UTILS ---
def calculate_metrics(T, y, final_value):
    y = np.array(y).flatten()
    T = np.array(T).flatten()
    peak_value = np.max(y)
    overshoot = 0.0
    # Si final_value est 0 (ex: système dérivateur), l'overshoot n'a pas de sens classique
    if final_value != 0 and peak_value > final_value:
        overshoot = (peak_value - final_value) / final_value * 100

    margin = 0.05 * (final_value if final_value != 0 else 1.0)
    unsettled_indices = np.where(np.abs(y - final_value) > margin)[0]
    
    tr_5 = 0.0
    if len(unsettled_indices) == 0: tr_5 = 0.0 
    elif unsettled_indices[-1] == len(y) - 1: tr_5 = float(T[-1])
    else: tr_5 = float(T[unsettled_indices[-1]])

    tm = 0.0
    # Calcul Tm basique
    if final_value != 0:
        idx_90 = np.where(y >= 0.9 * final_value)[0]
        if len(idx_90) > 0: tm = float(T[idx_90[0]])

    return { "overshoot": round(float(overshoot), 2), "tr_5": round(float(tr_5), 2), "tm": round(float(tm), 2) }

# --- ROUTES ---

@app.get("/")
def read_root(): return {"status": "AutoLab Ready"}

@app.post("/simulate/first-order")
def simulate_first_order(params: FirstOrderParams):
    sys = ct.tf([params.K], [params.tau, 1])
    T, yout = ct.step_response(sys, T=np.linspace(0, params.duration, 500))
    return {"time": np.array(T).flatten().tolist(), "amplitude": np.array(yout).flatten().tolist()}

@app.post("/simulate/second-order")
def simulate_second_order(params: SecondOrderParams):
    w2 = params.omega_n ** 2
    sys = ct.tf([params.K * w2], [1, 2 * params.zeta * params.omega_n, w2])
    T, yout = ct.step_response(sys, T=np.linspace(0, params.duration, 500))
    y_clean = np.array(yout).flatten()
    metrics = calculate_metrics(np.array(T).flatten(), y_clean, params.K)
    return {"time": T.tolist(), "amplitude": y_clean.tolist(), "metrics": metrics}

@app.post("/simulate/pid")
def simulate_pid(params: PIDParams):
    T = np.linspace(0, params.duration, 500)
    process = ct.tf([params.process_K], [params.process_tau, 1])
    controller = ct.tf([params.Kd, params.Kp, params.Ki], [1, 0])
    sys_ref = ct.feedback(controller * process)
    _, y_ref = ct.step_response(sys_ref, T)
    y_total = np.array(y_ref).flatten()
    if params.dist_amp != 0:
        sys_dist = process / (1 + controller * process)
        _, y_dist_step = ct.step_response(sys_dist, T)
        y_dist_step = np.array(y_dist_step).flatten()
        start_index = np.searchsorted(T, params.dist_time)
        y_disturbance = np.zeros_like(T)
        if len(T) - start_index > 0:
            y_disturbance[start_index:] = y_dist_step[:len(T) - start_index] * params.dist_amp
        y_total = y_total + y_disturbance
    return {"time": T.tolist(), "amplitude": y_total.tolist()}

# NOUVEAU : Route Ordre N (Général)
@app.post("/simulate/general")
def simulate_general(params: GeneralParams):
    # Création directe via numérateur/dénominateur
    sys = ct.tf(params.num, params.den)
    
    T, yout = ct.step_response(sys, T=np.linspace(0, params.duration, 500))
    
    # On essaie de deviner la valeur finale (DC Gain) pour les métriques
    final_val = ct.dcgain(sys)
    # Si le système a un intégrateur pur, dcgain peut être infini ou nan, on prend la dernière valeur
    if np.isinf(final_val) or np.isnan(final_val):
        final_val = yout[-1]

    y_clean = np.array(yout).flatten()
    metrics = calculate_metrics(np.array(T).flatten(), y_clean, float(final_val))
    
    return {"time": T.tolist(), "amplitude": y_clean.tolist(), "metrics": metrics}

@app.post("/simulate/frequency")
def simulate_frequency(params: FreqParams):
    w2 = params.omega_n ** 2
    sys = ct.tf([params.K * w2], [1, 2 * params.zeta * params.omega_n, w2])
    omega = np.logspace(-2, 3, 1000) 
    mag, phase, omega = ct.freqresp(sys, omega)
    return {
        "omega": np.array(omega).flatten().tolist(),
        "magnitude": (20 * np.log10(np.array(mag).flatten())).tolist(),
        "phase": (np.degrees(np.array(phase).flatten())).tolist(),
        "real": (np.array(mag).flatten() * np.cos(np.array(phase).flatten())).tolist(),
        "imag": (np.array(mag).flatten() * np.sin(np.array(phase).flatten())).tolist()
    }