import { describe, expect, it } from "vitest";

import { localizeHref, resolveRequestLocale, toInternalPathname } from "@/modules/i18n/config";
import { localizeAppHref, toInternalAppPathname } from "@/modules/i18n/public-content-routes";

describe("i18n foundation", () => {
    it("strips locale prefixes and keeps the locale when it is explicitly in the path", () => {
        const resolution = resolveRequestLocale({
            pathname: "/ta/tamilnadu/promises",
            tenantDefaultLocale: "en",
            supportedLocales: ["en", "ta"]
        });

        expect(resolution.locale).toBe("ta");
        expect(resolution.pathname).toBe("/tamilnadu/promises");
        expect(resolution.hadLocalePrefix).toBe(true);
    });

    it("falls back to the tenant default locale when the request does not carry one", () => {
        const resolution = resolveRequestLocale({
            pathname: "/kerala",
            tenantDefaultLocale: "ml",
            supportedLocales: ["ml", "en"],
            fallbackLocale: "ml"
        });

        expect(resolution.locale).toBe("ml");
    });

    it("normalizes unsupported tenant locales back to an enabled locale", () => {
        const resolution = resolveRequestLocale({
            pathname: "/hi/tamilnadu/promises",
            cookieLocale: "hi",
            acceptLanguage: "hi-IN,hi;q=0.9,en;q=0.8",
            tenantDefaultLocale: "ta",
            supportedLocales: ["ta", "en"],
            fallbackLocale: "ta"
        });

        expect(resolution).toEqual({
            locale: "en",
            pathname: "/tamilnadu/promises",
            hadLocalePrefix: true
        });
    });

    it("matches regional accept-language headers to the nearest supported language", () => {
        const resolution = resolveRequestLocale({
            pathname: "/",
            acceptLanguage: "ta-IN,ta;q=0.9,en;q=0.8",
            tenantDefaultLocale: "en",
            supportedLocales: ["en", "ta"]
        });

        expect(resolution.locale).toBe("ta");
    });

    it("builds locale-aware internal links without duplicating prefixes", () => {
        expect(localizeHref("/tamilnadu/2026", "ta")).toBe("/ta/tamilnadu/2026");
        expect(localizeHref("/ta/tamilnadu/2026", "ta")).toBe("/ta/tamilnadu/2026");
        expect(localizeHref("/ta/tamilnadu/2026?tab=overview", "en")).toBe("/en/tamilnadu/2026?tab=overview");
    });

    it("builds shareable localized aliases for translated template pages", () => {
        expect(localizeHref("/signup", "ml")).toBe("/ml/രജിസ്റ്റർ");
        expect(localizeHref("/login", "ta")).toBe("/ta/உள்நுழைவு");
        expect(localizeHref("/reset-password", "ta")).toBe("/ta/கடவுச்சொல்-மீட்டமை");
        expect(localizeHref("/account?tab=security", "hi")).toBe("/hi/मेरा-खाता?tab=security");
        expect(localizeHref("/login", "en")).toBe("/en/login");
    });

    it("normalizes localized aliases back to the internal route path", () => {
        expect(toInternalPathname("/രജിസ്റ്റർ")).toBe("/signup");
        expect(toInternalPathname("/கடவுச்சொல்-மீட்டமை")).toBe("/reset-password");
        expect(resolveRequestLocale({
            pathname: "/ml/രജിസ്റ്റർ",
            tenantDefaultLocale: "en",
            supportedLocales: ["en", "ml"]
        })).toEqual({
            locale: "ml",
            pathname: "/signup",
            hadLocalePrefix: true
        });
    });

    it("builds localized tenant, timeline, and promise detail slugs for translated public content", () => {
        expect(localizeAppHref("/tamilnadu/2026", "ta")).toBe("/ta/தமிழ்நாடு/சட்டப்பேரவை-2026");
        expect(localizeAppHref("/tamilnadu/2026/promises/tn-2026-tvk-women-income-support", "ta")).toBe(
            "/ta/தமிழ்நாடு/சட்டப்பேரவை-2026/வாக்குறுதிகள்/பெண்-குடும்ப-தலைவர்-வருமான-உதவி"
        );
    });

    it("normalizes localized content slugs back to canonical internal params", () => {
        expect(toInternalAppPathname("/ta/தமிழ்நாடு/சட்டப்பேரவை-2026/வாக்குறுதிகள்/பெண்-குடும்ப-தலைவர்-வருமான-உதவி")).toBe(
            "/ta/tamilnadu/2026/promises/tn-2026-tvk-women-income-support"
        );
    });

    it("normalizes percent-encoded localized content slugs back to canonical internal params", () => {
        expect(
            toInternalAppPathname(
                "/ta/%E0%AE%A4%E0%AE%AE%E0%AE%BF%E0%AE%B4%E0%AF%8D%E0%AE%A8%E0%AE%BE%E0%AE%9F%E0%AF%81/%E0%AE%9A%E0%AE%9F%E0%AF%8D%E0%AE%9F%E0%AE%AA%E0%AF%8D%E0%AE%AA%E0%AF%87%E0%AE%B0%E0%AE%B5%E0%AF%88-2026"
            )
        ).toBe("/ta/tamilnadu/2026");
    });
});