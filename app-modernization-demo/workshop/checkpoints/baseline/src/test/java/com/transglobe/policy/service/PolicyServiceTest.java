package com.transglobe.policy.service;

import com.transglobe.policy.dto.PolicyRequest;
import com.transglobe.policy.repository.PolicyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * BASELINE 測試：由於 PolicyService 回傳 Map<String, Object> 而非型別化的
 * DTO，因此以原始的 Map key 進行斷言。
 */
class PolicyServiceTest {

    private PolicyService policyService;

    @BeforeEach
    void setUp() {
        policyService = new PolicyService();
        // 欄位注入代表我們必須透過不使用反射的 setter 替代方式來注入：
        // baseline 類別未為 repository 提供任何建構子，因此我們沿用整個 baseline
        // 測試套件中所使用的 package-private 欄位存取模式。
        setRepository(policyService, new PolicyRepository());
    }

    private static void setRepository(PolicyService service, PolicyRepository repository) {
        try {
            var field = PolicyService.class.getDeclaredField("policyRepository");
            field.setAccessible(true);
            field.set(service, repository);
        } catch (ReflectiveOperationException e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void createPolicy_computesPremiumFromHardCodedRate() {
        PolicyRequest request = new PolicyRequest();
        request.setPolicyHolderName("Alice Wu");
        request.setAge(30);
        request.setPolicyType("life");
        request.setSumInsured(100_000.0);

        Map<String, Object> result = policyService.createPolicy(request);

        assertThat(result.get("policyNumber")).isNotNull();
        assertThat(result.get("policyType")).isEqualTo("LIFE");
        assertThat(result.get("premium")).isEqualTo(2000.0); // 100000 * 0.02
        assertThat(result.get("status")).isEqualTo("ACTIVE");
    }

    @Test
    void createPolicy_appliesSeniorSurcharge() {
        PolicyRequest request = new PolicyRequest();
        request.setPolicyHolderName("Bob Chen");
        request.setAge(65);
        request.setPolicyType("HEALTH");
        request.setSumInsured(100_000.0);

        Map<String, Object> result = policyService.createPolicy(request);

        // 100000 * 0.03 = 3000，長者附加費 15% => 3450
        assertThat(result.get("premium")).isEqualTo(3450.0);
    }

    @Test
    void createPolicy_appliesMinimumPremiumFloor() {
        PolicyRequest request = new PolicyRequest();
        request.setPolicyHolderName("Cara Lin");
        request.setAge(25);
        request.setPolicyType("AUTO");
        request.setSumInsured(1_000.0);

        Map<String, Object> result = policyService.createPolicy(request);

        // 1000 * 0.05 = 50，低於 MINIMUM_PREMIUM(500)，因此套用下限
        assertThat(result.get("premium")).isEqualTo(500.0);
    }

    @Test
    void createPolicy_unknownPolicyType_throwsIllegalArgumentException() {
        PolicyRequest request = new PolicyRequest();
        request.setPolicyHolderName("Dan Wu");
        request.setAge(40);
        request.setPolicyType("PET");
        request.setSumInsured(10_000.0);

        assertThatThrownBy(() -> policyService.createPolicy(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Unknown policy type");
    }

    @Test
    void getPolicy_unknownPolicyNumber_returnsNull() {
        assertThat(policyService.getPolicy("POL-DOES-NOT-EXIST")).isNull();
    }

    @Test
    void getPolicy_afterCreate_returnsStoredPolicy() {
        PolicyRequest request = new PolicyRequest();
        request.setPolicyHolderName("Eva Huang");
        request.setAge(50);
        request.setPolicyType("AUTO");
        request.setSumInsured(50_000.0);
        Map<String, Object> created = policyService.createPolicy(request);

        Map<String, Object> fetched = policyService.getPolicy((String) created.get("policyNumber"));

        assertThat(fetched).isNotNull();
        assertThat(fetched.get("policyHolderName")).isEqualTo("Eva Huang");
    }
}
