package de.bivona.customer_intelligence.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String customerId;

    private String gender;
    private Boolean seniorCitizen;
    private Boolean partner;
    private Boolean dependents;
    private Integer tenure;
    private Boolean phoneService;

    // dreiwertig in der CSV, z.B. "No phone service" -> String statt Boolean
    private String multipleLines;
    private String internetService;
    private String onlineSecurity;
    private String onlineBackup;
    private String deviceProtection;
    private String techSupport;
    private String streamingTv;
    private String streamingMovies;
    private String contract;

    private Boolean paperlessBilling;
    private String paymentMethod;
    private BigDecimal monthlyCharges;
    private BigDecimal totalCharges;
    private Boolean churn;

    // Zeitpunkt der Anlage in unserer DB, nicht Teil der CSV-Quelldaten
    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
