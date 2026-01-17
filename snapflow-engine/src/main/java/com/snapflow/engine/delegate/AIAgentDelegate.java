package com.snapflow.engine.delegate;

import dev.langchain4j.model.chat.ChatLanguageModel;
import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component("aiAgentDelegate")
public class AIAgentDelegate implements JavaDelegate {
    private static final Logger logger = LoggerFactory.getLogger(AIAgentDelegate.class);

    private final ChatLanguageModel chatModel;

    @Autowired
    public AIAgentDelegate(ChatLanguageModel chatModel) {
        this.chatModel = chatModel;
    }

    @Override
    public void execute(DelegateExecution execution) {
        logger.info("AIAgentDelegate starting for process instance: {}", execution.getProcessInstanceId());

        // Extract userPrompt and caseContext variables from DelegateExecution
        Object userPromptObj = execution.getVariable("userPrompt");
        Object caseContextObj = execution.getVariable("caseContext");

        String userPrompt = userPromptObj != null ? userPromptObj.toString() : "No prompt provided";
        String caseContext = caseContextObj != null ? caseContextObj.toString() : "";

        String fullPrompt = String.format("Context: %s\n\nPrompt: %s", caseContext, userPrompt);

        logger.info("Sending request to Gemini with prompt length: {}", fullPrompt.length());

        try {
            // Using the actual method name for ChatLanguageModel in 1.0.0-beta1
            String response = chatModel.generate(fullPrompt);

            // Store the result in a process variable named aiResponse
            execution.setVariable("aiResponse", response);

            // Log the response to the terminal for verification
            logger.info("Gemini response received and stored in 'aiResponse':");
            logger.info("--------------------------------------------------");
            logger.info(response);
            logger.info("--------------------------------------------------");
        } catch (Exception e) {
            logger.error("Error invoking Gemini: {}", e.getMessage(), e);
            throw e;
        }
    }
}
