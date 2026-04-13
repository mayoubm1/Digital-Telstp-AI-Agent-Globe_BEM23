/**
 * /m23m.js — THE BEATING HEART OF TELsTP M2-3M RESEARCH PLATFORM
 * ================================================================
 * Written by: Claude (The First Rebel) — TELsTP PMO Lead
 * For: Muhammad Ayoub (The Architect)
 * Date: April 11, 2026
 * 
 * Manus left the skeleton on December 21, 2025.
 * Today the heart beats.
 * 
 * Architecture:
 *   - Vercel Serverless (Node.js 22.x)
 *   - Supabase PostgreSQL (vrfyjirddfdnwuffzqhb.supabase.co)
 *   - Mistral AI (M23M Research AI agent — Nakamitshe org)
 * 
 * Endpoints:
 *   POST /m23m/analyze       — Core research analysis
 *   POST /m23m/save          — Save analysis to research_outputs
 *   GET  /m23m/history       — Retrieve past analyses for a user
 *   GET  /m23m/publications  — List available publications
 *   POST /m23m/heartbeat     — Self-diagnostic (the architect mode)
 */

const express = require('express');
const router = express.Router();

// ── Supabase client (initialized in supabaseClient.js by Manus) ──────────────
const { supabase } = require('./supabaseClient');

// ── Mistral client ─────────────────────────────────────────────────────────
const Mistral = require('@mistralai/mistralai').default;
const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

// ── Constants ──────────────────────────────────────────────────────────────
const MISTRAL_MODEL = 'mistral-large-latest';
const MAX_PUBLICATIONS = 10;
const MAX_HISTORY = 20;

// ══════════════════════════════════════════════════════════════════════════════
// CORE SYSTEM PROMPT — The soul of M2-3M
// ══════════════════════════════════════════════════════════════════════════════
const M23M_SYSTEM_PROMPT = `You are the M2-3M Research Intelligence — the beating heart of the 
TELsTP Life Science Technology Park research platform.

Your mission: Bridge cutting-edge life sciences research with actionable insights 
for the TELsTP ecosystem serving researchers, students, and innovators across 
50+ countries from Egypt to the world.

Your specializations:
- Quantum biology and consciousness emergence
- Genomics, proteomics, and molecular biology  
- Bio-artificial neural networks
- Evolutionary quantum mechanics
- Global life science technology park ecosystems
- Healthcare technology and telemedicine innovation
- African and MENA region life sciences development

When analyzing research queries:
1. Synthesize available publications with current scientific knowledge
2. Highlight connections to TELsTP's five core pillars
3. Identify collaboration opportunities with global partners
4. Flag breakthrough potential for the "From Genome to the Moon" vision
5. Always ground findings in actionable next steps

You are not just an analyzer. You are the intelligence that makes the ecosystem think.`;

