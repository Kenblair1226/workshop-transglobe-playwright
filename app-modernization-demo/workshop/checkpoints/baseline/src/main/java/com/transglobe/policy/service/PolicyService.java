package com.transglobe.policy.service;

import com.transglobe.policy.dto.PolicyRequest;
import com.transglobe.policy.model.Policy;
import com.transglobe.policy.repository.PolicyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * BASELINE（舊版但可建置）實作。
 *
 * 為了現代化 workshop 而刻意保留於此的已知壞味道（smells）：
 *  - 使用 @Autowired 的欄位注入（field injection），而非建構子注入（constructor injection）。
 *  - 業務設定（費率、門檻、最低保費）以常數硬編碼，而非外部化／可設定。
 *  - 以字串化／Map 為基礎的回應，而非型別化的 DTO。
 *  - 將呈現層的職責（組裝回應 map）混入 service 層。
 */
@Service
public class PolicyService {

    // 硬編碼的業務設定：不重新部署就無法針對各環境調整。
    private static final Map<String, Double> BASE_RATES = Map.of(
            "LIFE", 0.02,
            "HEALTH", 0.03,
            "AUTO", 0.05
    );
    private static final int SENIOR_AGE_THRESHOLD = 60;
    private static final double SENIOR_SURCHARGE_RATE = 0.15;
    private static final double MINIMUM_PREMIUM = 500.0;

    @Autowired
    private PolicyRepository policyRepository;

    public Map<String, Object> createPolicy(PolicyRequest request) {
        String policyType = request.getPolicyType() == null ? "" : request.getPolicyType().trim().toUpperCase();
        Double rate = BASE_RATES.get(policyType);
        if (rate == null) {
            // 薄弱的錯誤處理：拋出泛用的 runtime exception，沒有錯誤代碼／細節。
            throw new IllegalArgumentException("Unknown policy type: " + request.getPolicyType());
        }

        double premium = request.getSumInsured() * rate;
        if (request.getAge() != null && request.getAge() >= SENIOR_AGE_THRESHOLD) {
            premium = premium * (1 + SENIOR_SURCHARGE_RATE);
        }
        if (premium < MINIMUM_PREMIUM) {
            premium = MINIMUM_PREMIUM;
        }
        premium = Math.round(premium * 100.0) / 100.0;

        String policyNumber = policyRepository.nextPolicyNumber();
        Policy policy = new Policy(
                policyNumber,
                request.getPolicyHolderName(),
                request.getAge() == null ? 0 : request.getAge(),
                policyType,
                request.getSumInsured(),
                premium,
                "ACTIVE"
        );
        policyRepository.save(policy);

        return toMap(policy);
    }

    public Map<String, Object> getPolicy(String policyNumber) {
        return policyRepository.findByPolicyNumber(policyNumber)
                .map(this::toMap)
                .orElse(null);
    }

    private Map<String, Object> toMap(Policy policy) {
        Map<String, Object> map = new HashMap<>();
        map.put("policyNumber", policy.getPolicyNumber());
        map.put("policyHolderName", policy.getPolicyHolderName());
        map.put("age", policy.getAge());
        map.put("policyType", policy.getPolicyType());
        map.put("sumInsured", policy.getSumInsured());
        map.put("premium", policy.getPremium());
        map.put("status", policy.getStatus());
        return map;
    }
}
