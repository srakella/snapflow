package com.snapflow.engine.controller;

import com.snapflow.engine.dto.DeploymentRequest;
import org.flowable.engine.RepositoryService;
import org.flowable.engine.repository.Deployment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class DeploymentController {

    @Autowired
    private RepositoryService repositoryService;

    @PostMapping("/deploy")
    public DeploymentResponse deploy(@RequestBody DeploymentRequest request) {
        Deployment deployment = repositoryService.createDeployment()
                .addString(request.getName() + ".bpmn20.xml", request.getXml())
                .name(request.getName())
                .deploy();

        return new DeploymentResponse(deployment.getId(), deployment.getName());
    }

    public static class DeploymentResponse {
        private String id;
        private String name;

        public DeploymentResponse(String id, String name) {
            this.id = id;
            this.name = name;
        }

        public String getId() {
            return id;
        }

        public String getName() {
            return name;
        }
    }
}
