package com.snapflow.engine.controller;

import org.flowable.engine.RepositoryService;
import org.flowable.engine.repository.Deployment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/processes")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = { RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
        RequestMethod.DELETE, RequestMethod.OPTIONS })
public class ProcessDeploymentController {

    private final RepositoryService repositoryService;

    @Autowired
    public ProcessDeploymentController(RepositoryService repositoryService) {
        this.repositoryService = repositoryService;
    }

    @PostMapping(value = "/deploy", consumes = "application/json")
    public ResponseEntity<?> deployProcess(@RequestBody Map<String, String> payload) {
        String xml = payload.get("xml");
        String name = payload.get("name");

        if (xml == null || xml.isEmpty()) {
            return ResponseEntity.badRequest().body("BPMN XML is required");
        }

        System.out.println("Deploying process: " + name);
        System.out.println("XML Content: " + xml);

        try {
            Deployment deployment = repositoryService.createDeployment()
                    .addString(name + ".bpmn20.xml", xml)
                    .name(name)
                    .deploy();

            return ResponseEntity.ok(Map.of(
                    "id", deployment.getId(),
                    "name", deployment.getName(),
                    "deploymentTime", deployment.getDeploymentTime()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Deployment failed: " + e.getMessage());
        }
    }
}
