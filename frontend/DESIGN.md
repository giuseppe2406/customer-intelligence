# Gestaltungsvorgaben Frontend

Verbindlich für alle Oberflächen in `frontend/`. Bei Konflikten mit einem
Vorschlag gilt dieses Dokument.

Leitbild: interne Fachanwendung, wie ein Werkzeug für Leute, die damit
täglich arbeiten. Nicht wie eine Produktseite, nicht wie ein Portfolio-Stück.
Dicht, ruhig, funktional.

---

## Verboten

Diese Dinge lassen eine Oberfläche sofort generisch wirken:

- Farbverläufe jeder Art. Besonders violett, indigo, blau-lila.
- Schlagschatten auf Karten, Kacheln, Tabellen. Erlaubt nur bei
  Elementen, die tatsächlich schweben: Dropdowns, Dialoge.
- Emojis in Überschriften, Buttons, Beschriftungen.
- Eckenradius über 6px.
- Zentrierte Inhaltsspalten mit Rand links und rechts. Layout ist
  linksbündig und nutzt die Breite.
- Glaseffekte, Weichzeichner, Transparenzen.
- Große farbige Kacheln mit Icon-Kreis darin.
- Animationen außer einem Farbwechsel bei Hover (120ms).
- UI-Bibliotheken: kein Bootstrap, kein Material UI, kein Tailwind,
  kein shadcn. Eigenes CSS.
- Icon-Bibliotheken. Wo ein Symbol nötig ist, ein schlichtes Inline-SVG,
  16px, einfarbig.

---

## Abstände

Ausschließlich diese Werte. Keine Zwischenwerte, keine krummen Zahlen.

```
4px   innerhalb einer Zeile
8px   zwischen eng zusammengehörenden Elementen
12px  Innenabstand Tabellenzellen
16px  Innenabstand Karten, Abstand zwischen Feldern
24px  zwischen Abschnitten
32px  Seitenrand
48px  zwischen großen Blöcken
```

---

## Typografie

Eine Schrift, wenige Größen. Gewicht trägt die Hierarchie, nicht Größe.

```
Schriftfamilie: system-ui, -apple-system, "Segoe UI", sans-serif

11px / 600 / 0.04em Laufweite / GROSSBUCHSTABEN / gedämpft
      → Tabellenköpfe, Kleinbeschriftungen über Kennzahlen
13px / 400 → Tabelleninhalt, Fließtext, Formularfelder
14px / 600 → Abschnittsüberschriften
15px / 600 → Seitentitel
28px / 600 / tabular-nums → Kennzahlen
```

Zeilenhöhe 1.45 im Text, 1.2 bei Zahlen und Überschriften.

Keine Gewichte über 600. Kein Fett-Kursiv. Keine zweite Schriftart.

Zahlen in Tabellenspalten und Kennzahlen immer mit
`font-variant-numeric: tabular-nums`, sonst springen die Ziffern.

---

## Farben

Aus `tokens.css`, geprüfte Palette. Grau macht die Arbeit, Farbe ist
die Ausnahme.

```
--page:           #f9f9f7    Seitenhintergrund
--surface:        #fcfcfb    Tabellen, Karten
--border:         rgba(11,11,11,0.10)
--gridline:       #e1e0d9

--text-primary:   #0b0b0b    Inhalt
--text-secondary: #52514e    Nebeninformation
--text-muted:     #898781    Beschriftungen, Achsen

--accent:         #2a78d6    Links, aktive Navigation, Diagramme

--risk-high:      #d03b3b
--risk-medium:    #fab219
--risk-low:       #0ca30c
```

**Faustregel:** Pro Bildschirm erscheint der Akzent höchstens dreimal.
Wenn mehr, ist etwas falsch gewichtet.

**Farbe steht nie allein.** Eine Risikostufe zeigt immer auch Text.
Ein farbiger Punkt ohne Beschriftung ist für farbfehlsichtige Nutzer
bedeutungslos, und `--risk-medium` erreicht auf hellem Grund ohnehin
keinen ausreichenden Kontrast.

---

## Layout

Feste Seitenleiste links, 220px, Hintergrund `--page`, rechte Kante als
Haarlinie. Darin der Projektname oben und die Navigation darunter:
Arbeitsliste, Kunden, Dashboard. Der aktive Eintrag bekommt einen
2px-Balken links in `--accent` und Text in `--text-primary`, die
übrigen `--text-secondary`.

Rechts der Inhaltsbereich mit 32px Rand. Oben eine Zeile mit dem
Seitentitel links und dem angemeldeten Benutzer plus Abmelden rechts,
darunter eine Haarlinie.

Inhalt beginnt links und nutzt die volle Breite. Keine zentrierte Spalte.

