# ThreadMine Survey Dashboard

This repository contains a **Streamlit** dashboard that demonstrates how ThreadMine's three unique selling propositions (USPs) can be validated with machine‑learning on synthetic survey data.

## 📂 Folder Structure

```text
├── app.py                       # Streamlit app (single‑file)
├── requirements.txt             # Python deps for Streamlit Cloud
├── threadmine_survey_5000.csv   # 5 000‑row synthetic dataset
```

## 🚀 Quick Start (local)

```bash
python -m venv .venv && source .venv/bin/activate   # (or Windows)
pip install -r requirements.txt
streamlit run app.py
```

## ☁️ Deploy to Streamlit Cloud

1. Create a new public repo and push **app.py**, **requirements.txt** and **threadmine_survey_5000.csv**.
2. In Streamlit Community Cloud, link the repo and click **Deploy**.
3. Done – your dashboard is live!

## Dashboard Overview

| Tab | ML Workflows |
|-----|--------------|
| **AI StyleDNA Engine** | Logistic regression, linear regression, k‑means clustering, Apriori rules |
| **Circular Storytelling** | Random‑forest‑style logistic regression equivalent, ordinal regression, hierarchical clustering, motive association rules |
| **Dynamic Swaps + Loyalty** | Classification on subscription intent, fee regression, cluster archetypes, perk association rules |

All plots use **matplotlib** only (no seaborn) and default colors to comply with Streamlit Cloud GPU quotas.

--
*Synthetic data: for demo only – do **not** treat as real consumer insight.*
