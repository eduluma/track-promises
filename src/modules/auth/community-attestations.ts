import { and, eq, inArray } from "drizzle-orm";

import type { AccountState } from "@/lib/permissions";
import { runQuery } from "@/db/client";
import {
    communityAttestations as communityAttestationsTable,
    moderationReviews as moderationReviewsTable,
    users
} from "@/db/schema";
import { appendAuditLog } from "@/modules/audit/logs";
import { createModerationReview } from "@/modules/moderation/reviews";

const COMMUNITY_ATTESTATION_REASON = "Community attestation requested";
const WITNESS_THRESHOLD = 2;
type CommunityAttestationMetadata = {
    requestType: "community_attestation";
    city: string;
    locality: string | null;
    postalCode: string | null;
    address: string | null;
    statement: string | null;
    witnessThreshold: number;
};

export type CommunityAttestationRecord = {
    id: string;
    tenantId: string;
    reviewId: string;
    subjectUserId: string;
    witnessUserId: string;
    relationship: string;
    witnessCity: string;
    witnessLocality: string | null;
    witnessPostalCode: string | null;
    note: string | null;
    localityMatched: boolean;
    createdAt: string;
};

export type CommunityAttestationSummary = {
    reviewId: string;
    tenantId: string;
    subjectUserId: string;
    subjectDisplayName: string;
    status: "open" | "in_review" | "resolved";
    decision: string | null;
    request: {
        city: string;
        locality: string | null;
        postalCode: string | null;
        address: string | null;
        statement: string | null;
    };
    witnessThreshold: number;
    eligibleWitnessCount: number;
    localityMatchedWitnessCount: number;
    witnesses: Array<CommunityAttestationRecord & { witnessDisplayName: string }>;
};

export class CommunityAttestationError extends Error {
    status: number;

    constructor(message: string, status = 400) {
        super(message);
        this.name = "CommunityAttestationError";
        this.status = status;
    }
}

function isCommunityAttestationMetadata(value: unknown): value is CommunityAttestationMetadata {
    if (!value || typeof value !== "object") {
        return false;
    }

    const metadata = value as Partial<CommunityAttestationMetadata>;
    return metadata.requestType === "community_attestation" && typeof metadata.city === "string";
}

function normalizeLocationPart(value: string | null | undefined) {
    return value?.trim().toLowerCase().replace(/\s+/g, " ") || null;
}

function normalizePostalCode(value: string | null | undefined) {
    return value?.trim().toUpperCase().replace(/\s+/g, "") || null;
}

function rowToCommunityAttestation(row: typeof communityAttestationsTable.$inferSelect): CommunityAttestationRecord {
    return {
        id: row.id,
        tenantId: row.tenantId,
        reviewId: row.reviewId,
        subjectUserId: row.subjectUserId,
        witnessUserId: row.witnessUserId,
        relationship: row.relationship,
        witnessCity: row.witnessCity,
        witnessLocality: row.witnessLocality,
        witnessPostalCode: row.witnessPostalCode,
        note: row.note,
        localityMatched: row.localityMatched,
        createdAt: row.createdAt.toISOString()
    };
}

function isLocalWitnessMatch(
    request: Pick<CommunityAttestationSummary["request"], "city" | "locality" | "postalCode">,
    witness: Pick<CommunityAttestationRecord, "witnessCity" | "witnessLocality" | "witnessPostalCode">
) {
    const requestCity = normalizeLocationPart(request.city);
    const witnessCity = normalizeLocationPart(witness.witnessCity);

    if (!requestCity || !witnessCity || requestCity !== witnessCity) {
        return false;
    }

    const requestPostalCode = normalizePostalCode(request.postalCode);
    const witnessPostalCode = normalizePostalCode(witness.witnessPostalCode);

    if (requestPostalCode && witnessPostalCode) {
        return requestPostalCode === witnessPostalCode;
    }

    const requestLocality = normalizeLocationPart(request.locality);
    const witnessLocality = normalizeLocationPart(witness.witnessLocality);

    if (requestLocality && witnessLocality) {
        return requestLocality === witnessLocality;
    }

    return true;
}

export function canWitnessCommunityAttestation(user: {
    role?: string;
    state: AccountState;
    emailVerified: boolean;
    phoneVerified?: boolean;
}) {
    if (user.role === "guest" || user.state === "readonly" || user.state === "suspended") {
        return false;
    }

    return user.state === "moderator_approved";
}

