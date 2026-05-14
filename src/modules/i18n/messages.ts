import { platformFallbackLocale, type SupportedLocale } from "@/modules/i18n/config";

export type AppMessages = {
    navigation: {
        brand: string;
        home: string;
        language: string;
        newPromise: string;
        tenantLocales: string;
        audit: string;
        moderation: string;
        createAccount: string;
        signIn: string;
        signOut: string;
    };
    auth: {
        loginEyebrow: string;
        loginTitle: string;
        loginSummary: string;
        demoPasswordLabel: string;
        demoRoleLabel: string;
        credentialsTitle: string;
        credentialsSummary: string;
        newHere: string;
        createAccountLink: string;
        resetPasswordLink: string;
        signupEyebrow: string;
        signupTitle: string;
        signupSummary: string;
        afterRegistrationTitle: string;
        afterRegistrationBody: string;
        demoModeTitle: string;
        demoModeBody: string;
        alreadyHaveAccount: string;
        signInLink: string;
        createAccountTitle: string;
        createAccountSummary: string;
        resetPasswordTitle: string;
        resetPasswordSummary: string;
        resetPasswordEmailOnly: string;
        backToSignIn: string;
        signInForm: {
            signInType: string;
            emailAddress: string;
            mobileNumber: string;
            aadhaarId: string;
            panCard: string;
            password: string;
            passwordPlaceholder: string;
            error: string;
            submitting: string;
            submit: string;
        };
        resetPasswordRequestForm: {
            email: string;
            emailPlaceholder: string;
            success: string;
            failed: string;
            submitting: string;
            submit: string;
        };
        resetPasswordCompleteForm: {
            newPassword: string;
            confirmPassword: string;
            mismatch: string;
            invalidToken: string;
            failed: string;
            success: string;
            submitting: string;
            submit: string;
        };
        signUpForm: {
            identifierType: string;
            displayName: string;
            optional: string;
            displayNamePlaceholder: string;
            password: string;
            passwordPlaceholder: string;
            passwordHint: string;
            accountCreated: string;
            signedInLaterEmail: string;
            signedInLaterOther: string;
            signInPage: string;
            emailLabel: string;
            passwordLabel: string;
            chosenPassword: string;
            chooseSignInType: string;
            phoneVerificationNext: string;
            verifyNow: string;
            continue: string;
            autoSignInFailed: string;
            creating: string;
            submit: string;
            identifierOptions: {
                email: string;
                phone: string;
                aadhaar: string;
                pan: string;
            };
            identifierHints: {
                email: string;
                phone: string;
                aadhaar: string;
                pan: string;
            };
        };
    };
    account: {
        title: string;
        verifiedFlash: string;
        invalidVerificationFlash: string;
        verificationErrorFlash: string;
        phoneSavedFlash: string;
        phoneUpdatedFlash: string;
        phoneDeletedFlash: string;
        communityAttestationRequestedFlash: string;
        role: string;
        emailVerified: string;
        phoneVerified: string;
        yes: string;
        no: string;
        trustScore: string;
        communityScore: string;
        communityScoreEligible: string;
        communityScorePending: string;
        votesCast: string;
        verifyEmailTitle: string;
        verifyEmailSummary: string;
        addPhoneTitle: string;
        addPhoneSummary: string;
        managePhoneTitle: string;
        managePhoneSummary: string;
        primaryPhoneDeleteGuard: string;
        verifyPhoneTitle: string;
        verifyPhoneSummary: string;
        verifyCta: string;
        communityAttestationTitle: string;
        communityAttestationSummary: string;
        communityAttestationPromotionSummary: string;
        communityAttestationOpenStatus: string;
        communityAttestationResolvedStatus: string;
        communityAttestationWitnessCount: string;
        communityAttestationLocalCount: string;
        communityAttestationRequestLocation: string;
        communityAttestationShareLabel: string;
        communityAttestationWitnessesTitle: string;
        communityAttestationNoWitnesses: string;
        communityAttestationLocalWitness: string;
        communityAttestationRemoteWitness: string;
        communityAttestationWitnessEyebrow: string;
        communityAttestationWitnessTitle: string;
        communityAttestationWitnessSummary: string;
        communityAttestationDetailsTitle: string;
        communityAttestationResolvedMessage: string;
        communityAttestationAlreadyWitnessed: string;
        communityAttestationCannotWitness: string;
        backToAccount: string;
        myVotes: string;
        votePointsSummary: string;
        votePointsEarned: string;
        votePointsExpired: string;
        pointHistoryTitle: string;
        pointHistorySummary: string;
        pointHistoryCurrentTitle: string;
        pointHistoryCurrentEmpty: string;
        pointHistoryWindowBadge: string;
        pointHistoryActivityTitle: string;
        pointHistoryNoActivity: string;
        pointHistoryCountsNow: string;
        pointHistoryExpired: string;
        noVotes: string;
        changePassword: string;
        voteLabels: Record<string, string>;
        roleLabels: Record<string, string>;
        stateLabels: Record<string, string>;
        verifyEmailButton: {
            sent: string;
            error: string;
            sending: string;
            idle: string;
        };
        addPhoneForm: {
            label: string;
            placeholder: string;
            failed: string;
            saving: string;
            submit: string;
            update: string;
            delete: string;
            deleting: string;
            deleteFailed: string;
        };
        communityAttestationRequestForm: {
            city: string;
            locality: string;
            postalCode: string;
            address: string;
            statement: string;
            statementDefault: string;
            failed: string;
            saving: string;
            submit: string;
        };
        verifyPhoneForm: {
            idle: string;
            sending: string;
            sent: string;
            codeLabel: string;
            codePlaceholder: string;
            submit: string;
            verifying: string;
            sendError: string;
            verifyError: string;
            debugCodeLabel: string;
        };
        communityAttestationWitnessForm: {
            relationship: string;
            city: string;
            locality: string;
            postalCode: string;
            note: string;
            failed: string;
            success: string;
            submitting: string;
            submit: string;
        };
        changePasswordForm: {
            currentPassword: string;
            newPassword: string;
            confirmPassword: string;
            mismatch: string;
            failed: string;
            success: string;
            saving: string;
            submit: string;
        };
    };
    admin: {
        eyebrow: string;
        auditTitle: string;
        auditSummary: string;
        moderationEyebrow: string;
        moderationTitle: string;
        moderationSummary: string;
        createPromiseTitle: string;
        createPromiseSummary: string;
        tenantLocalesTitle: string;
        tenantLocalesSummary: string;
        tenantLocalesPending: string;
        tenantLocalesConstraintsTitle: string;
        tenantLocalesPrimaryLabel: string;
        tenantLocalesSupportedLabel: string;
        tenantLocalesAvailableLabel: string;
        tenantLocalesSaveIdle: string;
        tenantLocalesSavePending: string;
        tenantLocalesSaveSuccess: string;
        tenantLocalesSaveError: string;
    };
    home: {
        eyebrow: string;
        headline: string;
        summary: string;
    };
};

