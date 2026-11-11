import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BellRing, ExternalLink, Plus, Search, Settings2 } from 'lucide-react'
import { COMPANIES, DEMO_SCOPE, formatDate, getEmployee, pluralEmployees } from '../data.js'
import { useRole } from '../App.jsx'
import { actions, hotelStaff, useStore } from '../store.js'
import { Avatar, AreaField, Drawer, NoAccess, Pill, Segmented, SelectField, Stars, TextField } from '../components/ui.jsx'

const BANDS = {
  low: (r) => r <= 2,
  mid: (r) => r === 3,
  high: (r) => r >= 4,
}

function inScope(role, emp) {
  if (role === 'gm') return emp.hotel === DEMO_SCOPE.hotel
  if (role === 'head') return emp.hotel === DEMO_SCOPE.hotel && emp.dept === DEMO_SCOPE.dept
  return true
}

export default function Reviews() {
  const { role } = useRole()
  const s = useStore()
  const [tab, setTab] = useState('list')
  const [hotel, setHotel] = useState('')
  const [band, setBand] = useState('all')
  const [query, setQuery] = useState('')
  const [configSlug, setConfigSlug] = useState(null)
  const [adding, setAdding] = useState(false)

  if (role === 'self') return <NoAccess text="Отзывы гостей видят HR и руководители в пределах своих прав." />

  const scoped = s.reviews
    .map((r) => ({ ...r, emp: getEmployee(r.empId, s.employees) }))
    .filter((r) => r.emp && inScope(role, r.emp))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
  const q = query.trim().toLowerCase()
  const rows = scoped.filter(
    (r) => (!hotel || r.emp.hotel === hotel) && (band === 'all' || BANDS[band](r.rating)) && (!q || r.emp.fullName.toLowerCase().includes(q)),
  )
  const avg = scoped.length ? (scoped.reduce((sum, r) => sum + r.rating, 0) / scoped.length).toFixed(1).replace('.', ',') : '—'
  const low = scoped.filter((r) => r.rating <= 2).length

  const forms = s.reviewForms.map((f) => ({ ...f, hotel: s.hotels.find((h) => h.slug === f.slug) })).filter((f) => f.hotel)

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Отзывы гостей</h1>
          <p className="muted">Гость выбирает сотрудника на планшете в отеле и ставит оценку от 1 до 5. Отзыв сразу попадает в карточку</p>
        </div>
        {role === 'hr' && (
          <Segmented
            value={tab}
            onChange={setTab}
            options={[
              { value: 'list', label: 'Отзывы' },
              { value: 'forms', label: 'Формы отелей', count: forms.length },
            ]}
          />
        )}
      </div>

      {tab === 'list' || role !== 'hr' ? (
        <>
          <div className="stats stats-3">
            <div className="stat">
              <div>
                <div className="stat-value gold">{avg}</div>
                <div className="stat-label">Средняя оценка</div>
                <div className="stat-hint">по отзывам в списке</div>
              </div>
            </div>
            <div className="stat">
              <div>
                <div className="stat-value">{scoped.length}</div>
                <div className="stat-label">Отзывов</div>
                <div className="stat-hint">с 27 октября</div>
              </div>
            </div>
            <div className="stat">
              <div>
                <div className={`stat-value${low ? ' bad' : ''}`}>{low}</div>
                <div className="stat-label">Оценки 1–2</div>
                <div className="stat-hint">руководители уведомлены в Битрикс24</div>
              </div>
            </div>
          </div>

          <section className="card">
            <div className="toolbar">
              <label className="search">
                <Search size={16} />
                <input type="search" placeholder="Поиск по сотруднику" value={query} onChange={(e) => setQuery(e.target.value)} />
              </label>
              {role === 'hr' && (
                <label className={`select${hotel ? ' has-value' : ''}`}>
                  <span className="sr-only">Отель</span>
                  <select value={hotel} onChange={(e) => setHotel(e.target.value)}>
                    <option value="">Отель: все</option>
                    {s.hotels.map((h) => (
                      <option key={h.slug}>{h.name}</option>
                    ))}
                  </select>
                </label>
              )}
              <Segmented
                value={band}
                onChange={setBand}
                options={[
                  { value: 'all', label: 'Все оценки' },
                  { value: 'low', label: '1–2' },
                  { value: 'mid', label: '3' },
                  { value: 'high', label: '4–5' },
                ]}
              />
            </div>
            <ul className="review-feed">
              {rows.map((r) => (
                <li key={r.id} className={r.rating <= 2 ? 'low' : ''}>
                  <Link to={`/employee/${r.emp.id}?tab=reviews`} className="person">
                    <Avatar emp={r.emp} />
                    <span>
                      <b>{r.emp.shortName}</b>
                      <small>
                        {r.emp.position} · {r.emp.hotel}
                      </small>
                    </span>
                  </Link>
                  <div className="review-body">
                    <div className="review-meta">
                      <Stars value={r.rating} />
                      <time>{formatDate(r.date)}</time>
                      {r.rating <= 2 && (
                        <span className="notified">
                          <BellRing size={13} />
                          Руководитель уведомлён
                        </span>
                      )}
                    </div>
                    <p className={r.text ? '' : 'muted'}>{r.text || 'Без комментария'}</p>
                  </div>
                </li>
              ))}
            </ul>
            {rows.length === 0 && <div className="table-empty"><p>Отзывов по этим условиям нет.</p></div>}
          </section>
        </>
      ) : (
        <div className="form-cards">
          {forms.map((f) => {
            const total = hotelStaff(s, f.hotel.name).length
            return (
              <section key={f.slug} className="card pad">
                <div className="doc-head">
                  <div>
                    <h2>{f.hotel.name}</h2>
                    <span className="muted">{f.title}</span>
                  </div>
                  <Pill tone={f.active ? 'ok' : 'muted'}>{f.active ? 'Активна' : 'Отключена'}</Pill>
                </div>
                <dl className="fields">
                  <div className="field">
                    <dt>Приветствие</dt>
                    <dd>{f.greeting}</dd>
                  </div>
                  <div className="field">
                    <dt>Оцениваемые</dt>
                    <dd>
                      {f.staffIds.length} из {total} {pluralEmployees(total)} отеля
                    </dd>
                  </div>
                  <div className="field">
                    <dt>Ссылка для планшета</dt>
                    <dd className="mono">/review/{f.slug}</dd>
                  </div>
                </dl>
                <label className="switch">
                  <input type="checkbox" checked={f.active} onChange={() => actions.toggleReviewForm(f.slug)} />
                  <span />
                  Принимает отзывы
                </label>
                <div className="row-actions">
                  <button type="button" className="btn" onClick={() => setConfigSlug(f.slug)}>
                    <Settings2 size={15} />
                    Настроить
                  </button>
                  <Link to={`/review/${f.slug}`} className="btn">
                    <ExternalLink size={15} />
                    Открыть форму
                  </Link>
                </div>
              </section>
            )
          })}
          <button type="button" className="card add-card" onClick={() => setAdding(true)}>
            <Plus size={20} />
            Добавить отель и форму
            <small>Новые отели добавляются здесь, без доработки приложения</small>
          </button>
        </div>
      )}

      {configSlug && <FormConfig form={forms.find((f) => f.slug === configSlug)} staff={hotelStaff(s, forms.find((f) => f.slug === configSlug).hotel.name)} onClose={() => setConfigSlug(null)} />}
      {adding && <AddHotel onClose={() => setAdding(false)} existing={s.hotels.map((h) => h.name.toLowerCase())} />}
    </>
  )
}

