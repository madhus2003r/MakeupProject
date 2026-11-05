package com.atelier.service;

public interface OtpService {
    String send(String email, String purpose);
    void store(String email, String purpose, String secret, int minutes);
    void verify(String email, String purpose, String code);
}
