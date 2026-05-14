import type { PromiseStatus } from "@/config/schemas";
import { platformFallbackLocale, type SupportedLocale } from "@/modules/i18n/config";
import type { PromiseDeliveryCheckpoint, PromiseDeliveryPlan } from "@/modules/promises/data";
import type { VoteValue } from "@/modules/voting/assessment";
import type { VotingState } from "@/modules/voting/service";

export type PublicUiMessages = {
    filters: {
        all: string;
        category: string;
        status: string;
    };
    timelinePage: {
        contextEyebrow: string;
        overviewTitle: string;
        sourcePath: string;
    };
    promiseDetailPage: {
        uniqueId: string;
        timeline: string;
        officeHolder: string;
        election: string;
        jurisdiction: string;
        voteMeaning: string;
        voting: string;
        reconciliation: string;
        statusHistory: string;
        fromStatus: string;
        unsetStatus: string;
        aggregateReconciliation: string;
        currentCompletion: string;
        latestSnapshot: string;
        drift: string;
    };
    none: string;
    statusLabels: Record<PromiseStatus, string>;
    voteLabels: Record<VoteValue, string>;
    voteShortLabels: Record<VoteValue, string>;
    windowStateLabels: Record<VotingState, string>;
    promiseCard: {
        completion: string;
        assessors: string;
        leading: string;
        sources: string;
        assessmentEvents: string;
        tracking: string;
        cadence: string;
        target: string;
    };
    voteSegment: {
        registeredUser: string;
        guestUser: string;
        voteSingular: string;
        votePlural: string;
    };
    inlineVotePanel: {
        eyebrow: string;
        summary: string;
        learnMore: string;
        signInToAssess: string;
        error: string;
    };
    votePanel: {
        eyebrow: string;
        title: string;
        cannotVote: string;
        authenticatedSummary: string;
        guestSummary: string;
        crowdEstimate: string;
        leading: string;
        window: string;
        yourVote: string;
        eventsRecorded: string;
        createAccount: string;
        signIn: string;
        error: string;
    };
    deliveryPlan: {
        eyebrow: string;
        title: string;
        cadence: string;
        target: string;
        currentPhase: string;
        due: string;
        completed: string;
        modelLabels: Record<PromiseDeliveryPlan["model"], string>;
        checkpointStatusLabels: Record<PromiseDeliveryCheckpoint["status"], string>;
    };
    sources: {
        title: string;
        captured: string;
        verifiedSource: string;
        verificationPending: string;
        openSourceRecord: string;
    };
    trend: {
        title: string;
        emptySummary: string;
        summary: string;
        snapshotSingular: string;
        snapshotPlural: string;
        completion: string;
        assessors: string;
    };
    timelineHero: {
        jurisdictionTimeline: string;
        voteMeaning: string;
        timelineScore: string;
        timelineScoreSummary: string;
        currentTimeline: string;
        results: string;
        promiseClock: string;
        openRecords: string;
        openRecordsSummary: string;
        assessedProgress: string;
        assessedProgressSummary: string;
        termElapsed: string;
        monthOf: string;
        termClockFallback: string;
        pace: string;
        paceSummary: string;
        coverage: string;
        coverageSummary: string;
        assessments: string;
        projectionRefreshed: string;
        recentElectionSnapshot: string;
        votesCast: string;
        votesOfRegistered: string;
        turnout: string;
        statewideParticipation: string;
        primarySources: string;
        resultBreakdown: string;
        voteShareAndSeats: string;
        recentMandateBefore: string;
        allianceResult: string;
        voteShare: string;
        votesAndSeats: string;
        votesAndSeatsWithSeats: string;
    };
};

type PublicUiOverrides = Partial<{
    [Section in keyof PublicUiMessages]: Partial<PublicUiMessages[Section]>;
}>;

