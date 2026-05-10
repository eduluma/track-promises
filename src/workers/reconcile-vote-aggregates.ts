import { reconcileVoteAggregatesForAllTenants } from "@/modules/voting/snapshots";

const results = reconcileVoteAggregatesForAllTenants();
const drifted = results.filter((result) => result.status === "drift_detected").length;
const missingSnapshots = results.filter((result) => result.status === "missing_snapshot").length;

console.log(`Reconciled ${results.length} promises. Drifted: ${drifted}. Missing snapshots: ${missingSnapshots}.`);