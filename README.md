# 🚀 AutoLab Pro

**Plateforme Full-Stack de Simulation et d'Analyse de Systèmes Automatiques.**

AutoLab Pro est un laboratoire virtuel moderne conçu pour les étudiants et ingénieurs en automatique. Il permet de simuler, visualiser et analyser des systèmes dynamiques en temps réel, le tout via une interface web fluide et interactive.

![AutoLab Screenshot](https://via.placeholder.com/1000x500?text=Capture+d%27ecran+AutoLab+Pro)
*(Ajoute ici une capture d'écran de ton interface)*

## ✨ Fonctionnalités Clés

### ⏱️ Simulation Temporelle
- **Systèmes du 1er et 2nd Ordre :** Visualisation instantanée de la réponse indicielle.
- **Métriques Automatiques :** Calcul en temps réel du Dépassement ($D\%$), Temps de montée ($t_m$) et Temps de réponse à 5% ($t_r$).
- **Mode Comparaison :** Possibilité de figer plusieurs courbes ("Mémoire") pour comparer différents scénarios superposés.

### 🧠 Régulation Avancée (PID)
- **Simulateur PID Complet :** Réglages $K_p, K_i, K_d$ en temps réel.
- **Injection de Perturbations :** Simulation de chocs externes (Step Disturbance) à un instant $t$ précis pour tester la robustesse de la boucle fermée.

### 📉 Analyse Fréquentielle & Stabilité
Suite complète d'outils d'ingénierie :
- **Diagramme de Bode :** Gain (dB) et Phase (°) avec échelle logarithmique.
- **Diagramme de Nyquist :** Courbe polaire avec visualisation du point critique $(-1, 0)$.
- **Diagramme de Black-Nichols :** Lieu de transfert Gain/Phase.

### 🛠️ Outils & Ergonomie
- **Interface Moderne :** Design "Glassmorphism", Sidebar sticky, Sliders interactifs.
- **Exports Professionnels :**
    - 📸 Export des graphiques en **PNG Haute Définition**.
    - 📊 Export des données brutes en **CSV (Compatible Excel/Matlab)**.

---

## 🏗️ Architecture Technique

Ce projet utilise une architecture **Full-Stack** séparant le moteur de calcul scientifique de l'interface utilisateur.

### 🎨 Frontend (Le Visage)
- **Framework :** Next.js 14+ (React, TypeScript, App Router).
- **Styling :** TailwindCSS 4 (Design responsive et moderne).
- **Visualisation :** Chart.js & React-Chartjs-2 (Graphiques interactifs).

### 🧠 Backend (Le Cerveau)
- **API :** Python FastAPI (Performance et typage strict).
- **Calcul Scientifique :** NumPy & SciPy.
- **Automatique :** Bibliothèque `python-control` pour la résolution des équations différentielles et fréquentielles.

---

## 🚀 Installation et Démarrage

### Prérequis
- Node.js (v18+)
- Python (v3.9+)

### 1. Installation
```bash
# Cloner le projet
git clone [https://github.com/TonNomUtilisateur/AutoLab.git](https://github.com/TonNomUtilisateur/AutoLab.git)
cd AutoLab

# --- Installation Backend ---
cd backend
python -m venv venv
# Windows :
.\venv\Scripts\activate
# Mac/Linux :
source venv/bin/activate

pip install fastapi uvicorn numpy scipy control matplotlib

# --- Installation Frontend ---
cd ../frontend
npm install