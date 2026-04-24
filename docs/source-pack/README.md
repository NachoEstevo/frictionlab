# FrictionLab Codex Pack

Este pack está pensado para llevarlo directo a Codex y construir un MVP demoable de **FrictionLab** para el hackathon de Vercel.

## Decisión central

Construir **FrictionLab** como un agente operacional de research de conversión/UX:

> El usuario pega una URL, define target audience y conversion goal, y FrictionLab corre un workflow agentic que captura la página, extrae evidencia, genera usuarios sintéticos, simula sesiones, agrega fricciones, prioriza fixes y publica un reporte compartible. Como capa wow, genera un **Presenter Report** con storyboard/deck y video opcional.

## Track recomendado

**Track principal:** Vercel Workflow / WDK.

Motivo: el producto es naturalmente un workflow multi-step durable: extracción, screenshots, generación de personas, sesiones, agregación, recomendaciones, reporte y presentador/video.

**Soporte:**

- v0 para UI inicial.
- Vercel AI SDK + AI Gateway para structured outputs y tools.
- Vercel Blob para screenshots/assets.
- Prisma + Postgres/Neon/Supabase para runs.
- Remotion solo como opcional; el fallback obligatorio es deck/storyboard React.

## Orden recomendado para usar estos archivos

1. Leer `PROJECT_BRIEF.md`.
2. Pasar `CODEX_MASTER_PROMPT.md` a Codex como instrucción base.
3. Usar `IMPLEMENTATION_TASKS.md` como backlog.
4. Usar `ARCHITECTURE_AND_DATA_MODEL.md` para backend, DB y endpoints.
5. Usar `AGENT_WORKFLOW_AND_TOOLS.md` para AI SDK, schemas y workflow.
6. Usar `UX_UI_SPEC_AND_V0_PROMPT.md` para v0 y UI.
7. Usar `PRESENTER_VIDEO_LAYER.md` para agregar el presentador/video sin romper el MVP.
8. Usar `DEMO_AND_JUDGES.md` para preparar la presentación.
9. Usar `RISKS_FALLBACKS.md` como checklist de hardening.

## No negociables

- Debe deployar en Vercel.
- Debe poder correr en `MOCK_MODE=true` sin AI, sin screenshot real y sin fetch real.
- Cada finding debe estar atado a evidencia o marcarse como `missing_information`.
- No construir auth, billing, teams, crawling multi-page, integrations pesadas ni video obligatorio.
- La UI no debe parecer chatbot. Debe parecer un lab/command center con workflow, personas, evidencia y reporte.
- El producto debe funcionar aunque Browserless, fetch, AI o Workflow fallen.

## Minimum winning product

Una app deployada donde:

1. El usuario pega URL + target + goal.
2. Ve un workflow vivo.
3. Ve un swarm de 4 usuarios sintéticos.
4. Abre una sesión por persona con timeline y evidencia.
5. Ve top blockers y conversion score.
6. Recibe recommendations, hero rewrite, CTA variants y FAQ suggestions.
7. Comparte un report.
8. Ve un Presenter Report con storyboard/deck y, si está estable, video opcional.

