package de.bivona.customer_intelligence.service;

import de.bivona.customer_intelligence.model.ActionListEntry;
import de.bivona.customer_intelligence.model.ActionListSummary;
import de.bivona.customer_intelligence.model.ChurnPrediction;
import de.bivona.customer_intelligence.model.Customer;
import de.bivona.customer_intelligence.model.RiskLevel;
import de.bivona.customer_intelligence.repository.ChurnPredictionRepository;
import de.bivona.customer_intelligence.repository.InteractionRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ChurnPredictionService {

    private final ChurnPredictionRepository churnPredictionRepository;
    private final InteractionRepository interactionRepository;
    private final CustomerService customerService;

    public ChurnPredictionService(
            ChurnPredictionRepository churnPredictionRepository,
            InteractionRepository interactionRepository,
            CustomerService customerService
    ) {
        this.churnPredictionRepository = churnPredictionRepository;
        this.interactionRepository = interactionRepository;
        this.customerService = customerService;
    }

    public ChurnPrediction findByCustomerId(Long customerId) {
        customerService.findById(customerId);
        return churnPredictionRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Keine Abwanderungsprognose fuer Kunde: " + customerId));
    }

    public List<ActionListEntry> actionList(int limit) {
        return churnPredictionRepository.findActiveOrderByRevenueAtRiskDesc(PageRequest.of(0, limit))
                .stream()
                .map(this::toActionListEntry)
                .toList();
    }

    public ActionListSummary summary() {
        return churnPredictionRepository.summarizeByRiskLevel(RiskLevel.HIGH);
    }

    private ActionListEntry toActionListEntry(ChurnPrediction prediction) {
        Customer customer = prediction.getCustomer();
        long interactionCount = interactionRepository.countByCustomerId(customer.getId());
        return new ActionListEntry(
                customer,
                prediction.getChurnProbability(),
                prediction.getRiskLevel(),
                prediction.getRevenueAtRisk(),
                interactionCount
        );
    }
}
