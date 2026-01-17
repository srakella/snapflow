package com.snapflow.engine.controller;

import com.snapflow.engine.model.ProcessDocument;
import com.snapflow.engine.service.WorkflowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workflows")
@CrossOrigin(origins = "*") // Allow frontend access
public class WorkflowController {

    private final WorkflowService workflowService;

    @Autowired
    public WorkflowController(WorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    @PostMapping("/save")
    public ResponseEntity<?> saveWorkflow(@RequestBody Map<String, Object> payload) {
        String name = (String) payload.get("name");
        Map<String, Object> json = (Map<String, Object>) payload.get("json");
        String xml = (String) payload.get("xml");

        if (name == null || json == null || xml == null) {
            return ResponseEntity.badRequest().body("Missing required fields: name, json, xml");
        }

        try {
            ProcessDocument savedDoc = workflowService.saveWorkflow(name, json, xml);
            return ResponseEntity.ok(savedDoc);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error saving workflow: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<ProcessDocument>> getAllWorkflows() {
        return ResponseEntity.ok(workflowService.getAllWorkflows());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getWorkflow(@PathVariable String id) {
        return workflowService.getWorkflow(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
