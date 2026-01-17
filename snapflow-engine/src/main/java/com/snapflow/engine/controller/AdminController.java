package com.snapflow.engine.controller;

import org.flowable.engine.RepositoryService;
import org.flowable.engine.repository.ProcessDefinition;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final RepositoryService repositoryService;

    @Autowired
    public AdminController(RepositoryService repositoryService) {
        this.repositoryService = repositoryService;
    }

    @DeleteMapping("/definitions/{definitionId}")
    public ResponseEntity<?> deleteProcessDefinition(@PathVariable String definitionId) {
        try {
            // Need Deployment ID to delete
            ProcessDefinition def = repositoryService.createProcessDefinitionQuery()
                    .processDefinitionId(definitionId)
                    .singleResult();

            if (def == null) {
                return ResponseEntity.notFound().build();
            }

            // Cascade = true deletes instances/history
            repositoryService.deleteDeployment(def.getDeploymentId(), true);

            return ResponseEntity.ok().body("Deleted definition " + definitionId + " and its deployment.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to delete: " + e.getMessage());
        }
    }
}
