import { describe, expect, it } from "vitest";

import {
    validateStageCompletion,
    validateStagePreconditions,
} from "./contract-validator.js";

describe("Contract Validator", () => {

    describe("stage preconditions", () => {

        it("accepts a stage when all preconditions are satisfied", () => {

            const result = validateStagePreconditions(
                "PLANNING",
                {
                    currentStage: "PLANNING",
                    satisfiedPreconditions: [
                        "TASK_AT_STAGE",
                        "REQUIREMENT_APPROVED",
                        "REPOSITORY_CONTEXT_AVAILABLE",
                    ],
                },
            );

            expect(result.valid).toBe(true);
            expect(result.missing).toEqual([]);

        });

        it("rejects a stage when a precondition is missing", () => {

            const result = validateStagePreconditions(
                "PLANNING",
                {
                    currentStage: "PLANNING",
                    satisfiedPreconditions: [
                        "TASK_AT_STAGE",
                        "REPOSITORY_CONTEXT_AVAILABLE",
                    ],
                },
            );

            expect(result.valid).toBe(false);

            expect(result.missing).toEqual([
                "REQUIREMENT_APPROVED",
            ]);

        });

        it("rejects validation when the task is at another stage", () => {

            const result = validateStagePreconditions(
                "PLANNING",
                {
                    currentStage: "REQUIREMENT",
                    satisfiedPreconditions: [
                        "TASK_AT_STAGE",
                        "REQUIREMENT_APPROVED",
                        "REPOSITORY_CONTEXT_AVAILABLE",
                    ],
                },
            );

            expect(result.valid).toBe(false);

            expect(result.missing).toEqual([
                "TASK_AT_STAGE",
            ]);

        });

    });

    describe("stage completion", () => {

        it("accepts completion when definition of done is satisfied", () => {

            const result = validateStageCompletion(
                "CONTRACT",
                {
                    currentStage: "CONTRACT",
                    satisfiedPreconditions: [
                        "TASK_AT_STAGE",
                        "REQUIREMENT_APPROVED",
                        "PLAN_APPROVED",
                        "REPOSITORY_CONTEXT_AVAILABLE",
                    ],
                    satisfiedPostconditions: [
                        "CONTRACT_VALID",
                        "CHECKLIST_GENERATED",
                        "CONTRACT_APPROVED",
                    ],
                },
            );

            expect(result.valid).toBe(true);
            expect(result.missing).toEqual([]);

        });

        it("rejects completion when definition of done is incomplete", () => {

            const result = validateStageCompletion(
                "CONTRACT",
                {
                    currentStage: "CONTRACT",
                    satisfiedPreconditions: [
                        "TASK_AT_STAGE",
                        "REQUIREMENT_APPROVED",
                        "PLAN_APPROVED",
                        "REPOSITORY_CONTEXT_AVAILABLE",
                    ],
                    satisfiedPostconditions: [
                        "CONTRACT_VALID",
                        "CHECKLIST_GENERATED",
                    ],
                },
            );

            expect(result.valid).toBe(false);

            expect(result.missing).toEqual([
                "CONTRACT_APPROVED",
            ]);

        });

        it("uses definition of done rather than every stage postcondition", () => {

            const result = validateStageCompletion(
                "AUDIT",
                {
                    currentStage: "AUDIT",
                    satisfiedPreconditions: [
                        "TASK_AT_STAGE",
                        "CONTRACT_APPROVED",
                        "CHECKLIST_EXISTS",
                        "REPOSITORY_CONTEXT_AVAILABLE",
                    ],
                    satisfiedPostconditions: [
                        "AUDIT_COMPLETED",
                        "NO_EXECUTION_BLOCKER",
                    ],
                },
            );

            expect(result.valid).toBe(true);
            expect(result.missing).toEqual([]);

        });

    });

});