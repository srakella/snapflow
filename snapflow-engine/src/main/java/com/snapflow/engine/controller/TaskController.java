package com.snapflow.engine.controller;

import com.snapflow.engine.model.FormDefinition;
import com.snapflow.engine.repository.FormRepository;
import org.flowable.engine.RuntimeService;
import org.flowable.engine.TaskService;
import org.flowable.task.api.Task;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/runtime/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    private final TaskService taskService;
    private final RuntimeService runtimeService;
    private final FormRepository formRepository;

    @Autowired
    public TaskController(TaskService taskService, RuntimeService runtimeService, FormRepository formRepository) {
        this.taskService = taskService;
        this.runtimeService = runtimeService;
        this.formRepository = formRepository;
    }

    // 1. List Active Tasks
    @GetMapping
    public List<Map<String, Object>> getTasks(@RequestParam(required = false) String assignee) {
        // Simple query: if assignee provided, filter by it. Else return all active
        // tasks.
        // In a real app, you'd filter by logged-in user.
        var query = taskService.createTaskQuery().active();

        if (assignee != null && !assignee.isEmpty()) {
            query.taskAssignee(assignee);
        }

        List<Task> tasks = query.orderByTaskCreateTime().desc().list();

        return tasks.stream().map(task -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", task.getId());
            map.put("name", task.getName());
            map.put("assignee", task.getAssignee());
            map.put("createTime", task.getCreateTime());
            map.put("processInstanceId", task.getProcessInstanceId());
            map.put("formKey", task.getFormKey());
            return map;
        }).collect(Collectors.toList());
    }

    // 2. Get Task Form Data (Definition + Variables)
    @GetMapping("/{taskId}/form-data")
    public ResponseEntity<?> getTaskFormData(@PathVariable String taskId) {
        Task task = taskService.createTaskQuery().taskId(taskId).singleResult();
        if (task == null) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> response = new HashMap<>();

        // A. Fetch Form Definition if exists
        String formKey = task.getFormKey();
        if (formKey != null) {
            Optional<FormDefinition> formDef = formRepository.findById(formKey);
            formDef.ifPresent(definition -> response.put("form", definition));
        }

        // B. Fetch Process Variables (Scope: Process Instance)
        if (task.getProcessInstanceId() != null) {
            Map<String, Object> variables = runtimeService.getVariables(task.getProcessInstanceId());
            response.put("variables", variables);
        }

        // C. Fetch Task Metadata (for Handoff/Review logic)
        // Note: Flowable doesn't strictly store "custom attributes" easily on the Task
        // entity without extensions.
        // However, we can use local variables or look up the BpmnModel if we need
        // strict XML attributes.
        // For now, let's proceed with returning what we have. Frontend can infer
        // ReadOnly if variables exist for known fields?
        // Or better, we can access the description or other standard fields.

        return ResponseEntity.ok(response);
    }

    // 3. Complete Task
    @PostMapping("/{taskId}/complete")
    public ResponseEntity<?> completeTask(@PathVariable String taskId, @RequestBody Map<String, Object> variables) {
        try {
            taskService.complete(taskId, variables);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to complete task: " + e.getMessage());
        }
    }
}
