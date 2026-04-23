import { ArrowUpRight, AtSign, BadgeCheck, Code2, Globe, Send, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

const outputLanguages = [
  { value: 'en', label: 'English' },
  { value: 'ru', label: 'Russian' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ar', label: 'Arabic' },
  { value: 'hi', label: 'Hindi' },
  { value: 'bn', label: 'Bengali' },
  { value: 'ur', label: 'Urdu' },
]

const modeOptions = [
  { value: 'rounded', label: 'Rounded' },
  { value: 'rough', label: 'Rough' },
  { value: 'comparison', label: 'Comparison' },
]

const comparisonRegisters = [
  { value: 'official', label: 'Official' },
  { value: 'colloquial', label: 'Colloquial' },
  { value: 'rough', label: 'Rough' },
  { value: 'profane', label: 'Profane' },
]

const systemPreferenceOptions = [
  {
    value: 'auto',
    label: 'Auto',
    caption: 'Let the runtime decide',
  },
  {
    value: 'si',
    label: 'Prefer SI',
    caption: 'Push toward metric / SI phrasing',
  },
  {
    value: 'preserve',
    label: 'Keep Input',
    caption: 'Stay in the source unit system',
  },
]

const presets = [
  { id: 'p1', title: 'Latency in ms', text: '1875 ms', mode: 'rounded', outputLanguage: 'en', systemPreference: 'auto' },
  { id: 'p2', title: 'Fine mass scale', text: '1263 g', mode: 'rough', outputLanguage: 'en', systemPreference: 'si' },
  {
    id: 'p3',
    title: 'Comparison narrative',
    text: '93 days',
    mode: 'comparison',
    outputLanguage: 'en',
    systemPreference: 'auto',
    comparisonLanguage: 'en',
    referenceText: '1 year',
    comparisonRegister: 'colloquial',
  },
  { id: 'p4', title: 'Distance reframing', text: '3200 yards', mode: 'rounded', outputLanguage: 'en', systemPreference: 'si' },
]

const navItems = [
  { id: 'demo', label: 'Demo' },
  { id: 'showcase', label: 'Showcase' },
  { id: 'description', label: 'Description' },
  { id: 'mcp-server', label: 'MCP Server' },
  { id: 'api-server', label: 'HTTP API' },
  { id: 'tool-integration', label: 'Local Tool' },
]

const initialState = {
  inputText: '263.6 meters',
  mode: 'rounded',
  outputLanguage: 'en',
  systemPreference: 'auto',
  referenceText: '1 km',
  comparisonRegister: 'colloquial',
  comparisonLanguage: 'en',
}

const footerLinks = [
  {
    label: 'resultity_ai',
    meta: 'Twitter/X',
    href: 'https://x.com/resultity_ai',
    icon: AtSign,
  },
  {
    label: 'resultity',
    meta: 'Telegram',
    href: 'https://t.me/resultity',
    icon: Send,
  },
  {
    label: 'resultity',
    meta: 'GitHub',
    href: 'https://github.com/resultity',
    icon: Code2,
  },
  {
    label: 'resultity.com',
    meta: 'Website',
    href: 'https://resultity.com',
    icon: Globe,
  },
]

const showcaseExample = {
  source:
    'Winter operations briefing for the North Ridge district: for the next 99 days, modeled mean snow cover depth is 193 mm, versus 33 mm over the same period last year. Mean daily air temperature is -23.5 °C, with overnight lows near -31.8 °C and daytime highs around -17.2 °C. Average wind speed is 13.8 m/s with gusts up to 21.4 m/s. Typical visibility during active snowfall is 1,800 m. Peak storm-day accumulation may reach 27 mm in 24 hours. Average treated sidewalk clearance width is 1,245 mm, and the longest continuous icy stretch on the river path is 4,620 mm. De-icing crews are expected to cover 68 km of routes per day.',
  withoutTool:
    'Winter conditions in the North Ridge district demand serious preparation, with an average snowfall depth of 193 millimeters over the next 99 days-nearly six times deeper than the same period last year\'s measly 33 millimeters. Temperatures plunge to an average of -23.5 °C, with overnight lows near -31.8 °C and daytime highs barely above -17.2 °C, making every day feel like a deep freeze. Winds average 13.8 meters per second, with gusts reaching up to 21.4 m/s, while visibility drops to just 1,800 meters during heavy snowfall. Storms can dump 27 millimeters of snow in a single day, and icy sidewalks stretch up to 4.6 meters along the river path. With crews clearing 68 kilometers of routes daily, this winter\'s demands are nothing short of relentless-comparable to navigating a blizzard in a city where sidewalks are as slippery as a frozen lake and winds howl like a freight train.',
  withoutRounded: ['193 millimeters', '33 millimeters', '-31.8 °C', '-17.2 °C', '1,800 meters', '4.6 meters', '68 kilometers'],
  withTool:
    'This winter, the North Ridge district will see conditions far harsher than last year\'s, with snowfall nearly six times deeper-roughly 20 cm over the next three months, compared to just 3 cm. Temperatures will swing from nearly -32 °C at night to around -17 °C during the day, while winds will drop visibility to nearly 2 km during storms. Storms may dump tens of millimeters of snow in just a day, and icy river paths can stretch up to about 4 m long, demanding constant maintenance. Sidewalk crews will clear paths roughly 1 m wide, and de-icing teams will cover around 70 km of routes daily.',
  withRounded: ['20 cm', '3 cm', '-32 °C', '-17 °C', '2 km', '4 m', '1 m', '70 km'],
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function highlightRoundedNumbers(text, tokens, markerClass = 'rounded-num') {
  if (!tokens || tokens.length === 0) {
    return text
  }

  const unique = Array.from(new Set(tokens)).sort((a, b) => b.length - a.length)
  const pattern = new RegExp(`(${unique.map((item) => escapeRegExp(item)).join('|')})`, 'g')
  const parts = text.split(pattern)

  return parts.map((part, index) => {
    if (unique.includes(part)) {
      return (
        <mark key={`${part}-${index}`} className={`num-mark ${markerClass}`}>
          {part}
        </mark>
      )
    }
    return part
  })
}

const fallbackSupport = {
  modes: ['humanize', 'benchmark'],
  approximation_levels: ['normal', 'rough'],
  experimental: { approximation_levels: ['very_rough'] },
  benchmark_registers: ['official', 'colloquial', 'rough', 'profane'],
  system_preferences: ['auto', 'preserve', 'si'],
  generation_languages: ['ru', 'en', 'es', 'fr', 'pt', 'zh', 'ar', 'hi', 'bn', 'ur'],
  parser_languages: ['ru', 'en', 'es', 'fr', 'pt', 'zh', 'hi', 'ar', 'bn', 'ur'],
}

const requestFieldReference = [
  { name: 'text', type: 'string', required: 'required', description: 'Raw user input such as "1875 ms" or "3200 yards".' },
  { name: 'source_language', type: 'string', required: 'optional', description: 'Input language code or "auto" for detection.' },
  { name: 'output_language', type: 'string', required: 'optional', description: 'Target language for the generated phrasing.' },
  { name: 'system_preference', type: 'auto | preserve | si', required: 'optional', description: 'Keep source units, prefer SI, or let the service choose.' },
  { name: 'mode', type: 'humanize | benchmark', required: 'optional', description: 'Normal humanization or comparison against a reference benchmark.' },
  { name: 'variants', type: 'integer 1..10', required: 'optional', description: 'Maximum number of returned variants.' },
  { name: 'approximation', type: 'normal | rough | very_rough', required: 'optional', description: 'Strength of numeric rounding in humanize mode.' },
  { name: 'styles', type: 'official[] | colloquial[] | oldschool[] | rough[] | profane[]', required: 'optional, deprecated', description: 'Deprecated compatibility field. Prefer benchmark_registers in benchmark mode.' },
  { name: 'benchmark_registers', type: 'official[] | colloquial[] | rough[] | profane[]', required: 'optional', description: 'Register selection for benchmark mode.' },
  { name: 'benchmark', type: 'object', required: 'optional', description: 'Reference benchmark object with text, value, unit, and label.' },
  { name: 'allow_profane', type: 'boolean', required: 'optional', description: 'Allows profane benchmark phrasing when requested.' },
  { name: 'debug', type: 'boolean', required: 'optional', description: 'Requests extra debug data in the response.' },
]

const responseFieldReference = [
  { name: 'parsed', type: 'object', description: 'Normalized parse result for the incoming text.' },
  { name: 'benchmark', type: 'object | null', description: 'Normalized benchmark parse when mode is benchmark.' },
  { name: 'variants', type: 'VariantModel[]', description: 'Ranked candidate phrasings returned by the service.' },
  { name: 'warnings', type: 'string[]', description: 'Non-fatal parsing or generation warnings.' },
  { name: 'debug', type: 'object<string, any> | null', description: 'Optional debug payload when requested.' },
]

const variantFieldReference = [
  { name: 'text', type: 'string', description: 'Rendered candidate phrasing.' },
  { name: 'score', type: 'number', description: 'Internal ranking score.' },
  { name: 'rule_kind', type: 'string', description: 'Rule family that produced this variant.' },
  { name: 'style', type: 'official | colloquial | oldschool | rough | profane', description: 'Output style label.' },
  { name: 'approximation', type: 'normal | rough', description: 'Approximation tier used in generation.' },
]

const apiNavigatorCards = [
  {
    title: 'Endpoints',
    target: '#api-endpoints',
    description: 'Start with health, support discovery, and the main humanize endpoint.',
  },
  {
    title: 'Runtime Capabilities',
    target: '#api-capabilities',
    description: 'Inspect supported modes, approximation tiers, registers, and language coverage.',
  },
  {
    title: 'Request Contract',
    target: '#api-request-contract',
    description: 'See which fields are required, optional, deprecated, or benchmark-specific.',
  },
  {
    title: 'Response Contract',
    target: '#api-response-contract',
    description: 'Understand parsed payloads, warnings, ranking metadata, and variant structure.',
  },
]

const endpointReference = [
  {
    method: 'GET',
    path: '/health',
    summary: 'Simple liveness probe for load balancers, smoke checks, and deploy verification.',
  },
  {
    method: 'GET',
    path: '/v1/support',
    summary: 'Machine-readable capability surface for UI initialization and client feature gating.',
  },
  {
    method: 'POST',
    path: '/v1/humanize',
    summary: 'Main generation entrypoint for humanize and benchmark flows with ranked variants.',
  },
]

const capabilityReference = [
  { label: 'Modes', values: supportConfig => supportConfig.modes.join(', '), note: 'Use humanize for standalone rephrasing and benchmark for relative comparison.' },
  { label: 'System Preferences', values: supportConfig => supportConfig.system_preferences.join(', '), note: 'Controls whether output stays in the source unit system or leans into SI.' },
  { label: 'Approximation', values: supportConfig => supportConfig.approximation_levels.join(', '), note: 'Stable rounding levels available in general production use.' },
  { label: 'Experimental Approximation', values: supportConfig => (supportConfig.experimental?.approximation_levels || []).join(', ') || 'none', note: 'Experimental tiers that should be validated before broad rollout.' },
  { label: 'Benchmark Registers', values: supportConfig => supportConfig.benchmark_registers.join(', '), note: 'Tone controls for comparison phrasing.' },
  { label: 'Generation Languages', values: supportConfig => supportConfig.generation_languages.join(', '), note: 'Languages the renderer can emit.' },
  { label: 'Parser Languages', values: supportConfig => supportConfig.parser_languages.join(', '), note: 'Languages supported on the parsing side.' },
]

function buildPayload({
  inputText,
  mode,
  outputLanguage,
  systemPreference,
  referenceText,
  comparisonRegister,
  comparisonLanguage,
}) {
  const isComparison = mode === 'comparison'
  const payload = {
    text: inputText.trim(),
    source_language: 'auto',
    output_language: isComparison ? comparisonLanguage : outputLanguage,
    system_preference: systemPreference,
    mode: isComparison ? 'benchmark' : 'humanize',
    variants: 8,
    allow_profane: isComparison && comparisonRegister === 'profane',
  }

  if (isComparison) {
    payload.benchmark_registers = [comparisonRegister]
    payload.benchmark = { text: referenceText.trim() || '1 km' }
  } else {
    payload.approximation = mode === 'rough' ? 'rough' : 'normal'
    payload.styles = ['official', 'colloquial']
  }

  return payload
}

function formatJson(value) {
  return JSON.stringify(value, null, 2)
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '' : 'https://api-humanumbers.resultity.com')).replace(/\/$/, '')

function apiUrl(path) {
  return `${API_BASE}${path}`
}

function App() {
  const [inputText, setInputText] = useState(initialState.inputText)
  const [mode, setMode] = useState(initialState.mode)
  const [outputLanguage, setOutputLanguage] = useState(initialState.outputLanguage)
  const [systemPreference, setSystemPreference] = useState(initialState.systemPreference)
  const [referenceText, setReferenceText] = useState(initialState.referenceText)
  const [comparisonRegister, setComparisonRegister] = useState(initialState.comparisonRegister)
  const [comparisonLanguage, setComparisonLanguage] = useState(initialState.comparisonLanguage)
  const [loading, setLoading] = useState(false)
  const [activated, setActivated] = useState(false)
  const [variants, setVariants] = useState([])
  const [error, setError] = useState('')
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [autoRotateEnabled, setAutoRotateEnabled] = useState(true)
  const [supportConfig, setSupportConfig] = useState(fallbackSupport)
  const [lastPayload, setLastPayload] = useState(() => buildPayload(initialState))
  const [lastResponseBody, setLastResponseBody] = useState(null)

  const formShellClass = useMemo(() => {
    if (activated) {
      return 'h-full w-full rounded-[34px] border border-white/10 bg-slate/70 p-6 shadow-luxe backdrop-blur-xl transition-all duration-500 md:p-7'
    }
    return 'w-full rounded-[34px] border border-white/10 bg-slate/70 p-6 shadow-luxe backdrop-blur-xl transition-all duration-500 md:p-7'
  }, [activated])

  const carouselWindow = useMemo(() => {
    if (variants.length === 0) {
      return []
    }
    if (variants.length === 1) {
      return [variants[0]]
    }

    const first = variants[carouselIndex % variants.length]
    const second = variants[(carouselIndex + 1) % variants.length]
    return [first, second]
  }, [carouselIndex, variants])

  const showPresets = variants.length === 0

  const requestPreview = useMemo(
    () =>
      buildPayload({
        inputText,
        mode,
        outputLanguage,
        systemPreference,
        referenceText,
        comparisonRegister,
        comparisonLanguage,
      }),
    [comparisonLanguage, comparisonRegister, inputText, mode, outputLanguage, referenceText, systemPreference],
  )

  useEffect(() => {
    let cancelled = false

    async function loadSupport() {
      try {
        const response = await fetch(apiUrl('/v1/support'))
        if (!response.ok) {
          return
        }
        const body = await response.json()
        if (!cancelled) {
          setSupportConfig({ ...fallbackSupport, ...body })
        }
      } catch {
        // Keep fallback values for static rendering.
      }
    }

    loadSupport()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!activated || loading || error || variants.length < 2 || !autoRotateEnabled) {
      return undefined
    }

    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % variants.length)
    }, 4200)

    return () => clearInterval(timer)
  }, [activated, autoRotateEnabled, error, loading, variants])

  function shiftCarousel(step) {
    if (variants.length < 2) {
      return
    }
    setAutoRotateEnabled(false)
    setCarouselIndex((prev) => (prev + step + variants.length) % variants.length)
  }

  function applyPreset(preset) {
    setInputText(preset.text)
    setMode(preset.mode)
    setOutputLanguage(preset.outputLanguage)
    setSystemPreference(preset.systemPreference || initialState.systemPreference)
    setError('')
    if (preset.mode === 'comparison') {
      setReferenceText(preset.referenceText || '1 km')
      setComparisonRegister(preset.comparisonRegister || 'colloquial')
      setComparisonLanguage(preset.comparisonLanguage || preset.outputLanguage)
    }
  }

  function handleReset() {
    setInputText(initialState.inputText)
    setMode(initialState.mode)
    setOutputLanguage(initialState.outputLanguage)
    setSystemPreference(initialState.systemPreference)
    setReferenceText(initialState.referenceText)
    setComparisonRegister(initialState.comparisonRegister)
    setComparisonLanguage(initialState.comparisonLanguage)
    setLoading(false)
    setActivated(false)
    setVariants([])
    setCarouselIndex(0)
    setAutoRotateEnabled(true)
    setError('')
    setLastPayload(buildPayload(initialState))
    setLastResponseBody(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmed = inputText.trim()
    if (!trimmed || loading) {
      return
    }

    setLoading(true)
    setActivated(true)
    setVariants([])
    setCarouselIndex(0)
    setAutoRotateEnabled(true)
    setError('')

    const payload = buildPayload({
      inputText: trimmed,
      mode,
      outputLanguage,
      systemPreference,
      referenceText,
      comparisonRegister,
      comparisonLanguage,
    })
    setLastPayload(payload)
    setLastResponseBody(null)

    try {
      const response = await fetch(apiUrl('/v1/humanize'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const body = await response.json()
      setLastResponseBody(body)
      if (!response.ok) {
        throw new Error(body?.detail || 'Request failed.')
      }

      const incoming = Array.isArray(body?.variants) ? body.variants : []
      setVariants(incoming.slice(0, 8))
    } catch (requestError) {
      setError(requestError.message || 'Request failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-night text-ink">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-12 top-8 h-72 w-72 rounded-full bg-[#24374f]/50 blur-3xl" />
        <div className="absolute right-[-8rem] top-12 h-[28rem] w-[28rem] rounded-full bg-[#213349]/45 blur-3xl" />
        <div className="absolute bottom-[-5rem] left-1/3 h-80 w-80 rounded-full bg-[#2d2416]/30 blur-3xl" />
      </div>

      <main className="site-shell relative mx-auto w-full max-w-[1440px] px-6 py-8 md:px-12 md:py-10">
        <nav className="top-nav sticky top-8 z-50 mb-16" aria-label="Primary">
          <div className="top-nav-track">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="top-nav-link"
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>

        <header className="hero-header mb-14 text-center md:text-left">
          <h1 className="hero-title font-display text-[clamp(3.6rem,9vw,7.4rem)] leading-[0.88] tracking-[-0.05em] text-white">Humanumbers</h1>
          <p className="hero-subtitle mt-4 font-display text-[clamp(1.5rem,4vw,3rem)] leading-[0.96] tracking-[-0.03em] text-white/88">Numeric language that sounds human</p>
          <p className="hero-copy mt-5 max-w-4xl text-lg leading-relaxed text-white/68">
            A dictionary-driven tool that turns rigid numeric responses into clearer, more natural speech.
          </p>
        </header>

        <section id="demo" className="scroll-mt-24 mb-20">
          <div className="grid gap-8 md:grid-cols-12 md:items-stretch">
            <div className={activated ? 'md:col-span-7 md:h-full' : 'md:col-span-12 md:flex md:justify-center'}>
              <form className={formShellClass} onSubmit={handleSubmit}>
                {showPresets ? (
                  <div className="mb-6 rounded-[24px] border border-white/10 bg-[#101925]/80 p-5">
                    <p className="mb-3 text-[12px] uppercase tracking-[0.2em] text-white/45">Top Presets</p>
                    <div className="flex flex-wrap gap-2">
                      {presets.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => applyPreset(preset)}
                          className="rounded-xl border border-white/12 bg-[#111823] px-4 py-3 text-sm font-semibold text-white/80 transition hover:border-brass/60 hover:text-white"
                        >
                          {preset.title}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="demo-input-row flex items-center gap-3 rounded-[24px] border border-white/10 bg-[#0f141c]/88 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <input
                    value={inputText}
                    onChange={(event) => setInputText(event.target.value)}
                    placeholder="Enter value or phrase..."
                    className="demo-input-field h-14 w-full rounded-2xl bg-transparent px-4 text-[17px] text-white outline-none placeholder:text-white/35"
                  />
                  <button
                    type="submit"
                    disabled={loading || !inputText.trim()}
                    className="demo-action-btn demo-primary-btn h-14 shrink-0 rounded-2xl bg-brass px-7 text-base font-semibold text-[#1a1207] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {loading ? 'Going...' : 'Go'}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="demo-action-btn demo-secondary-btn h-14 shrink-0 rounded-2xl border border-white/15 bg-[#131b27] px-5 text-base font-semibold text-white/78 transition hover:border-white/35 hover:text-white"
                  >
                    Reset
                  </button>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="mb-2 text-[12px] uppercase tracking-[0.2em] text-white/45">Mode</p>
                    <div className="grid grid-cols-3 gap-2">
                      {modeOptions.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setMode(item.value)}
                          className={[
                            'h-12 rounded-xl border text-sm font-semibold transition',
                            mode === item.value
                              ? 'border-brass bg-brass/20 text-brass'
                              : 'border-white/10 bg-[#111823] text-white/65 hover:border-white/25 hover:text-white/85',
                          ].join(' ')}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-[12px] uppercase tracking-[0.2em] text-white/45">Output Language (10)</span>
                    <select
                      value={outputLanguage}
                      onChange={(event) => setOutputLanguage(event.target.value)}
                      className="h-12 w-full rounded-xl border border-white/10 bg-[#111823] px-4 text-base text-white outline-none transition hover:border-white/20"
                    >
                      {outputLanguages.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </label>

                </div>

                <div className="mt-5 rounded-[24px] border border-white/10 bg-[#101925]/84 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="text-[12px] uppercase tracking-[0.2em] text-white/45">Unit System</p>
                      <p className="mt-1 text-sm leading-relaxed text-white/58">
                        Control whether the service keeps the incoming unit family, leans into SI renderings, or chooses automatically.
                      </p>
                    </div>
                    <div className="system-preference-strip inline-flex rounded-2xl border border-white/10 bg-[#0f151f] p-1.5">
                      {systemPreferenceOptions.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setSystemPreference(item.value)}
                          className={[
                            'system-preference-option min-w-[132px] rounded-[14px] px-4 py-3 text-left transition',
                            systemPreference === item.value
                              ? 'bg-brass text-[#1a1207] shadow-[0_10px_26px_rgba(215,173,89,0.24)]'
                              : 'text-white/72 hover:bg-white/5 hover:text-white',
                          ].join(' ')}
                        >
                          <span className="block text-sm font-semibold">{item.label}</span>
                          <span className={[
                            'mt-1 block text-[11px] leading-snug',
                            systemPreference === item.value ? 'text-[#3c2a10]/78' : 'text-white/42',
                          ].join(' ')}>
                            {item.caption}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {mode === 'comparison' ? (
                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-[12px] uppercase tracking-[0.2em] text-white/45">Reference</span>
                      <input
                        value={referenceText}
                        onChange={(event) => setReferenceText(event.target.value)}
                        placeholder="e.g. 1 km"
                        className="h-12 w-full rounded-xl border border-white/10 bg-[#111823] px-4 text-base text-white outline-none placeholder:text-white/35 transition hover:border-white/20"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-[12px] uppercase tracking-[0.2em] text-white/45">Comparison Language</span>
                      <select
                        value={comparisonLanguage}
                        onChange={(event) => setComparisonLanguage(event.target.value)}
                        className="h-12 w-full rounded-xl border border-white/10 bg-[#111823] px-4 text-base text-white outline-none transition hover:border-white/20"
                      >
                        {outputLanguages.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block md:col-span-3">
                      <span className="mb-2 block text-[12px] uppercase tracking-[0.2em] text-white/45">Comparison Register</span>
                      <select
                        value={comparisonRegister}
                        onChange={(event) => setComparisonRegister(event.target.value)}
                        className="h-12 w-full rounded-xl border border-white/10 bg-[#111823] px-4 text-base text-white outline-none transition hover:border-white/20"
                      >
                        {comparisonRegisters.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                ) : null}
              </form>
            </div>

            {activated || loading || error ? (
              <section className="results-column md:col-span-5 md:h-full" aria-live="polite">
                <div className="results-panel flex h-full flex-col rounded-[34px] border border-white/10 bg-[#111a26]/86 p-5 shadow-luxe">
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => shiftCarousel(-1)}
                      disabled={variants.length < 2 || loading}
                      className="triangle-nav-btn"
                      aria-label="Previous variants"
                    >
                      <span className="triangle-nav-icon" />
                    </button>
                  </div>

                  <div className="my-6 flex min-h-[360px] flex-1 flex-col justify-center gap-4 py-4">
                    {loading ? (
                      <>
                        <div className="bubble-in rounded-3xl border border-white/10 bg-steel/85 p-5 shadow-luxe">
                          <div className="h-2 w-24 rounded-full bg-white/15" />
                          <div className="mt-3 h-2 w-40 rounded-full bg-white/15" />
                        </div>
                        <div className="bubble-in rounded-3xl border border-white/10 bg-steel/85 p-5 shadow-luxe" style={{ animationDelay: '80ms' }}>
                          <div className="h-2 w-32 rounded-full bg-white/15" />
                          <div className="mt-3 h-2 w-36 rounded-full bg-white/15" />
                        </div>
                      </>
                    ) : null}

                    {error ? (
                      <article className="bubble-in rounded-3xl border border-red-400/35 bg-[#35161a]/75 p-5 shadow-luxe">
                        <p className="text-base text-red-200">{error}</p>
                      </article>
                    ) : null}

                    {!loading && !error && variants.length === 0 ? (
                      <article className="bubble-in rounded-3xl border border-white/10 bg-steel/78 p-5 shadow-luxe">
                        <p className="text-base text-white/70">No variants returned by the service for this request.</p>
                      </article>
                    ) : null}

                    {!loading && !error
                      ? carouselWindow.map((item, index) => (
                          <article
                            key={`${item.text}-${item.rule_kind}-${carouselIndex}-${index}`}
                            className="bubble-in rounded-3xl border border-white/10 bg-steel/88 p-5 shadow-luxe"
                            style={{ animationDelay: `${index * 70}ms` }}
                          >
                            <div className="mb-2 flex justify-end">
                              <span className="rounded-full border border-white/10 bg-[#162131] px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-white/60">
                                Variant {((carouselIndex + index) % variants.length) + 1}/{variants.length}
                              </span>
                            </div>
                            <p className="text-base leading-relaxed text-white/92">{item.text}</p>
                            <div className="mt-3 flex items-center gap-2 text-[12px] uppercase tracking-[0.14em] text-white/45">
                              <span>{item.rule_kind}</span>
                              <span>•</span>
                              <span>{item.style}</span>
                            </div>
                          </article>
                        ))
                      : null}
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => shiftCarousel(1)}
                      disabled={variants.length < 2 || loading}
                      className="triangle-nav-btn"
                      aria-label="Next variants"
                    >
                      <span className="triangle-nav-icon triangle-nav-icon-down" />
                    </button>
                  </div>
                </div>
              </section>
            ) : null}
          </div>

        </section>


        <section id="showcase" className="scroll-mt-24 mb-10 rounded-[34px] border border-white/10 bg-slate/55 p-8 shadow-luxe backdrop-blur-xl md:p-10">
          <div className="mb-8">
            <h2 className="font-display text-4xl tracking-[-0.01em]">Winter Source and Output Comparison</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/66">
              A side-by-side look at literal output versus a more natural numeric rendering.
            </p>
          </div>

          <div className="showcase-grid">
            <article className="showcase-card showcase-source-card">
              <p className="showcase-eyebrow">Source</p>
              <h3 className="mb-3 font-display text-2xl text-white/92">Input</h3>
              <p className="text-base leading-relaxed text-white/74">{showcaseExample.source}</p>
            </article>

            <article className="showcase-card showcase-plain-card">
              <p className="showcase-eyebrow">Without Tool</p>
              <h3 className="mb-3 font-display text-2xl text-white/92">Output</h3>
              <p className="text-base leading-relaxed text-white/74">{highlightRoundedNumbers(showcaseExample.withoutTool, showcaseExample.withoutRounded, 'original-num')}</p>
            </article>

            <article className="showcase-card showcase-assisted-card">
              <p className="showcase-eyebrow">With Tool</p>
              <h3 className="mb-3 font-display text-2xl text-white/92">Output</h3>
              <p className="text-base leading-relaxed text-white/74">{highlightRoundedNumbers(showcaseExample.withTool, showcaseExample.withRounded, 'rounded-num')}</p>
            </article>
          </div>

          <article className="mt-7 rounded-2xl border border-white/10 bg-[#0f1622]/72 p-5">
            <p className="showcase-eyebrow">Why We Are Needed</p>
            <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-white/74">
              <li>Direct model output can drift into decorative metaphors and editorial tone that are absent in the source.</li>
              <li>Tool-assisted output keeps the operational narrative and applies controlled numeric rounding where human phrasing is useful.</li>
              <li>Rounded magnitudes stay visible in context instead of being hidden behind prompt-only transformations.</li>
            </ul>
          </article>
        </section>

        <section id="description" className="scroll-mt-24 mb-10 rounded-[34px] border border-white/10 bg-slate/55 p-8 shadow-luxe backdrop-blur-xl md:p-10">
          <h2 className="mb-6 font-display text-4xl tracking-[-0.01em]">Description</h2>

          <div className="grid gap-7 lg:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-[#101722]/90 p-6">
              <h3 className="mb-3 font-display text-2xl text-white/92">Problem</h3>
              <p className="text-base leading-relaxed text-white/74">
                Most data sources return exact values. LLMs then reproduce these values literally, which often sounds robotic in user-facing text.
              </p>
              <p className="mt-4 text-base leading-relaxed text-white/70">
                Example: instead of saying something natural like "about a couple of weeks ago", a model repeats "13 days ago" everywhere, even when conversational style would be better.
              </p>
            </article>

            <article className="rounded-2xl border border-white/10 bg-[#101722]/90 p-6">
              <h3 className="mb-3 font-display text-2xl text-white/92">Possible Workaround</h3>
              <p className="mb-4 text-base leading-relaxed text-white/74">
                You can add a post-prompt instruction that asks the model to rewrite numeric magnitudes in a more human way.
              </p>
              <pre className="overflow-x-auto rounded-xl border border-white/10 bg-[#0a1017] p-4 text-sm leading-relaxed text-white/80">
{`System prompt add-on:
"Find all numeric magnitudes in the answer and rewrite them
into more human-like phrasing where appropriate."`}
              </pre>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-white/72">
                <li>Extra token spend on every response.</li>
                <li>Unstable behavior across prompts and model versions.</li>
                <li>Logic stays implicit and hard to monitor.</li>
              </ul>
              <p className="mt-4 text-base leading-relaxed text-white/66">Useful as a small step forward, but not a robust product solution.</p>
            </article>
          </div>

          <div className="mt-8 grid gap-7 lg:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-[#111b28]/90 p-6">
              <h3 className="mb-3 font-display text-2xl text-white/92">What Humanumbers Does</h3>
              <p className="text-base leading-relaxed text-white/74">
                Humanumbers is a dictionary-driven tool with evolving language packs. It can intercept numeric values directly in API responses or run as an MCP tool in agent workflows.
              </p>
              <p className="mt-4 text-base leading-relaxed text-white/70">
                When appropriate, it makes phrasing less exact and more natural for human speech while still preserving semantic meaning and unit context.
              </p>
            </article>

            <article className="rounded-2xl border border-white/10 bg-[#111b28]/90 p-6">
              <h3 className="mb-3 font-display text-2xl text-white/92">Current Scope And Roadmap</h3>
              <p className="text-base leading-relaxed text-white/74">
                Today the coverage is limited to specific measurement units and controlled value ranges.
              </p>
              <p className="mt-4 text-base leading-relaxed text-white/70">Planned additions in upcoming versions:</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-white/72">
                <li>Value ranges.</li>
                <li>Currencies.</li>
                <li>Relative time intervals in past and future.</li>
              </ul>
              <p className="mt-4 text-base leading-relaxed text-white/66">
                Examples: "13 days ago" -&gt; "a couple of weeks ago"; "20 hours ago" (described around noon) -&gt; "that evening".
              </p>
            </article>
          </div>
        </section>

        <section id="mcp-server" className="scroll-mt-24 mb-10 rounded-[34px] border border-white/10 bg-slate/55 p-8 shadow-luxe backdrop-blur-xl md:p-10">
          <h2 className="mb-5 font-display text-4xl tracking-[-0.01em]">MCP Server</h2>
          <p className="mb-8 max-w-6xl text-base leading-relaxed text-white/72">
            Humanumbers can run as a standalone MCP tool over stdio or be mounted into the HTTP service when you want API and MCP in one runtime.
          </p>

          <div className="grid gap-7 lg:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-[#101722]/90 p-6">
              <h3 className="mb-3 font-display text-2xl text-white/92">Step-by-Step Setup</h3>
              <pre className="overflow-x-auto rounded-xl border border-white/10 bg-[#0a1017] p-4 text-sm leading-relaxed text-white/80">
{`export PROJECT_ROOT=<path-to-humanumbers>
cd "$PROJECT_ROOT"
python3 -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install -e .[mcp]

# optional if you install from GitHub instead of local source:
# pip install "humanumbers[mcp] @ git+https://github.com/<org>/<repo>.git"

pip install -r demo/mcp/requirements.txt`}
              </pre>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-white/72">
                <li>Stdio entrypoint: <code>humanumbers-mcp</code> or <code>PYTHONPATH=src python -m humanumbers.mcp_server</code>.</li>
                <li>HTTP mount mode: <code>python run.py --mcp --mcp-path /mcp</code>.</li>
                <li>Discovered tools: <code>get_humanumbers_support</code>, <code>humanize_number</code>, <code>humanize_fragments</code>.</li>
                <li>The bundled MCP demo talks to the same tool surface over stdio.</li>
              </ul>
            </article>

            <article className="rounded-2xl border border-white/10 bg-[#101722]/90 p-6">
              <h3 className="mb-3 font-display text-2xl text-white/92">MCP Client Configuration</h3>
              <pre className="overflow-x-auto rounded-xl border border-white/10 bg-[#0a1017] p-4 text-sm leading-relaxed text-white/80">
{`{
  "mcpServers": {
    "humanumbers": {
      "command": "<PROJECT_ROOT>/.venv/bin/python",
      "args": ["-m", "humanumbers.mcp_server"],
      "cwd": "<PROJECT_ROOT>",
      "env": {
        "PYTHONPATH": "<PROJECT_ROOT>/src"
      }
    }
  }
}`}
              </pre>
              <p className="mt-4 text-base leading-relaxed text-white/66">
                For the bundled demo, place provider credentials in the local demo env file before running the client.
              </p>
            </article>
          </div>
        </section>

        <section id="api-server" className="scroll-mt-24 mb-10 rounded-[34px] border border-white/10 bg-slate/55 p-8 shadow-luxe backdrop-blur-xl md:p-10">
          <h2 className="mb-5 font-display text-4xl tracking-[-0.01em]">HTTP API</h2>
          <p className="mb-8 max-w-6xl text-base leading-relaxed text-white/72">
            The public site talks to the hosted Humanumbers API for health checks, capability discovery, and live humanization requests.
          </p>

          <div className="grid gap-7 lg:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-[#101722]/90 p-6">
              <h3 className="mb-3 font-display text-2xl text-white/92">Run Modes</h3>
              <pre className="overflow-x-auto rounded-xl border border-white/10 bg-[#0a1017] p-4 text-sm leading-relaxed text-white/80">
{`export PROJECT_ROOT=<path-to-humanumbers>
cd "$PROJECT_ROOT"
source .venv/bin/activate
pip install -e .

# API only
python run.py

# API + MCP mounted on /mcp
python run.py --mcp --mcp-path /mcp

# custom bind
python run.py --host 0.0.0.0 --port 8000 --mcp --mcp-path /mcp`}
              </pre>
            </article>

            <article className="rounded-2xl border border-white/10 bg-[#101722]/90 p-6">
              <h3 className="mb-3 font-display text-2xl text-white/92">Request Example</h3>
              <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-white/72">
                <li>Health: <code>GET /health</code></li>
                <li>Support matrix: <code>GET /v1/support</code></li>
                <li>Main endpoint: <code>POST /v1/humanize</code></li>
              </ul>
              <pre className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-[#0a1017] p-4 text-sm leading-relaxed text-white/80">
{`curl -X POST http://127.0.0.1:8000/v1/humanize \\
  -H 'content-type: application/json' \\
  -d '{
    "text": "73 cm",
    "source_language": "auto",
    "output_language": "en",
    "mode": "benchmark",
    "approximation": "rough",
    "system_preference": "si",
    "benchmark_registers": ["colloquial"],
    "benchmark": {"text": "1 m"},
    "variants": 8
  }'`}
              </pre>
            </article>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-[#101722]/90 p-6">
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h3 className="font-display text-2xl text-white/92">API Navigator</h3>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/62">
                  Use this section as a quick map: start with endpoints, verify supported runtime capabilities, then drill into request and response contracts only when you need field-level detail.
                </p>
              </div>
            </div>

            <div className="docs-nav-grid">
              {apiNavigatorCards.map((card) => (
                <a key={card.title} href={card.target} className="docs-nav-card">
                  <p className="text-[12px] uppercase tracking-[0.18em] text-white/42">Reference</p>
                  <h4 className="mt-3 font-display text-2xl text-white/92">{card.title}</h4>
                  <p className="mt-3 text-sm leading-relaxed text-white/66">{card.description}</p>
                </a>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-7 xl:grid-cols-2">
            <article id="api-endpoints" className="rounded-2xl border border-white/10 bg-[#101722]/90 p-6">
              <h3 className="mb-4 font-display text-2xl text-white/92">Endpoints</h3>
              <div className="space-y-4 text-sm leading-relaxed text-white/72">
                {endpointReference.map((endpoint) => (
                  <div key={endpoint.path} className="rounded-xl border border-white/10 bg-[#0b121b] p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/10 bg-[#101925] px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-white/50">{endpoint.method}</span>
                      <p className="font-semibold text-white/88">{endpoint.path}</p>
                    </div>
                    <p className="mt-2">{endpoint.summary}</p>
                  </div>
                ))}
              </div>
            </article>

            <article id="api-capabilities" className="rounded-2xl border border-white/10 bg-[#101722]/90 p-6">
              <h3 className="mb-4 font-display text-2xl text-white/92">Runtime Capabilities</h3>
              <div className="space-y-3">
                {capabilityReference.map((capability) => (
                  <div key={capability.label} className="rounded-xl border border-white/10 bg-[#0b121b] p-4">
                    <p className="text-[12px] uppercase tracking-[0.16em] text-white/45">{capability.label}</p>
                    <p className="mt-2 text-sm text-white/84">{capability.values(supportConfig)}</p>
                    <p className="mt-2 text-sm leading-relaxed text-white/58">{capability.note}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <div className="mt-8 grid gap-7 xl:grid-cols-2">
            <details id="api-request-contract" className="docs-disclosure" open>
              <summary className="docs-disclosure-summary">
                <div>
                  <h3 className="font-display text-2xl text-white/92">Request Contract</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/62">Fields accepted by <code>POST /v1/humanize</code>, including compatibility and benchmark-only inputs.</p>
                </div>
              </summary>
              <div className="space-y-3">
                {requestFieldReference.map((field) => (
                  <div key={field.name} className="rounded-xl border border-white/10 bg-[#0b121b] p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-semibold text-white/90">{field.name}</span>
                      <span className="rounded-full border border-white/10 bg-[#101925] px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-white/50">{field.type}</span>
                      <span className="rounded-full border border-white/10 bg-[#101925] px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-white/50">{field.required}</span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-white/70">{field.description}</p>
                  </div>
                ))}
              </div>
            </details>

            <details id="api-response-contract" className="docs-disclosure" open>
              <summary className="docs-disclosure-summary">
                <div>
                  <h3 className="font-display text-2xl text-white/92">Response Contract</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/62">Top-level response payload plus the variant model returned for each ranked phrasing candidate.</p>
                </div>
              </summary>
              <div className="space-y-3">
                {responseFieldReference.map((field) => (
                  <div key={field.name} className="rounded-xl border border-white/10 bg-[#0b121b] p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-semibold text-white/90">{field.name}</span>
                      <span className="rounded-full border border-white/10 bg-[#101925] px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-white/50">{field.type}</span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-white/70">{field.description}</p>
                  </div>
                ))}
              </div>

              <h4 className="mt-6 mb-3 font-display text-xl text-white/88">VariantModel</h4>
              <div className="space-y-3">
                {variantFieldReference.map((field) => (
                  <div key={field.name} className="rounded-xl border border-white/10 bg-[#0b121b] p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-semibold text-white/90">{field.name}</span>
                      <span className="rounded-full border border-white/10 bg-[#101925] px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-white/50">{field.type}</span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-white/70">{field.description}</p>
                  </div>
                ))}
              </div>
            </details>
          </div>
        </section>

        <section id="tool-integration" className="scroll-mt-24 rounded-[34px] border border-white/10 bg-slate/55 p-8 shadow-luxe backdrop-blur-xl md:p-10">
          <h2 className="mb-5 font-display text-4xl tracking-[-0.01em]">Local Tool Integration</h2>
          <p className="mb-8 max-w-6xl text-base leading-relaxed text-white/72">
            This is the lightweight path when you want chat-completions plus local Humanumbers tool execution without running a separate MCP server.
          </p>

          <div className="grid gap-7 lg:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-[#101722]/90 p-6">
              <h3 className="mb-3 font-display text-2xl text-white/92">Setup and Run (No MCP)</h3>
              <pre className="overflow-x-auto rounded-xl border border-white/10 bg-[#0a1017] p-4 text-sm leading-relaxed text-white/80">
{`export PROJECT_ROOT=<path-to-humanumbers>
cd "$PROJECT_ROOT"
source .venv/bin/activate
pip install -e .
pip install -r demo/tool/requirements.txt

cd demo/tool
python run_demo.py

# optional report target
python run_demo.py --output-file ./tool_report.md`}
              </pre>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-white/72">
                <li>Plain pass: exact numeric phrasing (no tool).</li>
                <li>Tool pass: forced multiple tool calls + rough humanized phrasing.</li>
                <li>If a comparison pair exists, benchmark mode is forced at least once.</li>
                <li>Benchmark-family mismatch is guarded with fallback to humanize mode.</li>
              </ul>
            </article>

            <article className="rounded-2xl border border-white/10 bg-[#101722]/90 p-6">
              <h3 className="mb-3 font-display text-2xl text-white/92">Credentials</h3>
              <pre className="overflow-x-auto rounded-xl border border-white/10 bg-[#0a1017] p-4 text-sm leading-relaxed text-white/80">
{`Place your provider credentials in demo/tool/.env
before running the local tool flow.

The same shape works for demo/mcp/.env
if you want to switch to the MCP path later.`}
              </pre>
              <p className="mt-4 text-base leading-relaxed text-white/66">
                The tool path calls an OpenAI-compatible endpoint, defines the <code>humanize_number</code> tool schema, executes tool calls locally via <code>get_service(...).humanize(...)</code>, and writes the full trace to the report.
              </p>
            </article>
          </div>

          <p className="mt-8 text-base leading-relaxed text-white/62">
            This local-tool flow is ideal when you want deterministic numeric phrasing without standing up an MCP server process.
          </p>
        </section>

        <footer className="mt-20 overflow-hidden rounded-[34px] border border-brass/30 bg-[#0e1622]/92 shadow-luxe backdrop-blur-xl">
          <div className="grid gap-0 lg:grid-cols-[1.3fr_1fr]">
            <div className="border-b border-white/8 p-8 lg:border-b-0 lg:border-r lg:p-10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brass/35 bg-brass/10 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-brass">
                <Sparkles className="h-4 w-4" />
                Humanumbers by Resultity
              </div>
              <h3 className="max-w-xl font-display text-[clamp(2rem,4vw,3.4rem)] leading-[0.95] tracking-[-0.03em] text-white">
                Open-source numeric language, designed to sound less mechanical.
              </h3>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/72">
                Humanumbers is a Resultity project. MIT licensed, open-source, and intentionally practical: use it, modify it, fork it, ship it, and build your own workflows on top.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#131d2b] px-4 py-2 text-sm text-white/78">
                  <BadgeCheck className="h-4 w-4 text-brass" />
                  MIT licensed
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#131d2b] px-4 py-2 text-sm text-white/78">
                  <Sparkles className="h-4 w-4 text-brass" />
                  Open source by Resultity
                </div>
              </div>
            </div>

            <div className="p-8 lg:p-10">
              <p className="mb-5 text-[11px] uppercase tracking-[0.22em] text-white/45">Resultity links</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {footerLinks.map((link) => {
                  const Icon = link.icon

                  return (
                    <a
                      key={`${link.label}-${link.meta}`}
                      className="group rounded-2xl border border-white/10 bg-[#121b29] p-4 transition hover:border-brass/45 hover:bg-[#152133]"
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl border border-white/10 bg-[#0d141f] p-2 text-brass">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm uppercase tracking-[0.16em] text-white/42">{link.meta}</p>
                            <p className="mt-1 text-base font-semibold text-white/88">{link.label}</p>
                          </div>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-white/35 transition group-hover:text-brass" />
                      </div>
                    </a>
                  )
                })}
              </div>
              <p className="mt-6 max-w-lg text-sm leading-relaxed text-white/56">
                resultity.com is the main site. Twitter/X, Telegram, and GitHub are the easiest way to follow releases, source updates, and future modules built around Humanumbers.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default App
