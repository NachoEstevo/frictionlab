import type { AuditInput } from "@/lib/schemas/audit";
import type { PageSnapshot } from "@/lib/schemas/page";

export const launchPilotInput: AuditInput = {
  auditType: "LANDING",
  url: "https://launchpilot.example",
  targetAudience: "B2B SaaS founders preparing a product launch",
  conversionGoal: "Book a demo",
  businessType: "saas",
  language: "en",
  market: "US",
  brandTone: "clear, sharp and founder-friendly",
  personaCount: 4,
  demoMode: true
};

export const launchPilotSnapshot: PageSnapshot = {
  title: "LaunchPilot",
  description: "Launch ops for B2B SaaS teams",
  visibleText:
    "LaunchPilot gives B2B SaaS teams a shared launch room for product, marketing and sales. Coordinate launch tasks, spot blockers and keep every stakeholder aligned before launch day. Book a demo. Teams use LaunchPilot to reduce launch chaos and improve handoff quality. Pricing and implementation details are available after a consultation.",
  sections: [
    {
      id: "section_hero",
      order: 1,
      type: "hero",
      heading: "Launch faster without losing signal",
      text:
        "LaunchPilot gives B2B SaaS teams a shared launch room for product, marketing and sales. Coordinate launch tasks, spot blockers and keep every stakeholder aligned before launch day.",
      ctas: ["Book a demo"]
    },
    {
      id: "section_proof",
      order: 2,
      type: "proof",
      heading: "Built for operator teams",
      text:
        "Teams use LaunchPilot to reduce launch chaos and improve handoff quality with one source of truth for every launch motion.",
      ctas: []
    },
    {
      id: "section_process",
      order: 3,
      type: "unknown",
      heading: "From plan to launch room",
      text:
        "Create a launch room, assign owners and track readiness signals across product, marketing and sales workflows.",
      ctas: ["Compare plans"]
    }
  ],
  ctas: ["Book a demo", "Compare plans"],
  links: [
    { label: "Pricing", href: "/pricing" },
    { label: "Book a demo", href: "/demo" },
    { label: "Compare plans", href: "/compare" }
  ],
  metadata: {
    demo: true,
    fallbackUsed: false
  }
};
