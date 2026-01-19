package com.snapflow.engine.model;

import jakarta.persistence.*;

@Entity
@Table(name = "app_groups")
public class UserGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(unique = true, nullable = false)
    private String code; // e.g., 'ADMIN', 'DESIGNER'

    private String name; // e.g., 'Administrators'

    public UserGroup() {
    }

    public UserGroup(String code, String name) {
        this.code = code;
        this.name = name;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
