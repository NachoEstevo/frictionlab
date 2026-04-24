import { describe, expect, it } from "vitest";
import { extractVisibleContent } from "@/lib/extraction/extract-visible-content";

describe("extractVisibleContent", () => {
  it("extracts title, meta description, sections, CTAs and links from static HTML", () => {
    const snapshot = extractVisibleContent({
      url: "https://launchpilot.example",
      html: `<!doctype html>
        <html>
          <head>
            <title>LaunchPilot</title>
            <meta name="description" content="Launch ops for B2B teams">
          </head>
          <body>
            <nav><a href="/pricing">Pricing</a></nav>
            <main>
              <section>
                <h1>Launch faster without losing signal</h1>
                <p>LaunchPilot helps B2B SaaS founders coordinate launches.</p>
                <a href="/demo">Book a demo</a>
              </section>
              <section>
                <h2>Proof from operator teams</h2>
                <p>Keep product, marketing and sales aligned in one launch room.</p>
                <button>Compare plans</button>
              </section>
            </main>
          </body>
        </html>`
    });

    expect(snapshot.title).toBe("LaunchPilot");
    expect(snapshot.description).toBe("Launch ops for B2B teams");
    expect(snapshot.ctas).toContain("Book a demo");
    expect(snapshot.links).toContainEqual({ label: "Pricing", href: "/pricing" });
    expect(snapshot.sections[0]?.type).toBe("hero");
    expect(snapshot.sections[1]?.type).toBe("proof");
    expect(snapshot.visibleText).toContain("Launch faster");
  });
});
