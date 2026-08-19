"""Erzeugt synthetische CRM-Interaktionen (Anrufe, E-Mails, Termine, Notizen) je Kunde.

Diese Daten sind erfunden, weil es dafuer keinen oeffentlichen Datensatz gibt
(anders als beim Telco-Churn-Datensatz aus Etappe 2). Das ist hier vertretbar,
weil Interaktionen bewusst NICHT ins spaetere Churn-Modell einfliessen, sondern
nur die Anwendung bedienbar machen (CRM-Historie in der Oberflaeche).

Mehrfach ausfuehrbar: Kunden, die schon mindestens eine Interaktion haben,
werden uebersprungen (siehe load_candidate_customers). So entstehen nie
Duplikate, egal ob durch einen frueheren Skript-Lauf oder durch echte
Eintraege ueber die REST-API.
"""
import os
import random
from datetime import datetime, timedelta
from pathlib import Path

from dateutil.relativedelta import relativedelta
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

BASE_DIR = Path(__file__).resolve().parent
ENV_PATH = BASE_DIR / ".env"

SEED = 42  # fester Startwert, damit derselbe Datenbestand reproduzierbar entsteht

CALL_TEMPLATES = [
    "Rückfrage zum aktuellen Tarif.",
    "Kunde erkundigt sich nach Zusatzoptionen.",
    "Anruf wegen einer Frage zur letzten Rechnung.",
    "Kunde möchte den Vertrag verlängern.",
]

CALL_COMPLAINT_TEMPLATES = [
    "Kunde beschwert sich über wiederholte Verbindungsabbrüche.",
    "Kunde ist unzufrieden mit den monatlichen Kosten und erwägt Kündigung.",
    "Rückruf wegen eines ungelösten Problems aus einem früheren Gespräch.",
    "Kunde beschwert sich über die Wartezeit in der Hotline.",
    "Kunde droht mit Anbieterwechsel wegen wiederholter Störungen.",
]

EMAIL_TEMPLATES = [
    "E-Mail-Anfrage zur aktuellen Rechnung gesendet.",
    "Vertragsunterlagen per E-Mail verschickt.",
    "Kunde fragt per E-Mail nach einem Tarifwechsel.",
    "Bestätigung der Vertragsverlängerung per E-Mail versendet.",
]

MEETING_TEMPLATES = [
    "Beratungstermin zur Vertragsverlängerung durchgeführt.",
    "Vor-Ort-Termin zur Geräteinstallation.",
    "Videotermin zur Tarifberatung wahrgenommen.",
    "Termin im Shop zur Vertragsunterschrift.",
]

NOTE_TEMPLATES = [
    "Notiz: Kunde bevorzugt Kontakt per E-Mail.",
    "Notiz: Kunde erwägt einen Tarifwechsel.",
    "Notiz: Zahlungsart wurde auf Wunsch des Kunden geändert.",
    "Notiz: Kunde ist mit dem aktuellen Tarif zufrieden.",
]

AGENTS = [
    "Anna Berger",
    "Tom Fischer",
    "Lena Hoffmann",
    "Markus Weber",
    "Sophie Klein",
    "Kundenservice-Team",
]


def build_engine():
    load_dotenv(ENV_PATH)
    url = (
        f"mysql+pymysql://{os.environ['DB_USER']}:{os.environ['DB_PASSWORD']}"
        f"@{os.environ['DB_HOST']}:{os.environ['DB_PORT']}/{os.environ['DB_NAME']}"
    )
    return create_engine(url)


def count_all_customers(engine):
    with engine.connect() as connection:
        return connection.execute(text("SELECT COUNT(*) FROM customers")).scalar()


def load_candidate_customers(engine):
    # CAST auf UNSIGNED, weil MySQL churn als bit(1) liefert - als rohe bytes
    # waere b'\x00' (False) in Python truthy und wuerde die Gewichtung verfaelschen.
    query = text(
        """
        SELECT c.id, c.tenure, CAST(c.churn AS UNSIGNED) AS churn
        FROM customers c
        LEFT JOIN interactions i ON i.customer_id = c.id
        WHERE i.id IS NULL
        """
    )
    with engine.connect() as connection:
        return connection.execute(query).mappings().all()


def contract_window(tenure, today):
    start = today - relativedelta(months=int(tenure))
    return start, today


