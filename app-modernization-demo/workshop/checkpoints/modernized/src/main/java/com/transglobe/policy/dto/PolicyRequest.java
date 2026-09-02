package com.transglobe.policy.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * 建立保單的請求 payload。
 * MODERNIZED：以 Bean Validation 約束取代 controller 中手動撰寫的 if/return 檢查。
 * spring-boot-starter-validation 在 baseline 的 pom 中已存在，因此啟用此功能
 * 不需要變更任何相依性。
 */
public class PolicyRequest {

    @NotBlank(message = "policyHolderName is required")
    private String policyHolderName;

    @NotNull(message = "age is required")
    @Min(value = 0, message = "age must be between 0 and 120")
    @Max(value = 120, message = "age must be between 0 and 120")
    private Integer age;

    @NotBlank(message = "policyType is required")
    private String policyType;

    @NotNull(message = "sumInsured is required")
    @Positive(message = "sumInsured must be positive")
    private Double sumInsured;

    public PolicyRequest() {
    }

    public String getPolicyHolderName() {
        return policyHolderName;
    }

    public void setPolicyHolderName(String policyHolderName) {
        this.policyHolderName = policyHolderName;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getPolicyType() {
        return policyType;
    }

    public void setPolicyType(String policyType) {
        this.policyType = policyType;
    }

    public Double getSumInsured() {
        return sumInsured;
    }

    public void setSumInsured(Double sumInsured) {
        this.sumInsured = sumInsured;
    }
}
