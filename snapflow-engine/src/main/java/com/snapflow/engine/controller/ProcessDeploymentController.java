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
    private final org.flowable.engine.RuntimeService runtimeService;

    @Autowired
    public ProcessDeploymentController(RepositoryService repositoryService,
            org.flowable.engine.RuntimeService runtimeService) {
        this.repositoryService = repositoryService;
        this.runtimeService = runtimeService;
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

    @GetMapping
    public ResponseEntity<?> listProcessDefinitions() {
        return ResponseEntity.ok(repositoryService.createProcessDefinitionQuery()
                .latestVersion()
                .list()
                .stream()
                .map(pd -> Map.of(
                        "id", pd.getId(),
                        "key", pd.getKey(),
                        "name", pd.getName(),
                        "version", pd.getVersion()))
                .toList());
    }

    @PostMapping(value = "/start", consumes = "application/json")
    public ResponseEntity<?> startProcess(@RequestBody Map<String, Object> payload) {
        String processDefinitionKey = (String) payload.get("processDefinitionKey");
        Map<String, Object> variables = (Map<String, Object>) payload.get("variables");

        if (processDefinitionKey == null || processDefinitionKey.isEmpty()) {
            return ResponseEntity.badRequest().body("processDefinitionKey is required");
        }

        try {
            org.flowable.engine.runtime.ProcessInstance processInstance = runtimeService
                    .startProcessInstanceByKey(processDefinitionKey, variables);
            return ResponseEntity.ok(Map.of(
                    "id", processInstance.getId(),
                    "processDefinitionId", processInstance.getProcessDefinitionId(),
                    "isEnded", processInstance.isEnded()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to start process: " + e.getMessage());
        }
    }
}
