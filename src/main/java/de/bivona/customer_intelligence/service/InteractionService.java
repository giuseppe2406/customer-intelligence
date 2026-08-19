package de.bivona.customer_intelligence.service;

import de.bivona.customer_intelligence.model.Customer;
import de.bivona.customer_intelligence.model.Interaction;
import de.bivona.customer_intelligence.repository.InteractionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InteractionService {

    private final InteractionRepository interactionRepository;
    private final CustomerService customerService;

    public InteractionService(InteractionRepository interactionRepository, CustomerService customerService) {
        this.interactionRepository = interactionRepository;
        this.customerService = customerService;
    }

    public List<Interaction> findByCustomerId(Long customerId) {
        customerService.findById(customerId);
        return interactionRepository.findByCustomerIdOrderByCreatedAtDescIdDesc(customerId);
    }

    public Interaction create(Long customerId, Interaction interaction, String verfasser) {
        Customer customer = customerService.findById(customerId);
        interaction.setCustomer(customer);
        // Verfasser kommt aus dem Token, nicht aus dem Request - sonst koennte
        // jeder einen beliebigen Namen eintragen.
        interaction.setCreatedBy(verfasser);
        return interactionRepository.save(interaction);
    }
}
