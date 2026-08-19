package de.bivona.customer_intelligence.model;

// Wie viele noch aktive Kunden auf eine Risikostufe entfallen.
public record Risikoanteil(RiskLevel stufe, long kunden) {
}
