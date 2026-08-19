"""Berechnet fuer alle Kunden die Abwanderungswahrscheinlichkeit und schreibt sie
in die Tabelle churn_predictions.

Mehrfach ausfuehrbar: pro Kunde genau eine Zeile (customer_id ist unique in der
DB), ein erneuter Lauf aktualisiert bestehende Zeilen per Upsert statt neue
anzulegen - anders als bei den Interaktionen in Etappe 3 ist predictedAt hier
bewusst KEIN historischer Zeitpunkt, sondern "wann wurde zuletzt berechnet" und
wird deshalb bei jedem Lauf aktualisiert.
"""
import json
import os
from datetime import datetime
from pathlib import Path

import joblib
import pandas as pd
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

BASE_DIR = Path(__file__).resolve().parent
ENV_PATH = BASE_DIR / ".env"
MODEL_PATH = BASE_DIR / "models" / "churn_model.pkl"
METRICS_PATH = BASE_DIR / "models" / "metrics.json"

MEDIUM_SCHWELLENWERT = None  # wird aus metrics.json gelesen (Teil 2: 0,4)
# HIGH ab dem 75. Perzentil der vorhergesagten Wahrscheinlichkeiten (empirisch
# rund 0,70) - damit landet ungefaehr das oberste Viertel aller Kunden in HIGH,
# eine handhabbare Groesse fuer eine priorisierte Anrufliste.
HIGH_SCHWELLENWERT = 0.7

KATEGORIALE_MERKMALE = [
    "gender", "senior_citizen", "partner", "dependents", "phone_service",
    "multiple_lines", "internet_service", "online_security", "online_backup",
    "device_protection", "tech_support", "streaming_tv", "streaming_movies",
    "contract", "paperless_billing", "payment_method",
]
NUMERISCHE_MERKMALE = ["tenure", "monthly_charges"]


def build_engine():
    load_dotenv(ENV_PATH)
    url = (
        f"mysql+pymysql://{os.environ['DB_USER']}:{os.environ['DB_PASSWORD']}"
        f"@{os.environ['DB_HOST']}:{os.environ['DB_PORT']}/{os.environ['DB_NAME']}"
    )
    return create_engine(url)


def load_customers(engine):
    # Gleiche Merkmale wie beim Training in 02_model.ipynb, inkl. CAST auf
    # UNSIGNED fuer alle bit(1)-Spalten (sonst waere b'\x00' in Python truthy).
    query = text(
        """
        SELECT
            id, monthly_charges,
            gender,
            CAST(senior_citizen AS UNSIGNED) AS senior_citizen,
            CAST(partner AS UNSIGNED) AS partner,
            CAST(dependents AS UNSIGNED) AS dependents,
            tenure,
            CAST(phone_service AS UNSIGNED) AS phone_service,
            multiple_lines, internet_service, online_security, online_backup,
            device_protection, tech_support, streaming_tv, streaming_movies,
            contract,
            CAST(paperless_billing AS UNSIGNED) AS paperless_billing,
            payment_method
        FROM customers
        """
    )
    return pd.read_sql(query, engine)


def risk_level(probability):
    if probability >= HIGH_SCHWELLENWERT:
        return "HIGH"
    if probability >= MEDIUM_SCHWELLENWERT:
        return "MEDIUM"
    return "LOW"


UPSERT_SQL = text(
    """
    INSERT INTO churn_predictions
        (customer_id, churn_probability, risk_level, revenue_at_risk, model_version, predicted_at)
    VALUES
        (:customer_id, :churn_probability, :risk_level, :revenue_at_risk, :model_version, :predicted_at)
    ON DUPLICATE KEY UPDATE
        churn_probability = VALUES(churn_probability),
        risk_level = VALUES(risk_level),
        revenue_at_risk = VALUES(revenue_at_risk),
        model_version = VALUES(model_version),
        predicted_at = VALUES(predicted_at)
    """
)


def upsert_predictions(engine, rows):
    inserted = 0
    errors = []
    with engine.connect() as connection:
        for row in rows:
            try:
                with connection.begin():
                    connection.execute(UPSERT_SQL, row)
                inserted += 1
            except SQLAlchemyError as exc:
                errors.append((row["customer_id"], str(exc)))
    return inserted, errors


def print_report(df, errors):
    print(f"Verarbeitet: {len(df)} Kunden")
    if errors:
        print(f"\n{len(errors)} Kunde(n) konnten NICHT geschrieben werden:")
        for customer_id, message in errors:
            print(f"  - Kunde (id={customer_id}): {message}")

    print("\nVerteilung Risikostufe:")
    print(df["risk_level"].value_counts().reindex(["LOW", "MEDIUM", "HIGH"], fill_value=0))

    aktiv_high = df[(df["risk_level"] == "HIGH") & (df["churn"] == 0)]
    print(f"\nAktive Kunden mit Risikostufe HIGH: {len(aktiv_high)}")
    print(f"Monatsumsatz daran (Summe monthlyCharges): {aktiv_high['monthly_charges'].sum():,.2f} EUR")
    print(f"Revenue at risk daran (Summe revenue_at_risk): {aktiv_high['revenue_at_risk'].sum():,.2f} EUR")


def main():
    global MEDIUM_SCHWELLENWERT

    with open(METRICS_PATH, encoding="utf-8") as f:
        metrics = json.load(f)
    MEDIUM_SCHWELLENWERT = metrics["schwellenwert"]
    model_version = metrics["modell"]

    engine = build_engine()
    model = joblib.load(MODEL_PATH)

    df = load_customers(engine)
    # churn wird separat geladen (nicht Teil der Modellmerkmale), nur fuer den
    # Prüfbericht am Ende (Umsatz an bereits aktiven vs. abgewanderten Kunden).
    with engine.connect() as connection:
        churn_map = dict(
            connection.execute(text("SELECT id, CAST(churn AS UNSIGNED) AS churn FROM customers")).all()
        )
    df["churn"] = df["id"].map(churn_map)

    df["churn_probability"] = model.predict_proba(df[KATEGORIALE_MERKMALE + NUMERISCHE_MERKMALE])[:, 1]
    df["revenue_at_risk"] = df["monthly_charges"] * df["churn_probability"]
    df["risk_level"] = df["churn_probability"].apply(risk_level)

    jetzt = datetime.now()
    rows = [
        {
            "customer_id": int(zeile.id),
            "churn_probability": float(zeile.churn_probability),
            "risk_level": zeile.risk_level,
            "revenue_at_risk": float(zeile.revenue_at_risk),
            "model_version": model_version,
            "predicted_at": jetzt,
        }
        for zeile in df.itertuples()
    ]

    inserted, errors = upsert_predictions(engine, rows)
    print(f"Geschrieben/aktualisiert: {inserted} von {len(rows)}\n")
    print_report(df, errors)

    if errors:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
