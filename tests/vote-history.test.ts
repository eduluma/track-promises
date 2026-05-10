import { describe, expect, it } from "vitest";

import { listAuditLogsForTenant } from "@/modules/audit/logs";
import { castVote } from "@/modules/voting/service";
import {
    captureVoteSnapshotForPromise,
    listVoteSnapshotsForPromise,
    reconcileVoteAggregateForPromise
} from "@/modules/voting/snapshots";

describe("vote history pipeline", () => {
    it("captures a new snapshot from the current vote aggregate", () => {
        const before = listVoteSnapshotsForPromise("tenant-tamilnadu", "promise-power").length;

        const snapshot = captureVoteSnapshotForPromise({
            tenantId: "tenant-tamilnadu",
            promiseId: "promise-power",
            snapshotAt: "2026-06-01T12:00:00.000Z"
        });

        expect(snapshot.upvotes).toBe(1);
        expect(snapshot.downvotes).toBe(1);
        expect(listVoteSnapshotsForPromise("tenant-tamilnadu", "promise-power")).toHaveLength(before + 1);
    });

    it("reports aligned reconciliation when the latest snapshot matches current votes", () => {
        captureVoteSnapshotForPromise({
            tenantId: "tenant-tamilnadu",
            promiseId: "promise-school-meals",
            snapshotAt: "2026-06-01T12:01:00.000Z"
        });

        const reconciliation = reconcileVoteAggregateForPromise("tenant-tamilnadu", "promise-school-meals");

        expect(reconciliation.status).toBe("aligned");
        expect(reconciliation.drift.score).toBe(0);
    });

    it("detects drift after votes change after the latest snapshot", () => {
        captureVoteSnapshotForPromise({
            tenantId: "tenant-tamilnadu",
            promiseId: "promise-power",
            snapshotAt: "2026-06-01T12:02:00.000Z"
        });

        castVote({
            tenantId: "tenant-tamilnadu",
            promiseId: "promise-power",
            user: {
                id: "observer-1",
                emailVerified: true,
                state: "verified"
            },
            value: "up",
            now: new Date("2026-06-02T00:00:00.000Z")
        });

        const reconciliation = reconcileVoteAggregateForPromise("tenant-tamilnadu", "promise-power");

        expect(reconciliation.status).toBe("drift_detected");
        expect(reconciliation.drift.upvotes).toBe(1);
        expect(reconciliation.drift.downvotes).toBe(-1);
    });

    it("writes an audit log when snapshots are captured", () => {
        captureVoteSnapshotForPromise({
            tenantId: "tenant-tamilnadu",
            promiseId: "promise-school-meals",
            snapshotAt: "2026-06-03T00:00:00.000Z"
        });

        const logs = listAuditLogsForTenant("tenant-tamilnadu");
        expect(logs.some((log) => log.action === "votes.snapshot_captured" && log.entityId === "promise-school-meals")).toBe(true);
    });
});