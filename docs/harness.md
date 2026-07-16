# QA Automation Harness

How the orchestrator, sub-agents, skills, guardrails, and tools fit together.

```mermaid
flowchart TB
    subgraph Triggers["Outer Runners / Triggers"]
        GHA["GitHub Actions<br/>test-generation.yml<br/>(cron 19:15 EDT + dispatch)"]
        AUTO["Cursor Automation<br/>ds-in-progress-playwright.yaml<br/>(cron + Jira webhook)"]
        CHAT["Interactive chat<br/>(ticket key / red run id)"]
    end

    subgraph Runner["agent -p (headless) / Cursor session"]
        ORCH["QA Orchestrator<br/>rules/qa-orchestrator.mdc<br/>Coordinator — only does: read ticket + build plan<br/>Loop guard: 3 delegations, 5 tickets, 5 heals"]
    end

    Triggers -->|query Jira: DS · In Progress · !tests-generated| ORCH

    subgraph Agents["Specialist Sub-agents (.cursor/agents)"]
        TW["test-writer<br/>plan → spec in tests/ + POM in pages/"]
        TR["triage<br/>read-only · classify drift vs app bug"]
        BR["bug-reporter<br/>file + link Jira bug (readonly)"]
        SH["self-heal<br/>(heal-on-red skill)<br/>POM locator patch only"]
    end

    ORCH -->|plan ready| TW
    ORCH -->|run red| TR
    TR -->|test issue: drift| SH
    TR -->|real app bug| BR
    SH -->|re-run to prove green| ORCH
    TW -->|spec back| ORCH

    subgraph Skills["Skills (.cursor/skills)"]
        S1["jira-ticket-analyzer"]
        S2["explore-and-generate"]
        S3["ci-failure-triage"]
        S4["self-heal"]
        S5["jira-bug-reporter"]
        S6["pom-conventions"]
        S7["api-cleanup"]
        S8["didaxis-program-deleter"]
    end

    ORCH -.uses.-> S1 & S2
    TW -.uses.-> S6 & S7
    TR -.uses.-> S3
    SH -.uses.-> S4
    BR -.uses.-> S5

    subgraph Guards["Guardrails"]
        HOOK["Hook: block-weakened-assertions.mjs<br/>afterFileEdit matcher tests/** · failClosed"]
        CONV["rules/playwright-conventions.mdc<br/>locators · POM · anti-flake · hard-stop refusals"]
    end

    TW -.edits tests/** trip.-> HOOK
    TW & SH -.must follow.-> CONV

    subgraph Ext["Tools / MCP"]
        JIRA["Atlassian MCP<br/>Jira"]
        GH["GitHub MCP / gh"]
        PW["Playwright MCP<br/>a11y snapshot"]
        TERM["Terminal<br/>npm run test:ci"]
    end

    ORCH & TR & BR -.-> JIRA
    ORCH & TR & BR -.-> GH
    SH -.-> PW
    ORCH & TW -.-> TERM

    subgraph Out["Outputs (human-gated)"]
        PR["1 DRAFT PR / ticket<br/>Jira Relates link"]
        LBL["tests-generated label<br/>on Jira ticket"]
        BUG["Jira Bug + backup<br/>bug/&lt;story&gt;-&lt;TC&gt;.bug.md"]
    end

    ORCH --> PR --> LBL
    BR --> BUG

    classDef trig fill:#1e3a5f,stroke:#4a90d9,color:#fff
    classDef orch fill:#4a2c5f,stroke:#a855c7,color:#fff
    classDef agent fill:#2c4a2c,stroke:#5ac75a,color:#fff
    classDef skill fill:#5f4a1e,stroke:#d9a94a,color:#fff
    classDef guard fill:#5f1e1e,stroke:#d94a4a,color:#fff
    class GHA,AUTO,CHAT trig
    class ORCH orch
    class TW,TR,BR,SH agent
    class S1,S2,S3,S4,S5,S6,S7,S8 skill
    class HOOK,CONV guard
```

## Legend

- **Triggers → Orchestrator** — a run starts via the GHA workflow (`test-generation.yml`), the Cursor Automation, or interactive chat. The outer runner queries Jira (`DS · In Progress · !tests-generated`) and hands ticket keys in; the orchestrator never decides when to start.
- **Orchestrator (`qa-orchestrator.mdc`)** — the coordinator. It only reads the ticket and produces the plan, then delegates. Loop guards cap it at 3 delegations, 5 tickets/run, 5 heals/run.
- **Sub-agents (`.cursor/agents/`)** — `test-writer` (plan → spec + POM), `triage` (read-only classify), `bug-reporter` (file Jira bug). `self-heal` is the registered heal-on-red **skill** (drawn in the agent lane as a delegated actor) and is **not** invoked in scheduled backlog runs.
- **Skills** — feed knowledge/behavior into each actor.
- **Guardrails** — the `block-weakened-assertions` hook (fails closed on `tests/**` edits) and the conventions rule's hard-stop refusals (never weaken assertions, never heal a real bug, no CSS/XPath, etc.).
- **Outputs** — human-gated: DRAFT PRs, the `tests-generated` label, and filed bugs. Never merges or ticket transitions.
