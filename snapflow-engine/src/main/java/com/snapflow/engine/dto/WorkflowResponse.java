package com.snapflow.engine.dto;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * DTO for workflow responses
 */
public class WorkflowResponse {

    private String id;
    private String name;
    private Map<String, Object> json;
    private String xml;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public WorkflowResponse() {
    }

    public WorkflowResponse(String id, String name, Map<String, Object> json, String xml,
            LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.json = json;
        this.xml = xml;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Map<String, Object> getJson() {
        return json;
    }

    public void setJson(Map<String, Object> json) {
        this.json = json;
    }

    public String getXml() {
        return xml;
    }

    public void setXml(String xml) {
        this.xml = xml;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