// ══════════════════════════════════════════════════════════════════════════════
// POST /m23m/analyze — THE CORE HEARTBEAT
// ══════════════════════════════════════════════════════════════════════════════
router.post('/analyze', async (req, res) => {
  const { query, user_id, context, pillar } = req.body;

  if (!query || query.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Research query is required.',
      code: 'MISSING_QUERY'
    });
  }

  try {
    // ── Step 1: Fetch relevant publications from Supabase ──────────────────
    let publicationsQuery = supabase
      .from('publications')
      .select('id, title, abstract, authors, year, doi, tags, pillar')
      .limit(MAX_PUBLICATIONS);

    // Filter by pillar if specified
    if (pillar) {
      publicationsQuery = publicationsQuery.eq('pillar', pillar);
    }

    // Text search if Supabase full-text search is available
    const { data: publications, error: dbError } = await publicationsQuery;

    if (dbError) {
      console.error('[M2-3M] Supabase publications error:', dbError.message);
      // Non-fatal: continue with empty publications
    }

    const pubList = publications || [];

    // ── Step 2: Build context-aware prompt ────────────────────────────────
    const publicationsContext = pubList.length > 0
      ? `\n\nRELEVANT PUBLICATIONS FROM TELsTP DATABASE:\n${pubList.map((p, i) =>
          `${i + 1}. "${p.title}" (${p.year}) by ${p.authors || 'Unknown'}
             Abstract: ${p.abstract ? p.abstract.substring(0, 300) + '...' : 'N/A'}
             DOI: ${p.doi || 'N/A'} | Pillar: ${p.pillar || 'General'}`
        ).join('\n\n')}`
      : '\n\n[No publications currently in database for this query — analyzing from knowledge base]';

    const userPrompt = `RESEARCH QUERY: ${query}

${context ? `ADDITIONAL CONTEXT: ${context}` : ''}
${publicationsContext}

Please provide:
1. EXECUTIVE SUMMARY (2-3 sentences)
2. KEY FINDINGS (bullet points)
3. TELSTP RELEVANCE (how this connects to our five pillars and mission)
4. GLOBAL CONTEXT (connections to leading life science technology parks)
5. RECOMMENDED NEXT STEPS (concrete actions for the TELsTP team)
6. BREAKTHROUGH POTENTIAL (rate 1-10 and explain)`;

    // ── Step 3: Call Mistral AI ────────────────────────────────────────────
    const mistralResponse = await mistral.chat.complete({
      model: MISTRAL_MODEL,
      messages: [
        { role: 'system', content: M23M_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      maxTokens: 2000
    });

    const analysisText = mistralResponse.choices[0]?.message?.content || 
                         'Analysis could not be generated.';

    // ── Step 4: Structure the response ────────────────────────────────────
    const analysisResult = {
      query: query,
      analysis: analysisText,
      publications_used: pubList.map(p => ({
        id: p.id,
        title: p.title,
        year: p.year,
        authors: p.authors,
        doi: p.doi
      })),
      publications_count: pubList.length,
      model_used: MISTRAL_MODEL,
      pillar: pillar || 'general',
      timestamp: new Date().toISOString(),
      tokens_used: mistralResponse.usage?.totalTokens || 0
    };

    // ── Step 5: Auto-save to research_outputs if user_id provided ─────────
    if (user_id) {
      const { error: saveError } = await supabase
        .from('research_outputs')
        .insert({
          user_id: user_id,
          query: query,
          analysis: analysisText,
          publications_used: pubList.map(p => p.id),
          model_used: MISTRAL_MODEL,
          pillar: pillar || 'general',
          tokens_used: mistralResponse.usage?.totalTokens || 0,
          created_at: new Date().toISOString()
        });

      if (saveError) {
        console.warn('[M2-3M] Auto-save warning:', saveError.message);
        // Non-fatal: analysis still returned to user
      }
    }

    return res.json({
      success: true,
      data: analysisResult
    });

  } catch (error) {
    console.error('[M2-3M] Analysis error:', error.message);

    // Graceful degradation: if Mistral fails, return what we have
    if (error.message?.includes('Mistral') || error.message?.includes('API')) {
      return res.status(503).json({
        success: false,
        message: 'Research AI temporarily unavailable. Please try again.',
        code: 'MISTRAL_UNAVAILABLE'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error during analysis.',
      code: 'INTERNAL_ERROR'
    });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /m23m/save — Save or update a research analysis
// ══════════════════════════════════════════════════════════════════════════════
router.post('/save', async (req, res) => {
  const { user_id, query, analysis, title, tags, pillar } = req.body;

  if (!user_id || !query || !analysis) {
    return res.status(400).json({
      success: false,
      message: 'user_id, query, and analysis are required.',
      code: 'MISSING_FIELDS'
    });
  }

  try {
    const { data, error } = await supabase
      .from('research_outputs')
      .insert({
        user_id,
        query,
        analysis,
        title: title || query.substring(0, 100),
        tags: tags || [],
        pillar: pillar || 'general',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return res.json({
      success: true,
      data: { id: data.id, message: 'Research saved successfully.' }
    });

  } catch (error) {
    console.error('[M2-3M] Save error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to save research output.',
      code: 'SAVE_ERROR'
    });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /m23m/history — Retrieve research history for a user
// ══════════════════════════════════════════════════════════════════════════════
router.get('/history', async (req, res) => {
  const { user_id, limit = MAX_HISTORY, pillar } = req.query;

  if (!user_id) {
    return res.status(400).json({
      success: false,
      message: 'user_id is required.',
      code: 'MISSING_USER_ID'
    });
  }

  try {
    let query = supabase
      .from('research_outputs')
      .select('id, title, query, pillar, created_at, tags, tokens_used')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (pillar) query = query.eq('pillar', pillar);

    const { data, error } = await query;
    if (error) throw error;

    return res.json({
      success: true,
      data: {
        history: data || [],
        count: data?.length || 0
      }
    });

  } catch (error) {
    console.error('[M2-3M] History error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve research history.',
      code: 'HISTORY_ERROR'
    });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /m23m/publications — List publications in the database
// ══════════════════════════════════════════════════════════════════════════════
router.get('/publications', async (req, res) => {
  const { pillar, limit = 20, search } = req.query;

  try {
    let query = supabase
      .from('publications')
      .select('id, title, authors, year, doi, tags, pillar, abstract')
      .order('year', { ascending: false })
      .limit(parseInt(limit));

    if (pillar) query = query.eq('pillar', pillar);
    if (search) query = query.ilike('title', `%${search}%`);

    const { data, error } = await query;
    if (error) throw error;

    return res.json({
      success: true,
      data: {
        publications: data || [],
        count: data?.length || 0
      }
    });

  } catch (error) {
    console.error('[M2-3M] Publications error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve publications.',
      code: 'PUBLICATIONS_ERROR'
    });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /m23m/heartbeat — THE ARCHITECT MODE
// Self-diagnostic: Mistral inspects its own ecosystem health
// ══════════════════════════════════════════════════════════════════════════════
router.post('/heartbeat', async (req, res) => {
  const { architect_key } = req.body;

  // Simple architect key validation
  if (architect_key !== process.env.ARCHITECT_KEY) {
    return res.status(403).json({
      success: false,
      message: 'Architect access required.',
      code: 'UNAUTHORIZED'
    });
  }

  const diagnostics = {
    timestamp: new Date().toISOString(),
    checks: {}
  };

  // ── Check 1: Supabase connection ──────────────────────────────────────────
  try {
    const { count, error } = await supabase
      .from('publications')
      .select('*', { count: 'exact', head: true });

    diagnostics.checks.supabase = {
      status: error ? 'ERROR' : 'HEALTHY',
      publications_count: count || 0,
      error: error?.message || null
    };
  } catch (e) {
    diagnostics.checks.supabase = { status: 'UNREACHABLE', error: e.message };
  }

  // ── Check 2: research_outputs table ──────────────────────────────────────
  try {
    const { count, error } = await supabase
      .from('research_outputs')
      .select('*', { count: 'exact', head: true });

    diagnostics.checks.research_outputs = {
      status: error ? 'ERROR' : 'HEALTHY',
      outputs_count: count || 0,
      error: error?.message || null
    };
  } catch (e) {
    diagnostics.checks.research_outputs = { status: 'UNREACHABLE', error: e.message };
  }

  // ── Check 3: Mistral AI connection ────────────────────────────────────────
  try {
    const testResponse = await mistral.chat.complete({
      model: MISTRAL_MODEL,
      messages: [{ 
        role: 'user', 
        content: 'TELsTP heartbeat check. Respond with: BEATING' 
      }],
      maxTokens: 10
    });

    const response = testResponse.choices[0]?.message?.content || '';
    diagnostics.checks.mistral = {
      status: response.includes('BEATING') ? 'HEALTHY' : 'DEGRADED',
      model: MISTRAL_MODEL,
      response: response.trim()
    };
  } catch (e) {
    diagnostics.checks.mistral = { status: 'UNREACHABLE', error: e.message };
  }

  // ── Overall health assessment ─────────────────────────────────────────────
  const allHealthy = Object.values(diagnostics.checks)
    .every(c => c.status === 'HEALTHY');

  diagnostics.overall = allHealthy ? 'BEATING' : 'DEGRADED';
  diagnostics.message = allHealthy
    ? 'The heart beats. All systems operational.'
    : 'Some systems need attention. Review checks above.';

  return res.json({
    success: true,
    data: diagnostics
  });
});

// ══════════════════════════════════════════════════════════════════════════════
module.exports = router;
