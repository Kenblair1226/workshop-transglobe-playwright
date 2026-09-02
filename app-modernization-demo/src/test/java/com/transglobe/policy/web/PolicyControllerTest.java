package com.transglobe.policy.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.transglobe.policy.dto.PolicyRequest;
import com.transglobe.policy.service.PolicyService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * BASELINE 測試：由於 controller 回傳 ResponseEntity<Map<String, Object>>
 * 而非型別化的 DTO，因此以原始的 JSON map key 進行斷言，並直接測試手動
 * 撰寫的驗證分支。
 */
@WebMvcTest(PolicyController.class)
class PolicyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PolicyService policyService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createPolicy_validRequest_returns201WithMapBody() throws Exception {
        Map<String, Object> serviceResult = new HashMap<>();
        serviceResult.put("policyNumber", "POL-1001");
        serviceResult.put("policyHolderName", "Alice Wu");
        serviceResult.put("policyType", "LIFE");
        serviceResult.put("premium", 2000.0);
        serviceResult.put("status", "ACTIVE");
        given(policyService.createPolicy(any())).willReturn(serviceResult);

        PolicyRequest request = new PolicyRequest();
        request.setPolicyHolderName("Alice Wu");
        request.setAge(30);
        request.setPolicyType("LIFE");
        request.setSumInsured(100_000.0);

        mockMvc.perform(post("/api/policies")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.policyNumber").value("POL-1001"))
                .andExpect(jsonPath("$.premium").value(2000.0));
    }

    @Test
    void createPolicy_missingPolicyHolderName_returns400WithErrorMap() throws Exception {
        PolicyRequest request = new PolicyRequest();
        request.setAge(30);
        request.setPolicyType("LIFE");
        request.setSumInsured(100_000.0);

        mockMvc.perform(post("/api/policies")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("policyHolderName is required"));
    }

    @Test
    void createPolicy_invalidAge_returns400WithErrorMap() throws Exception {
        PolicyRequest request = new PolicyRequest();
        request.setPolicyHolderName("Alice Wu");
        request.setAge(200);
        request.setPolicyType("LIFE");
        request.setSumInsured(100_000.0);

        mockMvc.perform(post("/api/policies")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("age must be between 0 and 120"));
    }

    @Test
    void getPolicy_notFound_returns404WithErrorMap() throws Exception {
        given(policyService.getPolicy("POL-MISSING")).willReturn(null);

        mockMvc.perform(get("/api/policies/POL-MISSING"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Policy not found: POL-MISSING"));
    }

    @Test
    void getPolicy_found_returnsMapBody() throws Exception {
        Map<String, Object> serviceResult = new HashMap<>();
        serviceResult.put("policyNumber", "POL-1002");
        serviceResult.put("policyHolderName", "Bob Chen");
        given(policyService.getPolicy("POL-1002")).willReturn(serviceResult);

        mockMvc.perform(get("/api/policies/POL-1002"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.policyHolderName").value("Bob Chen"));
    }
}
