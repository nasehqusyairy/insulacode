import type {
    LLMProvider,
    LLMRequest,
    LLMResponse,
} from "./provider.js";

interface OllamaProviderOptions {
    baseUrl?: string;
    model: string;
}

interface OllamaGenerateResponse {
    response: string;
}

export class OllamaProvider implements LLMProvider {

    private readonly baseUrl: string;

    private readonly model: string;

    constructor(
        options: OllamaProviderOptions,
    ) {

        this.baseUrl = (
            options.baseUrl
            ?? "http://localhost:11434"
        );

        this.model = options.model;

    }

    async generate(
        request: LLMRequest,
    ): Promise<LLMResponse> {

        const response = await fetch(
            `${this.baseUrl}/api/generate`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    model: this.model,
                    prompt: request.prompt,
                    stream: false,
                }),
            },
        );

        if (!response.ok) {

            throw new Error(
                `Ollama request failed: ${response.status} ${response.statusText}`,
            );

        }

        const data =
            await response.json() as OllamaGenerateResponse;

        return {
            content: data.response,
        };

    }

}