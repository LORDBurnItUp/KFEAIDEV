# 🧠 KDS Reference Brain

> Knowledge base drawn from external systems, selectively adapted for KDS.
> Organized by domain. Only what serves the platform goes in.

---

## 📚 Gravity Claw — Memory Architecture
_Source: Three-tier memory system with graceful degradation_

### What We Stole
- ✅ **Three-tier memory** — SQLite (local) → Pinecone (semantic) → Supabase (structured)
- ✅ **Graceful degradation** — each tier independent, no single point of failure
- ✅ **Non-blocking writes** — fire-and-forget background tasks, user never waits
- ✅ **Automatic compaction** — self-manage at 30 messages, summarize and prune
- ✅ **Memory tools** — remember_fact, recall_memory, add_to_memory, save_data, query_data
- ✅ **150-char overlap chunking** — for contextual knowledge base

### What We Skipped
- ❌ Specific table names (adapted to KDS needs)
- ❌ YouTube-specific tables (until we need them)
- ❌ Cost tracking (add later when we have real usage)

---

## 🎯 AntiGravity — Content Creation Workflows
_Source: NotebookLM + content generation pipelines_

### What We Stole
- ✅ **5 core workflows** — YouTube Research, Podcast Prep, Executive Briefing, Newsletter, Market Research
- ✅ **Output formats** — Audio, Video, Infographic, Data Table, Mind Map, Briefing Doc, Study Guide, Blog Post
- ✅ **Stack outputs** — infographic + audio + data table = complete content packages
- ✅ **Audio styles** — deep_dive, brief, critique, debate
- ✅ **Video styles** — classic, whiteboard, kawaii, anime, watercolor, retro_print
- ✅ **Pro tips** — token savings (12K vs 150K), sync sources, match visual style to audience

### What We Skipped
- ❌ NotebookLM integration (requires browser auth — user will set up manually)
- ❌ Meeting Intelligence System (not needed yet)
- ❌ Due Diligence System (future)
- ❌ Travel/Health/Book Club (personal productivity — off-topic for KDS)

### Enhancement Priorities
1. Wire up actual LLM to agent.ts (OpenAI/Anthropic/Ollama)
2. Configure Pinecone + Supabase environment variables
3. Build Mission Control frontend for memory/dashboard
4. Connect YouTube API for research workflows

---

## 🎨 Vexel — Design System
_Source: Vexel.peachworlds.com — 3D spatial website_

### What We Stole
- ✅ **Full 3D canvas as background** — HTML overlays are sparse
- ✅ **Spline integration** — handcrafted 3D scenes over procedural generation
- ✅ **Code-style labels** — `// SECTION_NAME` in monospace
- ✅ **Minimal text, massive whitespace** — let 3D breathe
- ✅ **Cinematic letterbox bars** — 6px black top/bottom
- ✅ **Scroll-anchored sections** — each 100vh, camera drives through

### What We Skipped
- ❌ Hamburger mobile menu (desktop-first for now)
- ❌ PeachWeb watermarked badge
- ❌ Footer image stack (device mockups)
- ❌ Circular loading ring (we have our own)

---

## ⚡ Video Integration — 28 Clips
_Our own assets — deployed at /public/videos/_

### What's Working
- ✅ 28 high-quality clips cross-fading across 4 sections
- ✅ Clips 1-7 (KDS AI), 8-14 (About), 15-21 (Features), 22-28 (Get Started)
- ✅ Preloaded, muted, autoplay, object-cover, dark radial overlay

---

## 📋 Architecture Decisions Made
1. **Spline is primary 3D** → Three.js particles are fallback
2. **Video backgrounds layered under 3D** → atmospheric base layer
3. **Memory API at /api/kds/memory** → graceful degradation if services down
4. **Workflows at /api/kds/workflow** → placeholder implementations ready for real data
5. **Next.js 14 App Router** → all routes static export for Hostinger

---

_Last updated: 2026-04-04 by Lord Sav_
_When Omar sends new reference material, extract → categorize → adapt → update this file._
