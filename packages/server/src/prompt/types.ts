export interface PromptContext {

    systemContract: string;

    agentContract: string;

    taskContext: string;

    projectContext: string;

    previousOutput?: string;

    userInput: string;

}