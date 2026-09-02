package com.transglobe.policy.repository;

import com.transglobe.policy.model.Policy;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 記憶體內的保單儲存區。此示範不使用任何資料庫或雲端相依性；
 * 資料不會在應用程式重新啟動後保留。
 * 在 baseline 與 modernized 檢查點之間保持完全相同。
 */
@Repository
public class PolicyRepository {

    private final Map<String, Policy> policies = new ConcurrentHashMap<>();
    private final AtomicLong sequence = new AtomicLong(1000);

    public String nextPolicyNumber() {
        return "POL-" + sequence.incrementAndGet();
    }

    public Policy save(Policy policy) {
        policies.put(policy.getPolicyNumber(), policy);
        return policy;
    }

    public Optional<Policy> findByPolicyNumber(String policyNumber) {
        return Optional.ofNullable(policies.get(policyNumber));
    }

    public Collection<Policy> findAll() {
        return policies.values();
    }
}