---

## Tabellen

Das wichtigste Element dieser Anwendung. Dicht, nicht luftig.

- Zeilenhöhe 36px, Innenabstand 12px
- Kopfzeile: 11px, Großbuchstaben, `--text-muted`, darunter Haarlinie
  in `--gridline`
- Trennlinien nur zwischen Zeilen, in `--gridline`. Keine senkrechten
  Linien, kein Rahmen um die Tabelle.
- Kein Zebrastreifen
- Hover: Zeilenhintergrund `rgba(11,11,11,0.03)`, 120ms
- Zahlenspalten rechtsbündig mit tabular-nums, Text linksbündig
- Beträge einheitlich mit zwei Nachkommastellen und Tausenderpunkt
- Sortierbare Spaltenköpfe zeigen ein kleines Dreieck, 8px, gedämpft

---

## Kennzahlen

Kein Kachel-Raster mit Rahmen und Schatten. Stattdessen eine Reihe,
durch senkrechte Haarlinien getrennt:

```
ABWANDERUNGSRATE      UMSATZ IM RISIKO      HOHES RISIKO      KUNDEN
26,5 %                52.852,40 €           650               7.043
```

Beschriftung 11px in Großbuchstaben und `--text-muted`, darunter die
Zahl in 28px/600. Abstand 48px zwischen den Einträgen. Kein Rahmen,
kein Hintergrund, kein Icon.

Eine Kennzahl darf farbig sein, wenn die Farbe eine Aussage trägt –
etwa das Umsatzrisiko in `--risk-high`. Die übrigen bleiben schwarz.

---

## Abzeichen für Risikostufen

Kleines Rechteck, 4px Radius, 2px/8px Innenabstand, 11px/600.
Farbiger Text auf schwach getöntem Grund, keine Vollfläche:

```
HOCH     Text #d03b3b   Grund rgba(208,59,59,0.10)
MITTEL   Text #8a6100   Grund rgba(250,178,25,0.15)
NIEDRIG  Text #0a7a0a   Grund rgba(12,163,12,0.10)
```

Bei Mittel ist der Text bewusst dunkler als die Tokenfarbe, sonst
reicht der Kontrast nicht.

---

## Formulare und Schaltflächen

Eingabefelder: 32px hoch, 1px Rand in `--border`, 4px Radius, 13px.
Bei Fokus Rand in `--accent`, kein Leuchten, kein Schatten.
Beschriftung 11px Großbuchstaben darüber, 4px Abstand.

Primäre Schaltfläche: Grund `--accent`, weißer Text, 32px hoch,
4px Radius, 13px/600, waagerechter Innenabstand 16px.
Sekundäre: transparenter Grund, 1px Rand, Text `--text-primary`.

Pro Bildschirm höchstens eine primäre Schaltfläche.

---

## Diagramme

- Balken statt Torten. Immer.
- Eine Achse. Niemals zwei Skalen in einem Diagramm.
- Balken in `--accent`, Datenende mit 4px Radius, an der Grundlinie
  ansetzend, 2px Abstand zwischen Balken
- Gitternetz nur waagerecht, Haarlinie in `--gridline`
- Achsenbeschriftung 11px in `--text-muted`
- Keine Legende bei nur einer Reihe. Ab zwei Reihen Legende und
  zusätzlich Direktbeschriftung.
- Keine Werte an jedem Balken, nur an den hervorgehobenen
- Keine 3D-Effekte, keine Schatten, keine Verläufe in den Flächen

---

## Zustände

Diese drei werden gerne vergessen und fallen sofort auf, wenn sie fehlen.

**Lädt:** Die Tabellenstruktur bleibt stehen, Zellen zeigen graue
Platzhalterbalken. Kein Kreisel in der Bildschirmmitte.

**Leer:** Kurzer Satz in `--text-secondary`, der erklärt warum nichts
da ist und was zu tun wäre. Kein Bild, kein Emoji.

**Fehler:** Verständlicher Satz plus eine Schaltfläche zum erneuten
Versuchen. Keine Rohausgabe des Fehlers, keine Statuscodes für den
Nutzer.

---

## Prüfung vor Abgabe

Ein Bildschirm ist fertig, wenn:

- kein Farbverlauf, kein Schatten außer bei schwebenden Elementen
- höchstens drei Akzentfarbeinsätze sichtbar
- alle Abstände aus der Skala stammen
- höchstens fünf verschiedene Schriftgrößen im Einsatz
- Zahlenspalten rechtsbündig und mit tabular-nums
- Lade-, Leer- und Fehlerzustand vorhanden
- die Seite bei 1280px Breite ohne waagerechtes Scrollen funktioniert
