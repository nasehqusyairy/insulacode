import { describe, expect, it } from "vitest";

import {
    STAGE_CONTRACTS,
} from "./stage-contract.js";

describe("Stage Contracts", () => {

    it("defines every active task stage", () => {

        expect(
            Object.keys(STAGE_CONTRACTS).sort(),
        ).toEqual([
            "AUDIT",
            "CONTRACT",
            "EXECUTION",
            "PLANNING",
            "REQUIREMENT",
        ]);

    });

    it("does not define COMPLETED as an active stage contract", () => {

        expect(
            STAGE_CONTRACTS,
        ).not.toHaveProperty("COMPLETED");

    });

    describe("REQUIREMENT", () => {

        const contract = STAGE_CONTRACTS.REQUIREMENT;

        it("accepts user request and project context", () => {

            expect(contract.input).toEqual([
                "USER_REQUEST",
                "PROJECT_METADATA",
                "PROJECT_CONTEXT",
            ]);

        });

        it("produces a requirement artifact", () => {

            expect(contract.output).toEqual([
                "REQUIREMENT",
            ]);

        });

        it("requires requirement approval for completion", () => {

            expect(
                contract.definitionOfDone,
            ).toContain("REQUIREMENT_APPROVED");

        });

    });

    describe("PLANNING", () => {

        const contract = STAGE_CONTRACTS.PLANNING;

        it("requires an approved requirement", () => {

            expect(
                contract.preconditions,
            ).toContain("REQUIREMENT_APPROVED");

        });

        it("produces a plan artifact", () => {

            expect(contract.output).toEqual([
                "PLAN",
            ]);

        });

    });

    describe("CONTRACT", () => {

        const contract = STAGE_CONTRACTS.CONTRACT;

        it("requires an approved requirement and plan", () => {

            expect(
                contract.preconditions,
            ).toEqual(
                expect.arrayContaining([
                    "REQUIREMENT_APPROVED",
                    "PLAN_APPROVED",
                ]),
            );

        });

        it("produces contract and checklist artifacts", () => {

            expect(contract.output).toEqual([
                "CONTRACT",
                "CHECKLIST",
            ]);

        });

        it("requires checklist generation before completion", () => {

            expect(
                contract.definitionOfDone,
            ).toContain("CHECKLIST_GENERATED");

        });

    });

    describe("AUDIT", () => {

        const contract = STAGE_CONTRACTS.AUDIT;

        it("requires an approved contract and checklist", () => {

            expect(
                contract.preconditions,
            ).toEqual(
                expect.arrayContaining([
                    "CONTRACT_APPROVED",
                    "CHECKLIST_EXISTS",
                ]),
            );

        });

        it("produces an audit artifact", () => {

            expect(contract.output).toEqual([
                "AUDIT",
            ]);

        });

        it("requires no unresolved execution blocker", () => {

            expect(
                contract.definitionOfDone,
            ).toContain("NO_EXECUTION_BLOCKER");

        });

    });

    describe("EXECUTION", () => {

        const contract = STAGE_CONTRACTS.EXECUTION;

        it("requires contract, checklist, and audit", () => {

            expect(
                contract.input,
            ).toEqual(
                expect.arrayContaining([
                    "CONTRACT_ARTIFACT",
                    "CHECKLIST_ARTIFACT",
                    "AUDIT_ARTIFACT",
                    "PROJECT_FILESYSTEM",
                ]),
            );

        });

        it("allows the execution testing and fix loop", () => {

            expect(
                contract.allowedActions,
            ).toEqual(
                expect.arrayContaining([
                    "IMPLEMENT",
                    "TEST",
                    "DIAGNOSE",
                    "FIX",
                    "RETEST",
                ]),
            );

        });

        it("requires verification evidence for completion", () => {

            expect(
                contract.definitionOfDone,
            ).toEqual(
                expect.arrayContaining([
                    "IMPLEMENTATION_COMPLETE",
                    "CHECKLIST_SATISFIED",
                    "VERIFICATION_PASSED",
                    "ACCEPTANCE_CRITERIA_SATISFIED",
                ]),
            );

        });

    });

});