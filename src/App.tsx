import { useState, useEffect, useRef, useCallback } from 'react'
import QRCode from 'qrcode'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
  exiting?: boolean
}

interface FormState {
  upiId: string
  name: string
  amount: string
  note: string
}

interface ValidationErrors {
  upiId?: string
  amount?: string
}

function injectSEO() {
  document.title = 'Free UPI QR Code Generator Online | Instant & Secure'

  const setMeta = (name: string, content: string, isProp = false) => {
    const attr = isProp ? 'property' : 'name'
    let tag = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null
    if (!tag) {
      tag = document.createElement('meta')
      tag.setAttribute(attr, name)
      document.head.appendChild(tag)
    }
    tag.content = content
  }

  setMeta('description', 'Generate UPI QR codes instantly for free. Compatible with GPay, PhonePe, Paytm & BHIM. Download PNG, print or copy UPI payment link. Built by Muzamil Ahmad Mir.')
  setMeta('keywords', 'UPI QR code generator, free UPI QR, GPay QR, PhonePe QR, Paytm QR, BHIM QR, UPI payment link, generate UPI QR online, Muzamil Ahmad Mir, muzamilmeerdev')
  setMeta('author', 'Muzamil Ahmad Mir')
  setMeta('robots', 'index, follow')
  setMeta('theme-color', '#6d28d9')
  setMeta('og:type', 'website', true)
  setMeta('og:title', 'Free UPI QR Code Generator | Instant & Secure', true)
  setMeta('og:description', 'Create UPI QR codes for GPay, PhonePe, Paytm & BHIM in seconds. 100% free and private.', true)
  setMeta('twitter:card', 'summary_large_image')
  setMeta('twitter:title', 'Free UPI QR Code Generator Online')
  setMeta('twitter:creator', '@muzamilmeerdev')

  if (!document.querySelector('script[type="application/ld+json"]')) {
    const ld = document.createElement('script')
    ld.type = 'application/ld+json'
    ld.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'UPI QR Code Generator',
      description: 'Free online tool to generate UPI QR codes compatible with GPay, PhonePe, Paytm and BHIM.',
      applicationCategory: 'FinanceApplication',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
      author: {
        '@type': 'Person',
        name: 'Muzamil Ahmad Mir',
        url: 'https://github.com/muzamilmeerdev',
        sameAs: [
          'https://github.com/muzamilmeerdev',
          'https://linkedin.com/in/muzamilahmadmir',
        ],
      },
    })
    document.head.appendChild(ld)
  }
}

function buildUpiUrl(form: FormState): string {
  const p = new URLSearchParams()
  p.set('pa', form.upiId.trim())
  if (form.name.trim()) p.set('pn', form.name.trim())
  if (form.amount.trim()) p.set('am', form.amount.trim())
  p.set('cu', 'INR')
  if (form.note.trim()) p.set('tn', form.note.trim())
  return `upi://pay?${p.toString()}`
}

function validateForm(form: FormState): ValidationErrors {
  const errors: ValidationErrors = {}
  const upiPattern = /^[a-zA-Z0-9.\-_+]+@[a-zA-Z0-9]+$/
  if (!form.upiId.trim()) {
    errors.upiId = 'UPI ID is required'
  } else if (!upiPattern.test(form.upiId.trim())) {
    errors.upiId = 'Enter a valid UPI ID (e.g. name@bank)'
  }
  if (form.amount.trim()) {
    const n = parseFloat(form.amount)
    if (isNaN(n) || n <= 0) errors.amount = 'Enter a valid positive amount'
    else if (n > 100000) errors.amount = 'Amount cannot exceed ₹1,00,000'
  }
  return errors
}

function useToastManager() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counter = useRef(0)

  const push = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++counter.current
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t))
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 320)
    }, 3000)
  }, [])

  return { toasts, push }
}

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

const QrIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
)

const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

const PrintIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
)

const CopyIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)

const ResetIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-4.78" />
  </svg>
)

const ZapIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const AlertIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

const InfoIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
)

const ShieldIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const RupeeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3h12" /><path d="M6 8h12" /><path d="m6 13 8.5 8" /><path d="M6 13h3" /><path d="M9 13c6.667 0 6.667-10 0-10" />
  </svg>
)

const GithubIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
)

const LinkedinIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

interface QrCanvasProps {
  upiUrl: string
  dark: boolean
  name: string
  upiId: string
  amount: string
  canvasRef: React.RefObject<HTMLCanvasElement | null>
}

function QrCanvas({ upiUrl, dark, name, upiId, amount, canvasRef }: QrCanvasProps) {
  useEffect(() => {
    if (!canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, upiUrl, {
      width: 240,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: dark ? '#ffffff' : '#0f0f23',
        light: dark ? '#1a1b3a' : '#ffffff',
      },
    })
  }, [upiUrl, dark, canvasRef])

  return (
    <div className="animate-qr-reveal print-area" style={{ textAlign: 'center' }}>
      <div style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        padding: '28px',
        background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'}`,
        boxShadow: dark
          ? '0 0 0 1px rgba(124,58,237,0.15), 0 24px 64px rgba(0,0,0,0.4)'
          : '0 0 0 1px rgba(124,58,237,0.08), 0 16px 48px rgba(0,0,0,0.1)',
      }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.45 }}>
          Scan to Pay via UPI
        </div>

        <div style={{
          padding: '12px',
          background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.95)',
          borderRadius: '14px',
          border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
        }}>
          <canvas ref={canvasRef} style={{ borderRadius: '8px', display: 'block' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          {name && <div style={{ fontWeight: 700, fontSize: '1rem' }}>{name}</div>}
          <div style={{ fontSize: '0.78rem', opacity: 0.5, fontFamily: 'monospace' }}>{upiId}</div>
          {amount && (
            <div style={{
              marginTop: '4px',
              fontWeight: 800,
              fontSize: '1.1rem',
              background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              ₹{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
            <span key={app} style={{
              fontSize: '0.62rem',
              padding: '2px 8px',
              borderRadius: '999px',
              background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
              border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
              fontWeight: 600,
              opacity: 0.6,
            }}>{app}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [dark, setDark] = useState(false)
  const [form, setForm] = useState<FormState>({ upiId: '', name: '', amount: '', note: '' })
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [upiUrl, setUpiUrl] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toasts, push } = useToastManager()

  useEffect(() => { injectSEO() }, [])

  useEffect(() => {
    document.documentElement.className = dark ? 'dark-mode' : ''
  }, [dark])

  const updateField = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleGenerate = () => {
    const errs = validateForm(form)
    if (Object.keys(errs).length) {
      setErrors(errs)
      push(Object.values(errs)[0]!, 'error')
      return
    }
    setGenerating(true)
    setTimeout(() => {
      setUpiUrl(buildUpiUrl(form))
      setGenerating(false)
      push('QR code generated!', 'success')
    }, 280)
  }

  const handleDownload = () => {
    if (!canvasRef.current) return
    const a = document.createElement('a')
    a.download = `upi-qr-${form.upiId.replace('@', '-')}.png`
    a.href = canvasRef.current.toDataURL('image/png')
    a.click()
    push('QR code downloaded!', 'success')
  }

  const handleCopy = async () => {
    if (!upiUrl) return
    try {
      await navigator.clipboard.writeText(upiUrl)
      push('UPI link copied!', 'success')
    } catch {
      push('Could not copy — try manually', 'error')
    }
  }

  const handleReset = () => {
    setForm({ upiId: '', name: '', amount: '', note: '' })
    setErrors({})
    setUpiUrl(null)
    push('Form cleared', 'info')
  }

  const onEnter = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleGenerate() }

  return (
    <>
      <div className={`gradient-bg${dark ? '' : ' light'}`} />
      <div className="orb" style={{ width: 500, height: 500, top: -100, left: -100, background: 'radial-gradient(circle, rgba(124,58,237,0.14) 0%, transparent 70%)' }} />
      <div className="orb" style={{ width: 400, height: 400, bottom: -80, right: -80, background: 'radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 70%)', animationDelay: '-4s' }} />

      <div style={{ position: 'fixed', top: 0, right: 0, zIndex: 999 }}>
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}${t.exiting ? ' exiting' : ''}`}>
            {t.type === 'success' && <CheckIcon />}
            {t.type === 'error' && <AlertIcon />}
            {t.type === 'info' && <InfoIcon />}
            {t.message}
          </div>
        ))}
      </div>

      <div style={{ minHeight: '100vh', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        <header className="animate-fade-in" style={{ width: '100%', maxWidth: 900, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
              color: '#fff',
            }}>
              <QrIcon />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>UPI QR Generator</div>
              <div style={{ fontSize: '0.68rem', opacity: 0.4, fontWeight: 500 }}>Instant · Secure · Free</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="shimmer-badge" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <ShieldIcon /> Secure
            </div>
            <button
              onClick={() => setDark(d => !d)}
              className="btn-ghost"
              style={{ padding: '8px 12px' }}
              aria-label="Toggle theme"
            >
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </header>

        <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{
            fontSize: 'clamp(1.8rem, 5vw, 3rem)',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #7c3aed 0%, #818cf8 45%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.15,
            marginBottom: 10,
          }}>
            Generate UPI QR Codes
          </h1>
          <p style={{ opacity: 0.5, fontSize: '0.95rem', maxWidth: 420, margin: '0 auto', lineHeight: 1.6 }}>
            Accept payments instantly with a scannable QR code compatible with all UPI apps.
          </p>
        </div>

        <div style={{
          width: '100%',
          maxWidth: 900,
          display: 'grid',
          gridTemplateColumns: upiUrl ? '1fr 1fr' : '1fr',
          gap: 24,
          alignItems: 'start',
        }}>
          <div className="glass animate-slide-up" style={{ padding: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(59,130,246,0.25))',
                border: '1px solid rgba(124,58,237,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <RupeeIcon />
              </div>
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>Payment Details</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: 6, opacity: 0.65, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  UPI ID <span style={{ color: '#f87171' }}>*</span>
                </label>
                <input
                  className={`input-field${errors.upiId ? ' error' : ''}`}
                  type="text"
                  placeholder="yourname@bank"
                  value={form.upiId}
                  onChange={updateField('upiId')}
                  onKeyDown={onEnter}
                  autoComplete="off"
                  spellCheck={false}
                />
                {errors.upiId && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.73rem', color: '#f87171', marginTop: 4 }}>
                    <AlertIcon /> {errors.upiId}
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: 6, opacity: 0.65, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Payee Name
                </label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={form.name}
                  onChange={updateField('name')}
                  onKeyDown={onEnter}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: 6, opacity: 0.65, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Amount (₹)
                </label>
                <input
                  className={`input-field${errors.amount ? ' error' : ''}`}
                  type="number"
                  placeholder="Leave blank for any amount"
                  value={form.amount}
                  onChange={updateField('amount')}
                  onKeyDown={onEnter}
                  min="0"
                  step="0.01"
                />
                {errors.amount && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.73rem', color: '#f87171', marginTop: 4 }}>
                    <AlertIcon /> {errors.amount}
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: 6, opacity: 0.65, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Payment Note
                </label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="e.g. For invoice #INV-001"
                  value={form.note}
                  onChange={updateField('note')}
                  onKeyDown={onEnter}
                  maxLength={100}
                />
              </div>

              <button
                className="btn-primary"
                onClick={handleGenerate}
                disabled={generating}
                style={{ marginTop: 8, padding: '14px 20px', fontSize: '0.95rem', width: '100%' }}
              >
                <ZapIcon />
                {generating ? 'Generating...' : 'Generate QR Code'}
              </button>

              {upiUrl && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  <button className="btn-ghost" onClick={handleDownload}>
                    <DownloadIcon /> Download
                  </button>
                  <button className="btn-ghost" onClick={() => window.print()}>
                    <PrintIcon /> Print
                  </button>
                  <button className="btn-ghost" onClick={handleCopy}>
                    <CopyIcon /> Copy Link
                  </button>
                </div>
              )}

              {upiUrl && (
                <button className="btn-ghost" onClick={handleReset} style={{ color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}>
                  <ResetIcon /> Reset
                </button>
              )}
            </div>
          </div>

          {upiUrl && (
            <div className="glass animate-slide-up" style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', alignSelf: 'flex-start' }}>Your QR Code</div>

              <QrCanvas
                upiUrl={upiUrl}
                dark={dark}
                name={form.name}
                upiId={form.upiId}
                amount={form.amount}
                canvasRef={canvasRef}
              />

              <div style={{
                width: '100%',
                padding: '12px 14px',
                background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                borderRadius: 10,
                border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
              }}>
                <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, opacity: 0.35, marginBottom: 4 }}>
                  UPI Deep Link
                </div>
                <div style={{ fontSize: '0.7rem', fontFamily: 'monospace', opacity: 0.55, wordBreak: 'break-all', lineHeight: 1.6 }}>
                  {upiUrl}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.7rem', opacity: 0.35 }}>
                <ShieldIcon />
                <span>Secure · No data stored · NPCI compliant</span>
              </div>
            </div>
          )}
        </div>

        {!upiUrl && (
          <div className="animate-fade-in" style={{ width: '100%', maxWidth: 900, marginTop: 40, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {[
              { icon: '⚡', title: 'Instant', desc: 'QR generated in milliseconds, no server needed' },
              { icon: '📱', title: 'All UPI Apps', desc: 'GPay, PhonePe, Paytm, BHIM & more' },
              { icon: '🔒', title: 'Private', desc: 'Everything runs in your browser locally' },
              { icon: '🖨️', title: 'Print Ready', desc: 'High-res PNG download for any use case' },
            ].map(f => (
              <div key={f.title} className="glass" style={{ padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{f.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: '0.73rem', opacity: 0.4, lineHeight: 1.55 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 48, width: '100%', maxWidth: 900 }}>
          <div className="glass" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{
              width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '1rem', color: '#fff',
              boxShadow: '0 4px 14px rgba(124,58,237,0.3)',
            }}>
              M
            </div>

            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>Muzamil Ahmad Mir</span>
                <span style={{
                  fontSize: '0.62rem', padding: '2px 8px', borderRadius: 999,
                  background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(59,130,246,0.12))',
                  border: '1px solid rgba(124,58,237,0.2)',
                  color: dark ? '#a78bfa' : '#6d28d9',
                  fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
                }}>
                  Developer
                </span>
              </div>
              <div style={{ fontSize: '0.73rem', opacity: 0.45, marginTop: 2 }}>
                Full-Stack Developer · UI/UX · FinTech Tools
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <a
                href="https://github.com/muzamilmeerdev"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
                style={{ textDecoration: 'none', fontSize: '0.78rem', padding: '8px 14px' }}
              >
                <GithubIcon /> muzamilmeerdev
              </a>
              <a
                href="https://linkedin.com/in/muzamilahmadmir"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
                style={{
                  textDecoration: 'none', fontSize: '0.78rem', padding: '8px 14px',
                  color: dark ? '#60a5fa' : '#2563eb',
                  borderColor: dark ? 'rgba(59,130,246,0.3)' : 'rgba(37,99,235,0.2)',
                }}
              >
                <LinkedinIcon /> Muzamil Ahmad Mir
              </a>
            </div>
          </div>
        </div>

        <footer style={{ marginTop: 20, textAlign: 'center', opacity: 0.25, fontSize: '0.7rem', paddingBottom: 24 }}>
          Built by Muzamil Ahmad Mir · All processing is done locally in your browser
        </footer>
      </div>
    </>
  )
}
