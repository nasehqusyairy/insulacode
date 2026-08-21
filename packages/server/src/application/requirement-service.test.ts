import {
    describe,
    expect,
    it,
    vi,
} from "vitest";

import {
    RequirementService,
} from "./requirement-service.js";

describe("RequirementService", () => {

    it("creates a pending requirement artifact", async () => {

        const agent = {
            run: vi.fn()
                .mockResolvedValue({
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
                }),
        };

        const service =
            new RequirementService(agent);

        const result =
            await service.createRequirement({
                taskId: "task-1",
                prompt: "Build a project dashboard.",
            });

        expect(result).toMatchObject({
            taskId: "task-1",
            artifactType: "REQUIREMENT",
            revisionNumber: 1,
            isCurrent: true,
            approvalState: "PENDING",

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
        });

        expect(result.id).toEqual(
            expect.any(String),
        );

        expect(result.createdAt).toEqual(
            expect.any(String),
        );

    });

});