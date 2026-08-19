package de.bivona.customer_intelligence.controller;

import de.bivona.customer_intelligence.model.ActionListEntry;
import de.bivona.customer_intelligence.model.ActionListSummary;
import de.bivona.customer_intelligence.model.ChurnPrediction;
import de.bivona.customer_intelligence.service.ChurnPredictionService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ChurnPredictionController {

    private final ChurnPredictionService churnPredictionService;

    public ChurnPredictionController(ChurnPredictionService churnPredictionService) {
        this.churnPredictionService = churnPredictionService;
    }

    @GetMapping("/api/customers/{customerId}/churn-prediction")
    public ChurnPrediction findByCustomerId(@PathVariable Long customerId) {
        return churnPredictionService.findByCustomerId(customerId);
    }

    @GetMapping("/api/action-list")
    public List<ActionListEntry> actionList(@RequestParam(defaultValue = "20") int limit) {
        return churnPredictionService.actionList(limit);
    }

    @GetMapping("/api/action-list/kennzahlen")
    public ActionListSummary summary() {
        return churnPredictionService.summary();
    }
}
