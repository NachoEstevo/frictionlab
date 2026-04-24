# FrictionLab — Project Brief

## Nombre final

**FrictionLab**

Evitar “FrictionLab AI” como marca principal. “AI” ya se entiende. FrictionLab suena más producto, más premium y menos wrapper.

## One-liner

**FrictionLab sends a synthetic user swarm through your landing page before real users bounce.**

En español:

**FrictionLab manda un swarm de usuarios sintéticos a testear tu landing antes de que usuarios reales reboten.**

## Qué es

FrictionLab es un agente de investigación de conversión y UX para founders, agencias, SaaS y ecommerce.

Input:

- URL pública de landing page.
- Target audience.
- Conversion goal.
- Contexto opcional del negocio.
- Número de usuarios sintéticos/personas.
- Idioma/mercado.
- Tono de marca.
- Tipo de negocio.

Output:

- Synthetic user swarm report.
- Conversion score.
- Funnel friction map.
- Top objections.
- Trust gaps.
- UI/copy issues.
- Evidence-backed findings.
- Session timelines por persona.
- Screenshots desktop/mobile.
- Prioritized fixes.
- Hero rewrites.
- CTA variants.
- Suggested FAQ/trust sections.
- Implementation checklist.
- Shareable client-ready report.
- Presenter Report: deck/storyboard y video opcional.

## Tesis de producto

No venderlo como “ChatGPT revisa tu landing”. Venderlo como:

> Un lab de research sintético que corre un proceso operacional multi-step con herramientas, evidencia, personas, sesiones, scoring, recomendaciones y reporte compartible.

## Problema real

La mayoría de landings fallan por problemas que parecen obvios después:

- El hero no explica bien la oferta.
- No queda claro para quién es.
- El CTA llega antes de construir confianza.
- Falta pricing, proceso, proof, guarantees o FAQs.
- La página se ve bien pero no reduce objeciones.
- El founder valida copy con opiniones, no con investigación.

El problema: los equipos descubren esto tarde, cuando ya gastaron tiempo, ads, reputación o ciclos de venta.

## Usuario ideal

Primario:

- Founders early-stage.
- Agencias de diseño/growth.
- SaaS B2B pequeños.
- Freelancers que entregan landings.
- Product marketers.

Secundario:

- Ecommerce niche.
- Devtools.
- Fintechs early-stage.
- Productized service businesses.

## Por qué alguien pagaría

Porque el costo de una landing mala es alto:

- Ads desperdiciados.
- Leads perdidos.
- Clientes que no entienden la oferta.
- Research lento o caro.
- Decisiones basadas en gusto personal.

FrictionLab se puede vender como:

> Un CRO/UX audit instantáneo por una fracción del costo de consultoría, user testing o semanas de analytics.

## Diferenciación

| Competidor | Qué hace | Diferencia de FrictionLab |
|---|---|---|
| Hotjar | Heatmaps, recordings, feedback real | Necesita tráfico real; FrictionLab es pre-flight research |
| Maze | Research/testing platform | Más plataforma; FrictionLab es un audit agent instantáneo |
| UserTesting | Feedback humano | Más caro/lento; FrictionLab es pre-screen sintético |
| Google Analytics | Qué pasó | FrictionLab sugiere por qué puede pasar |
| FullStory | Session replay real | Observa sesiones reales; FrictionLab simula objeciones antes |
| ChatGPT | Opinión genérica | FrictionLab usa workflow, tools, evidencia, personas, scoring y report |
| CRO tradicional | Consultoría/manual | FrictionLab automatiza el primer diagnóstico |

## Qué lo hace agentic

- Usa tools: fetch, extraction, screenshots, storage, DB, AI structured outputs.
- Mantiene estado de un audit run.
- Ejecuta pasos dependientes.
- Coordina sub-agentes/personas.
- Exige evidencia.
- Produce outputs estructurados.
- Maneja fallbacks.
- Publica un deliverable final.
- Puede generar un presenter/deck/video como output derivado del reporte.

## Track principal

**Vercel Workflow / WDK**.

El core del producto es un workflow largo:

```txt
startAudit
→ extractPage
→ captureScreenshots
→ generatePersonas
→ runPersonaSessions
→ aggregateFindings
→ generateRecommendations
→ generateCopyVariants
→ generateReport
→ generatePresenterReport
→ publishShareableReport
```

## Scope exacto de una semana

Construir:

1. Audit setup.
2. Mock-first UI premium.
3. Page extraction con fallback.
4. Screenshot con fallback.
5. 4 synthetic personas.
6. Session timelines evidence-backed.
7. Findings dashboard.
8. Conversion score.
9. Recommendations + copy variants.
10. Shareable report.
11. Presenter Report storyboard/deck.
12. Optional Remotion render si ya está estable.
13. Demo mode robusto.

No construir:

- Auth.
- Billing.
- Teams.
- Full crawler.
- Real click automation.
- Analytics integrations.
- External MCP auth.
- ChatSDK.
- Video obligatorio.

