import { useState } from 'react'
import { Link, useOutletContext, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft, Cake, CalendarDays, Check, ChevronRight, ClipboardList, ExternalLink, KeyRound, Lock, Pencil, Phone, Plus, Send, Star,
} from 'lucide-react'
import {
  CHAR_STATUS, DEMO_SCOPE, FORM_STATUS, daysToBirthday, formatDate, getDetails, getEmployee, getManagers,
  pluralDays, pluralReviews, shortDate, tenure,
} from '../data.js'
import { useRole } from '../App.jsx'
import { actions, formOf, useStore } from '../store.js'
import { AreaField, Avatar, Pill, Source, Stars, StatusPill } from '../components/ui.jsx'
import EmployeeForm from '../components/EmployeeForm.jsx'
import CharForm from '../components/CharForm.jsx'

function canOpen(role, emp) {
  if (role === 'hr') return true
  if (role === 'gm') return emp.hotel === DEMO_SCOPE.hotel
  if (role === 'head') return emp.hotel === DEMO_SCOPE.hotel && emp.dept === DEMO_SCOPE.dept
  return emp.id === DEMO_SCOPE.selfId
}

const EMPTY_ANSWERS = { education: [], languages: [], prevWork: [], family: null, hobbies: null }

export default function EmployeeCard() {
  const { id } = useParams()
  const { role } = useRole()
  const { backTo, backLabel } = useOutletContext()
  const [params] = useSearchParams()
  const [tab, setTab] = useState(params.get('tab') || 'main')
  const [editing, setEditing] = useState(false)
  const s = useStore()
  const emp = getEmployee(id, s.employees)

  if (!emp) {
    return (
      <div className="empty-state">
        <h2>Сотрудник не найден</h2>
        <Link className="btn" to="/">К реестру</Link>
      </div>
    )
  }

  if (!canOpen(role, emp)) {
    return (
      <div className="empty-state">
        <Lock size={28} />
        <h2>Нет доступа к карточке</h2>
        <p>Права проверяются при каждом открытии, в том числе по прямой ссылке.</p>
        <Link className="btn btn-primary" to={role === 'self' ? `/employee/${DEMO_SCOPE.selfId}` : '/'}>
          {role === 'self' ? 'Открыть мою карточку' : 'К реестру'}
        </Link>
      </div>
    )
  }

  const base = getDetails(emp)
  const form = formOf(s, emp.id)
  const managers = getManagers(emp, s.employees)
  const bdays = daysToBirthday(emp.birth)

  // Сведения из анкеты попадают в карточку только после утверждения HR.
  const answers = form.status === 'approved' && form.answers ? form.answers : EMPTY_ANSWERS
  const career = [...(s.career[emp.id] || []), ...base.career]
  // Сотрудник видит характеристику только после согласования.
  const chars = s.chars
    .filter((c) => c.empId === emp.id && (role !== 'self' || c.status === 'approved'))
    .sort((a, b) => b.version - a.version)
  const stored = s.reviews.filter((r) => r.empId === emp.id)
  const reviews = [...stored, ...base.reviewList.filter((r) => !stored.some((x) => x.date === r.date))].sort((a, b) => b.date.localeCompare(a.date))

  const tabs = [
    { id: 'main', label: 'Основное' },
    { id: 'personal', label: 'Личные сведения' },
    { id: 'career', label: 'Карьера', count: career.length },
    { id: 'char', label: 'Характеристика', count: chars.length || null },
    role !== 'self' && { id: 'dev', label: 'Развитие и резерв' },
    emp.hotel && { id: 'reviews', label: 'Отзывы гостей', count: emp.reviews || null },
  ].filter(Boolean)
  const active = tabs.some((t) => t.id === tab) ? tab : 'main'

  return (
    <>
      {role !== 'self' && (
        <Link to={backTo} className="back">
          <ArrowLeft size={16} />
          {backLabel}
        </Link>
      )}

      <section className="card profile">
        <div className="profile-top">
          <Avatar emp={emp} size={88} />
          <div className="profile-id">
            <h1>{emp.fullName}</h1>
            <p>
              {emp.position} · {emp.dept}
            </p>
            <div className="profile-tags">
              <StatusPill status={emp.status} />
              <span className="tag">{emp.hotel || emp.company}</span>
              <span className="tag">{emp.form === 'ИП' ? 'Оформление: ИП' : 'В штате'}</span>
              {!emp.b24 && (
                <span className="tag">
                  <KeyRound size={12} /> {s.access.some((a) => a.id === emp.id) ? 'Внешний доступ' : 'Доступ не выдан'}
                </span>
              )}
            </div>
          </div>
          {role === 'hr' && (
            <div className="profile-actions">
              {form.status !== 'approved' && form.status !== 'review' && (
                <button type="button" className="btn" onClick={() => { actions.issueLink(emp.id); setTab('personal') }}>
                  <Send size={15} />
                  {form.status === 'none' ? 'Выдать ссылку на анкету' : 'Выдать ссылку заново'}
                </button>
              )}
              <button type="button" className="btn btn-primary" onClick={() => setEditing(true)}>
                <Pencil size={15} />
                Редактировать
              </button>
            </div>
          )}
        </div>

        {bdays <= 2 && emp.status !== 'dismissed' && (
          <div className="banner">
            <Cake size={18} />
            <span>
              <b>{bdays === 0 ? 'Сегодня день рождения.' : `День рождения через ${bdays} ${pluralDays(bdays)} — ${formatDate(emp.birth, false)}.`}</b>{' '}
              Руководитель и генеральный менеджер уже получили уведомление в Битрикс24.
            </span>
          </div>
        )}

        <div className="facts">
          <Fact icon={CalendarDays} label="Стаж в холдинге" value={tenure(emp.hired)} hint={`с ${formatDate(emp.hired)}`} />
          <Fact icon={CalendarDays} label="Остаток отпуска" value={`${base.vacationLeft} ${pluralDays(base.vacationLeft)}`} hint={base.vacationNext} />
          <Fact icon={Phone} label="Телефон" value={emp.phone || '—'} hint="мобильный" />
          {emp.hotel && (
            <Fact
              icon={Star}
              label="Рейтинг гостей"
              value={emp.rating != null ? emp.rating.toFixed(1).replace('.', ',') : 'Нет оценок'}
              hint={emp.rating != null ? `${emp.reviews} ${pluralReviews(emp.reviews)} за всё время` : 'отзывов пока нет'}
              accent={emp.rating != null}
            />
          )}
        </div>

        <div className="tabs" role="tablist">
          {tabs.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={active === t.id} className={active === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>
              {t.label}
              {t.count ? <span className="tab-count">{t.count}</span> : null}
            </button>
          ))}
        </div>
      </section>

      {active === 'main' && <MainTab emp={emp} d={base} managers={managers} role={role} />}
      {active === 'personal' && <PersonalTab emp={emp} form={form} answers={answers} role={role} />}
      {active === 'career' && <CareerTab career={career} />}
      {active === 'char' && <CharTab key={emp.id} emp={emp} chars={chars} role={role} />}
      {active === 'dev' && <DevTab key={emp.id} emp={emp} dev={s.dev[emp.id]} role={role} />}
      {active === 'reviews' && <ReviewsTab emp={emp} reviews={reviews} />}

      {editing && <EmployeeForm emp={emp} onClose={() => setEditing(false)} />}
    </>
  )
}

