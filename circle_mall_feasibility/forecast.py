"""Circle Mall (Cotton On Adults) lease-renewal feasibility: sales forecast + P&L.
Run: python3 forecast.py  -> writes results.json used by the HTML report."""
import json, warnings
import numpy as np, pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import Ridge
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from statsmodels.tsa.statespace.sarimax import SARIMAX
warnings.filterwarnings("ignore")
np.random.seed(7)

SRC = "COG_month-loc_salesfootfall_from_2024.xlsx"
s = pd.read_excel(SRC, sheet_name="sales", header=1)
f = pd.read_excel(SRC, sheet_name="footfall", header=1)
LAST = 202608  # Sep-26 is a partial month -> excluded
s = s[(s.BRAND_ID == "COT") & (s.MONTH_ID <= LAST)]
f = f[(f.BRAND_ID == "COT") & (f.MONTH_ID <= LAST)]
EXCL = ["COG Online Store", "Namshi Cotton On Marketplace", "COG Sharjah Expo", "Sharjah Expo"]
s = s[~s.STORE_LOCATION.isin(EXCL)]
P = s.pivot_table(index="MONTH_ID", columns="STORE_LOCATION", values="NET_SALES", aggfunc="sum")
F = f.pivot_table(index="MONTH_ID", columns="STORE_LOCATION", values="FOOTFALL", aggfunc="sum")
P.index = pd.PeriodIndex([pd.Period(f"{str(m)[:4]}-{str(m)[4:]}", "M") for m in P.index])
F.index = pd.PeriodIndex([pd.Period(f"{str(m)[:4]}-{str(m)[4:]}", "M") for m in F.index])
CM = "CIRCLE MALL"
y = P[CM].astype(float)                     # 32 months Jan-24..Aug-26
# like-for-like peers: stores trading every month in the window
peers = [c for c in P.columns if c != CM and P[c].notna().all()]
chain = P[peers].sum(axis=1)

TEST = 8                                     # hold-out Jan-26..Aug-26
FUT = pd.period_range("2026-09", "2029-08", freq="M")   # to end of lease year 3 (7 Aug 2029)

def mape(a, b): a, b = np.asarray(a), np.asarray(b); return float(np.mean(np.abs(a - b) / a) * 100)

# ---------------- models: fn(train_series, horizon_index) -> forecast ----------------
def m_seasonal_naive(tr, idx):
    g = tr[-12:].sum() / tr[-24:-12].sum()
    out = []
    hist = tr.copy()
    for p in idx:
        v = hist[p - 12] * g
        hist[p] = v; out.append(v)
    return np.array(out)

def m_holt_winters(tr, idx):
    m = ExponentialSmoothing(tr.values, trend="add", damped_trend=True, seasonal="mul",
                             seasonal_periods=12, initialization_method="estimated").fit()
    return m.forecast(len(idx))

def m_sarima(tr, idx):
    m = SARIMAX(np.log(tr.values), order=(1, 0, 0), seasonal_order=(0, 1, 0, 12), trend="c").fit(disp=False)
    return np.exp(m.forecast(len(idx)))

def feats(idx, t0):
    X = pd.DataFrame({"t": [(p - t0).n for p in idx]})
    for k in range(2, 13): X[f"m{k}"] = [int(p.month == k) for p in idx]
    return X

def m_ridge(tr, idx):
    t0 = tr.index[0]
    mdl = Ridge(alpha=1.0).fit(feats(tr.index, t0), np.log(tr.values))
    return np.exp(mdl.predict(feats(idx, t0)))

def panel(train_end, target_idx):
    """Pooled cross-store dataset: target = store's log sales, features = month-of-year,
    store level, lag-12 log sales, chain lag-12 growth. Lets ML learn seasonality/decay
    patterns from the like-for-like Cotton On stores instead of one short series."""
    rows = []
    stores = peers + [CM]
    for st in stores:
        ser = P[st]
        lvl = np.log(ser[:train_end].dropna()).mean()
        for p in ser.index:
            if p > train_end or p - 12 not in ser.index or pd.isna(ser.get(p)) or pd.isna(ser[p - 12]): continue
            rows.append(dict(store=st, p=p, y=np.log(ser[p]), lag12=np.log(ser[p - 12]), lvl=lvl,
                             month=p.month, is_cm=int(st == CM),
                             chain_g=np.log(chain[p - 1] / chain[p - 13]) if p - 13 in chain.index else 0.0))
    return pd.DataFrame(rows)

