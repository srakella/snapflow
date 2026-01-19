package com.snapflow.engine.controller;

import com.snapflow.engine.dto.WorkflowResponse;
import com.snapflow.engine.dto.WorkflowSaveRequest;
import com.snapflow.engine.exception.WorkflowNotFoundException;
import com.snapflow.engine.model.ProcessDocument;
import com.snapflow.engine.service.WorkflowService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST controller for workflow operations
 */
@RestController
@RequestMapping("/api/workflows")
@CrossOrigin(origins = "*")
public class WorkflowController {

    private final WorkflowService workflowService;

    @Autowired
    public WorkflowController(WorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    /**
     * Save a workflow (both JSON and XML)
     */
    @PostMapping("/save")
    public ResponseEntity<ProcessDocument> saveWorkflow(@Valid @RequestBody WorkflowSaveRequest request) {
        ProcessDocument savedDoc = workflowService.saveWorkflow(
                request.getName(),
                request.getJson(),
                request.getXml());
        return ResponseEntity.ok(savedDoc);
    }

    /**
     * Get all workflows
     */
    @GetMapping
    public ResponseEntity<List<ProcessDocument>> getAllWorkflows() {
        List<ProcessDocument> workflows = workflowService.getAllWorkflows();
        return ResponseEntity.ok(workflows);
    }

    /**
     * Get a specific workflow by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProcessDocument> getWorkflow(@PathVariable String id) {
        return workflowService.getWorkflow(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new WorkflowNotFoundException(id));
    }

    /**
     * Delete a workflow
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkflow(@PathVariable String id) {
        if (!workflowService.getWorkflow(id).isPresent()) {
            throw new WorkflowNotFoundException(id);
        }
        workflowService.deleteWorkflow(id);
        return ResponseEntity.noContent().build();
    }
}