type MessageOverrides = Partial<{
    [Section in keyof AppMessages]: Partial<AppMessages[Section]>;
}>;

const englishMessages: AppMessages = {
    navigation: {
        brand: "Track Promises",
        home: "Home",
        language: "Language",
        newPromise: "New promise",
        tenantLocales: "Tenant locales",
        audit: "Audit",
        moderation: "Moderation",
        createAccount: "Create account",
        signIn: "Sign in",
        signOut: "Sign out"
    },
    auth: {
        loginEyebrow: "Authentication",
        loginTitle: "Sign in to continue",
        loginSummary: "Use your account to vote, manage permissions, and access admin tools through a real session.",
        demoPasswordLabel: "Password",
        demoRoleLabel: "Role",
        credentialsTitle: "Credentials sign-in",
        credentialsSummary: "Enter your identifier and password to continue.",
        newHere: "New here?",
        createAccountLink: "Create an account",
        resetPasswordLink: "Reset password",
        signupEyebrow: "Create account",
        signupTitle: "Just one piece of information",
        signupSummary: "Register with your email, phone number, Aadhaar ID, or PAN card.",
        afterRegistrationTitle: "After registration",
        afterRegistrationBody: "Your account starts as unverified. Verify your email address or mobile number from the account page to have your votes count as verified.",
        demoModeTitle: "Demo mode",
        demoModeBody: "Email verification is live. Phone verification uses SMS when configured, and falls back to an on-screen debug code during local development.",
        alreadyHaveAccount: "Already have an account?",
        signInLink: "Sign in",
        createAccountTitle: "Create your account",
        createAccountSummary: "Choose how you want to identify yourself. Email and phone accounts can be verified today; Aadhaar and PAN options will be verified with government records in a future release.",
        resetPasswordTitle: "Reset your password",
        resetPasswordSummary: "Request a smart link for a verified email account, then choose a new password from that link.",
        resetPasswordEmailOnly: "Smart-link password reset currently works only for verified email accounts. SMS reset is not wired yet.",
        backToSignIn: "Back to sign in",
        signInForm: {
            signInType: "Sign-in type",
            emailAddress: "Email address",
            mobileNumber: "Mobile number",
            aadhaarId: "Aadhaar ID",
            panCard: "PAN card",
            password: "Password",
            passwordPlaceholder: "Your password",
            error: "Sign-in failed. Check your identifier and password.",
            submitting: "Signing in...",
            submit: "Sign in"
        },
        resetPasswordRequestForm: {
            email: "Email address",
            emailPlaceholder: "you@example.com",
            success: "If that verified email account exists, we sent a reset link.",
            failed: "We could not send a reset link right now.",
            submitting: "Sending link...",
            submit: "Send reset link"
        },
        resetPasswordCompleteForm: {
            newPassword: "New password",
            confirmPassword: "Confirm new password",
            mismatch: "New passwords do not match.",
            invalidToken: "This reset link is invalid or has expired.",
            failed: "We could not reset the password.",
            success: "Password reset complete. You can sign in with your new password now.",
            submitting: "Resetting password...",
            submit: "Reset password"
        },
        signUpForm: {
            identifierType: "Identifier type",
            displayName: "Display name",
            optional: "optional",
            displayNamePlaceholder: "How you'll appear on the site",
            password: "Password",
            passwordPlaceholder: "At least 8 characters",
            passwordHint: "You'll use this to sign back in.",
            accountCreated: "Account created!",
            signedInLaterEmail: "You're now signed in. To sign back in later, go to the sign-in page and use:",
            signedInLaterOther: "You're now signed in. To sign back in later, go to the sign-in page, choose the right sign-in type, and enter your number again.",
            signInPage: "sign-in page",
            emailLabel: "Email:",
            passwordLabel: "Password:",
            chosenPassword: "the one you just chose",
            chooseSignInType: "Choose sign-in type:",
            phoneVerificationNext: "Verify this phone number from your account page to have your votes count as verified.",
            verifyNow: "Verify now",
            continue: "Continue",
            autoSignInFailed: "Account created but auto sign-in failed. Please use the sign-in page.",
            creating: "Creating account…",
            submit: "Create account",
            identifierOptions: {
                email: "Email address",
                phone: "Mobile number (OTP)",
                aadhaar: "Aadhaar ID",
                pan: "PAN card"
            },
            identifierHints: {
                email: "You'll use this email and the password you choose to sign in.",
                phone: "We will text this number a verification code from your account page.",
                aadhaar: "12-digit Aadhaar issued by UIDAI.",
                pan: "10-character Permanent Account Number."
            }
        }
    },
    account: {
        title: "My account",
        verifiedFlash: "Your account is verified. Your votes now count as verified votes.",
        invalidVerificationFlash: "That verification link is invalid or has expired. Please request a new one below.",
        verificationErrorFlash: "We couldn't complete verification right now. Please request a new verification attempt and try again.",
        phoneSavedFlash: "Mobile number saved. You can send a verification code below.",
        phoneUpdatedFlash: "Mobile number updated. If it was previously verified, request a new SMS code below.",
        phoneDeletedFlash: "Mobile number removed from this account.",
        communityAttestationRequestedFlash: "Community attestation started. Share the request link below with people who can vouch for you.",
        role: "Role",
        emailVerified: "Email verified",
        phoneVerified: "Phone verified",
        yes: "Yes",
        no: "No",
        trustScore: "Trust score",
        communityScore: "Community score",
        communityScoreEligible: "Promotion threshold reached at {threshold} points in the current scoring window.",
        communityScorePending: "{remaining} more points needed to reach the {threshold}-point promotion threshold in the current {windowDays}-day window.",
        votesCast: "Votes cast",
        verifyEmailTitle: "Verify your email",
        verifyEmailSummary: "Your votes are currently counted as unverified. Verify your email to have them count toward the verified score.",
        addPhoneTitle: "Add a mobile number instead",
        addPhoneSummary: "If email is not practical for you, add a mobile number here and verify it by SMS.",
        managePhoneTitle: "Manage your mobile number",
        managePhoneSummary: "Change or remove the mobile number used for SMS verification.",
        primaryPhoneDeleteGuard: "This mobile number is also your primary sign-in identifier, so you can only replace it, not remove it entirely.",
        verifyPhoneTitle: "Verify your mobile number",
        verifyPhoneSummary: "Your votes are currently counted as unverified. Send a 6-digit code to {phone}, then enter it below to count toward the verified score.",
        verifyCta: "Verify",
        communityAttestationTitle: "Request local verifier promotion",
        communityAttestationSummary: "Registered users can request promotion here so moderator-approved local verifiers can review and attest the account.",
        communityAttestationPromotionSummary: "Use this when you want your account promoted to the local-attester level so you can help verify nearby accounts after approval.",
        communityAttestationOpenStatus: "Waiting for local verifier witnesses",
        communityAttestationResolvedStatus: "Verification request completed",
        communityAttestationWitnessCount: "{count} of {threshold} witness statements received",
        communityAttestationLocalCount: "{count} witness statements currently match your local area.",
        communityAttestationRequestLocation: "Request area: {city}",
        communityAttestationShareLabel: "Share this request link:",
        communityAttestationWitnessesTitle: "Witnesses recorded",
        communityAttestationNoWitnesses: "No one has vouched yet.",
        communityAttestationLocalWitness: "Local area match",
        communityAttestationRemoteWitness: "Needs moderator review",
        communityAttestationWitnessEyebrow: "Community attestation",
        communityAttestationWitnessTitle: "Attest this promotion request",
        communityAttestationWitnessSummary: "Confirm that {name} is known in your local area and should be approved to verify nearby accounts.",
        communityAttestationDetailsTitle: "Request details",
        communityAttestationResolvedMessage: "This attestation request has already been resolved.",
        communityAttestationAlreadyWitnessed: "You have already vouched for this request.",
        communityAttestationCannotWitness: "Only moderator-approved local verifiers can vouch for someone else here.",
        backToAccount: "Back to account",
        myVotes: "My votes",
        votePointsSummary: "Points shown next to each vote count only while they remain inside that tenant's current scoring window.",
        votePointsEarned: "+{points} pts",
        votePointsExpired: "No active vote points",
        pointHistoryTitle: "Point history",
        pointHistorySummary: "Shows every rewarded action for {tenant}, including actions that have already fallen out of the current {windowDays}-day scoring window.",
        pointHistoryCurrentTitle: "Current points in score",
        pointHistoryCurrentEmpty: "No points are currently counting toward this tenant's score.",
        pointHistoryWindowBadge: "Current activity window: {windowDays} days",
        pointHistoryActivityTitle: "Rewarded actions",
        pointHistoryNoActivity: "No point activity has been recorded for this tenant yet.",
        pointHistoryCountsNow: "Counts now",
        pointHistoryExpired: "History only",
        noVotes: "You haven't voted on any promises yet.",
        changePassword: "Change password",
        voteLabels: {
            not_started: "Not started",
            started: "Started",
            in_progress: "In progress",
            mostly_done: "Mostly done",
            completed: "Completed"
        },
        roleLabels: {
            user: "Voter",
            promise_editor: "Promise Editor",
            moderator: "Moderator",
            tenant_admin: "Tenant Admin",
            platform_admin: "Platform Admin",
            guest: "Guest"
        },
        stateLabels: {
            unverified: "Unverified",
            verified: "Verified",
            moderator_approved: "Moderator approved",
            readonly: "Read-only",
            suspended: "Suspended"
        },
        verifyEmailButton: {
            sent: "Verification email sent — check your inbox and click the link.",
            error: "Something went wrong. Please try again.",
            sending: "Sending…",
            idle: "Send verification email"
        },
        addPhoneForm: {
            label: "Mobile number",
            placeholder: "+91 98765 43210",
            failed: "We couldn't save that mobile number right now.",
            saving: "Saving…",
            submit: "Save mobile number",
            update: "Update mobile number",
            delete: "Remove mobile number",
            deleting: "Removing…",
            deleteFailed: "We couldn't remove that mobile number right now."
        },
        communityAttestationRequestForm: {
            city: "City or town",
            locality: "Locality / neighborhood",
            postalCode: "Postal code",
            address: "Street address or landmark",
            statement: "Optional note for witnesses",
            statementDefault: "Please promote my account to a local verifier so I can help neighbors get their accounts verified. Thanks.",
            failed: "We couldn't start community attestation right now.",
            saving: "Starting…",
            submit: "Request verifier promotion"
        },
        verifyPhoneForm: {
            idle: "Send SMS code",
            sending: "Sending code…",
            sent: "Verification code sent. Enter the 6-digit code from the SMS to finish verification.",
            codeLabel: "Verification code",
            codePlaceholder: "123456",
            submit: "Verify phone",
            verifying: "Verifying…",
            sendError: "We couldn't send a verification code right now.",
            verifyError: "We couldn't verify that code. Request a new one and try again.",
            debugCodeLabel: "Local dev code:"
        },
        communityAttestationWitnessForm: {
            relationship: "How do you know this person?",
            city: "Your city or town",
            locality: "Your locality / neighborhood",
            postalCode: "Your postal code",
            note: "Optional supporting note",
            failed: "We couldn't record your attestation right now.",
            success: "Your witness statement has been recorded.",
            submitting: "Submitting…",
            submit: "Submit witness statement"
        },
        changePasswordForm: {
            currentPassword: "Current password",
            newPassword: "New password",
            confirmPassword: "Confirm new password",
            mismatch: "New passwords do not match.",
            failed: "Failed to change password.",
            success: "Password changed successfully.",
            saving: "Saving…",
            submit: "Change password"
        }
    },
    admin: {
        eyebrow: "Admin",
        auditTitle: "Audit activity",
        auditSummary: "Track promise creation, moderation decisions, snapshot captures, and reconciliation runs by tenant.",
        moderationEyebrow: "Moderation",
        moderationTitle: "Review queue",
        moderationSummary: "Trust-score signals now combine email verification, account age, review backlog, and abuse flags to support moderator decisions.",
        createPromiseTitle: "Create a promise",
        createPromiseSummary: "This form keeps promise creation limited to editor and admin roles while reusing tenant configuration for categories and statuses.",
        tenantLocalesTitle: "Tenant locale settings",
        tenantLocalesSummary: "Review the locale policy for each tenant before adding the write path. English stays enabled, and the tenant primary locale drives the default browsing language.",
        tenantLocalesPending: "Write controls are the next slice. This screen exposes the current tenant language policy and the constraints the update API will enforce.",
        tenantLocalesConstraintsTitle: "Constraints in force",
        tenantLocalesPrimaryLabel: "Primary locale",
        tenantLocalesSupportedLabel: "Enabled locales",
        tenantLocalesAvailableLabel: "Platform locales",
        tenantLocalesSaveIdle: "Save default language",
        tenantLocalesSavePending: "Saving…",
        tenantLocalesSaveSuccess: "Default browsing language updated.",
        tenantLocalesSaveError: "Unable to update the default browsing language."
    },
    home: {
        eyebrow: "Track Promises",
        headline: "A civic app for tracking public promises",
        summary:
            "Track promises from your point of view. Consider how each promise affects your life, then cast or update your vote while the poll remains open. Verify your account so you can return and revise your vote at any time."
    }
};

