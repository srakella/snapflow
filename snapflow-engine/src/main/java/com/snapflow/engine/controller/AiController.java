package com.snapflow.engine.controller;

import dev.langchain4j.model.chat.ChatLanguageModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:3000") // Allow frontend access
public class AiController {

    private static final Logger logger = LoggerFactory.getLogger(AiController.class);

    private final ChatLanguageModel chatModel;

    @Autowired
    public AiController(ChatLanguageModel chatModel) {
        this.chatModel = chatModel;
    }

    @PostMapping("/generate")
    public ResponseEntity<String> generateWorkflow(@RequestBody AiRequest request) {
        logger.info("Received AI generation request. History size: {}",
                request.messages() != null ? request.messages().size() : 0);

        try {
            // PHASE 1: THE ARCHITECT (Planning)
            // Decides WHAT nodes are needed (Logic agent)
            String plan = runArchitectAgent(request);

            // PHASE 2: THE SPECIALISTS (Configuration)
            // Parses the plan and executes specialized tasks (Form Agent)
            String detailedPlanContext = runSpecialistAgents(plan);

            // PHASE 3: THE ASSEMBLER (Construction)
            // Converts the detailed specs into the final specific JSON format for the
            // frontend
            String finalJson = runAssemblerAgent(plan, detailedPlanContext, request);

            // Clean up
            finalJson = finalJson.replaceAll("```json", "").replaceAll("```", "").trim();
            // Ensure array syntax
            if (!finalJson.startsWith("[")) {
                int start = finalJson.indexOf("[");
                int end = finalJson.lastIndexOf("]");
                if (start >= 0 && end > start) {
                    finalJson = finalJson.substring(start, end + 1);
                }
            }

            return ResponseEntity.ok(finalJson);

        } catch (Exception e) {
            logger.error("AI Agent orchestration failed", e);
            return ResponseEntity.internalServerError().body("Failed to run AI Agents. Check Ollama.");
        }
    }

    // --- AGENT 1: THE ARCHITECT ---
    // Objective: define the logical steps without worrying about JSON syntax or x/y
    // coordinates
    private String runArchitectAgent(AiRequest request) {
        String sysPrompt = """
                You are a Senior Process Architect.
                Analyze the user's request and output a sequential list of Logical Steps required for the workflow.
                Format: ONE STEP PER LINE.
                Syntax: [TYPE] : [Description]

                Valid Types: START, END, HUMAN_TASK, SERVICE_TASK, EMAIL, GATEWAY.

                Example:
                START : Process Start
                HUMAN_TASK : Employee submits expense report
                HUMAN_TASK : Manager approves expense
                EMAIL : Notify employee
                END : Process End
                """;

        String userPrompt = "User Request: " + request.prompt();
        if (request.context != null && request.context.containsKey("nodes")) {
            userPrompt += "\n(Note: This is an edit to an existing flow. Suggest only the CHANGES or NEW steps needed.)";
        }

        return chatModel.generate(sysPrompt + "\n\n" + userPrompt);
    }

    // --- AGENT 2: FORM SPECIALIST ---
    // Objective: Generate rich form configurations for any human tasks identified
    private String runSpecialistAgents(String architectPlan) {
        StringBuilder enrichment = new StringBuilder();

        String[] steps = architectPlan.split("\n");
        for (String step : steps) {
            if (step.contains("HUMAN_TASK")) {
                String taskDesc = step.substring(step.indexOf(":") + 1).trim();
                String formPrompt = """
                        You are a Form Data Specialist.
                        Generate a simple JSON configuration for a form based on this task: "%s".
                        Output format: { "formKey": "kebab-case-name", "fields": ["field1", "field2"] }
                        Keep it minimal.
                        """.formatted(taskDesc);

                String formConfig = chatModel.generate(formPrompt);
                enrichment.append("For task '").append(taskDesc).append("', use config: ").append(formConfig)
                        .append("\n");
            }
        }
        return enrichment.toString();
    }

    // --- AGENT 3: THE ASSEMBLER ---
    // Objective: Take the logic plan + the specialized configs and write the final
    // frontend JSON code
    private String runAssemblerAgent(String plan, String details, AiRequest request) {
        String sysPrompt = """
                You are the Workflow Builder Engine.
                Convert the following ARCHITECT PLAN and SPECIALIST DETAILS into the target JSON format.

                TARGET FORMAT:
                [
                  { "type": "ADD_NODE", "tempId": "...", "nodeType": "...", "label": "...", "x": 0, "y": 0, "config": {...} },
                  { "type": "CONNECT_NODES", "source": "...", "target": "..." }
                ]

                RULES:
                1. Layout nodes strictly from Left to Right (x=0, x=300, x=600...).
                2. Use the 'details' provided to populate the 'config' object for User Tasks.
                3. Ensure START and END nodes are included.
                4. Output ONLY the JSON Array.
                """;

        String input = "ARCHITECT PLAN:\n" + plan + "\n\nSPECIALIST DETAILS:\n" + details;
        return chatModel.generate(sysPrompt + "\n\n" + input);
    }

    public record AiRequest(String prompt, java.util.List<Message> messages, Map<String, Object> context) {
    }

    public record Message(String role, String content) {
    }
}
