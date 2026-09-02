package com.transglobe.policy.service;

import com.transglobe.policy.config.PricingProperties;
import com.transglobe.policy.dto.PolicyRequest;
import com.transglobe.policy.exception.PolicyNotFoundException;
import com.transglobe.policy.exception.UnsupportedPolicyTypeException;
import com.transglobe.policy.model.Policy;
import com.transglobe.policy.repository.PolicyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * MODERNIZED 測試：建構子注入讓測試能直接注入相依性（不需要反射），且斷言
 * 使用型別化的 Policy getter，而非 Map key。
 */
class PolicyServiceTest {

    private PolicyService policyService;

    @BeforeEach
    void setUp() {
        PricingProperties pricingProperties = new PricingProperties();
        pricingProperties.setBaseRates(Map.of(
                "LIFE", 0.02,
                "HEALTH", 0.03,
                "AUTO", 0.05
        ));
        pricingProperties.setSeniorAgeThreshold(60);
        pricingProperties.setSeniorSurchargeRate(0.15);
        pricingProperties.setMinimumPremium(500.0);

        policyService = new PolicyService(new PolicyRepository(), pricingProperties);
    }

    @Test
    void createPolicy_computesPremiumFromConfiguredRate() {
        PolicyRequest request = new PolicyRequest();
        request.setPolicyHolderName("Alice Wu");
        request.setAge(30);
        request.setPolicyType("life");
        request.setSumInsured(100_000.0);

        Policy policy = policyService.createPolicy(request);

        assertThat(policy.getPolicyNumber()).isNotNull();
        assertThat(policy.getPolicyType()).isEqualTo("LIFE");
        assertThat(policy.getPremium()).isEqualTo(2000.0); // 100000 * 0.02
        assertThat(policy.getStatus()).isEqualTo("ACTIVE");
    }

    @Test
    void createPolicy_appliesSeniorSurcharge() {
        PolicyRequest request = new PolicyRequest();
        request.setPolicyHolderName("Bob Chen");
        request.setAge(65);
        request.setPolicyType("HEALTH");
        request.setSumInsured(100_000.0);

        Policy policy = policyService.createPolicy(request);

        // 100000 * 0.03 = 3000，長者附加費 15% => 3450
        assertThat(policy.getPremium()).isEqualTo(3450.0);
    }

    @Test
    void createPolicy_appliesMinimumPremiumFloor() {
        PolicyRequest request = new PolicyRequest();
        request.setPolicyHolderName("Cara Lin");
        request.setAge(25);
        request.setPolicyType("AUTO");
        request.setSumInsured(1_000.0);

        Policy policy = policyService.createPolicy(request);

        // 1000 * 0.05 = 50，低於設定的 minimumPremium(500)，因此套用下限
        assertThat(policy.getPremium()).isEqualTo(500.0);
    }

    @Test
    void createPolicy_unknownPolicyType_throwsUnsupportedPolicyTypeException() {
        PolicyRequest request = new PolicyRequest();
        request.setPolicyHolderName("Dan Wu");
        request.setAge(40);
        request.setPolicyType("PET");
        request.setSumInsured(10_000.0);

        assertThatThrownBy(() -> policyService.createPolicy(request))
                .isInstanceOf(UnsupportedPolicyTypeException.class)
                .hasMessageContaining("Unknown policy type");
    }

    @Test
    void getPolicy_unknownPolicyNumber_throwsPolicyNotFoundException() {
        assertThatThrownBy(() -> policyService.getPolicy("POL-DOES-NOT-EXIST"))
                .isInstanceOf(PolicyNotFoundException.class)
                .hasMessageContaining("POL-DOES-NOT-EXIST");
    }

    @Test
    void getPolicy_afterCreate_returnsStoredPolicy() {
        PolicyRequest request = new PolicyRequest();
        request.setPolicyHolderName("Eva Huang");
        request.setAge(50);
        request.setPolicyType("AUTO");
        request.setSumInsured(50_000.0);
        Policy created = policyService.createPolicy(request);

        Policy fetched = policyService.getPolicy(created.getPolicyNumber());

        assertThat(fetched.getPolicyHolderName()).isEqualTo("Eva Huang");
    }
}
