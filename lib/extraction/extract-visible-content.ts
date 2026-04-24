import * as cheerio from "cheerio";
import type { PageSection, PageSnapshot } from "@/lib/schemas/page";

type ExtractVisibleContentInput = {
  url: string;
  html: string;
};

const CTA_PATTERN = /\b(book|start|get|try|request|contact|compare|buy|subscribe|join|schedule|demo|audit)\b/i;

export function extractVisibleContent({ html, url }: ExtractVisibleContentInput): PageSnapshot {
  const $ = cheerio.load(html);

  $("script, style, noscript, svg").remove();

  const title = cleanText($("title").first().text()) || undefined;
  const description =
    cleanText(
      $('meta[name="description"]').attr("content") ||
        $('meta[property="og:description"]').attr("content") ||
        ""
    ) || undefined;

  const links = $("a")
    .toArray()
    .map((element) => ({
      label: cleanText($(element).text()),
      href: $(element).attr("href")
    }))
    .filter((link) => link.label.length > 0)
    .slice(0, 80);

  const buttonLabels = $("button")
    .toArray()
    .map((element) => cleanText($(element).text()))
    .filter(Boolean);

  const linkCtas = links.map((link) => link.label).filter((label) => CTA_PATTERN.test(label));
  const ctas = uniqueStrings([...linkCtas, ...buttonLabels.filter((label) => CTA_PATTERN.test(label))]).slice(0, 20);

  const sectionCandidates = $("main section, section, main article, article, header, footer")
    .toArray()
    .map((element) => {
      const text = cleanText($(element).text());
      const heading = cleanText($(element).find("h1,h2,h3").first().text()) || undefined;
      const sectionCtas = $(element)
        .find("a,button")
        .toArray()
        .map((ctaElement) => cleanText($(ctaElement).text()))
        .filter((label) => label && CTA_PATTERN.test(label));

      return { text, heading, ctas: uniqueStrings(sectionCtas) };
    })
    .filter((section) => section.text.length > 24);

  const sections = normalizeSections(sectionCandidates);
  const bodyText = cleanText($("body").text());

  return {
    title,
    description,
    visibleText: bodyText.slice(0, 15000),
    sections:
      sections.length > 0
        ? sections
        : [
            {
              id: "section_1",
              order: 1,
              type: "unknown",
              heading: title,
              text: bodyText.slice(0, 2000),
              ctas
            }
          ],
    ctas,
    links,
    metadata: { sourceUrl: url }
  };
}

function normalizeSections(
  candidates: Array<{ text: string; heading?: string; ctas: string[] }>
): PageSection[] {
  return candidates.slice(0, 12).map((section, index) => ({
    id: `section_${index + 1}`,
    order: index + 1,
    type: detectSectionType(section.heading, section.text, index),
    heading: section.heading,
    text: section.text.slice(0, 2200),
    ctas: section.ctas
  }));
}

function detectSectionType(heading = "", text: string, index: number): PageSection["type"] {
  const haystack = `${heading} ${text}`.toLowerCase();
  if (index === 0 || haystack.includes("hero")) return "hero";
  if (/(testimonial|customer|proof|trusted|case stud|operator teams)/.test(haystack)) return "proof";
  if (/(price|pricing|plan|subscription)/.test(haystack)) return "pricing";
  if (/(faq|question|asked)/.test(haystack)) return "faq";
  if (/(feature|capabilit|platform)/.test(haystack)) return "features";
  if (/(benefit|outcome|result)/.test(haystack)) return "benefits";
  if (/(book|start|get|try|request|contact|demo)/.test(haystack)) return "cta";
  if (/(privacy|terms|copyright)/.test(haystack)) return "footer";
  return "unknown";
}

function cleanText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.map(cleanText).filter(Boolean)));
}
