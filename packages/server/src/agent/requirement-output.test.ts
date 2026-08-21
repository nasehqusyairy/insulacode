import {
    describe,
    expect,
    it,
} from "vitest";

import {
    parseRequirementOutput,
} from "./requirement-output.js";

describe("Requirement Output", () => {

    it("parses valid structured output", () => {

        const result = parseRequirementOutput(
            JSON.stringify({
                objective: "Build a project dashboard",
                requestedBehavior: "Users can view project status",
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
        );

        expect(result).toEqual({
            objective: "Build a project dashboard",
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

    });

    it("rejects invalid JSON", () => {

        expect(() =>
            parseRequirementOutput(
                "not valid json",
            ),
        ).toThrow();

    });

    it("rejects missing required fields", () => {

        expect(() =>
            parseRequirementOutput(
                JSON.stringify({
                    objective: "Something",
                }),
            ),
        ).toThrow();

    });

});