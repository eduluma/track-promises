type SendEmailParams = {
    to: string;
    subject: string;
    html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<void> {
    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
        throw new Error("BREVO_API_KEY is not set — cannot send email.");
    }

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            "api-key": apiKey,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            sender: { name: "Track Promises", email: "noreply@eduluma.org" },
            to: [{ email: to }],
            subject,
            htmlContent: html
        })
    });

    if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`Brevo API error ${res.status}: ${body}`);
    }
}
