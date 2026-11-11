import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Cake, ChevronDown, ChevronUp, ClipboardCheck, Palmtree, Plus, Search, Users, X } from 'lucide-react'
import { COMPANIES, DEMO_SCOPE, ROLES, STATUSES, daysToBirthday, pluralEmployees, tenure } from '../data.js'
import { useRole } from '../App.jsx'
import { useStore } from '../store.js'
import EmployeeForm from '../components/EmployeeForm.jsx'
import { Avatar, Rating, StatusPill } from '../components/ui.jsx'

const EMPTY = { company: '', hotel: '', dept: '', status: '' }

const COLUMNS = [
  { key: 'fullName', label: 'Сотрудник' },
  { key: 'dept', label: 'Подразделение' },
  { key: 'place', label: 'Компания / отель' },
  { key: 'status', label: 'Статус' },
  { key: 'hired', label: 'Стаж', num: true },
  { key: 'rating', label: 'Отзывы гостей', num: true },
]

function scopeFor(role, employees) {
  if (role === 'gm') return employees.filter((e) => e.hotel === DEMO_SCOPE.hotel)
  if (role === 'head') return employees.filter((e) => e.hotel === DEMO_SCOPE.hotel && e.dept === DEMO_SCOPE.dept)
  return employees
}

export default function Registry() {
  const { role } = useRole()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(EMPTY)
  const [archive, setArchive] = useState(false)
  const [sort, setSort] = useState({ key: 'fullName', dir: 1 })
  const [adding, setAdding] = useState(false)
  const store = useStore()

  const scope = useMemo(() => scopeFor(role, store.employees), [role, store.employees])

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = scope.filter((e) => {
      if (archive ? e.status !== 'dismissed' : e.status === 'dismissed') return false
      if (q && !e.fullName.toLowerCase().includes(q) && !e.position.toLowerCase().includes(q)) return false
      if (filters.company && e.company !== filters.company) return false
      if (filters.hotel && e.hotel !== filters.hotel) return false
      if (filters.dept && e.dept !== filters.dept) return false
      if (filters.status && e.status !== filters.status) return false
      return true
    })
    const value = (e) => {
      if (sort.key === 'place') return e.hotel || e.company
      if (sort.key === 'rating') return e.rating ?? -1
      return e[sort.key]
    }
    return [...list].sort((a, b) => {
      const va = value(a)
      const vb = value(b)
      if (typeof va === 'number') return (va - vb) * sort.dir
      // Стаж: более ранняя дата приёма = больший стаж.
      return String(va).localeCompare(String(vb), 'ru') * (sort.key === 'hired' ? -sort.dir : sort.dir)
    })
  }, [scope, query, filters, archive, sort])

  if (role === 'self') {
    return (
      <div className="empty-state">
        <Users size={28} />
        <h2>Реестр недоступен</h2>
        <p>Обычный сотрудник видит только собственную карточку и свои формы.</p>
        <Link className="btn btn-primary" to={`/employee/${DEMO_SCOPE.selfId}`}>
          Открыть мою карточку
        </Link>
      </div>
    )
  }

  const current = scope.filter((e) => e.status !== 'dismissed')
  const stats = [
    { icon: Users, label: 'В реестре', value: current.length, hint: 'без архива' },
    { icon: Palmtree, label: 'В отпуске', value: current.filter((e) => e.status === 'vacation').length, hint: 'сейчас' },
    { icon: Cake, label: 'Дни рождения', value: current.filter((e) => daysToBirthday(e.birth) <= 7).length, hint: 'в ближайшие 7 дней' },
    { icon: ClipboardCheck, label: 'Анкеты на проверке', value: role === 'hr' ? Object.values(store.forms).filter((f) => f.status === 'review').length : '—', hint: role === 'hr' ? 'ждут HR' : 'видит только HR' },
  ]

  const depts = [...new Set(scope.filter((e) => !filters.hotel || e.hotel === filters.hotel).map((e) => e.dept))].sort((a, b) => a.localeCompare(b, 'ru'))
  const activeFilters = Object.entries(filters).filter(([, v]) => v)
  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }))
  const reset = () => {
    setFilters(EMPTY)
    setQuery('')
  }
  const toggleSort = (key) => setSort((s) => (s.key === key ? { key, dir: -s.dir } : { key, dir: 1 }))

  const scopeNote =
    role === 'gm' ? `Вы видите сотрудников своего отеля: ${DEMO_SCOPE.hotel}` :
    role === 'head' ? `Вы видите подчинённое подразделение: ${DEMO_SCOPE.dept}, ${DEMO_SCOPE.hotel}` : null

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Сотрудники</h1>
          <p className="muted">
            {role === 'hr' ? 'Единый реестр холдинга: отели, центральный офис и другие направления' : scopeNote}
          </p>
        </div>
        {role === 'hr' && (
          <button className="btn btn-primary" type="button" onClick={() => setAdding(true)}>
            <Plus size={16} />
            Добавить сотрудника
          </button>
        )}
      </div>

      <div className="stats">
        {stats.map(({ icon: Icon, label, value, hint }) => (
          <div className="stat" key={label}>
            <span className="stat-icon">
              <Icon size={18} />
            </span>
            <div>
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
              <div className="stat-hint">{hint}</div>
            </div>
          </div>
        ))}
      </div>

      <section className="card">
        <div className="toolbar">
          <label className="search">
            <Search size={16} />
            <input
              type="search"
              placeholder="Поиск по ФИО или должности"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          {role === 'hr' && (
            <>
              <Select label="Компания" value={filters.company} onChange={(v) => setFilter('company', v)} options={COMPANIES} />
              <Select label="Отель" value={filters.hotel} onChange={(v) => setFilter('hotel', v)} options={store.hotels.map((h) => h.name)} />
            </>
          )}
          {role !== 'head' && <Select label="Подразделение" value={filters.dept} onChange={(v) => setFilter('dept', v)} options={depts} />}
          {!archive && (
            <Select
              label="Статус"
              value={filters.status}
              onChange={(v) => setFilter('status', v)}
              options={['active', 'vacation']}
              labels={STATUSES}
            />
          )}
          <div className="segmented" role="tablist">
            <button type="button" className={!archive ? 'on' : ''} onClick={() => { setArchive(false); setFilter('status', '') }}>
              Работают
            </button>
            <button type="button" className={archive ? 'on' : ''} onClick={() => { setArchive(true); setFilter('status', '') }}>
              Архив
            </button>
          </div>
        </div>

        <div className="result-bar">
          <span>
            <b>{rows.length}</b> {pluralEmployees(rows.length)}
          </span>
          {activeFilters.map(([key, value]) => (
            <button key={key} type="button" className="chip" onClick={() => setFilter(key, '')}>
              {key === 'status' ? STATUSES[value] : value}
              <X size={12} />
            </button>
          ))}
          {(activeFilters.length > 0 || query) && (
            <button type="button" className="link" onClick={reset}>
              Сбросить всё
            </button>
          )}
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                {COLUMNS.map((c) => (
                  <th key={c.key} className={c.num ? 'num' : ''} aria-sort={sort.key === c.key ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}>
                    <button type="button" onClick={() => toggleSort(c.key)}>
                      {c.label}
                      {sort.key === c.key && (sort.dir === 1 ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id} onClick={() => navigate(`/employee/${e.id}`)}>
                  <td>
                    <Link to={`/employee/${e.id}`} className="person" onClick={(ev) => ev.stopPropagation()}>
                      <Avatar emp={e} />
                      <span>
                        <b>{e.fullName}</b>
                        <small>
                          {e.position}
                          {!e.b24 && <em title="Нет учётной записи Битрикс24 — входит по логину и паролю"> · внешний доступ</em>}
                        </small>
                      </span>
                    </Link>
                  </td>
                  <td>{e.dept}</td>
                  <td>
                    {e.hotel || e.company}
                    {e.hotel && <small className="block muted">{e.company}</small>}
                  </td>
                  <td>
                    <StatusPill status={e.status} />
                  </td>
                  <td className="num">{tenure(e.hired)}</td>
                  <td className="num">
                    <Rating value={e.rating} count={e.rating != null ? e.reviews : null} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="table-empty">
              <p>Никого не нашли по этим условиям.</p>
              <button type="button" className="btn" onClick={reset}>
                Сбросить фильтры
              </button>
            </div>
          )}
        </div>
      </section>

      {adding && <EmployeeForm onClose={() => setAdding(false)} onSaved={(id) => navigate(`/employee/${id}`)} />}

      <p className="foot-note">Роль в демо: {ROLES[role]}. Переключите её вверху справа, чтобы увидеть разграничение доступа.</p>
    </>
  )
}

function Select({ label, value, onChange, options, labels }) {
  return (
    <label className={`select${value ? ' has-value' : ''}`}>
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{label}: все</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {labels ? labels[o] : o}
          </option>
        ))}
      </select>
    </label>
  )
}
