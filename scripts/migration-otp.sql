-- PostgreSQL Migration Script
-- Creates textbooks_otps table to store hashed OTPs and metadata securely.

CREATE TABLE IF NOT EXISTS textbooks_otps (
    id SERIAL PRIMARY KEY,
    access_id VARCHAR(50) NOT NULL,
    target VARCHAR(100) NOT NULL, -- mobile number or email address
    otp_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address VARCHAR(50),
    device_info VARCHAR(255),
    attempts INT DEFAULT 0
);
