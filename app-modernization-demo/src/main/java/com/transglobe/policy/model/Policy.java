package com.transglobe.policy.model;

/**
 * 已核發保單的內部領域模型表示。
 * 在 baseline 與 modernized 檢查點之間保持完全相同：本 workshop 的
 * 現代化範圍僅限於 service／controller／config 各層。
 */
public class Policy {

    private final String policyNumber;
    private final String policyHolderName;
    private final int age;
    private final String policyType;
    private final double sumInsured;
    private final double premium;
    private final String status;

    public Policy(String policyNumber, String policyHolderName, int age, String policyType,
                  double sumInsured, double premium, String status) {
        this.policyNumber = policyNumber;
        this.policyHolderName = policyHolderName;
        this.age = age;
        this.policyType = policyType;
        this.sumInsured = sumInsured;
        this.premium = premium;
        this.status = status;
    }

    public String getPolicyNumber() {
        return policyNumber;
    }

    public String getPolicyHolderName() {
        return policyHolderName;
    }

    public int getAge() {
        return age;
    }

    public String getPolicyType() {
        return policyType;
    }

    public double getSumInsured() {
        return sumInsured;
    }

    public double getPremium() {
        return premium;
    }

    public String getStatus() {
        return status;
    }
}
