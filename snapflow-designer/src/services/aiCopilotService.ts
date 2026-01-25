
import { AiAction } from '../store/useStore';

/**
 * Service to handle AI interactions.
 * This is a placeholder for the future specific "Copilot" API.
 */
export const aiCopilotService = {
    /**
     * Sends a natural language prompt to the AI agent and returns a stream or list of actions.
     * @param prompt The user's input text or transcribed voice.
     * @param context Current workflow state (nodes, edges) to give the AI context.
     */
    async processPrompt(prompt: string, context: any): Promise<AiAction[]> {
        console.log('Sending prompt to AI:', prompt);
        console.log('With context:', context);

        // TODO: Replace with actual API call to backend AI Agent
        // return api.post('/ai/copilot/prompt', { prompt, context });

        // MOCK RESPONSE for demonstration
        return new Promise((resolve) => {
            setTimeout(() => {
                if (prompt.toLowerCase().includes('add user task')) {
                    resolve([
                        { type: 'ADD_NODE', nodeType: 'userTask', label: 'New User Task' }
                    ]);
                } else {
                    resolve([]);
                }
            }, 1000);
        });
    },

    /**
     * Transcribes audio blob to text (for voice commands).
     */
    async transcribeAudio(audioBlob: Blob): Promise<string> {
        // TODO: Implement Whisper or similar STT service
        return "add a user task";
    }
};
