import {
    describe,
    expect,
    it,
    vi,
} from "vitest";

import {
    RequirementAgent,
} from "./requirement.js";

describe("RequirementAgent", () => {

    it("runs through the LLM provider", async () => {

        const provider = {
            generate: vi.fn()
                .mockResolvedValue({
                    content: JSON.stringify({
                        objective:
                            "Build a project dashboard",

                        requestedBehavior:
                            "Users can view project status",

                        scope: [
                            "Dashboard page",
                            "Project status",
                        ],

                        constraints: [
                            "Use existing project domain",
                        ],

                        ambiguities: [],

                        assumptions: [
                            "Authentication already exists",
                        ],

                        acceptanceIntent:
                            "The dashboard shows the current project status.",
                    }),
                }),
        };

        const agent =
            new RequirementAgent(provider);

        const result =
            await agent.run({
                prompt: "Generate a requirement.",
            });

        expect(result).toEqual({
            value: {
                objective:
                    "Build a project dashboard",

                requestedBehavior:
                    "Users can view project status",

                scope: [
                    "Dashboard page",
                    "Project status",
                ],

                constraints: [
                    "Use existing project domain",
                ],

                ambiguities: [],

                assumptions: [
                    "Authentication already exists",
                ],

                acceptanceIntent:
                    "The dashboard shows the current project status.",
            },
        });

        expect(
            provider.generate,
        ).toHaveBeenCalledWith({
            prompt: "Generate a requirement.",
        });

    });

    it("rejects invalid LLM output", async () => {

        const provider = {
            generate: vi.fn()
                .mockResolvedValue({
                    content: "Generated requirement",
                }),
        };

        const agent =
            new RequirementAgent(provider);

        await expect(
            agent.run({
                prompt: "Generate a requirement.",
            }),
        ).rejects.toThrow(
            "Invalid requirement output: expected valid JSON",
        );

    });

});