function Fact({ icon: Icon, label, value, hint, accent }) {
  return (
    <div className={`fact${accent ? ' fact-accent' : ''}`}>
      <span className="fact-label">
        <Icon size={14} />
        {label}
      </span>
      <span className="fact-value">{value}</span>
      <span className="fact-hint">{hint}</span>
    </div>
  )
}

function Field({ label, source, children }) {
  return (
    <div className="field">
      <dt>
        {label}
        {source && <Source type={source} />}
      </dt>
      <dd>{children || <span className="muted">Не указано</span>}</dd>
    </div>
  )
}

function MainTab({ emp, d, managers, role }) {
  return (
    <div className="grid-2">
      <section className="card pad">
        <h2>Работа</h2>
        <dl className="fields">
          <Field label="Компания" source="1c">{emp.company}</Field>
          {emp.hotel && <Field label="Отель" source="1c">{emp.hotel}</Field>}
          <Field label="Подразделение" source="hr">{emp.dept}</Field>
          <Field label="Должность" source="1c">{emp.position}</Field>
          <Field label="Руководители" source="hr">
            {managers.length > 0 && (
              <span className="people">
                {managers.map((m) => (
                  <Link key={m.id} to={`/employee/${m.id}`} className="person-mini">
                    <Avatar emp={m} size={24} />
                    {m.shortName}
                  </Link>
                ))}
              </span>
            )}
          </Field>
          <Field label="Форма оформления" source="1c">{emp.form}</Field>
        </dl>
      </section>

      <section className="card pad">
        <h2>Кадровые данные</h2>
        <dl className="fields">
          <Field label="Дата рождения" source="1c">
            {role === 'hr' || role === 'self' ? formatDate(emp.birth) : formatDate(emp.birth, false)}
          </Field>
          <Field label="Дата приёма" source="1c">{formatDate(emp.hired)}</Field>
          <Field label="Ближайший отпуск" source="1c">{d.vacationNext}</Field>
          <Field label="Остаток отпуска" source="1c">{`${d.vacationLeft} ${pluralDays(d.vacationLeft)}`}</Field>
          <Field label="Телефон" source="1c">{emp.phone}</Field>
          {role === 'hr' && <Field label="ID в 1С" source="auto">{emp.oneCId}</Field>}
        </dl>
        <p className="sync-note">Синхронизация с 1С: 10.11.2026, 06:00</p>
      </section>
    </div>
  )
}

