import { captureVoteSnapshotsForAllTenants } from "@/modules/voting/snapshots";

const snapshotAt = new Date().toISOString();
const snapshots = await captureVoteSnapshotsForAllTenants(snapshotAt);

console.log(`Captured ${snapshots.length} vote snapshots at ${snapshotAt}.`);