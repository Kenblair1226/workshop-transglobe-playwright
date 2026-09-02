package com.transglobe.policy.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * MODERNIZED：將 baseline 原本硬編碼於 PolicyService 內作為常數的業務設定
 *（各保單類型的基礎費率、長者附加費規則、最低保費）外部化。這些值會從
 * application.properties 以 "policy.pricing" 前綴繫結，因此可針對各環境調整
 * 而無需重新建置。
 */
@Component
@ConfigurationProperties(prefix = "policy.pricing")
public class PricingProperties {

    /** 各保單類型的基礎保費費率，例如 LIFE=0.02、HEALTH=0.03、AUTO=0.05。 */
    private Map<String, Double> baseRates = new HashMap<>();

    /** 套用長者附加費的年齡（含）門檻。 */
    private int seniorAgeThreshold = 60;

    /** 針對長者保單持有人，在基礎保費之上額外套用的附加費費率。 */
    private double seniorSurchargeRate = 0.15;

    /** 任何計算所得保費的絕對下限。 */
    private double minimumPremium = 500.0;

    public Map<String, Double> getBaseRates() {
        return baseRates;
    }

    public void setBaseRates(Map<String, Double> baseRates) {
        this.baseRates = baseRates;
    }

    public int getSeniorAgeThreshold() {
        return seniorAgeThreshold;
    }

    public void setSeniorAgeThreshold(int seniorAgeThreshold) {
        this.seniorAgeThreshold = seniorAgeThreshold;
    }

    public double getSeniorSurchargeRate() {
        return seniorSurchargeRate;
    }

    public void setSeniorSurchargeRate(double seniorSurchargeRate) {
        this.seniorSurchargeRate = seniorSurchargeRate;
    }

    public double getMinimumPremium() {
        return minimumPremium;
    }

    public void setMinimumPremium(double minimumPremium) {
        this.minimumPremium = minimumPremium;
    }
}
