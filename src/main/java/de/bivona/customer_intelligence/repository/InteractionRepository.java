package de.bivona.customer_intelligence.repository;

import de.bivona.customer_intelligence.model.Interaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InteractionRepository extends JpaRepository<Interaction, Long> {
    // Neueste zuerst; die Id entscheidet, wenn zwei den gleichen Zeitpunkt haben.
    List<Interaction> findByCustomerIdOrderByCreatedAtDescIdDesc(Long customerId);

    long countByCustomerId(Long customerId);
}