async function getAttestationReviewRow(reviewId: string) {
    const [row] = await runQuery((db) =>
        db
            .select()
            .from(moderationReviewsTable)
            .where(eq(moderationReviewsTable.id, reviewId))
            .limit(1)
    );

    if (!row || !isCommunityAttestationMetadata((row.metadata as { communityAttestation?: unknown } | null)?.communityAttestation)) {
        return null;
    }

    return row;
}

async function buildCommunityAttestationSummary(reviewRow: typeof moderationReviewsTable.$inferSelect): Promise<CommunityAttestationSummary | null> {
    const metadata = (reviewRow.metadata as { communityAttestation?: unknown } | null)?.communityAttestation;

    if (!isCommunityAttestationMetadata(metadata)) {
        return null;
    }

    const [subjectUser] = await runQuery((db) =>
        db
            .select({ id: users.id, displayName: users.displayName })
            .from(users)
            .where(eq(users.id, reviewRow.subjectId))
            .limit(1)
    );

    const witnessRows = await runQuery((db) =>
        db
            .select()
            .from(communityAttestationsTable)
            .where(eq(communityAttestationsTable.reviewId, reviewRow.id))
    );
    const attestations = witnessRows.map(rowToCommunityAttestation).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const witnessIds = Array.from(new Set(attestations.map((record) => record.witnessUserId)));
    const witnessUsers = witnessIds.length === 0
        ? []
        : await runQuery((db) =>
            db
                .select({ id: users.id, displayName: users.displayName })
                .from(users)
                .where(inArray(users.id, witnessIds))
        );

    const witnessDisplayNames = new Map(witnessUsers.map((row) => [row.id, row.displayName]));

    return {
        reviewId: reviewRow.id,
        tenantId: reviewRow.tenantId,
        subjectUserId: reviewRow.subjectId,
        subjectDisplayName: subjectUser?.displayName ?? reviewRow.subjectId,
        status: reviewRow.status as CommunityAttestationSummary["status"],
        decision: reviewRow.decision ?? null,
        request: {
            city: metadata.city,
            locality: metadata.locality,
            postalCode: metadata.postalCode,
            address: metadata.address,
            statement: metadata.statement
        },
        witnessThreshold: metadata.witnessThreshold,
        eligibleWitnessCount: attestations.length,
        localityMatchedWitnessCount: attestations.filter((record) => record.localityMatched).length,
        witnesses: attestations.map((record) => ({
            ...record,
            witnessDisplayName: witnessDisplayNames.get(record.witnessUserId) ?? record.witnessUserId
        }))
    };
}

export async function getCommunityAttestationSummary(reviewId: string) {
    const reviewRow = await getAttestationReviewRow(reviewId);
    return reviewRow ? buildCommunityAttestationSummary(reviewRow) : null;
}

export async function getCommunityAttestationSummaryForUser(tenantId: string, userId: string) {
    const rows = await runQuery((db) =>
        db
            .select()
            .from(moderationReviewsTable)
            .where(
                and(
                    eq(moderationReviewsTable.tenantId, tenantId),
                    eq(moderationReviewsTable.subjectType, "account"),
                    eq(moderationReviewsTable.subjectId, userId)
                )
            )
    );

    const reviewRow = rows
        .filter((row) => isCommunityAttestationMetadata((row.metadata as { communityAttestation?: unknown } | null)?.communityAttestation))
        .sort((a, b) => b.updatedAt.toISOString().localeCompare(a.updatedAt.toISOString()))[0];

    return reviewRow ? buildCommunityAttestationSummary(reviewRow) : null;
}

export async function createCommunityAttestationRequest(params: {
    tenantId: string;
    userId: string;
    city: string;
    locality?: string | null;
    postalCode?: string | null;
    address?: string | null;
    statement?: string | null;
}) {
    const existing = await getCommunityAttestationSummaryForUser(params.tenantId, params.userId);

    if (existing && existing.status !== "resolved") {
        return existing;
    }

    const now = new Date().toISOString();
    const review = await createModerationReview({
        id: `review-attestation-${crypto.randomUUID().slice(0, 8)}`,
        tenantId: params.tenantId,
        subjectType: "account",
        subjectId: params.userId,
        reason: COMMUNITY_ATTESTATION_REASON,
        metadata: {
            userId: params.userId,
            requestedState: "moderator_approved",
            communityAttestation: {
                requestType: "community_attestation",
                city: params.city.trim(),
                locality: params.locality?.trim() || null,
                postalCode: params.postalCode?.trim() || null,
                address: params.address?.trim() || null,
                statement: params.statement?.trim() || null,
                witnessThreshold: WITNESS_THRESHOLD
            }
        },
        now
    });

    await appendAuditLog({
        tenantId: params.tenantId,
        actorId: params.userId,
        action: "community_attestation.request_created",
        entityType: "account",
        entityId: params.userId,
        metadata: { reviewId: review.id },
        createdAt: now
    });

    return getCommunityAttestationSummary(review.id);
}

