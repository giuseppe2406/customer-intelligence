package de.bivona.customer_intelligence.service;

import de.bivona.customer_intelligence.model.ChurnPrediction;
import de.bivona.customer_intelligence.model.Customer;
import de.bivona.customer_intelligence.model.KundeDetail;
import de.bivona.customer_intelligence.model.KundenSeite;
import de.bivona.customer_intelligence.model.KundenZeile;
import de.bivona.customer_intelligence.model.RiskLevel;
import de.bivona.customer_intelligence.repository.ChurnPredictionRepository;
import de.bivona.customer_intelligence.repository.CustomerRepository;
import de.bivona.customer_intelligence.repository.InteractionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CustomerService {

    // Deckel gegen einen manipulierten size-Parameter, der sonst alle 7043
    // Datensaetze auf einmal zoege.
    private static final int MAX_SEITENGROESSE = 200;

    private final CustomerRepository customerRepository;
    private final ChurnPredictionRepository churnPredictionRepository;
    private final InteractionRepository interactionRepository;

    public CustomerService(
            CustomerRepository customerRepository,
            ChurnPredictionRepository churnPredictionRepository,
            InteractionRepository interactionRepository
    ) {
        this.customerRepository = customerRepository;
        this.churnPredictionRepository = churnPredictionRepository;
        this.interactionRepository = interactionRepository;
    }

    public KundenSeite suche(String suche, RiskLevel stufe, String vertragsart, int seite, int seitengroesse) {
        int geprueftGroesse = Math.clamp(seitengroesse, 1, MAX_SEITENGROESSE);
        int geprueftSeite = Math.max(seite, 0);

        Page<KundenZeile> ergebnis = customerRepository.suche(
                leerAlsKeinFilter(suche),
                stufe,
                leerAlsKeinFilter(vertragsart),
                PageRequest.of(geprueftSeite, geprueftGroesse));

        return new KundenSeite(
                ergebnis.getContent(),
                ergebnis.getTotalElements(),
                geprueftSeite,
                geprueftGroesse);
    }

    public KundeDetail detail(Long id) {
        Customer customer = findById(id);
        ChurnPrediction vorhersage = churnPredictionRepository.findByCustomerId(id).orElse(null);
        long interactionCount = interactionRepository.countByCustomerId(id);

        if (vorhersage == null) {
            return new KundeDetail(customer, null, null, null, interactionCount);
        }

        return new KundeDetail(
                customer,
                vorhersage.getChurnProbability(),
                vorhersage.getRiskLevel(),
                vorhersage.getRevenueAtRisk(),
                interactionCount);
    }

    public Customer findById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kunde nicht gefunden: " + id));
    }

    public Customer save(Customer customer) {
        return customerRepository.save(customer);
    }

    public Customer update(Long id, Customer customer) {
        Customer vorhandenerKunde = findById(id);

        vorhandenerKunde.setCustomerId(customer.getCustomerId());
        vorhandenerKunde.setGender(customer.getGender());
        vorhandenerKunde.setSeniorCitizen(customer.getSeniorCitizen());
        vorhandenerKunde.setPartner(customer.getPartner());
        vorhandenerKunde.setDependents(customer.getDependents());
        vorhandenerKunde.setTenure(customer.getTenure());
        vorhandenerKunde.setPhoneService(customer.getPhoneService());
        vorhandenerKunde.setMultipleLines(customer.getMultipleLines());
        vorhandenerKunde.setInternetService(customer.getInternetService());
        vorhandenerKunde.setOnlineSecurity(customer.getOnlineSecurity());
        vorhandenerKunde.setOnlineBackup(customer.getOnlineBackup());
        vorhandenerKunde.setDeviceProtection(customer.getDeviceProtection());
        vorhandenerKunde.setTechSupport(customer.getTechSupport());
        vorhandenerKunde.setStreamingTv(customer.getStreamingTv());
        vorhandenerKunde.setStreamingMovies(customer.getStreamingMovies());
        vorhandenerKunde.setContract(customer.getContract());
        vorhandenerKunde.setPaperlessBilling(customer.getPaperlessBilling());
        vorhandenerKunde.setPaymentMethod(customer.getPaymentMethod());
        vorhandenerKunde.setMonthlyCharges(customer.getMonthlyCharges());
        vorhandenerKunde.setTotalCharges(customer.getTotalCharges());
        vorhandenerKunde.setChurn(customer.getChurn());

        return customerRepository.save(vorhandenerKunde);
    }

    public void delete(Long id) {
        customerRepository.delete(findById(id));
    }

    // Ein leeres Suchfeld schickt einen leeren String - der soll "kein Filter"
    // bedeuten und nicht "customerId ist leer".
    private String leerAlsKeinFilter(String wert) {
        if (wert == null || wert.isBlank()) {
            return null;
        }
        return wert.trim();
    }
}
