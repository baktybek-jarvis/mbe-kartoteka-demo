import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Check, Lock, Star, X } from 'lucide-react'
import { STATUSES } from '../data.js'
import { useToast } from '../store.js'

// Спокойные тона из палитры бренда; цвет выбирается по id, чтобы не менялся между экранами.
const AVATAR_TONES = ['#998979', '#7c8a7a', '#8a7f95', '#b08a5b', '#6f8496', '#a07a72']

export function Avatar({ emp, size = 40 }) {
  const initials = `${emp.firstName[0]}${emp.lastName[0]}`
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, fontSize: size * 0.36, background: AVATAR_TONES[emp.id % AVATAR_TONES.length] }}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}

const STATUS_TONE = { active: 'ok', vacation: 'warn', dismissed: 'muted' }

export function StatusPill({ status }) {
  return (
    <span className={`pill pill-${STATUS_TONE[status]}`}>
      <span className="pill-dot" />
      {STATUSES[status]}
    </span>
  )
}

export function Pill({ tone = 'muted', children }) {
  return <span className={`pill pill-${tone}`}>{children}</span>
}

const SOURCES = {
  '1c': { label: '1С', title: 'Приходит из 1С' },
  hr: { label: 'HR', title: 'Заполняет HR' },
  form: { label: 'Анкета', title: 'Из личного листка, утверждено HR' },
  auto: { label: 'Авто', title: 'Считается автоматически' },
}

export function Source({ type }) {
  const s = SOURCES[type]
  return (
    <span className={`source source-${type}`} title={s.title}>
      {s.label}
    </span>
  )
}

export function Rating({ value, count }) {
  if (value == null) return <span className="muted">—</span>
  return (
    <span className="rating">
      <Star size={14} fill="currentColor" strokeWidth={0} />
      <b>{value.toFixed(1).replace('.', ',')}</b>
      {count != null && <span className="muted">· {count}</span>}
    </span>
  )
}

export function Stars({ value, size = 16 }) {
  return (
    <span className="stars" aria-label={`Оценка ${value} из 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} strokeWidth={0} fill="currentColor" className={n <= value ? 'on' : 'off'} />
      ))}
    </span>
  )
}

export function NoAccess({ text }) {
  return (
    <div className="empty-state">
      <Lock size={28} />
      <h2>Раздел недоступен</h2>
      <p>{text}</p>
      <Link className="btn btn-primary" to="/">
        На главную
      </Link>
    </div>
  )
}

// Боковая панель поверх страницы: детали записи без ухода со списка.
export function Drawer({ title, subtitle, onClose, children, footer }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <header className="drawer-head">
          <div>
            <h2>{title}</h2>
            {subtitle && <span className="muted">{subtitle}</span>}
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Закрыть">
            <X size={18} />
          </button>
        </header>
        <div className="drawer-body">{children}</div>
        {footer && <footer className="drawer-foot">{footer}</footer>}
      </aside>
    </div>
  )
}

export function Segmented({ value, onChange, options }) {
  return (
    <div className="segmented" role="tablist">
      {options.map((o) => (
        <button key={o.value} type="button" role="tab" aria-selected={value === o.value} className={value === o.value ? 'on' : ''} onClick={() => onChange(o.value)}>
          {o.label}
          {o.count != null && <span className="seg-count">{o.count}</span>}
        </button>
      ))}
    </div>
  )
}

export function PersonCell({ emp, note }) {
  return (
    <Link to={`/employee/${emp.id}`} className="person" onClick={(e) => e.stopPropagation()}>
      <Avatar emp={emp} />
      <span>
        <b>{emp.fullName}</b>
        <small>{note || `${emp.position} · ${emp.hotel || emp.company}`}</small>
      </span>
    </Link>
  )
}

// ───── поля форм ─────

export function TextField({ label, value, onChange, type = 'text', required, hint, ...rest }) {
  return (
    <label className="input">
      <span>
        {label}
        {required && <i aria-hidden="true"> *</i>}
      </span>
      <input type={type} value={value ?? ''} onChange={(e) => onChange(e.target.value)} required={required} {...rest} />
      {hint && <small>{hint}</small>}
    </label>
  )
}

export function AreaField({ label, value, onChange, rows = 3, required, ...rest }) {
  return (
    <label className="input">
      <span>
        {label}
        {required && <i aria-hidden="true"> *</i>}
      </span>
      <textarea rows={rows} value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...rest} />
    </label>
  )
}

// options — строки или пары { value, label }.
export function SelectField({ label, value, onChange, options, placeholder, required, disabled }) {
  return (
    <label className="input">
      <span>
        {label}
        {required && <i aria-hidden="true"> *</i>}
      </span>
      <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
        {placeholder != null && <option value="">{placeholder}</option>}
        {options.map((o) => {
          const opt = typeof o === 'string' ? { value: o, label: o } : o
          return (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          )
        })}
      </select>
    </label>
  )
}

export function Toast() {
  const t = useToast()
  if (!t) return null
  return (
    <div className="toast" role="status" key={t.id}>
      <Check size={16} />
      {t.text}
    </div>
  )
}
