package com.transglobe.policy.web;

import com.transglobe.policy.dto.PolicyRequest;
import com.transglobe.policy.dto.PolicyResponse;
import com.transglobe.policy.service.PolicyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * MODERNIZED 實作。
 *
 * 相對於 baseline 的變更：
 *  - 使用建構子注入（constructor injection）而非欄位注入（field injection）。
 *  - 在 PolicyRequest 上使用 @Valid 加 Bean Validation 約束，取代手動的 if/return 檢查。
 *  - 回傳型別化的 PolicyResponse，而非 Map<String, Object>。
 *  - 沒有區域性的 try/catch：由 GlobalExceptionHandler 集中將例外轉譯為回應。
 */
@RestController
@RequestMapping("/api/policies")
public class PolicyController {

    private final PolicyService policyService;

    public PolicyController(PolicyService policyService) {
        this.policyService = policyService;
    }

    @PostMapping
    public ResponseEntity<PolicyResponse> createPolicy(@Valid @RequestBody PolicyRequest request) {
        PolicyResponse response = PolicyResponse.from(policyService.createPolicy(request));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{policyNumber}")
    public ResponseEntity<PolicyResponse> getPolicy(@PathVariable String policyNumber) {
        PolicyResponse response = PolicyResponse.from(policyService.getPolicy(policyNumber));
        return ResponseEntity.ok(response);
    }
}
