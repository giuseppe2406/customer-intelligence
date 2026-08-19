package de.bivona.customer_intelligence.controller;

import de.bivona.customer_intelligence.model.Customer;
import de.bivona.customer_intelligence.model.KundeDetail;
import de.bivona.customer_intelligence.model.KundenSeite;
import de.bivona.customer_intelligence.model.RiskLevel;
import de.bivona.customer_intelligence.service.CustomerService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    // Geblaettert statt alles auf einmal: 7043 Datensaetze in einer Antwort
    // sind weder fuer die API noch fuer den Browser sinnvoll.
    @GetMapping
    public KundenSeite suche(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) RiskLevel riskLevel,
            @RequestParam(required = false) String contract,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return customerService.suche(search, riskLevel, contract, page, size);
    }

    @GetMapping("/{id}")
    public KundeDetail findById(@PathVariable Long id) {
        return customerService.detail(id);
    }

    @PostMapping
    public Customer create(@RequestBody Customer customer) {
        return customerService.save(customer);
    }

    @PutMapping("/{id}")
    public Customer update(@PathVariable Long id, @RequestBody Customer customer) {
        return customerService.update(id, customer);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        customerService.delete(id);
    }
}