def m_tree(kind):
    def fn(tr, idx):
        end = tr.index[-1]
        D = panel(end, idx)
        X = D[["lag12", "lvl", "month", "is_cm", "chain_g"]]; Y = D.y - D.lag12   # learn YoY log-growth
        mdl = (RandomForestRegressor(500, min_samples_leaf=3, random_state=7) if kind == "rf"
               else GradientBoostingRegressor(n_estimators=300, max_depth=2, learning_rate=0.03, subsample=0.8, random_state=7))
        mdl.fit(X, Y)
        hist = tr.copy(); lvl = np.log(tr).mean()
        cg = float(np.log(chain[:end][-12:].sum() / chain[:end][-24:-12].sum()))
        out = []
        for p in idx:
            lag = np.log(hist[p - 12])
            g = mdl.predict(pd.DataFrame([dict(lag12=lag, lvl=lvl, month=p.month, is_cm=1, chain_g=cg)]))[0]
            v = float(np.exp(lag + g)); hist[p] = v; out.append(v)
        return np.array(out)
    return fn

def m_chain_share(tr, idx):
    end = tr.index[-1]
    share = (tr[-12:] / chain[:end][-12:])            # seasonal share of like-for-like chain
    ch = chain[:end]
    chm = ExponentialSmoothing(ch.values, trend="add", damped_trend=True, seasonal="mul", seasonal_periods=12,
                               initialization_method="estimated").fit().forecast(len(idx))
    sh = np.array([share[share.index.month == p.month].iloc[0] for p in idx])
    # share drift: Circle share trend over the last 12 vs prior 12 months (dampened 50%)
    drift = (tr[-12:].sum() / ch[-12:].sum()) / (tr[-24:-12].sum() / ch[-24:-12].sum())
    return chm * sh * (1 + 0.5 * (drift - 1))

def m_footfall(tr, idx):
    end = tr.index[-1]
    ff = F[CM][:end].astype(float)
    spv = (tr / ff).dropna()                          # sales per store visitor (conversion x ATV)
    ffc = ExponentialSmoothing(ff.values, trend="add", damped_trend=True, seasonal="add", seasonal_periods=12,
                               initialization_method="estimated").fit().forecast(len(idx))
    spv_m = np.array([spv[spv.index.month == p.month][-1:].mean() for p in idx])
    return ffc * spv_m

MODELS = {
    "Seasonal naive × YoY growth": ("Baseline", m_seasonal_naive),
    "Holt-Winters (damped, multiplicative)": ("Statistical", m_holt_winters),
    "SARIMA (1,0,0)(0,1,0)12 on log sales": ("Statistical", m_sarima),
    "Ridge regression (trend + month)": ("Machine learning", m_ridge),
    "Random Forest (pooled store panel)": ("Machine learning", m_tree("rf")),
    "Gradient Boosting (pooled store panel)": ("Machine learning", m_tree("gb")),
    "Chain-share (Circle % of like-for-like)": ("Structural", m_chain_share),
    "Footfall × sales-per-visitor": ("Structural", m_footfall),
}

train, test = y[:-TEST], y[-TEST:]
res = {}
for name, (fam, fn) in MODELS.items():
    bt = fn(train.copy(), test.index)
    fc = fn(y.copy(), FUT)
    res[name] = dict(family=fam, mape=mape(test.values, bt), backtest=[float(v) for v in bt],
                     forecast=[float(v) for v in fc])

# inverse-MAPE weighted ensemble (models with MAPE > 25% get zero weight)
w = {k: (1 / v["mape"] if v["mape"] <= 25 else 0) for k, v in res.items()}
tw = sum(w.values()); w = {k: v / tw for k, v in w.items()}
ens_bt = sum(np.array(res[k]["backtest"]) * w[k] for k in res)
ens_fc = sum(np.array(res[k]["forecast"]) * w[k] for k in res)
for k in res: res[k]["weight"] = w[k]

def ly(series_idx, vals, start):
    s_ = pd.Series(vals, index=series_idx)
    # lease year runs 8 Aug (start) .. 7 Aug (start+1): 24/31 of the first August, 7/31 of the next
    a0, a1 = pd.Period(f"{start}-08", "M"), pd.Period(f"{start+1}-08", "M")
    return float(s_[a0] * 24 / 31 + s_[a0 + 1:a1 - 1].sum() + s_[a1] * 7 / 31)

full_idx = y.index.append(FUT)
def lease_years(fc):
    allv = np.concatenate([y.values, fc])
    return [ly(full_idx, allv, yr) for yr in (2026, 2027, 2028)]

for k in res: res[k]["lease_years"] = lease_years(np.array(res[k]["forecast"]))
ens_ly = lease_years(ens_fc)

