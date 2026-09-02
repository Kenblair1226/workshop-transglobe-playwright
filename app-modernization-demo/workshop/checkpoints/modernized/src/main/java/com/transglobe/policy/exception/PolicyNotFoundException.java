package com.transglobe.policy.exception;

/**
 * MODERNIZED：明確、型別化的例外，取代 baseline 中由 PolicyService.getPolicy()
 * 回傳 null、再由 controller 手動轉譯為 404 的做法。
 */
public class PolicyNotFoundException extends RuntimeException {

    public PolicyNotFoundException(String policyNumber) {
        super("Policy not found: " + policyNumber);
    }
}
