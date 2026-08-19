package de.bivona.customer_intelligence.controller;

import de.bivona.customer_intelligence.model.Interaction;
import de.bivona.customer_intelligence.service.InteractionService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/customers/{customerId}/interactions")
public class InteractionController {

    private final InteractionService interactionService;

    public InteractionController(InteractionService interactionService) {
        this.interactionService = interactionService;
    }

    @GetMapping
    public List<Interaction> findByCustomerId(@PathVariable Long customerId) {
        return interactionService.findByCustomerId(customerId);
    }

    // Principal kommt aus dem geprueften Token; daraus wird der Verfasser.
    @PostMapping
    public Interaction create(
            @PathVariable Long customerId,
            @RequestBody Interaction interaction,
            Principal principal
    ) {
        return interactionService.create(customerId, interaction, principal.getName());
    }
}