def random_timestamp(start, end, rng):
    span_seconds = int((end - start).total_seconds())
    if span_seconds <= 0:
        return start
    return start + timedelta(seconds=rng.randint(0, span_seconds))


def pick_type(churn, rng):
    if churn:
        weights = {"CALL": 55, "EMAIL": 20, "MEETING": 10, "NOTE": 15}
    else:
        weights = {"CALL": 25, "EMAIL": 30, "MEETING": 25, "NOTE": 20}
    return rng.choices(list(weights.keys()), weights=list(weights.values()), k=1)[0]


def pick_count(churn, rng):
    # Index = Anzahl (0 bis 5). Churn-Kunden bekommen tendenziell mehr Eintraege.
    weights = [10, 15, 20, 20, 20, 15] if churn else [25, 25, 20, 15, 10, 5]
    return rng.choices(range(6), weights=weights, k=1)[0]


def pick_content(interaction_type, churn, rng):
    if interaction_type == "CALL":
        if churn and rng.random() < 0.7:
            return rng.choice(CALL_COMPLAINT_TEMPLATES)
        return rng.choice(CALL_TEMPLATES)
    if interaction_type == "EMAIL":
        return rng.choice(EMAIL_TEMPLATES)
    if interaction_type == "MEETING":
        return rng.choice(MEETING_TEMPLATES)
    return rng.choice(NOTE_TEMPLATES)


def generate_for_customer(customer, today):
    # Eigener Zufallsgenerator je Kunde (Seed + Kunden-ID), nicht ein einziger
    # fortlaufender rng über alle Kandidaten: sonst haengt das Ergebnis eines
    # Kunden davon ab, welche anderen Kunden im selben Lauf verarbeitet werden.
    # Wichtig fuer Kunden mit Ergebnis 0 - die haben keine Zeile in der Tabelle
    # und würden sonst bei jedem erneuten Lauf neu (und anders) ausgewuerfelt.
    rng = random.Random(SEED + customer["id"])
    start, end = contract_window(customer["tenure"], today)
    rows = []
    for _ in range(pick_count(customer["churn"], rng)):
        interaction_type = pick_type(customer["churn"], rng)
        created_at = random_timestamp(start, end, rng)
        assert start <= created_at <= today, "createdAt außerhalb der Vertragslaufzeit"
        rows.append(
            {
                "customer_id": customer["id"],
                "type": interaction_type,
                "content": pick_content(interaction_type, customer["churn"], rng),
                "created_by": rng.choice(AGENTS),
                "created_at": created_at,
            }
        )
    return rows


INSERT_SQL = text(
    """
    INSERT INTO interactions (customer_id, type, content, created_by, created_at)
    VALUES (:customer_id, :type, :content, :created_by, :created_at)
    """
)


def insert_rows(engine, rows):
    inserted = 0
    errors = []
    with engine.connect() as connection:
        for row in rows:
            try:
                with connection.begin():
                    connection.execute(INSERT_SQL, row)
                inserted += 1
            except SQLAlchemyError as exc:
                errors.append((row["customer_id"], str(exc)))
    return inserted, errors


def print_report(rows, skipped, inserted, errors):
    print(f"Kunden übersprungen (hatten schon Interaktionen): {skipped}")
    print(f"Neue Interaktionen eingefügt: {inserted} von {len(rows)}")

    if errors:
        print(f"\n{len(errors)} Interaktion(en) konnten NICHT eingefügt werden:")
        for customer_id, message in errors:
            print(f"  - Kunde (id={customer_id}): {message}")

    counts_by_type = {}
    for row in rows:
        counts_by_type[row["type"]] = counts_by_type.get(row["type"], 0) + 1

    print("\nVerteilung nach Typ:")
    for interaction_type in ("CALL", "EMAIL", "MEETING", "NOTE"):
        print(f"  {interaction_type}: {counts_by_type.get(interaction_type, 0)}")


def main():
    today = datetime.now()

    engine = build_engine()
    total_customers = count_all_customers(engine)
    candidates = load_candidate_customers(engine)
    skipped = total_customers - len(candidates)

    rows = []
    for customer in candidates:
        rows.extend(generate_for_customer(customer, today))

    inserted, errors = insert_rows(engine, rows)
    print_report(rows, skipped, inserted, errors)

    if errors:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
