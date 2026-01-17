package com.snapflow.engine.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;
import java.util.Map;

@Document(collection = "process_documents")
public class ProcessDocument {

    @Id
    private String id;
    private String name;
    private Map<String, Object> jsonState;
    private Date updatedAt;

    public ProcessDocument() {
    }

    public ProcessDocument(String name, Map<String, Object> jsonState) {
        this.name = name;
        this.jsonState = jsonState;
        this.updatedAt = new Date();
    }

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

    public Map<String, Object> getJsonState() {
        return jsonState;
    }

    public void setJsonState(Map<String, Object> jsonState) {
        this.jsonState = jsonState;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }
}
