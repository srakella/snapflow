package com.snapflow.engine.controller;

import org.flowable.engine.RepositoryService;
import org.flowable.engine.RuntimeService;
import org.flowable.engine.repository.ProcessDefinition;
import org.flowable.engine.runtime.ProcessInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/runtime")
@CrossOrigin(origins = "*")
public class ProcessRuntimeController {

    private final RepositoryService repositoryService;
    private final RuntimeService runtimeService;

    @Autowired
    public ProcessRuntimeController(RepositoryService repositoryService, RuntimeService runtimeService) {
        this.repositoryService = repositoryService;
        this.runtimeService = runtimeService;
    }

    // 1. Get Deployed Definitions
    @GetMapping("/definitions")
    public List<Map<String, Object>> getProcessDefinitions() {
        List<ProcessDefinition> definitions = repositoryService.createProcessDefinitionQuery()
                .latestVersion()
                .list();

        return definitions.stream().map(def -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", def.getId());
            map.put("key", def.getKey());
            map.put("name", def.getName());
            map.put("version", def.getVersion());
            map.put("deploymentId", def.getDeploymentId());

            // Fetch Start Form Key if exists
            try {
                org.flowable.bpmn.model.BpmnModel model = repositoryService.getBpmnModel(def.getId());
                if (model != null && model.getMainProcess() != null) {
                    List<org.flowable.bpmn.model.StartEvent> startEvents = model.getMainProcess()
                            .findFlowElementsOfType(org.flowable.bpmn.model.StartEvent.class);
                    if (!startEvents.isEmpty()) {
                        map.put("startFormKey", startEvents.get(0).getFormKey());
                    }
                }
            } catch (Exception e) {
                // Ignore model fetch errors
            }

            return map;
        }).collect(Collectors.toList());
    }

    // 2. Start Process Instance
    @PostMapping("/instances")
    public ResponseEntity<?> startProcessInstance(@RequestBody Map<String, Object> payload) {
        String processDefinitionKey = (String) payload.get("processDefinitionKey");
        Map<String, Object> variables = (Map<String, Object>) payload.get("variables");

        if (processDefinitionKey == null) {
            return ResponseEntity.badRequest().body("processDefinitionKey is required");
        }

        try {
            ProcessInstance instance = runtimeService.startProcessInstanceByKey(processDefinitionKey, variables);
            Map<String, Object> response = new HashMap<>();
            response.put("id", instance.getId());
            response.put("processDefinitionId", instance.getProcessDefinitionId());
            response.put("startTime", instance.getStartTime());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to start workflow: " + e.getMessage());
        }
    }

    // 3. Get Active Instances
    @GetMapping("/instances")
    public List<Map<String, Object>> getActiveInstances() {
        List<ProcessInstance> instances = runtimeService.createProcessInstanceQuery()
                .active()
                .orderByStartTime().desc()
                .list();

        return instances.stream().map(inst -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", inst.getId());
            map.put("processDefinitionId", inst.getProcessDefinitionId());
            map.put("processDefinitionName", inst.getProcessDefinitionName()); // Might be null if not cached
            map.put("processDefinitionKey", inst.getProcessDefinitionKey());
            map.put("startTime", inst.getStartTime());
            map.put("isEnded", inst.isEnded());
            return map;
        }).collect(Collectors.toList());
    }
}
