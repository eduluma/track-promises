import { describe, expect, it } from "vitest";

import { listAuditLogsForTenant } from "@/modules/audit/logs";
import { castVote } from "@/modules/voting/service";
import {
    captureVoteSnapshotForPromise,
    listVoteSnapshotsForPromise,
    reconcileVoteAggregateForPromise
} from "@/modules/voting/snapshots";

describe("vote history pipeline", () => {
    it("captures a new snapshot from the current vote aggregate", async () => {
        const before = (await listVoteSnapshotsForPromise("tenant-tamilnadu", "promise-power")).length;

        const snapshot = await captureVoteSnapshotForPromise({
            tenantId: "tenant-tamilnadu",
            promiseId: "promise-power",
            snapshotAt: "2026-06-01T12:00:00.000Z"
        });

        expect(snapshot.totalVotes).toBe(2);
        expect(snapshot.completionPercent).toBe(38);
        expect(await listVoteSnapshotsForPromise("tenant-tamilnadu", "promise-power")).toHaveLength(before + 1);
    });

    it("reports aligned reconciliation when the latest snapshot matches current votes", async () => {
        await captureVoteSnapshotForPromise({
            tenantId: "tenant-tamilnadu",
            promiseId: "promise-school-meals",
            snapshotAt: "2026-06-01T12:01:00.000Z"
        });

        const reconciliation = await reconcileVoteAggregateForPromise("tenant-tamilnadu", "promise-school-meals");

        expect(reconciliation.status).toBe("aligned");
        expect(reconciliation.drift.completionPercent).toBe(0);
    });

    it("detects drift after votes change after the latest snapshot", async () => {
        await captureVoteSnapshotForPromise({
            tenantId: "tenant-tamilnadu",
            promiseId: "promise-power",
            snapshotAt: "2026-06-01T12:02:00.000Z"
        });

        await castVote({
            tenantId: "tenant-tamilnadu",
            promiseId: "promise-power",
            user: {
                id: "observer-1",
                emailVerified: true,
                state: "verified"
            },
            value: "completed",
            now: new Date("2026-06-02T00:00:00.000Z")
        });

        const reconciliation = await reconcileVoteAggregateForPromise("tenant-tamilnadu", "promise-power");

        expect(reconciliation.status).toBe("drift_detected");
        expect(reconciliation.drift.totalVotes).toBe(0);
        expect(reconciliation.drift.completionPercent).toBe(40);
    });

    it("writes an audit log when snapshots are captured", async () => {
        await captureVoteSnapshotForPromise({
            tenantId: "tenant-tamilnadu",
            promiseId: "promise-school-meals",
            snapshotAt: "2026-06-03T00:00:00.000Z"
        });

        const logs = await listAuditLogsForTenant("tenant-tamilnadu");
        expect(logs.some((log) => log.action === "votes.snapshot_captured" && log.entityId === "promise-school-meals")).toBe(true);
    });
});