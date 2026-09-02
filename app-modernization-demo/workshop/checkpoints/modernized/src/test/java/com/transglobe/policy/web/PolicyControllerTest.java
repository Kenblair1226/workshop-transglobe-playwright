package com.transglobe.policy.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.transglobe.policy.dto.PolicyRequest;
import com.transglobe.policy.exception.PolicyNotFoundException;
import com.transglobe.policy.model.Policy;
import com.transglobe.policy.service.PolicyService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * MODERNIZED 測試：以型別化的 PolicyResponse JSON 結構進行斷言，並驗證
 * Bean Validation 加 GlobalExceptionHandler 現在會產生一致的 ApiError 內容，
 * 而非 baseline 中手動組裝的錯誤 map。
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
    void createPolicy_validRequest_returns201WithTypedBody() throws Exception {
        Policy policy = new Policy("POL-1001", "Alice Wu", 30, "LIFE", 100_000.0, 2000.0, "ACTIVE");
        given(policyService.createPolicy(any())).willReturn(policy);

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
    void createPolicy_missingPolicyHolderName_returns400WithApiError() throws Exception {
        PolicyRequest request = new PolicyRequest();
        request.setAge(30);
        request.setPolicyType("LIFE");
        request.setSumInsured(100_000.0);

        mockMvc.perform(post("/api/policies")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"))
                .andExpect(jsonPath("$.details[0]").value("policyHolderName: policyHolderName is required"));
    }

    @Test
    void createPolicy_invalidAge_returns400WithApiError() throws Exception {
        PolicyRequest request = new PolicyRequest();
        request.setPolicyHolderName("Alice Wu");
        request.setAge(200);
        request.setPolicyType("LIFE");
        request.setSumInsured(100_000.0);

        mockMvc.perform(post("/api/policies")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"));
    }

    @Test
    void getPolicy_notFound_returns404WithApiError() throws Exception {
        given(policyService.getPolicy("POL-MISSING")).willThrow(new PolicyNotFoundException("POL-MISSING"));

        mockMvc.perform(get("/api/policies/POL-MISSING"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Policy not found: POL-MISSING"));
    }

    @Test
    void getPolicy_found_returnsTypedBody() throws Exception {
        Policy policy = new Policy("POL-1002", "Bob Chen", 45, "AUTO", 20_000.0, 1000.0, "ACTIVE");
        given(policyService.getPolicy("POL-1002")).willReturn(policy);

        mockMvc.perform(get("/api/policies/POL-1002"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.policyHolderName").value("Bob Chen"));
    }
}
