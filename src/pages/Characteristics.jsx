import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Pencil, Plus } from 'lucide-react'
import { CHAR_STATUS, DEMO_SCOPE, getEmployee, shortDate, tenure } from '../data.js'
import { useRole } from '../App.jsx'
import { actions, useStore } from '../store.js'
import { Drawer, NoAccess, PersonCell, Pill, Segmented } from '../components/ui.jsx'
import CharForm from '../components/CharForm.jsx'

const ORDER = ['pending', 'draft', 'approved']

function inScope(role, emp) {
  if (role === 'gm') return emp.hotel === DEMO_SCOPE.hotel
  if (role === 'head') return emp.hotel === DEMO_SCOPE.hotel && emp.dept === DEMO_SCOPE.dept
  return true
}

export default function Characteristics() {
  const { role } = useRole()
  const s = useStore()
  const [filter, setFilter] = useState('all')
  const [openId, setOpenId] = useState(null)
  // null — форма закрыта, 'new' — новая характеристика, иначе — черновик.
  const [formFor, setFormFor] = useState(null)

  if (role === 'self') return <NoAccess text="Свою характеристику сотрудник видит в карточке после утверждения." />

  const scoped = s.chars
    .map((c) => ({ ...c, emp: getEmployee(c.empId, s.employees) }))
    .filter((c) => c.emp && inScope(role, c.emp))
  const count = (status) => scoped.filter((c) => c.status === status).length
  const rows = scoped
    .filter((c) => filter === 'all' || c.status === filter)
    .sort((a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status) || b.date.localeCompare(a.date))
  const current = scoped.find((c) => c.id === openId)

  // Руководитель пишет подчинённым, у которых нет незакрытой версии.
  const candidates = s.employees.filter(
    (e) => inScope('head', e) && e.id !== DEMO_SCOPE.headId && e.status !== 'dismissed' && !s.chars.some((c) => c.empId === e.id && c.status !== 'approved'),
  )

  const approve = () => {
    actions.approveChar(current.id)
    setOpenId(null)
  }
  const editDraft = () => {
    setFormFor(current)
    setOpenId(null)
  }

  const canApprove = role === 'gm' && current?.status === 'pending'
  const canEdit = role === 'head' && current?.status === 'draft'

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Характеристики</h1>
          <p className="muted">Руководитель составляет характеристику подчинённого, генеральный менеджер утверждает. Все версии сохраняются</p>
        </div>
        {role === 'head' && (
          <button type="button" className="btn btn-primary" onClick={() => setFormFor('new')} disabled={candidates.length === 0}>
            <Plus size={16} />
            Составить характеристику
          </button>
        )}
      </div>

      <section className="card">
        <div className="toolbar">
          <Segmented
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'Все', count: scoped.length },
              { value: 'pending', label: 'На утверждении', count: count('pending') },
              { value: 'draft', label: 'Черновики', count: count('draft') },
              { value: 'approved', label: 'Утверждены', count: count('approved') },
            ]}
          />
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th><span>Сотрудник</span></th>
                <th><span>Версия</span></th>
                <th><span>Статус</span></th>
                <th><span>Составил</span></th>
                <th><span>Утвердил ГМ</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} onClick={() => setOpenId(c.id)}>
                  <td><PersonCell emp={c.emp} /></td>
                  <td>Версия {c.version}</td>
                  <td>
                    <Pill tone={CHAR_STATUS[c.status].tone}>{CHAR_STATUS[c.status].label}</Pill>
                  </td>
                  <td>
                    {c.author}
                    <small className="block muted">{shortDate(c.date)}</small>
                  </td>
                  <td>
                    {c.approvedBy ? (
                      <>
                        {c.approvedBy}
                        <small className="block muted">{shortDate(c.approvedAt)}</small>
                      </>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <div className="table-empty"><p>Характеристик в этом статусе нет.</p></div>}
        </div>
      </section>

      {formFor && (
        <CharForm
          candidates={candidates}
          draft={formFor === 'new' ? null : formFor}
          emp={formFor === 'new' ? null : formFor.emp}
          onClose={() => setFormFor(null)}
        />
      )}

      {current && (
        <Drawer
          title={`Характеристика · версия ${current.version}`}
          subtitle={`${current.emp.fullName} · ${current.emp.position} · стаж ${tenure(current.emp.hired)}`}
          onClose={() => setOpenId(null)}
          footer={
            canApprove ? (
              <button type="button" className="btn btn-primary" onClick={approve}>
                <Check size={16} />
                Утвердить
              </button>
            ) : canEdit ? (
              <button type="button" className="btn btn-primary" onClick={editDraft}>
                <Pencil size={15} />
                Продолжить черновик
              </button>
            ) : null
          }
        >
          <Pill tone={CHAR_STATUS[current.status].tone}>{CHAR_STATUS[current.status].label}</Pill>
          <div className="answers">
            <Block title="Сильные стороны" text={current.strengths} />
            <Block title="Достижения" text={current.achievements} />
            <Block title="Что развивать" text={current.improve} />
            <Block title="Готовность к росту" text={current.readiness} />
          </div>
          <div className="doc-foot">
            <span>
              Составил(а): <b>{current.author}</b>, {shortDate(current.date)}
            </span>
            {current.approvedBy && (
              <span>
                Утвердил ГМ: <b>{current.approvedBy}</b>, {shortDate(current.approvedAt)}
              </span>
            )}
          </div>
          {current.status === 'pending' && role !== 'gm' && <p className="sync-note">Утвердить может генеральный менеджер отеля.</p>}
          <Link className="link" to={`/employee/${current.emp.id}?tab=char`}>
            Открыть в карточке сотрудника
          </Link>
        </Drawer>
      )}
    </>
  )
}

function Block({ title, text }) {
  return (
    <div>
      <h3>{title}</h3>
      <p className={text ? '' : 'muted'}>{text || 'Не заполнено'}</p>
    </div>
  )
}
