package com.transglobe.policy.web;

import com.transglobe.policy.dto.PolicyRequest;
import com.transglobe.policy.service.PolicyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * BASELINE（舊版但可建置）實作。
 *
 * 為了現代化 workshop 而刻意保留於此的已知壞味道（smells）：
 *  - 使用 @Autowired 的欄位注入（field injection），而非建構子注入（constructor injection）。
 *  - 以重複的 if/return 區塊進行手動、臨時性的驗證，而非使用 Bean Validation。
 *  - 回應為原始的 Map<String, Object>，而非型別化的 DTO。
 *  - 錯誤處理在每個 endpoint 各自重複，而非集中處理。
 */
@RestController
@RequestMapping("/api/policies")
public class PolicyController {

    @Autowired
    private PolicyService policyService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createPolicy(@RequestBody PolicyRequest request) {
        Map<String, Object> error = new HashMap<>();

        if (request.getPolicyHolderName() == null || request.getPolicyHolderName().trim().isEmpty()) {
            error.put("error", "policyHolderName is required");
            return ResponseEntity.badRequest().body(error);
        }
        if (request.getAge() == null || request.getAge() < 0 || request.getAge() > 120) {
            error.put("error", "age must be between 0 and 120");
            return ResponseEntity.badRequest().body(error);
        }
        if (request.getSumInsured() == null || request.getSumInsured() <= 0) {
            error.put("error", "sumInsured must be positive");
            return ResponseEntity.badRequest().body(error);
        }
        if (request.getPolicyType() == null || request.getPolicyType().trim().isEmpty()) {
            error.put("error", "policyType is required");
            return ResponseEntity.badRequest().body(error);
        }

        try {
            Map<String, Object> result = policyService.createPolicy(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (IllegalArgumentException e) {
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/{policyNumber}")
    public ResponseEntity<Map<String, Object>> getPolicy(@PathVariable String policyNumber) {
        Map<String, Object> result = policyService.getPolicy(policyNumber);
        if (result == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Policy not found: " + policyNumber);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
        return ResponseEntity.ok(result);
    }
}