const englishPublicUi: PublicUiMessages = {
    filters: {
        all: "All",
        category: "Category",
        status: "Status"
    },
    timelinePage: {
        contextEyebrow: "Timeline context",
        overviewTitle: "Overview content",
        sourcePath: "Source: {path}"
    },
    promiseDetailPage: {
        uniqueId: "Unique id: {id}",
        timeline: "Timeline: {title}",
        officeHolder: "{officeTitle}: {officeHolder}",
        election: "Election: {election}",
        jurisdiction: "Jurisdiction: {jurisdiction}",
        voteMeaning: "Vote meaning: {value}",
        voting: "Voting: {state}",
        reconciliation: "Reconciliation: {status}",
        statusHistory: "Status history",
        fromStatus: "from {status}",
        unsetStatus: "not set",
        aggregateReconciliation: "Aggregate reconciliation",
        currentCompletion: "Current completion",
        latestSnapshot: "Latest snapshot",
        drift: "Drift"
    },
    none: "None",
    statusLabels: {
        planned: "planned",
        in_progress: "in progress",
        fulfilled: "fulfilled",
        delayed: "delayed",
        disputed: "disputed"
    },
    voteLabels: {
        not_started: "Not started",
        started: "Started",
        in_progress: "In progress",
        mostly_done: "Mostly done",
        completed: "Completed"
    },
    voteShortLabels: {
        not_started: "Not started",
        started: "Started",
        in_progress: "In progress",
        mostly_done: "Mostly done",
        completed: "Completed"
    },
    windowStateLabels: {
        scheduled: "scheduled",
        open: "open",
        frozen: "frozen",
        closed: "closed"
    },
    promiseCard: {
        completion: "Completion",
        assessors: "Assessors",
        leading: "Leading",
        sources: "Sources",
        assessmentEvents: "Assessment events",
        tracking: "Tracking",
        cadence: "Cadence",
        target: "Target"
    },
    voteSegment: {
        registeredUser: "Registered user",
        guestUser: "Guest user",
        voteSingular: "vote",
        votePlural: "votes"
    },
    inlineVotePanel: {
        eyebrow: "Quick assessment",
        summary: "Pick the stage that best describes delivery right now.",
        learnMore: "Learn more",
        signInToAssess: "Sign in to assess",
        error: "Voting failed. Please try again."
    },
    votePanel: {
        eyebrow: "Public assessment",
        title: "Delivery score",
        cannotVote: "This account cannot vote (suspended or read-only).",
        authenticatedSummary: "Choose the stage that best reflects what has actually been delivered so far.",
        guestSummary: "You're voting as a guest — your assessment counts but carries lower weight. Sign in or create an account to have it verified.",
        crowdEstimate: "Crowd estimate (all voters)",
        leading: "Leading",
        window: "Window",
        yourVote: "Your vote",
        eventsRecorded: "Events recorded",
        createAccount: "Create account",
        signIn: "Sign in",
        error: "Voting failed. Please try again."
    },
    deliveryPlan: {
        eyebrow: "Delivery tracking",
        title: "How this promise should be monitored",
        cadence: "Cadence",
        target: "Target",
        currentPhase: "Current phase",
        due: "Due {date}",
        completed: "Completed {date}",
        modelLabels: {
            one_time: "one time",
            milestone: "milestone",
            recurring: "recurring"
        },
        checkpointStatusLabels: {
            planned: "planned",
            in_progress: "in progress",
            met: "met",
            missed: "missed"
        }
    },
    sources: {
        title: "Sources",
        captured: "Captured {date}",
        verifiedSource: "verified source",
        verificationPending: "verification pending",
        openSourceRecord: "Open source record"
    },
    trend: {
        title: "Historical delivery trend",
        emptySummary: "No snapshots have been captured yet. Run the snapshot worker to start charting crowd-estimated delivery progress.",
        summary: "Completion snapshots captured by the Phase 2 worker pipeline.",
        snapshotSingular: "snapshot",
        snapshotPlural: "snapshots",
        completion: "Completion",
        assessors: "Assessors"
    },
    timelineHero: {
        jurisdictionTimeline: "Timeline",
        voteMeaning: "Vote meaning",
        timelineScore: "Timeline score",
        timelineScoreSummary: "Public delivery estimate across assessed promises.",
        currentTimeline: "Current timeline",
        results: "Results",
        promiseClock: "Promise clock",
        openRecords: "Open records",
        openRecordsSummary: "{promises} promises · {reviews} moderation reviews",
        assessedProgress: "Assessed progress",
        assessedProgressSummary: "Average across promises with votes.",
        termElapsed: "Term elapsed",
        monthOf: "Month {elapsed} of {total}.",
        termClockFallback: "Clock starts once the government takes office.",
        pace: "Pace",
        paceSummary: "Points ahead of or behind the term clock.",
        coverage: "Coverage",
        coverageSummary: "{assessed} of {total} promises assessed.",
        assessments: "Assessments",
        projectionRefreshed: "Projection refreshed {date}.",
        recentElectionSnapshot: "Most recent election snapshot",
        votesCast: "Votes cast",
        votesOfRegistered: "of {registered} registered",
        turnout: "Turnout",
        statewideParticipation: "statewide participation",
        primarySources: "Primary sources",
        resultBreakdown: "Result breakdown",
        voteShareAndSeats: "Vote share and seats",
        recentMandateBefore: "Recent mandate before {title}",
        allianceResult: "Alliance result",
        voteShare: "{value}% vote share",
        votesAndSeats: "{votes} votes",
        votesAndSeatsWithSeats: "{votes} votes · {seats} seats"
    }
};