# ---------------- macro / catchment overlay ----------------
# The statistical models extrapolate 32 months of history, i.e. they already carry the
# "organic" trend. Beyond year 1 we blend the model trend with external drivers.
drivers = [
    dict(name="UAE / Middle East apparel market", value=4.3, weight=0.30,
         note="Grand View Research: Middle East & Africa apparel CAGR 4.3% (2026-33); global 3.1-4.1%."),
    dict(name="Target segment: 18-35 value fashion, Dubai", value=6.0, weight=0.30,
         note="Dubai population +7.5% in 2025 to 4.58m (Dubai Statistics / WAM); 25-54 cohort ≈69% of residents; value/fast-fashion outgrowing total apparel. Tempered to 6%."),
    dict(name="JVC catchment development", value=8.0, weight=0.40,
         note="JVC ≈ 90-100k residents today vs ≈300k+ planned at build-out; continuous tower handovers adding captive, walk-in residents to Circle Mall's primary catchment."),
]
gross = sum(d["value"] * d["weight"] for d in drivers)
adjust = [
    dict(name="Competition / cannibalisation (new community retail, online incl. Namshi & COG online)", value=-1.5),
    dict(name="Store maturity (5th trading year, 2022 opening) & chain LFL softness in 2026", value=-0.8),
]
macro_g = gross + sum(a["value"] for a in adjust)

# Year-1 = ensemble. Years 2-3: 50% ensemble trend, 50% macro growth.
ens_g2 = ens_ly[1] / ens_ly[0] - 1; ens_g3 = ens_ly[2] / ens_ly[1] - 1
g2 = 0.5 * ens_g2 + 0.5 * macro_g / 100; g3 = 0.5 * ens_g3 + 0.5 * macro_g / 100
base = [ens_ly[0], ens_ly[0] * (1 + g2), ens_ly[0] * (1 + g2) * (1 + g3)]
# Years 4-5 (8 Aug 2029 - 7 Aug 2031): 32 months of history can't support model trends that far
# out, so these years grow at the external market rate only.
trend = list(base)                     # model + market trend (reference only)
# Adopted sales assumption (management input): Al Khail Avenue mall opening near Circle Mall.
# Year 1 = model forecast, Year 2 = no like-for-like growth, Year 3 = -10% on Year 2.
base = [base[0], base[0], base[0] * 0.90]
# Scenarios: bear = lowest credible model in Y1 & half the macro growth; bull = highest credible model & macro +2pp
cred = [k for k in res if w[k] > 0]
bear_y1 = min(res[k]["lease_years"][0] for k in cred); bull_y1 = max(res[k]["lease_years"][0] for k in cred)
bear = [bear_y1, bear_y1 * (1 + macro_g / 200), bear_y1 * (1 + macro_g / 200) ** 2]
bull = [bull_y1, bull_y1 * (1 + (macro_g + 2) / 100), bull_y1 * (1 + (macro_g + 2) / 100) ** 2]

# ---------------- history summaries ----------------
hist_ly = {
    "LY 22-23": 3345375.63, "LY 23-24": 3476676.14, "LY 24-25": 3375376.48, "LY 25-26": 3936735.19,
}
peer_yoy = {}
for st in peers + [CM]:
    a = P[st][pd.Period("2026-01", "M"):pd.Period("2026-08", "M")].sum()
    b = P[st][pd.Period("2025-01", "M"):pd.Period("2025-08", "M")].sum()
    peer_yoy[st] = float(a / b - 1)
ttm = {st: float(P[st][-12:].sum()) for st in P.columns if P[st][-12:].notna().all()}
ff_ttm = float(F[CM][-12:].sum()); conv = ttm[CM] / ff_ttm

out = dict(
    months=[str(p) for p in y.index], actual=[float(v) for v in y.values],
    fut_months=[str(p) for p in FUT], test_months=[str(p) for p in test.index],
    models=res, ensemble=dict(backtest=[float(v) for v in ens_bt], forecast=[float(v) for v in ens_fc],
                              mape=mape(test.values, ens_bt), lease_years=ens_ly),
    drivers=drivers, adjust=adjust, macro_g=macro_g, g2=g2, g3=g3,
    scenarios=dict(bear=bear, base=base, bull=bull, trend=trend), hist_ly=hist_ly, peer_yoy=peer_yoy, ttm=ttm,
    ff_ttm=ff_ttm, sales_per_visitor=conv, footfall=[float(v) if pd.notna(v) else None for v in F[CM].reindex(y.index).values],
    chain_lfl=[float(v) for v in chain.values], peers=peers,
)
json.dump(out, open("results.json", "w"), indent=1)
print(f"{'model':45s} {'MAPE':>6s} {'wt':>5s}  LY1        LY2        LY3")
for k, v in res.items():
    print(f"{k:45s} {v['mape']:6.1f} {v['weight']:5.2f}  " + "  ".join(f"{x/1e6:8.3f}" for x in v["lease_years"]))
print("ENSEMBLE mape", round(out["ensemble"]["mape"], 1), [round(x/1e6, 3) for x in ens_ly])
print("macro g", macro_g, "g2 g3", g2, g3)
print("base", [round(x/1e6,3) for x in base], "trend", [round(x/1e6,3) for x in trend], "bear", [round(x/1e6,3) for x in bear], "bull", [round(x/1e6,3) for x in bull])
print({k: round(v*100,1) for k,v in peer_yoy.items()})
print({k: round(v/1e6,2) for k,v in ttm.items()}, conv)
