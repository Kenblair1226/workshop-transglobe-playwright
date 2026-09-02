package com.transglobe.policy.exception;

/**
 * MODERNIZED：針對未在 PricingProperties 中設定的 policyType 所使用的明確、
 * 型別化例外。此業務規則不易以靜態的 Bean Validation 標註表達（有效集合是由
 * 設定驅動的），因此由 service 拋出並由 GlobalExceptionHandler 集中轉譯，
 * 取代 baseline 中泛用的 IllegalArgumentException 加上 controller 內重複的 try/catch。
 */
public class UnsupportedPolicyTypeException extends RuntimeException {

    public UnsupportedPolicyTypeException(String policyType) {
        super("Unknown policy type: " + policyType);
    }
}