async function finalizeCommunityAttestationIfEligible(reviewId: string) {
    const summary = await getCommunityAttestationSummary(reviewId);

    if (!summary || summary.status === "resolved" || summary.localityMatchedWitnessCount < summary.witnessThreshold) {
        return summary;
    }

    const now = new Date().toISOString();

    await runQuery((db) =>
        db
            .update(users)
            .set({ state: "moderator_approved", updatedAt: new Date(now) })
            .where(eq(users.id, summary.subjectUserId))
    );
    await runQuery((db) =>
        db
            .update(moderationReviewsTable)
            .set({ status: "resolved", decision: "approve_account", updatedAt: new Date(now) })
            .where(eq(moderationReviewsTable.id, reviewId))
    );

    await appendAuditLog({
        tenantId: summary.tenantId,
        actorId: null,
        action: "community_attestation.auto_approved",
        entityType: "account",
        entityId: summary.subjectUserId,
        metadata: {
            reviewId,
            witnessUserIds: summary.witnesses.map((witness) => witness.witnessUserId)
        },
        createdAt: now
    });

    return getCommunityAttestationSummary(reviewId);
}

export async function submitCommunityAttestation(params: {
    reviewId: string;
    witnessUserId: string;
    relationship: string;
    city: string;
    locality?: string | null;
    postalCode?: string | null;
    note?: string | null;
}) {
    const summary = await getCommunityAttestationSummary(params.reviewId);

    if (!summary) {
        throw new CommunityAttestationError("Unknown community attestation request.", 404);
    }

    if (summary.status === "resolved") {
        throw new CommunityAttestationError("This community attestation request is already closed.", 400);
    }

    if (summary.subjectUserId === params.witnessUserId) {
        throw new CommunityAttestationError("You cannot witness your own attestation request.", 400);
    }

    const [witnessUser] = await runQuery((db) =>
        db
            .select({
                id: users.id,
                role: users.role,
                state: users.state,
                emailVerified: users.emailVerified,
                phoneVerified: users.phoneVerified,
                createdAt: users.createdAt
            })
            .from(users)
            .where(eq(users.id, params.witnessUserId))
            .limit(1)
    );

    if (!witnessUser) {
        throw new CommunityAttestationError("Witness account not found.", 404);
    }

    if (!canWitnessCommunityAttestation({
        role: witnessUser.role,
        state: witnessUser.state,
        emailVerified: witnessUser.emailVerified,
        phoneVerified: witnessUser.phoneVerified
    })) {
        throw new CommunityAttestationError("Only moderator-approved local verifiers can witness a community attestation request.", 403);
    }

    const [existing] = await runQuery((db) =>
        db
            .select({ id: communityAttestationsTable.id })
            .from(communityAttestationsTable)
            .where(
                and(
                    eq(communityAttestationsTable.reviewId, params.reviewId),
                    eq(communityAttestationsTable.witnessUserId, params.witnessUserId)
                )
            )
            .limit(1)
    );

    if (existing) {
        throw new CommunityAttestationError("You have already vouched for this request.", 409);
    }

    const localityMatched = isLocalWitnessMatch(summary.request, {
        witnessCity: params.city,
        witnessLocality: params.locality ?? null,
        witnessPostalCode: params.postalCode ?? null
    });

    const now = new Date().toISOString();

    await runQuery((db) =>
        db
            .insert(communityAttestationsTable)
            .values({
                id: `attestation-${crypto.randomUUID().slice(0, 8)}`,
                tenantId: summary.tenantId,
                reviewId: params.reviewId,
                subjectUserId: summary.subjectUserId,
                witnessUserId: params.witnessUserId,
                relationship: params.relationship.trim(),
                witnessCity: params.city.trim(),
                witnessLocality: params.locality?.trim() || null,
                witnessPostalCode: params.postalCode?.trim() || null,
                note: params.note?.trim() || null,
                localityMatched,
                createdAt: new Date(now)
            })
    );

    await appendAuditLog({
        tenantId: summary.tenantId,
        actorId: params.witnessUserId,
        action: "community_attestation.witness_submitted",
        entityType: "account",
        entityId: summary.subjectUserId,
        metadata: {
            reviewId: params.reviewId,
            localityMatched
        },
        createdAt: now
    });

    return finalizeCommunityAttestationIfEligible(params.reviewId);
}
