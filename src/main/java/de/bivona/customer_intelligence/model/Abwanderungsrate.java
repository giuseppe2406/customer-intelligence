package de.bivona.customer_intelligence.model;

// Abwanderungsrate einer Gruppe, etwa einer Vertragsart. rate ist ein Anteil
// zwischen 0 und 1, kunden die Groesse der Gruppe.
public record Abwanderungsrate(String gruppe, long kunden, double rate) {
}
