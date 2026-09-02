package com.transglobe.policy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Insurance Policy REST API 示範程式的進入點。
 * 僅使用記憶體：執行此應用程式不需要任何資料庫或雲端相依性。
 */
@SpringBootApplication
public class PolicyApplication {

    public static void main(String[] args) {
        SpringApplication.run(PolicyApplication.class, args);
    }
}