const localizedPublicUi: Partial<Record<SupportedLocale, PublicUiOverrides>> = {
    ta: {
        filters: {
            all: "அனைத்தும்",
            category: "வகை",
            status: "நிலை"
        },
        timelinePage: {
            contextEyebrow: "காலவரிசை பின்னணி",
            overviewTitle: "மேலோட்ட உள்ளடக்கம்",
            sourcePath: "மூலம்: {path}"
        },
        promiseDetailPage: {
            uniqueId: "தனிப்பட்ட அடையாளம்: {id}",
            timeline: "காலவரிசை: {title}",
            officeHolder: "{officeTitle}: {officeHolder}",
            election: "தேர்தல்: {election}",
            jurisdiction: "அதிகார வரம்பு: {jurisdiction}",
            voteMeaning: "வாக்கின் அர்த்தம்: {value}",
            voting: "வாக்களிப்பு: {state}",
            reconciliation: "ஒப்புமைச் சரிபார்ப்பு: {status}",
            statusHistory: "நிலை வரலாறு",
            fromStatus: "{status} இலிருந்து",
            unsetStatus: "அமைக்கப்படவில்லை",
            aggregateReconciliation: "மொத்த ஒப்புமைச் சரிபார்ப்பு",
            currentCompletion: "தற்போதைய நிறைவு",
            latestSnapshot: "சமீபத்திய snapshot",
            drift: "விலகல்"
        },
        none: "எதுவும் இல்லை",
        statusLabels: {
            planned: "திட்டமிடப்பட்டது",
            in_progress: "நடைபெறுகிறது",
            fulfilled: "நிறைவேற்றப்பட்டது",
            delayed: "தாமதம்",
            disputed: "சர்ச்சைக்குரியது"
        },
        voteLabels: {
            not_started: "தொடங்கவில்லை",
            started: "தொடங்கியது",
            in_progress: "நடைபெறுகிறது",
            mostly_done: "பெரும்பாலும் முடிந்தது",
            completed: "முழுமையாக முடிந்தது"
        },
        voteShortLabels: {
            not_started: "தொடங்கவில்லை",
            started: "தொடங்கியது",
            in_progress: "நடைபெறுகிறது",
            mostly_done: "முடிவடைகிறது",
            completed: "முடிந்தது"
        },
        windowStateLabels: {
            scheduled: "திட்டமிடப்பட்டது",
            open: "திறந்துள்ளது",
            frozen: "முடக்கப்பட்டுள்ளது",
            closed: "மூடப்பட்டுள்ளது"
        },
        promiseCard: {
            completion: "நிறைவேற்றல்",
            assessors: "மதிப்பீட்டாளர்கள்",
            leading: "முன்னிலை",
            sources: "ஆதாரங்கள்",
            assessmentEvents: "மதிப்பீட்டு நிகழ்வுகள்",
            tracking: "கண்காணிப்பு",
            cadence: "இடைவெளி",
            target: "இலக்கு"
        },
        voteSegment: {
            registeredUser: "பதிவுசெய்த பயனர்",
            guestUser: "விருந்தினர் பயனர்",
            voteSingular: "வாக்கு",
            votePlural: "வாக்குகள்"
        },
        inlineVotePanel: {
            eyebrow: "விரைவு மதிப்பீடு",
            summary: "இப்போது எந்த நிலையில் உள்ளது என்பதைச் சொல்லும் கட்டத்தைத் தேர்வு செய்யுங்கள்.",
            learnMore: "மேலும் அறிய",
            signInToAssess: "மதிப்பிட உள்நுழைக",
            error: "வாக்களிப்பு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்."
        },
        votePanel: {
            eyebrow: "பொது மதிப்பீடு",
            title: "நிறைவேற்றல் மதிப்பெண்",
            cannotVote: "இந்தக் கணக்கால் வாக்களிக்க முடியாது (இடைநிறுத்தப்பட்டது அல்லது படிக்க மட்டும்).",
            authenticatedSummary: "உண்மையில் எவ்வளவு நிறைவேற்றப்பட்டுள்ளது என்பதைச் சரியாக பிரதிபலிக்கும் கட்டத்தைத் தேர்வு செய்யுங்கள்.",
            guestSummary: "நீங்கள் விருந்தினராக வாக்களிக்கிறீர்கள் — உங்கள் மதிப்பீடு கணக்கில் எடுத்துக்கொள்ளப்படும், ஆனால் குறைந்த எடை பெறும். சரிபார்க்கப்பட்டதாக எண்ணப்பட உள்நுழையுங்கள் அல்லது கணக்கு உருவாக்குங்கள்.",
            crowdEstimate: "மக்கள் மதிப்பீடு (அனைத்து வாக்காளர்கள்)",
            leading: "முன்னிலை",
            window: "சாளரம்",
            yourVote: "உங்கள் வாக்கு",
            eventsRecorded: "பதிவான நிகழ்வுகள்",
            createAccount: "கணக்கு உருவாக்கு",
            signIn: "உள்நுழை",
            error: "வாக்களிப்பு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்."
        },
        deliveryPlan: {
            eyebrow: "நிறைவேற்றல் கண்காணிப்பு",
            title: "இந்த வாக்குறுதியை எப்படி கண்காணிக்க வேண்டும்",
            cadence: "இடைவெளி",
            target: "இலக்கு",
            currentPhase: "தற்போதைய கட்டம்",
            due: "நிலுவை {date}",
            completed: "முடிந்தது {date}",
            modelLabels: {
                one_time: "ஒருமுறை",
                milestone: "கட்டம் அடிப்படையிலானது",
                recurring: "மீண்டும் மீண்டும்"
            },
            checkpointStatusLabels: {
                planned: "திட்டமிடப்பட்டது",
                in_progress: "நடைபெறுகிறது",
                met: "நிறைவேற்றப்பட்டது",
                missed: "தவறிவிட்டது"
            }
        },
        sources: {
            title: "ஆதாரங்கள்",
            captured: "பதிவு செய்தது {date}",
            verifiedSource: "சரிபார்க்கப்பட்ட ஆதாரம்",
            verificationPending: "சரிபார்ப்பு நிலுவையில்",
            openSourceRecord: "ஆதாரப் பதிவைத் திறக்கவும்"
        },
        trend: {
            title: "வரலாற்று நிறைவேற்றல் போக்கு",
            emptySummary: "இன்னும் snapshot-கள் உருவாக்கப்படவில்லை. மக்கள் மதிப்பிட்ட நிறைவேற்றல் முன்னேற்றத்தைப் பார்க்க snapshot worker-ஐ இயக்குங்கள்.",
            summary: "Phase 2 worker pipeline உருவாக்கிய completion snapshot-கள்.",
            snapshotSingular: "snapshot",
            snapshotPlural: "snapshots",
            completion: "நிறைவேற்றல்",
            assessors: "மதிப்பீட்டாளர்கள்"
        },
        timelineHero: {
            jurisdictionTimeline: "காலவரிசை",
            voteMeaning: "வாக்கின் அர்த்தம்",
            timelineScore: "காலவரிசை மதிப்பெண்",
            timelineScoreSummary: "மதிப்பிடப்பட்ட வாக்குறுதிகளின் அடிப்படையில் பொதுவான நிறைவேற்றல் மதிப்பீடு.",
            currentTimeline: "தற்போதைய காலவரிசை",
            results: "முடிவுகள்",
            promiseClock: "வாக்குறுதி கடிகாரம்",
            openRecords: "திறந்த பதிவுகள்",
            openRecordsSummary: "{promises} வாக்குறுதிகள் · {reviews} moderation reviews",
            assessedProgress: "மதிப்பிடப்பட்ட முன்னேற்றம்",
            assessedProgressSummary: "வாக்குகள் உள்ள வாக்குறுதிகளின் சராசரி.",
            termElapsed: "காலம் சென்றவை",
            monthOf: "{total} மாதங்களில் {elapsed}வது மாதம்.",
            termClockFallback: "அரசு பதவியேற்ற பின் கடிகாரம் துவங்கும்.",
            pace: "வேகம்",
            paceSummary: "காலக்கடிகாரத்தை விட முன்னோ, பின்னோ இருக்கும் புள்ளிகள்.",
            coverage: "பரவல்",
            coverageSummary: "{total} வாக்குறுதிகளில் {assessed} மதிப்பிடப்பட்டுள்ளன.",
            assessments: "மதிப்பீடுகள்",
            projectionRefreshed: "கணிப்பு புதுப்பிக்கப்பட்டது {date}.",
            recentElectionSnapshot: "சமீபத்திய தேர்தல் சுருக்கம்",
            votesCast: "பதிவான வாக்குகள்",
            votesOfRegistered: "பதிவுசெய்த {registered} பேரில்",
            turnout: "வருகை விகிதம்",
            statewideParticipation: "மாநில அளவிலான பங்கேற்பு",
            primarySources: "முதன்மை ஆதாரங்கள்",
            resultBreakdown: "முடிவுகளின் பிரிப்பு",
            voteShareAndSeats: "வாக்கு பங்கு மற்றும் இடங்கள்",
            recentMandateBefore: "{title}க்கு முந்தைய சமீபத்திய ஆணை",
            allianceResult: "கூட்டணி முடிவு",
            voteShare: "{value}% வாக்கு பங்கு",
            votesAndSeats: "{votes} வாக்குகள்",
            votesAndSeatsWithSeats: "{votes} வாக்குகள் · {seats} இடங்கள்"
        }
    }
};

