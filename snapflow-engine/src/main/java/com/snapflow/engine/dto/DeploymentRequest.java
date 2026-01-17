package com.snapflow.engine.dto;

public class DeploymentRequest {
    private String xml;
    private String name;

    public String getXml() {
        return xml;
    }

    public void setXml(String xml) {
        this.xml = xml;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
