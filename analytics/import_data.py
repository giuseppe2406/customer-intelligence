"""Importiert den Telco-Churn-Datensatz in die MySQL-Tabelle "customers".

Mehrfach ausführbar: bestehende Zeilen (gleiche customer_id) werden per
"INSERT ... ON DUPLICATE KEY UPDATE" aktualisiert statt dupliziert.
"""
import os
import sys
from datetime import datetime
from pathlib import Path

import pandas as pd
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

BASE_DIR = Path(__file__).resolve().parent
CSV_PATH = BASE_DIR / "data" / "telco_churn.csv"
ENV_PATH = BASE_DIR / ".env"

# Reine Yes/No-Spalten -> Boolean, passend zu den Entity-Feldern aus Etappe 1
BOOLEAN_COLUMNS = {
    "Partner": "partner",
    "Dependents": "dependents",
    "PhoneService": "phone_service",
    "PaperlessBilling": "paperless_billing",
    "Churn": "churn",
}

# Dreiwertige Spalten (z.B. "No internet service") bleiben String
STRING_COLUMNS = {
    "customerID": "customer_id",
    "gender": "gender",
    "MultipleLines": "multiple_lines",
    "InternetService": "internet_service",
    "OnlineSecurity": "online_security",
    "OnlineBackup": "online_backup",
    "DeviceProtection": "device_protection",
    "TechSupport": "tech_support",
    "StreamingTV": "streaming_tv",
    "StreamingMovies": "streaming_movies",
    "Contract": "contract",
    "PaymentMethod": "payment_method",
}

NUMERIC_COLUMNS = {
    "tenure": "tenure",
    "MonthlyCharges": "monthly_charges",
    "TotalCharges": "total_charges",
}

COLUMN_MAPPING = {
    "SeniorCitizen": "senior_citizen",
    **BOOLEAN_COLUMNS,
    **STRING_COLUMNS,
    **NUMERIC_COLUMNS,
}

# DB-Spaltenreihenfolge für INSERT und Prüfbericht, aus demselben Mapping abgeleitet,
# damit CSV-Spalten und DB-Spalten nie auseinanderlaufen.
DB_COLUMNS = list(COLUMN_MAPPING.values()) + ["created_at"]


def build_engine():
    load_dotenv(ENV_PATH)
    url = (
        f"mysql+pymysql://{os.environ['DB_USER']}:{os.environ['DB_PASSWORD']}"
        f"@{os.environ['DB_HOST']}:{os.environ['DB_PORT']}/{os.environ['DB_NAME']}"
    )
    return create_engine(url)


def load_and_clean_csv():
    df = pd.read_csv(CSV_PATH)

    # TotalCharges ist als Text gespeichert und bei 11 Zeilen leer (tenure = 0,
    # brandneue Kunden). to_numeric macht daraus NaN. Bei tenure = 0 wurde
    # noch nichts abgerechnet, daher ist 0.0 der sachlich korrekte Wert.
    df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")
    unerwartet_leer = df[df["TotalCharges"].isna() & (df["tenure"] != 0)]
    if not unerwartet_leer.empty:
        raise ValueError(
            f"{len(unerwartet_leer)} Zeile(n) haben leeres TotalCharges bei "
            "tenure != 0 - das ist der bekannte Fall nicht, bitte manuell prüfen."
        )
    df["TotalCharges"] = df["TotalCharges"].fillna(0.0)

    df["SeniorCitizen"] = df["SeniorCitizen"].astype(bool)
    for spalte in BOOLEAN_COLUMNS:
        df[spalte] = df[spalte].map({"Yes": True, "No": False})

    return df.rename(columns=COLUMN_MAPPING)


def to_db_rows(df):
    now = datetime.now()
    for row in df.to_dict("records"):
        yield {
            "customer_id": str(row["customer_id"]),
            "gender": str(row["gender"]),
            "senior_citizen": bool(row["senior_citizen"]),
            "partner": bool(row["partner"]),
            "dependents": bool(row["dependents"]),
            "tenure": int(row["tenure"]),
            "phone_service": bool(row["phone_service"]),
            "multiple_lines": str(row["multiple_lines"]),
            "internet_service": str(row["internet_service"]),
            "online_security": str(row["online_security"]),
            "online_backup": str(row["online_backup"]),
            "device_protection": str(row["device_protection"]),
            "tech_support": str(row["tech_support"]),
            "streaming_tv": str(row["streaming_tv"]),
            "streaming_movies": str(row["streaming_movies"]),
            "contract": str(row["contract"]),
            "paperless_billing": bool(row["paperless_billing"]),
            "payment_method": str(row["payment_method"]),
            "monthly_charges": float(row["monthly_charges"]),
            "total_charges": float(row["total_charges"]),
            "churn": bool(row["churn"]),
            "created_at": now,
        }


def build_upsert_statement():
    columns = ", ".join(DB_COLUMNS)
    placeholders = ", ".join(f":{c}" for c in DB_COLUMNS)
    # created_at bleibt beim Update unangetastet, damit der ursprüngliche
    # Anlage-Zeitpunkt bei einem erneuten Lauf nicht überschrieben wird.
    updates = ", ".join(
        f"{c} = VALUES({c})" for c in DB_COLUMNS if c not in ("customer_id", "created_at")
    )
    return text(
        f"INSERT INTO customers ({columns}) VALUES ({placeholders}) "
        f"ON DUPLICATE KEY UPDATE {updates}"
    )


def import_rows(engine, rows):
    statement = build_upsert_statement()
    imported = 0
    errors = []
    with engine.connect() as connection:
        for row in rows:
            try:
                with connection.begin():
                    connection.execute(statement, row)
                imported += 1
            except SQLAlchemyError as exc:
                errors.append((row["customer_id"], str(exc)))
    return imported, errors


def print_report(engine):
    with engine.connect() as connection:
        total = connection.execute(text("SELECT COUNT(*) FROM customers")).scalar()
        print(f"\nZeilen in customers: {total}")

        print("\nNull-Werte je Spalte:")
        for spalte in DB_COLUMNS:
            null_count = connection.execute(
                text(f"SELECT COUNT(*) FROM customers WHERE {spalte} IS NULL")
            ).scalar()
            print(f"  {spalte}: {null_count}")

        print("\nVerteilung churn:")
        result = connection.execute(
            text(
                "SELECT CAST(churn AS UNSIGNED) AS churn_wert, COUNT(*) AS anzahl "
                "FROM customers GROUP BY churn_wert"
            )
        )
        for row in result:
            label = "Ja" if row.churn_wert == 1 else "Nein"
            print(f"  {label}: {row.anzahl}")


def main():
    engine = build_engine()
    df = load_and_clean_csv()
    imported, errors = import_rows(engine, to_db_rows(df))

    print(f"Erfolgreich importiert/aktualisiert: {imported} von {len(df)} Zeilen")

    if errors:
        print(f"\n{len(errors)} Zeile(n) konnten NICHT importiert werden:")
        for customer_id, message in errors:
            print(f"  - {customer_id}: {message}")

    print_report(engine)

    if errors:
        sys.exit(1)


if __name__ == "__main__":
    main()
