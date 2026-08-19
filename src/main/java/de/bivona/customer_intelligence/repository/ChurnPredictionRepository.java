package de.bivona.customer_intelligence.repository;

import de.bivona.customer_intelligence.model.ActionListSummary;
import de.bivona.customer_intelligence.model.ChurnPrediction;
import de.bivona.customer_intelligence.model.RiskLevel;
import de.bivona.customer_intelligence.model.Risikoanteil;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChurnPredictionRepository extends JpaRepository<ChurnPrediction, Long> {

    Optional<ChurnPrediction> findByCustomerId(Long customerId);

    // JOIN FETCH laedt den Customer direkt mit, statt fuer jede Zeile einzeln
    // lazy nachzuladen (sonst eine Extra-Query je Eintrag der Arbeitsliste).
    @Query("SELECT cp FROM ChurnPrediction cp JOIN FETCH cp.customer c "
            + "WHERE c.churn = false ORDER BY cp.revenueAtRisk DESC")
    List<ChurnPrediction> findActiveOrderByRevenueAtRiskDesc(Pageable pageable);

    // COALESCE, damit die Summe bei noch leerer Tabelle 0 ist und nicht null
    @Query("SELECT new de.bivona.customer_intelligence.model.ActionListSummary("
            + "COUNT(cp), COALESCE(SUM(c.monthlyCharges), 0)) "
            + "FROM ChurnPrediction cp JOIN cp.customer c "
            + "WHERE c.churn = false AND cp.riskLevel = :stufe")
    ActionListSummary summarizeByRiskLevel(@Param("stufe") RiskLevel stufe);

    // Nur noch aktive Kunden, damit die Verteilung zur Kennzahl "hohes Risiko"
    // daneben passt - fuer einen abgewanderten Kunden hat die Prognose keinen
    // Handlungswert mehr.
    @Query("SELECT new de.bivona.customer_intelligence.model.Risikoanteil(cp.riskLevel, COUNT(cp)) "
            + "FROM ChurnPrediction cp JOIN cp.customer c "
            + "WHERE c.churn = false GROUP BY cp.riskLevel")
    List<Risikoanteil> verteilungAktiveKunden();
}