const localizedMessages: Partial<Record<SupportedLocale, MessageOverrides>> = {
    ta: {
        navigation: {
            home: "முகப்பு",
            language: "மொழி",
            newPromise: "புதிய வாக்குறுதி",
            tenantLocales: "டெனன்ட் மொழிகள்",
            audit: "தணிக்கை",
            moderation: "மதிப்பாய்வு",
            createAccount: "கணக்கு உருவாக்கு",
            signIn: "உள்நுழை",
            signOut: "வெளியேறு"
        },
        auth: {
            loginEyebrow: "அடையாளச் சரிபார்ப்பு",
            loginTitle: "தொடர உள்நுழையுங்கள்",
            loginSummary: "உங்கள் கணக்கைப் பயன்படுத்தி வாக்களிக்கவும், அனுமதிகளை நிர்வகிக்கவும், நிர்வாக கருவிகளை உண்மையான session மூலம் அணுகவும்.",
            demoPasswordLabel: "கடவுச்சொல்",
            demoRoleLabel: "பங்கு",
            credentialsTitle: "அடையாள விவர உள்நுழைவு",
            credentialsSummary: "தொடர உங்கள் அடையாளத் தகவலும் கடவுச்சொல்லும் உள்ளிடுங்கள்.",
            newHere: "இங்கு புதியவரா?",
            createAccountLink: "கணக்கு உருவாக்குங்கள்",
            resetPasswordLink: "கடவுச்சொல்லை மீட்டமைக்கவும்",
            signupEyebrow: "கணக்கு உருவாக்கு",
            signupTitle: "ஒரே ஒரு தகவல் போதும்",
            signupSummary: "மின்னஞ்சல், மொபைல் எண், ஆதார் ஐடி அல்லது PAN கார்டைப் பயன்படுத்தி பதிவு செய்யலாம்.",
            afterRegistrationTitle: "பதிவுக்குப் பிறகு",
            afterRegistrationBody: "உங்கள் கணக்கு முதலில் சரிபார்க்கப்படாத நிலையில் தொடங்கும். account page-இல் இருந்து மின்னஞ்சல் அல்லது மொபைல் எண்ணை சரிபார்த்ததும் உங்கள் வாக்குகள் verified ஆக கணக்கிடப்படும்.",
            demoModeTitle: "டெமோ நிலை",
            demoModeBody: "மின்னஞ்சல் சரிபார்ப்பு செயல்பாட்டில் உள்ளது. மொபைல் சரிபார்ப்பு SMS அமைக்கப்பட்டிருந்தால் SMS வழியாகவும், local development-இல் on-screen debug code வழியாகவும் வேலை செய்கிறது.",
            alreadyHaveAccount: "ஏற்கனவே கணக்கு உள்ளதா?",
            signInLink: "உள்நுழை",
            createAccountTitle: "உங்கள் கணக்கை உருவாக்குங்கள்",
            createAccountSummary: "நீங்கள் எந்த அடையாள முறையைப் பயன்படுத்த விரும்புகிறீர்கள் என்பதைத் தேர்வு செய்யுங்கள். மின்னஞ்சல் மற்றும் மொபைல் கணக்குகள் இன்று சரிபார்க்கப்படலாம்; ஆதார் மற்றும் PAN தேர்வுகள் எதிர்கால வெளியீட்டில் அரசு பதிவுகளுடன் சரிபார்க்கப்படும்.",
            resetPasswordTitle: "உங்கள் கடவுச்சொல்லை மீட்டமைக்கவும்",
            resetPasswordSummary: "சரிபார்க்கப்பட்ட மின்னஞ்சல் கணக்குக்கு smart link கோருங்கள்; அந்த இணைப்பிலிருந்து புதிய கடவுச்சொல்லை அமைக்கலாம்.",
            resetPasswordEmailOnly: "Smart-link password reset தற்போது verified email accounts-க்கு மட்டும் வேலை செய்கிறது. SMS reset இன்னும் இணைக்கப்படவில்லை.",
            backToSignIn: "உள்நுழைவுக்கு திரும்பவும்",
            signInForm: {
                signInType: "உள்நுழைவு வகை",
                emailAddress: "மின்னஞ்சல் முகவரி",
                mobileNumber: "மொபைல் எண்",
                aadhaarId: "ஆதார் ஐடி",
                panCard: "PAN கார்டு",
                password: "கடவுச்சொல்",
                passwordPlaceholder: "உங்கள் கடவுச்சொல்",
                error: "உள்நுழைவு தோல்வியடைந்தது. உங்கள் அடையாளமும் கடவுச்சொல்லையும் சரிபார்க்கவும்.",
                submitting: "உள்நுழைகிறது...",
                submit: "உள்நுழை"
            },
            resetPasswordRequestForm: {
                email: "மின்னஞ்சல் முகவரி",
                emailPlaceholder: "you@example.com",
                success: "அந்த verified email account இருந்தால், reset link அனுப்பப்பட்டுள்ளது.",
                failed: "இப்போது reset link அனுப்ப முடியவில்லை.",
                submitting: "இணைப்பு அனுப்பப்படுகிறது...",
                submit: "Reset link அனுப்பு"
            },
            resetPasswordCompleteForm: {
                newPassword: "புதிய கடவுச்சொல்",
                confirmPassword: "புதிய கடவுச்சொல்லை உறுதிப்படுத்தவும்",
                mismatch: "புதிய கடவுச்சொற்கள் பொருந்தவில்லை.",
                invalidToken: "இந்த reset link தவறானது அல்லது காலாவதியானது.",
                failed: "கடவுச்சொல்லை மீட்டமைக்க முடியவில்லை.",
                success: "கடவுச்சொல் மீட்டமைப்பு முடிந்தது. இப்போது புதிய கடவுச்சொல்லைப் பயன்படுத்தி உள்நுழையலாம்.",
                submitting: "கடவுச்சொல் மீட்டமைக்கப்படுகிறது...",
                submit: "கடவுச்சொல்லை மீட்டமை"
            },
            signUpForm: {
                identifierType: "அடையாள வகை",
                displayName: "காட்சி பெயர்",
                optional: "விருப்பத்தேர்வு",
                displayNamePlaceholder: "தளத்தில் நீங்கள் தோன்றும் பெயர்",
                password: "கடவுச்சொல்",
                passwordPlaceholder: "குறைந்தது 8 எழுத்துகள்",
                passwordHint: "பின்னர் மீண்டும் உள்நுழைய இதையே பயன்படுத்துவீர்கள்.",
                accountCreated: "கணக்கு உருவாக்கப்பட்டது!",
                signedInLaterEmail: "நீங்கள் இப்போது உள்நுழைந்துள்ளீர்கள். பிறகு மீண்டும் உள்நுழைய sign-in பக்கத்திற்குச் சென்று இதைப் பயன்படுத்துங்கள்:",
                signedInLaterOther: "நீங்கள் இப்போது உள்நுழைந்துள்ளீர்கள். பிறகு sign-in பக்கத்திற்குச் சென்று சரியான உள்நுழைவு வகையைத் தேர்வு செய்து உங்கள் எண்ணை மீண்டும் உள்ளிடுங்கள்.",
                signInPage: "உள்நுழைவு பக்கம்",
                emailLabel: "மின்னஞ்சல்:",
                passwordLabel: "கடவுச்சொல்:",
                chosenPassword: "நீங்கள் இப்போது தேர்ந்தெடுத்ததே",
                chooseSignInType: "உள்நுழைவு வகை:",
                phoneVerificationNext: "இந்த மொபைல் எண்ணை account page-இல் இருந்து சரிபார்த்தால் உங்கள் வாக்குகள் verified ஆக கணக்கிடப்படும்.",
                verifyNow: "இப்போதே சரிபார்",
                continue: "தொடரவும்",
                autoSignInFailed: "கணக்கு உருவாக்கப்பட்டது, ஆனால் தானியங்கு உள்நுழைவு தோல்வியடைந்தது. தயவுசெய்து sign-in பக்கத்தைப் பயன்படுத்துங்கள்.",
                creating: "கணக்கு உருவாக்கப்படுகிறது…",
                submit: "கணக்கு உருவாக்கு",
                identifierOptions: {
                    email: "மின்னஞ்சல் முகவரி",
                    phone: "மொபைல் எண் (OTP)",
                    aadhaar: "ஆதார் ஐடி",
                    pan: "PAN கார்டு"
                },
                identifierHints: {
                    email: "உள்நுழைய இந்த மின்னஞ்சலும் நீங்கள் தேர்வு செய்யும் கடவுச்சொல்லும் பயன்படுத்தப்படும்.",
                    phone: "account page-இல் இருந்து இந்த எண்ணுக்கு verification code SMS அனுப்பப்படும்.",
                    aadhaar: "UIDAI வழங்கிய 12 இலக்க ஆதார் எண்.",
                    pan: "10 எழுத்துகளைக் கொண்ட நிரந்தர கணக்கு எண்."
                }
            }
        },
        account: {
            title: "என் கணக்கு",
            verifiedFlash: "உங்கள் கணக்கு சரிபார்க்கப்பட்டது. இனி உங்கள் வாக்குகள் verified votes ஆக எண்ணப்படும்.",
            invalidVerificationFlash: "இந்த சரிபார்ப்பு இணைப்பு தவறானது அல்லது காலாவதியானது. கீழே புதிய இணைப்பை கோருங்கள்.",
            verificationErrorFlash: "இப்போது சரிபார்ப்பை முடிக்க முடியவில்லை. புதிய verification முயற்சியை கோரி மீண்டும் முயற்சிக்கவும்.",
            phoneSavedFlash: "மொபைல் எண் சேமிக்கப்பட்டது. கீழே verification code அனுப்பலாம்.",
            phoneUpdatedFlash: "மொபைல் எண் புதுப்பிக்கப்பட்டது. முன்பு சரிபார்க்கப்பட்டிருந்தால், கீழே புதிய SMS code கோரவும்.",
            phoneDeletedFlash: "மொபைல் எண் இந்த கணக்கில் இருந்து நீக்கப்பட்டது.",
            communityAttestationRequestedFlash: "Community attestation தொடங்கப்பட்டது. கீழே உள்ள link-ஐ உங்களுக்கு ஆதரவளிக்க முடியும் உள்ளூர் நபர்களுடன் பகிரவும்.",
            role: "பங்கு",
            emailVerified: "மின்னஞ்சல் சரிபார்ப்பு",
            phoneVerified: "மொபைல் சரிபார்ப்பு",
            yes: "ஆம்",
            no: "இல்லை",
            trustScore: "நம்பகத் தர மதிப்பெண்",
            communityScore: "சமூக மதிப்பெண்",
            communityScoreEligible: "தற்போதைய மதிப்பீட்டு சாளரத்தில் {threshold} புள்ளி promotion threshold எட்டப்பட்டுள்ளது.",
            communityScorePending: "தற்போதைய {windowDays}-நாள் சாளரத்தில் {threshold} புள்ளி promotion threshold-ஐ எட்ட இன்னும் {remaining} புள்ளிகள் தேவை.",
            votesCast: "பதிவான வாக்குகள்",
            verifyEmailTitle: "மின்னஞ்சலை சரிபார்க்கவும்",
            verifyEmailSummary: "உங்கள் வாக்குகள் தற்போது unverified ஆக எண்ணப்படுகின்றன. verified score-இல் சேர மின்னஞ்சலை சரிபார்க்கவும்.",
            addPhoneTitle: "அல்லது ஒரு மொபைல் எண்ணைச் சேர்க்கவும்",
            addPhoneSummary: "மின்னஞ்சல் வசதியாக இல்லையென்றால், இங்கே ஒரு மொபைல் எண்ணைச் சேர்த்து SMS மூலம் சரிபார்க்கலாம்.",
            managePhoneTitle: "உங்கள் மொபைல் எண்ணை நிர்வகிக்கவும்",
            managePhoneSummary: "SMS verification-க்கு பயன்படுத்தும் மொபைல் எண்ணை மாற்றலாம் அல்லது நீக்கலாம்.",
            primaryPhoneDeleteGuard: "இந்த மொபைல் எண் உங்கள் முதன்மை sign-in identifier ஆகவும் பயன்படுத்தப்படுகிறது. அதனால் இதை முழுவதுமாக நீக்காமல் மாற்ற மட்டும் முடியும்.",
            verifyPhoneTitle: "மொபைல் எண்ணை சரிபார்க்கவும்",
            verifyPhoneSummary: "உங்கள் வாக்குகள் தற்போது unverified ஆக எண்ணப்படுகின்றன. {phone} எண்ணுக்கு 6 இலக்க code அனுப்பி, அதை கீழே உள்ளிட்டு verified score-இல் சேர்க்கவும்.",
            verifyCta: "சரிபார்",
            communityAttestationTitle: "Local verifier promotion கோரிக்கை அனுப்பு",
            communityAttestationSummary: "பதிவுசெய்த பயனர்கள் இங்கே promotion request அனுப்பலாம்; பின்னர் moderator-approved local verifiers இந்த கணக்கை சாட்சி அளித்து மதிப்பாய்வு செய்யலாம்.",
            communityAttestationPromotionSummary: "அனுமதி கிடைத்த பிறகு அருகிலுள்ள மற்ற கணக்குகளை verify செய்ய உதவ உங்கள் கணக்கை local-attester நிலைக்கு உயர்த்த இதைப் பயன்படுத்துங்கள்.",
            communityAttestationOpenStatus: "Local verifier witnesses-ஐ காத்திருக்கிறது",
            communityAttestationResolvedStatus: "Verification request முடிந்தது",
            communityAttestationWitnessCount: "{count} / {threshold} சாட்சி பதிவுகள் பெறப்பட்டுள்ளன",
            communityAttestationLocalCount: "{count} சாட்சி பதிவுகள் தற்போது உங்கள் உள்ளூர் பகுதியுடன் பொருந்துகின்றன.",
            communityAttestationRequestLocation: "கோரிக்கை பகுதி: {city}",
            communityAttestationShareLabel: "இந்த கோரிக்கை link-ஐ பகிரவும்:",
            communityAttestationWitnessesTitle: "பதிவான சாட்சிகள்",
            communityAttestationNoWitnesses: "இன்னும் யாரும் ஆதரவு அளிக்கவில்லை.",
            communityAttestationLocalWitness: "உள்ளூர் பகுதி பொருந்துகிறது",
            communityAttestationRemoteWitness: "Moderator review தேவை",
            communityAttestationWitnessEyebrow: "Community attestation",
            communityAttestationWitnessTitle: "இந்த promotion request-க்கு சாட்சி அளிக்கவும்",
            communityAttestationWitnessSummary: "{name} உள்ளூர் பகுதியில் அறியப்பட்டவர் என்றும் அருகிலுள்ள கணக்குகளை verify செய்ய ஒப்புதல் பெற வேண்டும் என்றும் உறுதிப்படுத்துங்கள்.",
            communityAttestationDetailsTitle: "கோரிக்கை விவரங்கள்",
            communityAttestationResolvedMessage: "இந்த attestation கோரிக்கை ஏற்கனவே முடிக்கப்பட்டது.",
            communityAttestationAlreadyWitnessed: "இந்த கோரிக்கைக்கு நீங்கள் ஏற்கனவே சாட்சி அளித்துள்ளீர்கள்.",
            communityAttestationCannotWitness: "Moderator-approved local verifiers மட்டுமே இங்கே வேறு ஒருவருக்கு சாட்சி அளிக்க முடியும்.",
            backToAccount: "கணக்கிற்கு திரும்பு",
            myVotes: "என் வாக்குகள்",
            votePointsSummary: "ஒவ்வொரு வாக்கிற்கும் அருகே காட்டப்படும் புள்ளிகள், அந்த டெனன்டின் தற்போதைய scoring window-இல் இருக்கும் வரை மட்டுமே கணக்கில் சேரும்.",
            votePointsEarned: "+{points} புள்ளிகள்",
            votePointsExpired: "தற்போது செயலில் உள்ள வாக்கு புள்ளிகள் இல்லை",
            pointHistoryTitle: "புள்ளி வரலாறு",
            pointHistorySummary: "{tenant} டெனன்டிற்கான ஒவ்வொரு reward action-ஐயும் இங்கே காட்டுகிறது. தற்போதைய {windowDays}-நாள் scoring window-இல் இருந்து வெளியேறியவற்றும் சேரும்.",
            pointHistoryCurrentTitle: "தற்போது score-இல் சேரும் புள்ளிகள்",
            pointHistoryCurrentEmpty: "இந்த டெனன்டிற்கான score-இல் தற்போது எந்த புள்ளிகளும் சேரவில்லை.",
            pointHistoryWindowBadge: "தற்போதைய activity window: {windowDays} நாட்கள்",
            pointHistoryActivityTitle: "Rewarded actions",
            pointHistoryNoActivity: "இந்த டெனன்டிற்கான point activity இன்னும் பதிவு செய்யப்படவில்லை.",
            pointHistoryCountsNow: "இப்போது சேர்கிறது",
            pointHistoryExpired: "வரலாறு மட்டும்",
            noVotes: "நீங்கள் இன்னும் எந்த வாக்குறுதியிலும் வாக்களிக்கவில்லை.",
            changePassword: "கடவுச்சொல்லை மாற்றவும்",
            voteLabels: {
                not_started: "தொடங்கவில்லை",
                started: "தொடங்கியது",
                in_progress: "நடைபெறுகிறது",
                mostly_done: "பெரும்பாலும் முடிந்தது",
                completed: "முழுமையாக முடிந்தது"
            },
            roleLabels: {
                user: "வாக்காளர்",
                promise_editor: "வாக்குறுதி ஆசிரியர்",
                moderator: "மதிப்பாய்வாளர்",
                tenant_admin: "டெனன்ட் நிர்வாகி",
                platform_admin: "தள நிர்வாகி",
                guest: "விருந்தினர்"
            },
            stateLabels: {
                unverified: "சரிபார்க்கப்படாதது",
                verified: "சரிபார்க்கப்பட்டது",
                moderator_approved: "மதிப்பாய்வாளர் ஒப்புதல்",
                readonly: "படிக்க மட்டும்",
                suspended: "இடைநிறுத்தப்பட்டது"
            },
            verifyEmailButton: {
                sent: "சரிபார்ப்பு மின்னஞ்சல் அனுப்பப்பட்டது — உங்கள் inbox-ஐ பார்த்து இணைப்பை சொடுக்கவும்.",
                error: "ஏதோ தவறு நடந்தது. மீண்டும் முயற்சிக்கவும்.",
                sending: "அனுப்பப்படுகிறது…",
                idle: "சரிபார்ப்பு மின்னஞ்சலை அனுப்பு"
            },
            addPhoneForm: {
                label: "மொபைல் எண்",
                placeholder: "+91 98765 43210",
                failed: "இப்போது அந்த மொபைல் எண்ணை சேமிக்க முடியவில்லை.",
                saving: "சேமிக்கப்படுகிறது…",
                submit: "மொபைல் எண்ணை சேமி",
                update: "மொபைல் எண்ணை புதுப்பி",
                delete: "மொபைல் எண்ணை நீக்கு",
                deleting: "நீக்கப்படுகிறது…",
                deleteFailed: "இப்போது அந்த மொபைல் எண்ணை நீக்க முடியவில்லை."
            },
            communityAttestationRequestForm: {
                city: "நகர் அல்லது பேரூர்",
                locality: "பகுதி / ஊர்பகுதி",
                postalCode: "அஞ்சல் குறியீடு",
                address: "தெரு முகவரி அல்லது அடையாளம்",
                statement: "சாட்சிகளுக்கான விருப்பக் குறிப்பு",
                statementDefault: "Please promote my account to a local verifier so I can help neighbors get their accounts verified. Thanks.",
                failed: "இப்போது community attestation தொடங்க முடியவில்லை.",
                saving: "தொடங்குகிறது…",
                submit: "Verifier promotion கோரிக்கை அனுப்பு"
            },
            verifyPhoneForm: {
                idle: "SMS code அனுப்பு",
                sending: "code அனுப்பப்படுகிறது…",
                sent: "Verification code அனுப்பப்பட்டது. சரிபார்ப்பை முடிக்க SMS-இல் வந்த 6 இலக்க code-ஐ உள்ளிடுங்கள்.",
                codeLabel: "Verification code",
                codePlaceholder: "123456",
                submit: "மொபைலை சரிபார்",
                verifying: "சரிபார்க்கப்படுகிறது…",
                sendError: "இப்போது verification code அனுப்ப முடியவில்லை.",
                verifyError: "இந்த code-ஐ சரிபார்க்க முடியவில்லை. புதிய code கோரி மீண்டும் முயற்சிக்கவும்.",
                debugCodeLabel: "Local dev code:"
            },
            communityAttestationWitnessForm: {
                relationship: "இந்த நபரை நீங்கள் எப்படித் தெரிந்திருக்கிறீர்கள்?",
                city: "உங்கள் நகர் அல்லது பேரூர்",
                locality: "உங்கள் பகுதி / ஊர்பகுதி",
                postalCode: "உங்கள் அஞ்சல் குறியீடு",
                note: "விருப்ப ஆதரவு குறிப்பு",
                failed: "இப்போது உங்கள் சாட்சி பதிவை பதிவு செய்ய முடியவில்லை.",
                success: "உங்கள் சாட்சி பதிவு செய்யப்பட்டுவிட்டது.",
                submitting: "சமர்ப்பிக்கப்படுகிறது…",
                submit: "சாட்சி பதிவை சமர்ப்பி"
            },
            changePasswordForm: {
                currentPassword: "தற்போதைய கடவுச்சொல்",
                newPassword: "புதிய கடவுச்சொல்",
                confirmPassword: "புதிய கடவுச்சொல்லை உறுதிப்படுத்தவும்",
                mismatch: "புதிய கடவுச்சொற்கள் பொருந்தவில்லை.",
                failed: "கடவுச்சொல்லை மாற்ற முடியவில்லை.",
                success: "கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது.",
                saving: "சேமிக்கப்படுகிறது…",
                submit: "கடவுச்சொல்லை மாற்று"
            }
        },
        admin: {
            eyebrow: "நிர்வாகம்",
            auditTitle: "தணிக்கை செயல்பாடு",
            auditSummary: "டெனன்ட் அடிப்படையில் வாக்குறுதி உருவாக்கம், moderation முடிவுகள், snapshot பதிவுகள், reconciliation ஓட்டங்களை கண்காணிக்கவும்.",
            moderationEyebrow: "மதிப்பாய்வு",
            moderationTitle: "மறுஆய்வு வரிசை",
            moderationSummary: "Moderator முடிவுகளை ஆதரிக்க trust-score சைகைகள் இப்போது மின்னஞ்சல் சரிபார்ப்பு, கணக்கு வயது, review backlog, abuse flags ஆகியவற்றை ஒன்றாகக் கொண்டு செயல்படுகின்றன.",
            createPromiseTitle: "ஒரு வாக்குறுதியை உருவாக்குங்கள்",
            createPromiseSummary: "இந்த படிவம் editor மற்றும் admin பங்குகளுக்கே வாக்குறுதி உருவாக்கத்தை வரையறுக்கிறது; அதே நேரத்தில் category மற்றும் status-களுக்கு tenant configuration-ஐ மீண்டும் பயன்படுத்துகிறது.",
            tenantLocalesTitle: "டெனன்ட் மொழி அமைப்புகள்",
            tenantLocalesSummary: "Write path சேர்க்கும் முன் ஒவ்வொரு டெனன்டிற்குமான locale policy-ஐ பார்வையிடுங்கள். English எப்போதும் செயல்பாட்டிலிருக்கும்; tenant primary locale தான் default browsing language-ஐ நிர்ணயிக்கும்.",
            tenantLocalesPending: "Write controls அடுத்த slice-ல் சேர்க்கப்படும். இந்த திரை தற்போது tenant language policy மற்றும் update API enforced செய்யும் constraints-ஐ மட்டும் காட்டுகிறது.",
            tenantLocalesConstraintsTitle: "செயலில் உள்ள கட்டுப்பாடுகள்",
            tenantLocalesPrimaryLabel: "முதன்மை locale",
            tenantLocalesSupportedLabel: "செயல்படுத்தப்பட்ட locale-கள்",
            tenantLocalesAvailableLabel: "பிளாட்ஃபார்ம் locale-கள்",
            tenantLocalesSaveIdle: "Default language-ஐ சேமிக்கவும்",
            tenantLocalesSavePending: "சேமிக்கப்படுகிறது…",
            tenantLocalesSaveSuccess: "Default browsing language புதுப்பிக்கப்பட்டது.",
            tenantLocalesSaveError: "Default browsing language-ஐ புதுப்பிக்க முடியவில்லை."
        },
        home: {
            headline: "வாக்குறுதிகள், ஆதாரங்கள், மக்கள் மதிப்பீடுகள் ஆகியவற்றை கண்காணிக்கத் தயாரான பல-டெனன்ட் குடிமை கண்காணிப்பு தளம்.",
            summary:
                "இந்த அடித்தளம் திட்ட ஆவணங்களை இயக்கக்கூடிய தயாரிப்பாக மாற்றுகிறது: டெனன்ட் வழிச்செலுத்தல், சரிபார்க்கப்பட்ட கட்டமைப்பு, வாக்குறுதி பட்டியல் மற்றும் விவரப் பக்கங்கள், Auth.js அடிப்படையிலான உள்நுழைவு, முடக்கத் தேதியுடன் கூடிய வாக்குப்பதிவு, நிர்வாக உருவாக்கம், மற்றும் வெளியீட்டு அடித்தளம்."
        }
    },
    ml: {
        navigation: {
            home: "ഹോം",
            language: "ഭാഷ",
            newPromise: "പുതിയ വാഗ്ദാനം",
            audit: "ഓഡിറ്റ്",
            moderation: "മോഡറേഷന്‍",
            createAccount: "അക്കൗണ്ട് സൃഷ്ടിക്കുക",
            signIn: "സൈന്‍ ഇന്‍",
            signOut: "സൈന്‍ ഔട്ട്"
        },
        home: {
            headline: "വാഗ്ദാനങ്ങളും ഉറവിടങ്ങളും പൊതുജന വിലയിരുത്തലും പിന്തുണയ്ക്കുന്ന മള്‍ട്ടി-ടെന്നന്റ് പൗര ഉത്തരവാദിത്ത പ്ലാറ്റ്ഫോം.",
            summary:
                "ഈ അടിത്തറ പ്ലാനിംഗ് രേഖകളെ പ്രവർത്തിക്കുന്ന അടിസ്ഥാനമാക്കി മാറ്റുന്നു: ടെന്നന്റ് റൂട്ടിംഗ്, സാധൂകരിച്ച കോണ്‍ഫിഗറേഷന്‍, വാഗ്ദാന പട്ടികയും വിശദാംശ പേജുകളും, Auth.js അടിസ്ഥാനമാക്കിയുള്ള സൈന്‍ ഇന്‍, ഫ്രീസ് നിയമങ്ങളുള്ള വോട്ടിംഗ്, അഡ്മിന്‍ സൃഷ്ടി, ഡിപ്ലോയ്മെന്റ് ഘടന."
        }
    },
    hi: {
        navigation: {
            home: "मुखपृष्ठ",
            language: "भाषा",
            newPromise: "नया वादा",
            audit: "ऑडिट",
            moderation: "मॉडरेशन",
            createAccount: "खाता बनाएं",
            signIn: "साइन इन",
            signOut: "साइन आउट"
        },
        home: {
            headline: "वायदों, स्रोतों और जनता के आकलन के लिए तैयार बहु-टेनेंट नागरिक जवाबदेही मंच।",
            summary:
                "यह आधार योजना दस्तावेजों को चलने योग्य ऐप में बदलता है: टेनेंट रूटिंग, सत्यापित कॉन्फिगरेशन, वादा सूची और विवरण पृष्ठ, Auth.js आधारित साइन-इन, फ्रीज नियमों के साथ वोटिंग, एडमिन निर्माण, और डिप्लॉयमेंट ढांचा।"
        }
    }
};

