package com.transglobe.policy.service;

import com.transglobe.policy.config.PricingProperties;
import com.transglobe.policy.dto.PolicyRequest;
import com.transglobe.policy.exception.PolicyNotFoundException;
import com.transglobe.policy.exception.UnsupportedPolicyTypeException;
import com.transglobe.policy.model.Policy;
import com.transglobe.policy.repository.PolicyRepository;
import org.springframework.stereotype.Service;

/**
 * MODERNIZED 實作。
 *
 * 相對於 baseline 的變更：
 *  - 使用建構子注入（constructor injection）而非欄位注入（field injection）（更容易進行單元測試、相依性不可變）。
 *  - 業務設定（費率、門檻、最低保費）改由 PricingProperties（@ConfigurationProperties）外部化，而非硬編碼的常數。
 *  - 回傳領域 Policy 物件；對應到回應 DTO 是 controller 的職責。
 *  - 拋出明確、型別化的例外，而非泛用的 IllegalArgumentException。
 */
@Service
public class PolicyService {

    private final PolicyRepository policyRepository;
    private final PricingProperties pricingProperties;

    public PolicyService(PolicyRepository policyRepository, PricingProperties pricingProperties) {
        this.policyRepository = policyRepository;
        this.pricingProperties = pricingProperties;
    }

    public Policy createPolicy(PolicyRequest request) {
        String policyType = request.getPolicyType().trim().toUpperCase();
        Double rate = pricingProperties.getBaseRates().get(policyType);
        if (rate == null) {
            throw new UnsupportedPolicyTypeException(request.getPolicyType());
        }

        double premium = request.getSumInsured() * rate;
        if (request.getAge() >= pricingProperties.getSeniorAgeThreshold()) {
            premium = premium * (1 + pricingProperties.getSeniorSurchargeRate());
        }
        if (premium < pricingProperties.getMinimumPremium()) {
            premium = pricingProperties.getMinimumPremium();
        }
        premium = Math.round(premium * 100.0) / 100.0;

        String policyNumber = policyRepository.nextPolicyNumber();
        Policy policy = new Policy(
                policyNumber,
                request.getPolicyHolderName(),
                request.getAge(),
                policyType,
                request.getSumInsured(),
                premium,
                "ACTIVE"
        );
        return policyRepository.save(policy);
    }

    public Policy getPolicy(String policyNumber) {
        return policyRepository.findByPolicyNumber(policyNumber)
                .orElseThrow(() -> new PolicyNotFoundException(policyNumber));
    }
}
