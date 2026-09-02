package com.transglobe.policy.dto;

/**
 * 建立保單的請求 payload。
 * BASELINE（舊版）：僅有一般欄位，沒有任何 Bean Validation 標註。
 * 所有必填／範圍檢查都在 controller 內以手動方式完成。
 */
public class PolicyRequest {

    private String policyHolderName;
    private Integer age;
    private String policyType;
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
