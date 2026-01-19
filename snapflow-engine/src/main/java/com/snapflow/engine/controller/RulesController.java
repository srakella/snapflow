package com.snapflow.engine.controller;

import com.snapflow.engine.model.Rule;
import com.snapflow.engine.model.RuleSet;
import com.snapflow.engine.repository.RuleRepository;
import com.snapflow.engine.repository.RuleSetRepository;
import com.snapflow.engine.service.RulesEngineService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/rules")
@CrossOrigin(origins = "*")
public class RulesController {

    private static final Logger logger = LoggerFactory.getLogger(RulesController.class);

    @Autowired
    private RuleSetRepository ruleSetRepository;

    @Autowired
    private RuleRepository ruleRepository;

    @Autowired
    private RulesEngineService rulesEngine;

    // ============ Rule Sets ============

    @GetMapping("/rule-sets")
    public ResponseEntity<List<RuleSet>> getAllRuleSets() {
        return ResponseEntity.ok(ruleSetRepository.findAll());
    }

    @GetMapping("/rule-sets/{id}")
    public ResponseEntity<RuleSet> getRuleSet(@PathVariable UUID id) {
        return ruleSetRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/rule-sets")
    public ResponseEntity<RuleSet> createRuleSet(@RequestBody RuleSet ruleSet) {
        RuleSet saved = ruleSetRepository.save(ruleSet);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/rule-sets/{id}")
    public ResponseEntity<RuleSet> updateRuleSet(@PathVariable UUID id, @RequestBody RuleSet ruleSet) {
        return ruleSetRepository.findById(id)
                .map(existing -> {
                    existing.setName(ruleSet.getName());
                    existing.setDescription(ruleSet.getDescription());
                    existing.setVersion(ruleSet.getVersion());
                    existing.setStatus(ruleSet.getStatus());
                    RuleSet updated = ruleSetRepository.save(existing);

                    // Invalidate cache
                    rulesEngine.invalidateCache(id);

                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/rule-sets/{id}")
    public ResponseEntity<Void> deleteRuleSet(@PathVariable UUID id) {
        if (ruleSetRepository.existsById(id)) {
            ruleSetRepository.deleteById(id);
            rulesEngine.invalidateCache(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // ============ Rules ============

    @GetMapping("/rule-sets/{ruleSetId}/rules")
    public ResponseEntity<List<Rule>> getRules(@PathVariable UUID ruleSetId) {
        List<Rule> rules = ruleRepository.findByRuleSetIdOrderByPriorityDesc(ruleSetId);
        return ResponseEntity.ok(rules);
    }

    @GetMapping("/rules/{id}")
    public ResponseEntity<Rule> getRule(@PathVariable UUID id) {
        return ruleRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/rule-sets/{ruleSetId}/rules")
    public ResponseEntity<Rule> createRule(@PathVariable UUID ruleSetId, @RequestBody Rule rule) {
        rule.setRuleSetId(ruleSetId);
        Rule saved = ruleRepository.save(rule);

        // Invalidate cache
        rulesEngine.invalidateCache(ruleSetId);

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/rules/{id}")
    public ResponseEntity<Rule> updateRule(@PathVariable UUID id, @RequestBody Rule rule) {
        return ruleRepository.findById(id)
                .map(existing -> {
                    existing.setName(rule.getName());
                    existing.setDescription(rule.getDescription());
                    existing.setPriority(rule.getPriority());
                    existing.setConditions(rule.getConditions());
                    existing.setActions(rule.getActions());
                    existing.setEnabled(rule.getEnabled());
                    Rule updated = ruleRepository.save(existing);

                    // Invalidate cache
                    rulesEngine.invalidateCache(existing.getRuleSetId());

                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/rules/{id}")
    public ResponseEntity<Void> deleteRule(@PathVariable UUID id) {
        return ruleRepository.findById(id)
                .map(rule -> {
                    UUID ruleSetId = rule.getRuleSetId();
                    ruleRepository.deleteById(id);
                    rulesEngine.invalidateCache(ruleSetId);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ============ Rule Evaluation ============

    @PostMapping("/rule-sets/{ruleSetId}/evaluate")
    public ResponseEntity<Map<String, Object>> evaluateRules(
            @PathVariable UUID ruleSetId,
            @RequestBody Map<String, Object> inputData) {
        try {
            Map<String, Object> result = rulesEngine.evaluateRuleSet(ruleSetId, inputData);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Error evaluating rules", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ============ Rule Testing ============

    @PostMapping("/rules/{id}/test")
    public ResponseEntity<Map<String, Object>> testRule(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> inputData) {
        return ruleRepository.findById(id)
                .map(rule -> {
                    try {
                        // Create a temporary rule set with just this rule
                        Map<String, Object> result = new HashMap<>(inputData);

                        // Evaluate conditions
                        boolean matched = evaluateConditionsForTest(rule.getConditions(), inputData);

                        Map<String, Object> response = new HashMap<>();
                        response.put("matched", matched);
                        response.put("inputData", inputData);

                        if (matched) {
                            // Execute actions on a copy of input data
                            executeActionsForTest(rule.getActions(), result);
                            response.put("outputData", result);
                        }

                        return ResponseEntity.ok(response);
                    } catch (Exception e) {
                        logger.error("Error testing rule", e);
                        Map<String, Object> errorMap = new HashMap<>();
                        errorMap.put("error", e.getMessage());
                        return ResponseEntity.badRequest().body(errorMap);
                    }
                })
                .orElseGet(() -> {
                    return ResponseEntity.notFound().build();
                });
    }

    // Helper methods for testing (simplified versions)
    @SuppressWarnings("unchecked")
    private boolean evaluateConditionsForTest(Map<String, Object> conditionsMap, Map<String, Object> data) {
        if (conditionsMap == null || conditionsMap.isEmpty()) {
            return true;
        }

        List<Map<String, Object>> conditions = (List<Map<String, Object>>) conditionsMap.get("conditions");
        if (conditions == null || conditions.isEmpty()) {
            return true;
        }

        String logic = (String) conditionsMap.getOrDefault("conditionLogic", "AND");

        if ("AND".equals(logic)) {
            return conditions.stream().allMatch(c -> evaluateConditionForTest(c, data));
        } else {
            return conditions.stream().anyMatch(c -> evaluateConditionForTest(c, data));
        }
    }

    private boolean evaluateConditionForTest(Map<String, Object> condition, Map<String, Object> data) {
        String field = (String) condition.get("field");
        String operator = (String) condition.get("operator");
        Object conditionValue = condition.get("value");
        Object fieldValue = data.get(field);

        // Simplified evaluation for testing
        switch (operator) {
            case "equals":
                return Objects.equals(fieldValue, conditionValue);
            case "greaterThan":
                return compareNumbers(fieldValue, conditionValue) > 0;
            case "lessThan":
                return compareNumbers(fieldValue, conditionValue) < 0;
            default:
                return false;
        }
    }

    @SuppressWarnings("unchecked")
    private void executeActionsForTest(Map<String, Object> actionsMap, Map<String, Object> outputData) {
        if (actionsMap == null || actionsMap.isEmpty()) {
            return;
        }

        List<Map<String, Object>> actions = (List<Map<String, Object>>) actionsMap.get("actions");
        if (actions == null) {
            return;
        }

        for (Map<String, Object> action : actions) {
            String type = (String) action.get("type");
            if ("setVariable".equals(type)) {
                String variable = (String) action.get("variable");
                Object value = action.get("value");
                outputData.put(variable, value);
            }
        }
    }

    private int compareNumbers(Object a, Object b) {
        if (a == null || b == null)
            return 0;
        double aNum = ((Number) a).doubleValue();
        double bNum = ((Number) b).doubleValue();
        return Double.compare(aNum, bNum);
    }
}
