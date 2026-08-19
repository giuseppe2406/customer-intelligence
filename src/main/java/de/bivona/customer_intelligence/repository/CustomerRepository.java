package de.bivona.customer_intelligence.repository;

import de.bivona.customer_intelligence.model.Abwanderungsrate;
import de.bivona.customer_intelligence.model.Customer;
import de.bivona.customer_intelligence.model.KundenZeile;
import de.bivona.customer_intelligence.model.RiskLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    // LEFT JOIN, damit Kunden ohne Vorhersage nicht aus der Liste fallen.
    // Der Konstruktorausdruck holt Stammdaten und Risiko in einer einzigen
    // Abfrage, statt je Zeile eine zweite fuer die Vorhersage zu stellen.
    // Jeder Filter ist wirkungslos, solange sein Parameter null ist - so
    // deckt eine Abfrage alle Kombinationen ab.
    @Query(value = "SELECT new de.bivona.customer_intelligence.model.KundenZeile("
            + "c.id, c.customerId, c.contract, c.tenure, c.monthlyCharges, "
            + "cp.riskLevel, cp.churnProbability) "
            + "FROM Customer c LEFT JOIN ChurnPrediction cp ON cp.customer = c "
            + "WHERE (:suche IS NULL OR LOWER(c.customerId) LIKE LOWER(CONCAT('%', :suche, '%'))) "
            + "AND (:stufe IS NULL OR cp.riskLevel = :stufe) "
            + "AND (:vertragsart IS NULL OR c.contract = :vertragsart) "
            + "ORDER BY c.customerId",
            countQuery = "SELECT COUNT(c) FROM Customer c LEFT JOIN ChurnPrediction cp ON cp.customer = c "
            + "WHERE (:suche IS NULL OR LOWER(c.customerId) LIKE LOWER(CONCAT('%', :suche, '%'))) "
            + "AND (:stufe IS NULL OR cp.riskLevel = :stufe) "
            + "AND (:vertragsart IS NULL OR c.contract = :vertragsart)")
    Page<KundenZeile> suche(
            @Param("suche") String suche,
            @Param("stufe") RiskLevel stufe,
            @Param("vertragsart") String vertragsart,
            Pageable seite);

    long countByChurnTrue();

    // AVG ueber 1 und 0 ist genau der Anteil der abgewanderten Kunden - das
    // spart die Division aus zwei Summen. Gruppiert wird in der Datenbank,
    // Java bekommt nur die drei fertigen Zeilen.
    @Query("SELECT new de.bivona.customer_intelligence.model.Abwanderungsrate("
            + "c.contract, COUNT(c), AVG(CASE WHEN c.churn = true THEN 1.0 ELSE 0.0 END)) "
            + "FROM Customer c GROUP BY c.contract")
    List<Abwanderungsrate> abwanderungNachVertragsart();

    @Query("SELECT new de.bivona.customer_intelligence.model.Abwanderungsrate("
            + "c.paymentMethod, COUNT(c), AVG(CASE WHEN c.churn = true THEN 1.0 ELSE 0.0 END)) "
            + "FROM Customer c GROUP BY c.paymentMethod")
    List<Abwanderungsrate> abwanderungNachZahlungsmethode();
}
