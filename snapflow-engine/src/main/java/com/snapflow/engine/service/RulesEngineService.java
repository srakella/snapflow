package com.snapflow.engine.service;

import com.snapflow.engine.model.Rule;
import com.snapflow.engine.repository.RuleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;

@Service
public class RulesEngineService {

    private static final Logger logger = LoggerFactory.getLogger(RulesEngineService.class);

    @Autowired
    private RuleRepository ruleRepository;

    /**
     * Evaluate all rules in a rule set against input data
     * Returns the output data after applying matched rules
     */
    public Map<String, Object> evaluateRuleSet(
            UUID ruleSetId,
            Map<String, Object> inputData) {
        logger.info("Evaluating rule set: {} with input: {}", ruleSetId, inputData);

        // Get all enabled rules, ordered by priority (cached)
        List<Rule> rules = getRules(ruleSetId);

        // Start with input data as output
        Map<String, Object> outputData = new HashMap<>(inputData);

        // Evaluate rules in priority order
        for (Rule rule : rules) {
            long startTime = System.currentTimeMillis();

            try {
                // Evaluate conditions
                boolean matched = evaluateConditions(rule.getConditions(), inputData);

                if (matched) {
                    logger.info("Rule matched: {} (priority: {})", rule.getName(), rule.getPriority());

                    // Execute actions
                    executeActions(rule.getActions(), outputData);

                    long executionTime = System.currentTimeMillis() - startTime;
                    logger.info("Rule executed in {}ms", executionTime);

                    // Stop after first match (first-match-wins strategy)
                    // Change this if you want to evaluate all matching rules
                    break;
                }
            } catch (Exception e) {
                logger.error("Error evaluating rule: " + rule.getName(), e);
            }
        }

        logger.info("Rule evaluation complete. Output: {}", outputData);
        return outputData;
    }

    /**
     * Get rules for a rule set (cached)
     */
    @Cacheable(value = "ruleSets", key = "#ruleSetId")
    public List<Rule> getRules(UUID ruleSetId) {
        return ruleRepository.findByRuleSetIdAndEnabledOrderByPriorityDesc(ruleSetId, true);
    }

    /**
     * Invalidate cache when rules are updated
     */
    @CacheEvict(value = "ruleSets", key = "#ruleSetId")
    public void invalidateCache(UUID ruleSetId) {
        logger.info("Invalidated cache for rule set: {}", ruleSetId);
    }

    /**
     * Evaluate all conditions for a rule
     */
    @SuppressWarnings("unchecked")
    private boolean evaluateConditions(Map<String, Object> conditionsMap, Map<String, Object> data) {
        if (conditionsMap == null || conditionsMap.isEmpty()) {
            return true; // No conditions = always match
        }

        List<Map<String, Object>> conditions = (List<Map<String, Object>>) conditionsMap.get("conditions");
        if (conditions == null || conditions.isEmpty()) {
            return true; // No conditions = always match
        }

        String logic = (String) conditionsMap.getOrDefault("conditionLogic", "AND");

        if ("AND".equals(logic)) {
            // All conditions must match
            return conditions.stream().allMatch(c -> evaluateCondition(c, data));
        } else {
            // Any condition must match
            return conditions.stream().anyMatch(c -> evaluateCondition(c, data));
        }
    }

    /**
     * Evaluate a single condition
     */
    private boolean evaluateCondition(Map<String, Object> condition, Map<String, Object> data) {
        String field = (String) condition.get("field");
        String operator = (String) condition.get("operator");
        Object conditionValue = condition.get("value");

        Object fieldValue = data.get(field);

        try {
            switch (operator) {
                case "equals":
                    return Objects.equals(fieldValue, conditionValue);

                case "notEquals":
                    return !Objects.equals(fieldValue, conditionValue);

                case "greaterThan":
                    return compareNumbers(fieldValue, conditionValue) > 0;

                case "greaterThanOrEqual":
                    return compareNumbers(fieldValue, conditionValue) >= 0;

                case "lessThan":
                    return compareNumbers(fieldValue, conditionValue) < 0;

                case "lessThanOrEqual":
                    return compareNumbers(fieldValue, conditionValue) <= 0;

                case "contains":
                    return fieldValue != null &&
                            fieldValue.toString().contains(conditionValue.toString());

                case "startsWith":
                    return fieldValue != null &&
                            fieldValue.toString().startsWith(conditionValue.toString());

                case "endsWith":
                    return fieldValue != null &&
                            fieldValue.toString().endsWith(conditionValue.toString());

                case "matchesRegex":
                    return fieldValue != null &&
                            Pattern.matches(conditionValue.toString(), fieldValue.toString());

                case "in":
                    if (conditionValue instanceof List) {
                        return ((List<?>) conditionValue).contains(fieldValue);
                    }
                    return false;

                case "notIn":
                    if (conditionValue instanceof List) {
                        return !((List<?>) conditionValue).contains(fieldValue);
                    }
                    return true;

                case "isTrue":
                    return Boolean.TRUE.equals(fieldValue);

                case "isFalse":
                    return Boolean.FALSE.equals(fieldValue);

                case "isNull":
                    return fieldValue == null;

                case "isNotNull":
                    return fieldValue != null;

                default:
                    logger.warn("Unknown operator: {}", operator);
                    return false;
            }
        } catch (Exception e) {
            logger.error("Error evaluating condition: " + condition, e);
            return false;
        }
    }

    /**
     * Execute actions when a rule matches
     */
    @SuppressWarnings("unchecked")
    private void executeActions(Map<String, Object> actionsMap, Map<String, Object> outputData) {
        if (actionsMap == null || actionsMap.isEmpty()) {
            return;
        }

        List<Map<String, Object>> actions = (List<Map<String, Object>>) actionsMap.get("actions");
        if (actions == null || actions.isEmpty()) {
            return;
        }

        for (Map<String, Object> action : actions) {
            String type = (String) action.get("type");

            try {
                switch (type) {
                    case "setVariable":
                        String variable = (String) action.get("variable");
                        Object value = action.get("value");
                        outputData.put(variable, value);
                        logger.debug("Set variable: {} = {}", variable, value);
                        break;

                    case "routeTo":
                        String targetNode = (String) action.get("targetNode");
                        outputData.put("_routeToNode", targetNode);
                        logger.debug("Route to node: {}", targetNode);
                        break;

                    case "logMessage":
                        String message = (String) action.get("message");
                        logger.info("Rule action log: {}", message);
                        break;

                    default:
                        logger.warn("Unknown action type: {}", type);
                }
            } catch (Exception e) {
                logger.error("Error executing action: " + action, e);
            }
        }
    }

    /**
     * Compare two numbers
     */
    private int compareNumbers(Object a, Object b) {
        if (a == null || b == null) {
            throw new IllegalArgumentException("Cannot compare null values");
        }

        double aNum = convertToDouble(a);
        double bNum = convertToDouble(b);

        return Double.compare(aNum, bNum);
    }

    /**
     * Convert object to double
     */
    private double convertToDouble(Object obj) {
        if (obj instanceof Number) {
            return ((Number) obj).doubleValue();
        }
        try {
            return Double.parseDouble(obj.toString());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Cannot convert to number: " + obj);
        }
    }
}