function RecordList({ items }) {
  if (!items.length) return <span className="muted">Не указано</span>
  return (
    <ul className="records">
      {items.map((it) => (
        <li key={it.title}>
          <b>{it.title}</b>
          <span>{it.note}</span>
        </li>
      ))}
    </ul>
  )
}

const FORM_TEXT = {
  none: 'Ссылка на анкету ещё не выдана. Сведения появятся в карточке после заполнения и утверждения HR.',
  waiting: 'Ссылка выдана, сотрудник ещё не заполнил анкету.',
  review: 'Сотрудник отправил анкету. Сведения появятся в карточке после утверждения HR.',
  fix: 'HR вернул анкету сотруднику на исправление.',
  approved: 'Сотрудник заполнил анкету по ссылке, HR проверил и утвердил. В карточку выведены пять групп сведений.',
}

function PersonalTab({ emp, form, answers, role }) {
  const status = FORM_STATUS[form.status]
  const canFill = form.status === 'fix' || (form.status === 'waiting' && form.hoursLeft > 0)
  return (
    <>
      <section className="card pad form-status">
        <span className="form-icon">
          <ClipboardList size={20} />
        </span>
        <div>
          <b>Электронный личный листок</b>
          <p className="muted">
            {FORM_TEXT[form.status]}
            {form.status === 'waiting' && (form.hoursLeft > 0 ? ` Ссылка действует ещё ${form.hoursLeft} ч.` : ' Срок действия ссылки истёк.')}
          </p>
        </div>
        <Pill tone={status.tone}>{status.label}</Pill>
        {/* Сам сотрудник заполняет анкету по ссылке; HR в демо может открыть её, чтобы показать сценарий. */}
        {canFill && (role === 'self' || role === 'hr') && (
          <Link to={`/form/${emp.id}`} className="btn btn-primary">
            <ExternalLink size={15} />
            {role === 'self' ? 'Заполнить анкету' : 'Открыть анкету как сотрудник'}
          </Link>
        )}
        {role === 'hr' && (form.status === 'review' || form.status === 'approved') && (
          <Link to="/forms" className="btn">
            {form.status === 'review' ? 'Перейти к проверке' : 'Открыть в личных листках'}
            <ChevronRight size={15} />
          </Link>
        )}
        {role !== 'hr' && role !== 'self' && (
          <span className="locked">
            <Lock size={13} /> Полный листок видит только HR
          </span>
        )}
      </section>

      <div className="grid-2">
        <section className="card pad">
          <h2>Образование <Source type="form" /></h2>
          <RecordList items={answers.education} />
        </section>
        <section className="card pad">
          <h2>Иностранные языки <Source type="form" /></h2>
          <RecordList items={answers.languages} />
        </section>
        <section className="card pad">
          <h2>Предыдущие места работы <Source type="form" /></h2>
          <RecordList items={answers.prevWork} />
        </section>
        <section className="card pad">
          <h2>О себе <Source type="form" /></h2>
          <dl className="fields">
            <Field label="Семейное положение">{answers.family}</Field>
            <Field label="Увлечения">{answers.hobbies}</Field>
          </dl>
        </section>
      </div>
    </>
  )
}

