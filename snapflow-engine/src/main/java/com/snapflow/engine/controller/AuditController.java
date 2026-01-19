package com.snapflow.engine.controller;

import org.flowable.engine.HistoryService;
import org.flowable.engine.history.HistoricActivityInstance;
import org.flowable.engine.history.HistoricProcessInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/audit")
@CrossOrigin(origins = "*")
public class AuditController {

    private final HistoryService historyService;

    @Autowired
    public AuditController(HistoryService historyService) {
        this.historyService = historyService;
    }

    @GetMapping("/instances")
    public List<Map<String, Object>> getHistoricInstances() {
        return historyService.createHistoricProcessInstanceQuery()
                .orderByProcessInstanceStartTime().desc()
                .list()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/instances/{processInstanceId}/activities")
    public List<Map<String, Object>> getHistoricActivities(@PathVariable String processInstanceId) {
        return historyService.createHistoricActivityInstanceQuery()
                .processInstanceId(processInstanceId)
                .orderByHistoricActivityInstanceStartTime().asc()
                .list()
                .stream()
                .map(this::mapActivityToResponse)
                .collect(Collectors.toList());
    }

    private Map<String, Object> mapToResponse(HistoricProcessInstance instance) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", instance.getId());
        map.put("processDefinitionId", instance.getProcessDefinitionId());
        map.put("processDefinitionKey", instance.getProcessDefinitionKey());
        map.put("startTime", instance.getStartTime());
        map.put("endTime", instance.getEndTime());
        map.put("durationInMillis", instance.getDurationInMillis());
        return map;
    }

    private Map<String, Object> mapActivityToResponse(HistoricActivityInstance activity) {
        Map<String, Object> map = new HashMap<>();
        map.put("activityId", activity.getActivityId());
        map.put("activityName", activity.getActivityName());
        map.put("activityType", activity.getActivityType());
        map.put("startTime", activity.getStartTime());
        map.put("endTime", activity.getEndTime());
        map.put("assignee", activity.getAssignee());
        return map;
    }
}
