import { describe, expect, it } from "vitest";

import {
    assertTransition,
    canTransition,
    getAllowedTransitions,
    StateTransitionError,
} from "./state-machine.js";

describe("Task State Machine", () => {

    describe("normal lifecycle", () => {

        it("allows REQUIREMENT -> PLANNING with approval", () => {

            expect(
                canTransition(
                    "REQUIREMENT",
                    "PLANNING",
                    {
                        approvalState: "APPROVED",
                    },
                ),
            ).toBe(true);

        });

        it("rejects REQUIREMENT -> PLANNING without approval", () => {

            expect(
                canTransition(
                    "REQUIREMENT",
                    "PLANNING",
                ),
            ).toBe(false);

        });

        it("rejects REQUIREMENT -> PLANNING when rejected", () => {

            expect(
                canTransition(
                    "REQUIREMENT",
                    "PLANNING",
                    {
                        approvalState: "REJECTED",
                    },
                ),
            ).toBe(false);

        });

        it("allows PLANNING -> CONTRACT with approval", () => {

            expect(
                canTransition(
                    "PLANNING",
                    "CONTRACT",
                    {
                        approvalState: "APPROVED",
                    },
                ),
            ).toBe(true);

        });

        it("allows CONTRACT -> AUDIT only with approved contract and valid checklist", () => {

            expect(
                canTransition(
                    "CONTRACT",
                    "AUDIT",
                    {
                        approvalState: "APPROVED",
                        checklistValid: true,
                    },
                ),
            ).toBe(true);

        });

        it("rejects CONTRACT -> AUDIT with invalid checklist", () => {

            expect(
                canTransition(
                    "CONTRACT",
                    "AUDIT",
                    {
                        approvalState: "APPROVED",
                        checklistValid: false,
                    },
                ),
            ).toBe(false);

        });

        it("allows AUDIT -> EXECUTION when READY", () => {

            expect(
                canTransition(
                    "AUDIT",
                    "EXECUTION",
                    {
                        executionReadiness: "READY",
                    },
                ),
            ).toBe(true);

        });

        it("rejects AUDIT -> EXECUTION when BLOCKED", () => {

            expect(
                canTransition(
                    "AUDIT",
                    "EXECUTION",
                    {
                        executionReadiness: "BLOCKED",
                    },
                ),
            ).toBe(false);

        });

        it("allows EXECUTION -> COMPLETED on SUCCESS", () => {

            expect(
                canTransition(
                    "EXECUTION",
                    "COMPLETED",
                    {
                        executionOutcome: "SUCCESS",
                    },
                ),
            ).toBe(true);

        });

        it("rejects EXECUTION -> COMPLETED on FAILED", () => {

            expect(
                canTransition(
                    "EXECUTION",
                    "COMPLETED",
                    {
                        executionOutcome: "FAILED",
                    },
                ),
            ).toBe(false);

        });

        it("rejects EXECUTION -> COMPLETED on BLOCKED", () => {

            expect(
                canTransition(
                    "EXECUTION",
                    "COMPLETED",
                    {
                        executionOutcome: "BLOCKED",
                    },
                ),
            ).toBe(false);

        });

    });

    describe("stage skipping", () => {

        it("rejects REQUIREMENT -> CONTRACT", () => {

            expect(
                canTransition(
                    "REQUIREMENT",
                    "CONTRACT",
                    {
                        approvalState: "APPROVED",
                    },
                ),
            ).toBe(false);

        });

        it("rejects REQUIREMENT -> AUDIT", () => {

            expect(
                canTransition(
                    "REQUIREMENT",
                    "AUDIT",
                ),
            ).toBe(false);

        });

        it("rejects PLANNING -> AUDIT", () => {

            expect(
                canTransition(
                    "PLANNING",
                    "AUDIT",
                    {
                        approvalState: "APPROVED",
                    },
                ),
            ).toBe(false);

        });

        it("rejects AUDIT -> COMPLETED", () => {

            expect(
                canTransition(
                    "AUDIT",
                    "COMPLETED",
                    {
                        executionReadiness: "READY",
                    },
                ),
            ).toBe(false);

        });

    });

    describe("backward transitions", () => {

        it("rejects EXECUTION -> AUDIT", () => {

            expect(
                canTransition(
                    "EXECUTION",
                    "AUDIT",
                ),
            ).toBe(false);

        });

        it("rejects AUDIT -> CONTRACT", () => {

            expect(
                canTransition(
                    "AUDIT",
                    "CONTRACT",
                ),
            ).toBe(false);

        });

        it("rejects CONTRACT -> PLANNING", () => {

            expect(
                canTransition(
                    "CONTRACT",
                    "PLANNING",
                ),
            ).toBe(false);

        });

    });

    describe("paused state", () => {

        it("allows stage -> PAUSED", () => {

            for (const stage of [
                "REQUIREMENT",
                "PLANNING",
                "CONTRACT",
                "AUDIT",
                "EXECUTION",
            ] as const) {

                expect(
                    canTransition(stage, "PAUSED"),
                ).toBe(true);

            }

        });

        it("allows PAUSED -> original stage", () => {

            expect(
                canTransition(
                    "PAUSED",
                    "AUDIT",
                    {
                        resumeStage: "AUDIT",
                    },
                ),
            ).toBe(true);

        });

        it("rejects PAUSED -> arbitrary different stage", () => {

            expect(
                canTransition(
                    "PAUSED",
                    "EXECUTION",
                    {
                        resumeStage: "AUDIT",
                    },
                ),
            ).toBe(false);

        });

        it("rejects PAUSED resume without original stage", () => {

            expect(
                canTransition(
                    "PAUSED",
                    "AUDIT",
                ),
            ).toBe(false);

        });

    });

    describe("failed state", () => {

        it("allows FAILED -> REQUIREMENT", () => {

            expect(
                canTransition(
                    "FAILED",
                    "REQUIREMENT",
                ),
            ).toBe(true);

        });

        it("rejects FAILED -> PLANNING", () => {

            expect(
                canTransition(
                    "FAILED",
                    "PLANNING",
                ),
            ).toBe(false);

        });

    });

    describe("cancelled state", () => {

        it("allows cancellation from every non-completed state", () => {

            for (const state of [
                "REQUIREMENT",
                "PLANNING",
                "CONTRACT",
                "AUDIT",
                "EXECUTION",
                "PAUSED",
                "FAILED",
            ] as const) {

                expect(
                    canTransition(state, "CANCELLED"),
                ).toBe(true);

            }

        });

        it("rejects CANCELLED -> any state", () => {

            for (const state of [
                "REQUIREMENT",
                "PLANNING",
                "CONTRACT",
                "AUDIT",
                "EXECUTION",
                "COMPLETED",
                "PAUSED",
                "FAILED",
                "CANCELLED",
            ] as const) {

                expect(
                    canTransition("CANCELLED", state),
                ).toBe(false);

            }

        });

    });

    describe("completed state", () => {

        it("rejects COMPLETED -> any state", () => {

            for (const state of [
                "REQUIREMENT",
                "PLANNING",
                "CONTRACT",
                "AUDIT",
                "EXECUTION",
                "COMPLETED",
                "PAUSED",
                "FAILED",
                "CANCELLED",
            ] as const) {

                expect(
                    canTransition("COMPLETED", state),
                ).toBe(false);

            }

        });

    });

    describe("getAllowedTransitions", () => {

        it("returns only the approved next stage", () => {

            expect(
                getAllowedTransitions(
                    "REQUIREMENT",
                    {
                        approvalState: "APPROVED",
                    },
                ),
            ).toEqual([
                "PLANNING",
                "PAUSED",
                "FAILED",
                "CANCELLED",
            ]);

        });

        it("does not expose normal transition when its gate is missing", () => {

            expect(
                getAllowedTransitions("REQUIREMENT"),
            ).toEqual([
                "PAUSED",
                "FAILED",
                "CANCELLED",
            ]);

        });

        it("returns no transitions from COMPLETED", () => {

            expect(
                getAllowedTransitions("COMPLETED"),
            ).toEqual([]);

        });

        it("returns no transitions from CANCELLED", () => {

            expect(
                getAllowedTransitions("CANCELLED"),
            ).toEqual([]);

        });

    });

    describe("assertTransition", () => {

        it("returns the target state for valid transition", () => {

            expect(
                assertTransition(
                    "AUDIT",
                    "EXECUTION",
                    {
                        executionReadiness: "READY",
                    },
                ),
            ).toBe("EXECUTION");

        });

        it("throws StateTransitionError for invalid transition", () => {

            expect(() =>
                assertTransition(
                    "REQUIREMENT",
                    "EXECUTION",
                ),
            ).toThrow(StateTransitionError);

        });

        it("includes source and target in the error", () => {

            try {

                assertTransition(
                    "EXECUTION",
                    "PLANNING",
                );

                throw new Error("Expected StateTransitionError");

            } catch (error) {

                expect(error).toBeInstanceOf(
                    StateTransitionError,
                );

                if (error instanceof StateTransitionError) {

                    expect(error.fromState).toBe(
                        "EXECUTION",
                    );

                    expect(error.toState).toBe(
                        "PLANNING",
                    );

                }

            }

        });

    });

});