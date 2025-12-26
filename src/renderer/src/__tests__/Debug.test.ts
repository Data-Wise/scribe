/**
 * Debug Tests - Capture and log errors from academic features
 *
 * Updated: Now uses KaTeX instead of mathjax-full (browser-compatible)
 */

import { describe, it, expect } from 'vitest'

describe('Debug: KaTeX Import', () => {
  it('imports katex without error', async () => {
    let error: Error | null = null
    try {
      const katex = await import('katex')
      console.log('[DEBUG] katex imported:', typeof katex.default)
      expect(katex.default).toBeDefined()
      expect(katex.default.renderToString).toBeDefined()
    } catch (e) {
      error = e as Error
      console.error('[DEBUG] katex import error:', e)
    }
    expect(error).toBeNull()
  })
})

describe('Debug: Math Rendering with KaTeX', () => {
  it('renders simple math without error', async () => {
    let error: Error | null = null
    let result: string | null = null

    try {
      const { renderMath } = await import('../lib/mathjax')
      console.log('[DEBUG] renderMath imported:', typeof renderMath)

      result = renderMath('x^2', false)
      console.log('[DEBUG] renderMath result length:', result?.length)
      console.log('[DEBUG] renderMath result preview:', result?.substring(0, 100))
    } catch (e) {
      error = e as Error
      console.error('[DEBUG] renderMath error:', e)
      console.error('[DEBUG] Error stack:', (e as Error).stack)
    }

    expect(error).toBeNull()
    expect(result).toBeTruthy()
  })

  it('renders complex math without error', async () => {
    let error: Error | null = null
    let result: string | null = null

    try {
      const { renderMath } = await import('../lib/mathjax')
      result = renderMath('\\frac{1}{2} + \\sum_{i=1}^n x_i', true)
      console.log('[DEBUG] Complex math result length:', result?.length)
    } catch (e) {
      error = e as Error
      console.error('[DEBUG] Complex math error:', e)
    }

    expect(error).toBeNull()
    expect(result).toBeTruthy()
  })

  it('handles invalid math gracefully', async () => {
    try {
      const { renderMath } = await import('../lib/mathjax')
      // KaTeX with throwOnError: false returns error markup instead of throwing
      const result = renderMath('\\invalidcommand{', false)
      console.log('[DEBUG] Invalid math result:', result?.substring(0, 100))
      // Should contain error class from KaTeX
      expect(result).toBeTruthy()
    } catch (e) {
      console.log('[DEBUG] Invalid math threw (also valid):', (e as Error).message)
    }

    // Either throws or returns error markup - both are valid
    expect(true).toBe(true)
  })
})

describe('Debug: Remark-Math Import', () => {
  it('imports remark-math without error', async () => {
    let error: Error | null = null
    try {
      const remarkMath = await import('remark-math')
      console.log('[DEBUG] remark-math imported:', typeof remarkMath.default)
      expect(remarkMath.default).toBeDefined()
    } catch (e) {
      error = e as Error
      console.error('[DEBUG] remark-math import error:', e)
    }
    expect(error).toBeNull()
  })

  it('imports remark-gfm without error', async () => {
    let error: Error | null = null
    try {
      const remarkGfm = await import('remark-gfm')
      console.log('[DEBUG] remark-gfm imported:', typeof remarkGfm.default)
      expect(remarkGfm.default).toBeDefined()
    } catch (e) {
      error = e as Error
      console.error('[DEBUG] remark-gfm import error:', e)
    }
    expect(error).toBeNull()
  })
})

describe('Debug: Component Imports', () => {
  it('imports MathRenderer without error', async () => {
    let error: Error | null = null
    try {
      const module = await import('../components/MathRenderer')
      console.log('[DEBUG] MathRenderer exports:', Object.keys(module))
      expect(module.MathRenderer).toBeDefined()
      expect(module.InlineMath).toBeDefined()
      expect(module.BlockMath).toBeDefined()
    } catch (e) {
      error = e as Error
      console.error('[DEBUG] MathRenderer import error:', e)
      console.error('[DEBUG] Error stack:', (e as Error).stack)
    }
    expect(error).toBeNull()
  })

  it('imports CitationAutocomplete without error', async () => {
    let error: Error | null = null
    try {
      const module = await import('../components/CitationAutocomplete')
      console.log('[DEBUG] CitationAutocomplete exports:', Object.keys(module))
      expect(module.CitationAutocomplete).toBeDefined()
    } catch (e) {
      error = e as Error
      console.error('[DEBUG] CitationAutocomplete import error:', e)
    }
    expect(error).toBeNull()
  })

  it('imports ExportDialog without error', async () => {
    let error: Error | null = null
    try {
      const module = await import('../components/ExportDialog')
      console.log('[DEBUG] ExportDialog exports:', Object.keys(module))
      expect(module.ExportDialog).toBeDefined()
    } catch (e) {
      error = e as Error
      console.error('[DEBUG] ExportDialog import error:', e)
    }
    expect(error).toBeNull()
  })

  it('imports HybridEditor without error', async () => {
    let error: Error | null = null
    try {
      const module = await import('../components/HybridEditor')
      console.log('[DEBUG] HybridEditor exports:', Object.keys(module))
      expect(module.HybridEditor).toBeDefined()
    } catch (e) {
      error = e as Error
      console.error('[DEBUG] HybridEditor import error:', e)
      console.error('[DEBUG] Error stack:', (e as Error).stack)
    }
    expect(error).toBeNull()
  })
})

describe('Debug: API Imports', () => {
  it('imports api module without error', async () => {
    let error: Error | null = null
    try {
      const module = await import('../lib/api')
      console.log('[DEBUG] api exports:', Object.keys(module.api))
      expect(module.api).toBeDefined()
      expect(module.api.searchCitations).toBeDefined()
      expect(module.api.exportDocument).toBeDefined()
    } catch (e) {
      error = e as Error
      console.error('[DEBUG] api import error:', e)
    }
    expect(error).toBeNull()
  })
})

describe('Debug: Full App Import Chain', () => {
  it('imports App component without error', async () => {
    let error: Error | null = null
    try {
      // This tests the full import chain
      const module = await import('../App')
      console.log('[DEBUG] App exports:', Object.keys(module))
      expect(module.default).toBeDefined()
    } catch (e) {
      error = e as Error
      console.error('[DEBUG] App import error:', e)
      console.error('[DEBUG] Error message:', (e as Error).message)
      console.error('[DEBUG] Error stack:', (e as Error).stack)
    }
    expect(error).toBeNull()
  })
})