export function getMessages(locale: SupportedLocale): AppMessages {
    const overrides = localizedMessages[locale] ?? localizedMessages[platformFallbackLocale] ?? {};

    return {
        navigation: {
            ...englishMessages.navigation,
            ...overrides.navigation
        },
        auth: {
            ...englishMessages.auth,
            ...overrides.auth,
            signInForm: {
                ...englishMessages.auth.signInForm,
                ...overrides.auth?.signInForm
            },
            resetPasswordRequestForm: {
                ...englishMessages.auth.resetPasswordRequestForm,
                ...overrides.auth?.resetPasswordRequestForm
            },
            resetPasswordCompleteForm: {
                ...englishMessages.auth.resetPasswordCompleteForm,
                ...overrides.auth?.resetPasswordCompleteForm
            },
            signUpForm: {
                ...englishMessages.auth.signUpForm,
                ...overrides.auth?.signUpForm,
                identifierOptions: {
                    ...englishMessages.auth.signUpForm.identifierOptions,
                    ...overrides.auth?.signUpForm?.identifierOptions
                },
                identifierHints: {
                    ...englishMessages.auth.signUpForm.identifierHints,
                    ...overrides.auth?.signUpForm?.identifierHints
                }
            }
        },
        account: {
            ...englishMessages.account,
            ...overrides.account,
            voteLabels: {
                ...englishMessages.account.voteLabels,
                ...overrides.account?.voteLabels
            },
            roleLabels: {
                ...englishMessages.account.roleLabels,
                ...overrides.account?.roleLabels
            },
            stateLabels: {
                ...englishMessages.account.stateLabels,
                ...overrides.account?.stateLabels
            },
            verifyEmailButton: {
                ...englishMessages.account.verifyEmailButton,
                ...overrides.account?.verifyEmailButton
            },
            changePasswordForm: {
                ...englishMessages.account.changePasswordForm,
                ...overrides.account?.changePasswordForm
            }
        },
        admin: {
            ...englishMessages.admin,
            ...overrides.admin
        },
        home: {
            ...englishMessages.home,
            ...overrides.home
        }
    };
}