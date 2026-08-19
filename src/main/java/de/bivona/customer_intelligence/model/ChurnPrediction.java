package de.bivona.customer_intelligence.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "churn_predictions")
@Getter
@Setter
@NoArgsConstructor
public class ChurnPrediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // unidirektional wie bei Interaction, und genau eine Vorhersage je Kunde
    // (customer_id unique) - predict.py aktualisiert bestehende Zeilen statt
    // neue anzulegen. @JsonIgnore, weil customerId in den Endpoints ohnehin
    // schon bekannt ist (URL bzw. im ActionListEntry separat eingebettet).
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false, unique = true)
    @JsonIgnore
    private Customer customer;

    @Column(nullable = false)
    private double churnProbability;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RiskLevel riskLevel;

    @Column(nullable = false)
    private BigDecimal revenueAtRisk;

    @Column(nullable = false)
    private String modelVersion;

    @Column(nullable = false)
    private LocalDateTime predictedAt;
}
