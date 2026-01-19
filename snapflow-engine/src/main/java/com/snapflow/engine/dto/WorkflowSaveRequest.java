package com.snapflow.engine.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Map;

/**
 * DTO for workflow save requests
 */
public class WorkflowSaveRequest {

    @NotBlank(message = "Workflow name is required")
    private String name;

    @NotNull(message = "JSON definition is required")
    private Map<String, Object> json;

    @NotBlank(message = "XML definition is required")
    private String xml;

    // Constructors
    public WorkflowSaveRequest() {
    }

    public WorkflowSaveRequest(String name, Map<String, Object> json, String xml) {
        this.name = name;
        this.json = json;
        this.xml = xml;
    }

    // Getters and Setters
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
}
