package com.snapflow.engine.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.Map;

@Document(collection = "forms")
public class FormDefinition {

    @Id
    private String id;
    private String name;
    private List<Map<String, Object>> schema;

    public FormDefinition() {
    }

    public FormDefinition(String name, List<Map<String, Object>> schema) {
        this.name = name;
        this.schema = schema;
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

    public List<Map<String, Object>> getSchema() {
        return schema;
    }

    public void setSchema(List<Map<String, Object>> schema) {
        this.schema = schema;
    }
}