function CareerTab({ career }) {
  return (
    <section className="card pad">
      <h2>Карьера и профессиональный рост</h2>
      <ol className="timeline">
        {career.map((c, i) => (
          <li key={`${c.date}-${c.type}-${i}`} className={i === 0 ? 'current' : ''}>
            <time>{shortDate(c.date)}</time>
            <div>
              <div className="timeline-head">
                <b>{c.position}</b>
                <Pill tone={c.type === 'Приём' || c.type === 'Увольнение' ? 'muted' : 'gold'}>{c.type}</Pill>
              </div>
              <span className="muted">{c.dept}</span>
              {c.note && <p>{c.note}</p>}
            </div>
          </li>
        ))}
      </ol>
      <p className="sync-note">Дата, тип события, должность и подразделение приходят из 1С. Описание изменений добавляет HR.</p>
    </section>
  )
}

function CharTab({ emp, chars, role }) {
  const [selectedId, setSelectedId] = useState(null)
  // null — форма закрыта, 'new' — новая версия, иначе — редактируемый черновик.
  const [formFor, setFormFor] = useState(null)

  // Руководитель пишет характеристики подчинённым, но не себе.
  const canWrite = role === 'head' && emp.id !== DEMO_SCOPE.headId && emp.status !== 'dismissed'
  const hasOpen = chars.some((c) => c.status !== 'approved')
  const c = chars.find((x) => x.id === selectedId) || chars[0]

  const form = formFor && <CharForm emp={emp} draft={formFor === 'new' ? null : formFor} onClose={() => setFormFor(null)} />

  if (!c) {
    return (
      <section className="card pad empty-inline">
        <p>Характеристика ещё не составлена.</p>
        {canWrite ? (
          <button type="button" className="btn btn-primary" onClick={() => setFormFor('new')}>
            <Plus size={15} />
            Составить характеристику
          </button>
        ) : (
          <span className="muted">Её готовит руководитель службы, утверждает генеральный менеджер.</span>
        )}
        {form}
      </section>
    )
  }

  return (
    <div className="grid-side">
      <section className="card pad doc">
        <div className="doc-head">
          <div>
            <h2>Характеристика · версия {c.version}</h2>
            <span className="muted">
              {emp.fullName} · {emp.position} · стаж {tenure(emp.hired)}
            </span>
          </div>
          <Pill tone={CHAR_STATUS[c.status].tone}>{CHAR_STATUS[c.status].label}</Pill>
        </div>
        <DocBlock title="Сильные стороны" text={c.strengths} />
        <DocBlock title="Достижения" text={c.achievements} />
        <DocBlock title="Что развивать" text={c.improve} />
        <DocBlock title="Готовность к росту" text={c.readiness} />
        <div className="doc-foot">
          <span>
            Составил(а): <b>{c.author}</b>, {shortDate(c.date)}
          </span>
          {c.approvedBy && (
            <span>
              Утвердил ГМ: <b>{c.approvedBy}</b>, {shortDate(c.approvedAt)}
            </span>
          )}
        </div>
        {role === 'gm' && c.status === 'pending' && (
          <button type="button" className="btn btn-primary self-start" onClick={() => actions.approveChar(c.id)}>
            <Check size={16} />
            Утвердить характеристику
          </button>
        )}
        {canWrite && c.status === 'draft' && (
          <button type="button" className="btn btn-primary self-start" onClick={() => setFormFor(c)}>
            <Pencil size={15} />
            Продолжить черновик
          </button>
        )}
      </section>

      <aside className="card pad">
        <h2>История версий</h2>
        <ul className="versions">
          {chars.map((v) => (
            <li key={v.id}>
              <button type="button" className={v.id === c.id ? 'on' : ''} onClick={() => setSelectedId(v.id)}>
                <b>Версия {v.version}</b>
                <span>
                  {CHAR_STATUS[v.status].label} · {shortDate(v.approvedAt || v.date)} · {v.author}
                </span>
              </button>
            </li>
          ))}
        </ul>
        {canWrite && (
          <button type="button" className="btn btn-block" disabled={hasOpen} onClick={() => setFormFor('new')}>
            <Plus size={15} />
            Новая версия
          </button>
        )}
        <p className="sync-note">
          {canWrite && hasOpen ? 'Новую версию можно начать после утверждения текущей. ' : ''}
          Прежние версии не удаляются и не изменяются.
        </p>
      </aside>
      {form}
    </div>
  )
}

