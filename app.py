import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.cluster import KMeans
from sklearn.metrics import accuracy_score, classification_report, r2_score, silhouette_score
from mlxtend.frequent_patterns import apriori, association_rules
from mlxtend.preprocessing import TransactionEncoder

st.set_page_config(page_title="ThreadMine Feasibility Dashboard", layout="wide")

# --------------------------------------------------------------------- #
@st.cache_data(show_spinner=False)
def load_data():
    return pd.read_csv("threadmine_survey_5000.csv")

df = load_data()
st.sidebar.header("About")
st.sidebar.markdown(
    "📦 **ThreadMine Survey Dashboard**\n"
    "*Demo dashboard to validate the three USP hypotheses using real‑looking synthetic data.*"
)

# --------------------------------------------------------------------- #
def prep_features(df, drop_cols):
    X = df.drop(columns=drop_cols)
    num_cols = X.select_dtypes(include=["int", "float"]).columns.tolist()
    cat_cols = X.select_dtypes(include="object").columns.tolist()
    pre = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), num_cols),
            ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols),
        ]
    )
    return X, num_cols, cat_cols, pre

def run_classifier(df, target_col, positive_values):
    X, num_cols, cat_cols, pre = prep_features(df, [target_col])
    y = df[target_col].isin(positive_values).astype(int)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.3, random_state=42, stratify=y
    )
    clf = Pipeline(steps=[("prep", pre), ("clf", LogisticRegression(max_iter=1000))])
    clf.fit(X_train, y_train)
    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    st.write("**Accuracy:**", round(acc, 3))
    st.text(classification_report(y_test, y_pred, digits=3))

def run_regression(df, target_col, feature_drop):
    X, num_cols, cat_cols, pre = prep_features(df, feature_drop + [target_col])
    y = df[target_col]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.3, random_state=42
    )
    reg = Pipeline(steps=[("prep", pre), ("reg", LinearRegression())])
    reg.fit(X_train, y_train)
    y_pred = reg.predict(X_test)
    r2 = r2_score(y_test, y_pred)
    st.write("**R²:**", round(r2, 3))
    fig, ax = plt.subplots()
    ax.scatter(y_test, y_pred)
    ax.set_xlabel("Actual")
    ax.set_ylabel("Predicted")
    ax.set_title("Actual vs Predicted")
    st.pyplot(fig)

def run_clustering(df, feature_cols, n_clusters=5):
    X = df[feature_cols]
    num_cols = X.select_dtypes(include=["int", "float"]).columns.tolist()
    cat_cols = X.select_dtypes(include="object").columns.tolist()
    pre = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), num_cols),
            ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols),
        ]
    )
    X_enc = pre.fit_transform(X)
    km = KMeans(n_clusters=n_clusters, random_state=42, n_init="auto")
    labels = km.fit_predict(X_enc)
    sil = silhouette_score(X_enc, labels)
    st.write("**Silhouette score:**", round(sil, 3))

def run_association(df, multi_col, min_support=0.05):
    transactions = df[multi_col].str.split(", ").tolist()
    te = TransactionEncoder()
    oht = te.fit(transactions).transform(transactions)
    basket = pd.DataFrame(oht, columns=te.columns_)
    frequent = apriori(basket, min_support=min_support, use_colnames=True)
    rules = association_rules(frequent, metric="lift", min_threshold=1.0)                    .sort_values("lift", ascending=False).head(10)
    st.write(rules[["antecedents", "consequents", "support", "confidence", "lift"]])

# --------------------------------------------------------------------- #
tab_titles = ["AI StyleDNA Engine", "Circular Storytelling", "Wardrobe Swaps"]
tabs = st.tabs(tab_titles)

# ---- TAB 1 ---------------------------------------------------------- #
with tabs[0]:
    st.header("USP 1 · AI StyleDNA Engine")
    st.subheader("1. Classification – Who will finish the style quiz?")
    run_classifier(df, "QuizWillingness", ["Definitely"])

    st.subheader("2. Regression – How much will they pay monthly?")
    run_regression(df, "MaxMonthlyFeeUSD", feature_drop=["MaxMonthlyFeeUSD"])

    st.subheader("3. Clustering – Identify style personas")
    run_clustering(df, feature_cols=["Age", "Gender", "Region", "StyleKeywords"])

    st.subheader("4. Association Rules – Style × Platform affinities")
    run_association(df, "StyleKeywords")

# ---- TAB 2 ---------------------------------------------------------- #
with tabs[1]:
    st.header("USP 2 · Circular Storytelling Marketplace")
    st.subheader("1. Classification – Who pays a story premium?")
    df["StoryPremiumYes"] = (df["PayPremiumForStory"] >= 4).astype(int)
    run_classifier(df, "StoryPremiumYes", [1])

    st.subheader("2. Regression – Premium magnitude (Likert 1‑5)")
    run_regression(df, "PayPremiumForStory", feature_drop=["PayPremiumForStory"])

    st.subheader("3. Clustering – Storytelling personas")
    story_df = df[df["StoryPremiumYes"] == 1]
    if not story_df.empty:
        run_clustering(story_df, ["ShareOwnStory", "PrelovedMotives", "LinkSocials"])

    st.subheader("4. Association Rules – Motive bundles")
    run_association(df, "PrelovedMotives")

# ---- TAB 3 ---------------------------------------------------------- #
with tabs[2]:
    st.header("USP 3 · Dynamic Wardrobe Swaps + Loyalty")
    st.subheader("1. Classification – Subscription interest")
    df["SubInterestYes"] = df["SubscriptionInterest"].isin(["Very interested", "Somewhat"]).astype(int)
    run_classifier(df, "SubInterestYes", [1])

    st.subheader("2. Regression – Price tolerance (USD)")
    run_regression(df, "MaxMonthlyFeeUSD", feature_drop=["MaxMonthlyFeeUSD"])

    st.subheader("3. Clustering – Swap archetypes")
    run_clustering(df, ["BuyFrequency", "AvgSpendPerTripUSD", "SwapPerks"])

    st.subheader("4. Association Rules – Perk bundles that convert")
    run_association(df, "SwapPerks")
