import { normalizePhoneNumber } from "@/modules/auth/identifiers";

type SendPhoneVerificationCodeParams = {
    to: string;
    code: string;
};

export type PhoneDeliveryResult =
    | { delivery: "sms" }
    | { delivery: "debug"; debugCode: string };

export async function sendPhoneVerificationCode({ to, code }: SendPhoneVerificationCodeParams): Promise<PhoneDeliveryResult> {
    const recipient = normalizePhoneNumber(to);
    const apiKey = process.env.BREVO_API_KEY?.trim();
    const sender = process.env.BREVO_SMS_SENDER?.trim();

    if (!apiKey || !sender) {
        if (process.env.NODE_ENV === "production") {
            throw new Error("BREVO_API_KEY and BREVO_SMS_SENDER are required to send verification SMS messages.");
        }

        console.info(`[phone verification debug] ${recipient}: ${code}`);
        return { delivery: "debug", debugCode: code };
    }

    const res = await fetch("https://api.brevo.com/v3/transactionalSMS/sms", {
        method: "POST",
        headers: {
            "api-key": apiKey,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            sender,
            recipient: recipient.slice(1),
            content: `${code} is your Track Promises verification code. It expires in 10 minutes.`,
            type: "transactional"
        })
    });

    if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`Brevo SMS API error ${res.status}: ${body}`);
    }

    return { delivery: "sms" };
}