function DocBlock({ title, text }) {
  return (
    <div className="doc-block">
      <h3>{title}</h3>
      <p className={text ? '' : 'muted'}>{text || 'Не заполнено'}</p>
    </div>
  )
}

function DevTab({ emp, dev, role }) {
  const [draft, setDraft] = useState(null)
  const editing = draft !== null
  const save = () => {
    actions.saveDev(emp.id, draft.trim())
    setDraft(null)
  }
  return (
    <section className="card pad">
      <div className="doc-head">
        <h2>Развитие и кадровый резерв <Source type="hr" /></h2>
        {role === 'hr' && !editing && (
          <button type="button" className="btn" onClick={() => setDraft(dev?.text || '')}>
            <Pencil size={15} />
            {dev ? 'Изменить' : 'Заполнить'}
          </button>
        )}
      </div>
      {editing ? (
        <>
          <AreaField label="Развитие и резерв" rows={5} value={draft} onChange={setDraft} autoFocus />
          <div className="row-actions end">
            <button type="button" className="btn" onClick={() => setDraft(null)}>
              Отмена
            </button>
            <button type="button" className="btn btn-primary" onClick={save} disabled={!draft.trim()}>
              Сохранить
            </button>
          </div>
        </>
      ) : dev ? (
        <>
          <p className="lead">{dev.text}</p>
          <p className="sync-note">
            Изменено: {shortDate(dev.date)} · {dev.author}
          </p>
        </>
      ) : (
        <p className="muted">HR пока не добавил сведения.</p>
      )}
    </section>
  )
}

function ReviewsTab({ emp, reviews }) {
  if (emp.rating == null) {
    return (
      <section className="card pad empty-inline">
        <p>Нет оценок.</p>
        <span className="muted">Отзывы появятся, когда сотрудника добавят в форму отзывов отеля.</span>
      </section>
    )
  }
  const fmt = (n) => n.toFixed(1).replace('.', ',')
  const month = reviews.filter((r) => r.date.startsWith('2026-11'))
  const monthAvg = month.length ? month.reduce((sum, r) => sum + r.rating, 0) / month.length : null
  return (
    <>
      <div className="stats stats-3">
        <div className="stat">
          <div>
            <div className="stat-value gold">{fmt(emp.rating)}</div>
            <div className="stat-label">Общий рейтинг</div>
            <div className="stat-hint">средняя оценка за всё время</div>
          </div>
        </div>
        <div className="stat">
          <div>
            <div className="stat-value">{monthAvg != null ? fmt(monthAvg) : 'Нет оценок'}</div>
            <div className="stat-label">Рейтинг ноября</div>
            <div className="stat-hint">
              {month.length} {pluralReviews(month.length)} за месяц
            </div>
          </div>
        </div>
        <div className="stat">
          <div>
            <div className="stat-value">{emp.reviews}</div>
            <div className="stat-label">Всего отзывов</div>
            <div className="stat-hint">{emp.hotel}</div>
          </div>
        </div>
      </div>

      <section className="card pad">
        <h2>Последние отзывы</h2>
        <ul className="reviews">
          {reviews.map((r, i) => (
            <li key={`${r.date}-${i}`}>
              <div className="review-meta">
                <Stars value={r.rating} />
                <time>{formatDate(r.date)}</time>
              </div>
              <p className={r.text ? '' : 'muted'}>{r.text || 'Без комментария'}</p>
            </li>
          ))}
        </ul>
        <p className="sync-note">При оценке 1–2 руководитель сотрудника сразу получает уведомление в Битрикс24 с текстом отзыва.</p>
      </section>
    </>
  )
}
