package com.snapflow.engine.dto;

import java.time.LocalDateTime;

/**
 * Generic error response DTO
 */
public class ErrorResponse {

    private String message;
    private String error;
    private int status;
    private LocalDateTime timestamp;
    private String path;

    // Constructors
    public ErrorResponse() {
        this.timestamp = LocalDateTime.now();
    }

    public ErrorResponse(String message) {
        this();
        this.message = message;
    }

    public ErrorResponse(String message, String error, int status) {
        this();
        this.message = message;
        this.error = error;
        this.status = status;
    }

    public ErrorResponse(String message, String error, int status, String path) {
        this(message, error, status);
        this.path = path;
    }

    // Getters and Setters
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }
}
