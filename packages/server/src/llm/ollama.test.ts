import { describe, expect, it, vi } from "vitest";

import {
    OllamaProvider,
} from "./ollama.js";

describe("OllamaProvider", () => {

    it("sends a generation request to Ollama", async () => {

        const fetchMock = vi
            .spyOn(globalThis, "fetch")
            .mockResolvedValue(
                new Response(
                    JSON.stringify({
                        response: "Hello from Ollama",
                    }),
                    {
                        status: 200,
                        headers: {
                            "Content-Type": "application/json",
                        },
                    },
                ),
            );

        const provider = new OllamaProvider({
            model: "gemma4",
        });

        const result = await provider.generate({
            prompt: "Say hello.",
        });

        expect(result).toEqual({
            content: "Hello from Ollama",
        });

        expect(fetchMock).toHaveBeenCalledWith(
            "http://localhost:11434/api/generate",
            expect.objectContaining({
                method: "POST",
            }),
        );

        const [, request] =
            fetchMock.mock.calls[0];

        const body = JSON.parse(
            request?.body as string,
        );

        expect(body).toEqual({
            model: "gemma4",
            prompt: "Say hello.",
            stream: false,
        });

        fetchMock.mockRestore();

    });

    it("uses a custom Ollama base URL", async () => {

        vi.spyOn(globalThis, "fetch")
            .mockResolvedValue(
                new Response(
                    JSON.stringify({
                        response: "OK",
                    }),
                    {
                        status: 200,
                    },
                ),
            );

        const provider = new OllamaProvider({
            baseUrl: "http://127.0.0.1:11434",
            model: "gemma4",
        });

        await provider.generate({
            prompt: "Test",
        });

        expect(fetch).toHaveBeenCalledWith(
            "http://127.0.0.1:11434/api/generate",
            expect.objectContaining({
                method: "POST",
            }),
        );

        vi.restoreAllMocks();

    });

    it("throws when Ollama returns an HTTP error", async () => {

        vi.spyOn(globalThis, "fetch")
            .mockResolvedValue(
                new Response(
                    "Model not found",
                    {
                        status: 404,
                        statusText: "Not Found",
                    },
                ),
            );

        const provider = new OllamaProvider({
            model: "missing-model",
        });

        await expect(
            provider.generate({
                prompt: "Test",
            }),
        ).rejects.toThrow(
            "Ollama request failed: 404 Not Found",
        );

        vi.restoreAllMocks();

    });

});