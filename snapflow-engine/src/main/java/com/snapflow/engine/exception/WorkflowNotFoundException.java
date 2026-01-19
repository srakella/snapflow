package com.snapflow.engine.exception;

/**
 * Exception thrown when a workflow is not found
 */
public class WorkflowNotFoundException extends RuntimeException {

    public WorkflowNotFoundException(String id) {
        super("Workflow not found with id: " + id);
    }

    public WorkflowNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
