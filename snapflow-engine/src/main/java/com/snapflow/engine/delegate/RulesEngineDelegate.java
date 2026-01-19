package com.snapflow.engine.delegate;

import com.snapflow.engine.service.RulesEngineService;
import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component("rulesEngineDelegate")
public class RulesEngineDelegate implements JavaDelegate {

    private static final Logger logger = LoggerFactory.getLogger(RulesEngineDelegate.class);

    @Autowired
    private RulesEngineService rulesEngine;

    @Override
    public void execute(DelegateExecution execution) {
        logger.info("Executing Rules Engine Delegate for process: {}", execution.getProcessInstanceId());

        try {
            // Get rule set ID from node configuration
            String ruleSetIdStr = (String) execution.getVariable("ruleSetId");
            if (ruleSetIdStr == null || ruleSetIdStr.isEmpty()) {
                logger.error("No ruleSetId provided");
                execution.setVariable("_rulesEngineError", "No ruleSetId provided");
                return;
            }

            UUID ruleSetId = UUID.fromString(ruleSetIdStr);

            // Collect input variables (exclude internal variables starting with _)
            Map<String, Object> inputData = new HashMap<>();
            execution.getVariables().forEach((key, value) -> {
                if (!key.startsWith("_")) {
                    inputData.put(key, value);
                }
            });

            logger.info("Input data: {}", inputData);

            // Evaluate rules
            Map<String, Object> outputData = rulesEngine.evaluateRuleSet(ruleSetId, inputData);

            // Set output variables back to execution
            outputData.forEach((key, value) -> {
                execution.setVariable(key, value);
                logger.debug("Set variable: {} = {}", key, value);
            });

            logger.info("Rules evaluated successfully. Output: {}", outputData);

        } catch (Exception e) {
            logger.error("Error executing rules engine", e);
            execution.setVariable("_rulesEngineError", e.getMessage());
        }
    }
}
