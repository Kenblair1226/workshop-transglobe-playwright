package com.transglobe.policy.dto;

import com.transglobe.policy.model.Policy;

/**
 * MODERNIZED：型別化的回應 DTO，取代 baseline 的原始 Map<String, Object>。
 * 以 Java record 實作，以獲得不可變性以及簡潔的 equals/hashCode/toString。
 */
public record PolicyResponse(
        String policyNumber,
        String policyHolderName,
        int age,
        String policyType,
        double sumInsured,
        double premium,
        String status
) {

    public static PolicyResponse from(Policy policy) {
        return new PolicyResponse(
                policy.getPolicyNumber(),
                policy.getPolicyHolderName(),
                policy.getAge(),
                policy.getPolicyType(),
                policy.getSumInsured(),
                policy.getPremium(),
                policy.getStatus()
        );
    }
}
