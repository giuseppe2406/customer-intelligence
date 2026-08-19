package de.bivona.customer_intelligence.service;

import de.bivona.customer_intelligence.model.Abwanderungsrate;
import de.bivona.customer_intelligence.model.ActionListSummary;
import de.bivona.customer_intelligence.model.DashboardStats;
import de.bivona.customer_intelligence.model.RiskLevel;
import de.bivona.customer_intelligence.model.Risikoanteil;
import de.bivona.customer_intelligence.repository.ChurnPredictionRepository;
import de.bivona.customer_intelligence.repository.CustomerRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class DashboardService {

    private final CustomerRepository customerRepository;
    private final ChurnPredictionRepository churnPredictionRepository;

    public DashboardService(
            CustomerRepository customerRepository,
            ChurnPredictionRepository churnPredictionRepository
    ) {
        this.customerRepository = customerRepository;
        this.churnPredictionRepository = churnPredictionRepository;
    }

    public DashboardStats stats() {
        long kundenGesamt = customerRepository.count();
        long abgewandert = customerRepository.countByChurnTrue();

        // Dieselbe Abfrage wie die Arbeitsliste, damit beide Seiten nicht
        // unterschiedliche Zahlen fuer dasselbe zeigen koennen.
        ActionListSummary hohesRisiko = churnPredictionRepository.summarizeByRiskLevel(RiskLevel.HIGH);

        return new DashboardStats(
                kundenGesamt,
                anteil(abgewandert, kundenGesamt),
                hohesRisiko.highRiskCount(),
                hohesRisiko.highRiskRevenue(),
                nachRateAbsteigend(customerRepository.abwanderungNachVertragsart()),
                nachRateAbsteigend(customerRepository.abwanderungNachZahlungsmethode()),
                nachStufeAbsteigend(churnPredictionRepository.verteilungAktiveKunden()));
    }

    // Der laengste Balken steht oben, damit die Kernaussage unter dem Diagramm
    // die erste und die letzte Zeile vergleicht.
    private List<Abwanderungsrate> nachRateAbsteigend(List<Abwanderungsrate> gruppen) {
        return gruppen.stream()
                .sorted(Comparator.comparingDouble(Abwanderungsrate::rate).reversed())
                .toList();
    }

    private List<Risikoanteil> nachStufeAbsteigend(List<Risikoanteil> stufen) {
        return stufen.stream()
                .sorted(Comparator.comparing(Risikoanteil::stufe).reversed())
                .toList();
    }

    private double anteil(long teil, long gesamt) {
        if (gesamt == 0) {
            return 0;
        }
        return (double) teil / gesamt;
    }
}