export function fillTemplate(template: string, values: Record<string, string | number>) {
    return Object.entries(values).reduce((result, [key, value]) => result.replaceAll(`{${key}}`, String(value)), template);
}

export function formatCountLabel(count: number, singular: string, plural: string) {
    return `${count} ${count === 1 ? singular : plural}`;
}

export function getPublicUiMessages(locale: SupportedLocale): PublicUiMessages {
    const overrides = localizedPublicUi[locale] ?? localizedPublicUi[platformFallbackLocale] ?? {};

    return {
        filters: {
            ...englishPublicUi.filters,
            ...overrides.filters
        },
        timelinePage: {
            ...englishPublicUi.timelinePage,
            ...overrides.timelinePage
        },
        promiseDetailPage: {
            ...englishPublicUi.promiseDetailPage,
            ...overrides.promiseDetailPage
        },
        none: overrides.none ?? englishPublicUi.none,
        statusLabels: {
            ...englishPublicUi.statusLabels,
            ...overrides.statusLabels
        },
        voteLabels: {
            ...englishPublicUi.voteLabels,
            ...overrides.voteLabels
        },
        voteShortLabels: {
            ...englishPublicUi.voteShortLabels,
            ...overrides.voteShortLabels
        },
        windowStateLabels: {
            ...englishPublicUi.windowStateLabels,
            ...overrides.windowStateLabels
        },
        promiseCard: {
            ...englishPublicUi.promiseCard,
            ...overrides.promiseCard
        },
        voteSegment: {
            ...englishPublicUi.voteSegment,
            ...overrides.voteSegment
        },
        inlineVotePanel: {
            ...englishPublicUi.inlineVotePanel,
            ...overrides.inlineVotePanel
        },
        votePanel: {
            ...englishPublicUi.votePanel,
            ...overrides.votePanel
        },
        deliveryPlan: {
            ...englishPublicUi.deliveryPlan,
            ...overrides.deliveryPlan,
            modelLabels: {
                ...englishPublicUi.deliveryPlan.modelLabels,
                ...overrides.deliveryPlan?.modelLabels
            },
            checkpointStatusLabels: {
                ...englishPublicUi.deliveryPlan.checkpointStatusLabels,
                ...overrides.deliveryPlan?.checkpointStatusLabels
            }
        },
        sources: {
            ...englishPublicUi.sources,
            ...overrides.sources
        },
        trend: {
            ...englishPublicUi.trend,
            ...overrides.trend
        },
        timelineHero: {
            ...englishPublicUi.timelineHero,
            ...overrides.timelineHero
        }
    };
}