function FormConfig({ form, staff, onClose }) {
  const [title, setTitle] = useState(form.title)
  const [greeting, setGreeting] = useState(form.greeting)
  const [ids, setIds] = useState(form.staffIds)
  const toggle = (id) => setIds((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]))
  const save = () => {
    actions.saveReviewForm(form.slug, { title: title.trim() || form.title, greeting: greeting.trim() || form.greeting, staffIds: ids })
    onClose()
  }
  return (
    <Drawer
      title="Форма отзывов"
      subtitle={form.hotel.name}
      onClose={onClose}
      footer={
        <button type="button" className="btn btn-primary" onClick={save}>
          Сохранить
        </button>
      }
    >
      <div className="form">
        <TextField label="Название" value={title} onChange={setTitle} />
        <AreaField label="Приветственный текст" rows={2} value={greeting} onChange={setGreeting} />
        <div className="input">
          <span>Оцениваемые сотрудники · выбрано {ids.length}</span>
          {staff.length === 0 && <p className="muted">В этом отеле пока нет сотрудников. Добавьте их в реестре.</p>}
          <ul className="check-list">
            {staff.map((e) => (
              <li key={e.id}>
                <label>
                  <input type="checkbox" checked={ids.includes(e.id)} onChange={() => toggle(e.id)} />
                  <Avatar emp={e} size={30} />
                  <span>
                    <b>{e.shortName}</b>
                    <small>
                      {e.position} · {e.dept}
                    </small>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Drawer>
  )
}

function AddHotel({ onClose, existing }) {
  const [name, setName] = useState('')
  const [company, setCompany] = useState(COMPANIES[0])
  const taken = existing.includes(name.trim().toLowerCase())
  const save = (e) => {
    e.preventDefault()
    if (!name.trim() || taken) return
    actions.addHotel(name.trim(), company)
    onClose()
  }
  return (
    <Drawer
      title="Новый отель"
      subtitle="Отель появится в справочнике, структуре и получит свою форму отзывов"
      onClose={onClose}
      footer={
        <button type="submit" form="hotel-form" className="btn btn-primary" disabled={!name.trim() || taken}>
          Добавить
        </button>
      }
    >
      <form id="hotel-form" className="form" onSubmit={save}>
        <TextField label="Название отеля" value={name} onChange={setName} required autoFocus hint={taken ? 'Отель с таким названием уже есть' : undefined} />
        <SelectField label="Компания" value={company} onChange={setCompany} options={COMPANIES.slice(0, 2)} />
      </form>
    </Drawer>
  )
}
