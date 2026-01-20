package com.snapflow.engine.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;
import java.util.List;

@Document(collection = "collaboration_messages")
public class CollaborationMessage {

    @Id
    private String id;
    private String contextType; // workflow, form, rule, node
    private String contextId;
    private String nodeId; // Optional: for node-specific comments
    private Author author;
    private String content;
    private List<String> mentions; // User IDs
    private String parentId; // For threaded replies
    private String status; // open, resolved
    private Date createdAt;
    private List<String> acknowledgedBy; // User IDs who acknowledged

    public static class Author {
        private String id;
        private String name;
        private String avatar;

        public Author() {
        }

        public Author(String id, String name, String avatar) {
            this.id = id;
            this.name = name;
            this.avatar = avatar;
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

        public String getAvatar() {
            return avatar;
        }

        public void setAvatar(String avatar) {
            this.avatar = avatar;
        }
    }

    public CollaborationMessage() {
        this.createdAt = new Date();
        this.status = "open";
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getContextType() {
        return contextType;
    }

    public void setContextType(String contextType) {
        this.contextType = contextType;
    }

    public String getContextId() {
        return contextId;
    }

    public void setContextId(String contextId) {
        this.contextId = contextId;
    }

    public String getNodeId() {
        return nodeId;
    }

    public void setNodeId(String nodeId) {
        this.nodeId = nodeId;
    }

    public Author getAuthor() {
        return author;
    }

    public void setAuthor(Author author) {
        this.author = author;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public List<String> getMentions() {
        return mentions;
    }

    public void setMentions(List<String> mentions) {
        this.mentions = mentions;
    }

    public String getParentId() {
        return parentId;
    }

    public void setParentId(String parentId) {
        this.parentId = parentId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public List<String> getAcknowledgedBy() {
        return acknowledgedBy;
    }

    public void setAcknowledgedBy(List<String> acknowledgedBy) {
        this.acknowledgedBy = acknowledgedBy;
    }
}
