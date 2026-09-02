package com.transglobe.policy.dto;

import java.time.Instant;
import java.util.List;

/**
 * MODERNIZED：由 GlobalExceptionHandler 回傳的型別化錯誤 payload，取代 baseline
 * 在每個 controller method 中臨時組裝的 Map.of("error", "...") 回應。
 */
public record ApiError(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path,
        List<String> details
) {

    public static ApiError of(int status, String error, String message, String path) {
        return new ApiError(Instant.now(), status, error, message, path, List.of());
    }

    public static ApiError of(int status, String error, String message, String path, List<String> details) {
        return new ApiError(Instant.now(), status, error, message, path, details);
    }
}
