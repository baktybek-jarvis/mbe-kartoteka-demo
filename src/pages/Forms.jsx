import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Clock, ExternalLink, Send } from 'lucide-react'
import { FORM_STATUS, shortDate } from '../data.js'
import { useRole } from '../App.jsx'
import { actions, formOf, useStore } from '../store.js'
import { Drawer, NoAccess, PersonCell, Pill, Segmented, SelectField } from '../components/ui.jsx'

const ORDER = ['review', 'fix', 'waiting', 'none', 'approved']
// Вкладка «Ожидают заполнения» включает и тех, кому ссылку ещё не выдали.
const inTab = (tab, status) => tab === 'all' || status === tab || (tab === 'waiting' && status === 'none')

function linkState(f) {
  if (f.status !== 'waiting') return null
  if (!f.hoursLeft) return { text: 'Ссылка истекла', tone: 'bad' }
  return { text: `Осталось ${f.hoursLeft} ч`, tone: f.hoursLeft <= 12 ? 'warn' : 'muted' }
}

export default function Forms() {
  const { role } = useRole()
  const s = useStore()
  const [filter, setFilter] = useState('review')
  const [openId, setOpenId] = useState(null)
  const [note, setNote] = useState('')
  const [issuing, setIssuing] = useState(false)
  const [issueId, setIssueId] = useState('')

  if (role !== 'hr') return <NoAccess text="Полные личные листки видит только HR." />

  const forms = s.employees.filter((e) => e.status !== 'dismissed').map((emp) => ({ ...formOf(s, emp.id), id: emp.id, emp }))
  const count = (tab) => forms.filter((f) => inTab(tab, f.status)).length
  const rows = forms.filter((f) => inTab(filter, f.status)).sort((a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status))
  const current = forms.find((f) => f.id === openId)
  const canIssue = forms.filter((f) => f.status === 'none' || (f.status === 'waiting' && !f.hoursLeft))

  const close = () => {
    setOpenId(null)
    setNote('')
  }
  const approve = () => {
    actions.approveForm(current.id)
    close()
  }
  const requestFix = () => {
    actions.returnForm(current.id, note.trim())
    close()
  }
  const issue = () => {
    actions.issueLink(Number(issueId))
    setIssuing(false)
    setIssueId('')
    setFilter('waiting')
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Личные листки</h1>
          <p className="muted">HR выдаёт персональную ссылку на 48 часов, сотрудник заполняет анкету с телефона, HR проверяет и утверждает</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setIssuing(true)}>
          <Send size={16} />
          Выдать ссылку
        </button>
      </div>

      <section className="card">
        <div className="toolbar">
          <Segmented
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'review', label: 'На проверке', count: count('review') },
              { value: 'fix', label: 'Требуют исправления', count: count('fix') },
              { value: 'waiting', label: 'Ожидают заполнения', count: count('waiting') },
              { value: 'approved', label: 'Утверждены', count: count('approved') },
              { value: 'all', label: 'Все', count: forms.length },
            ]}
          />
        </div>
        <div className="table-wrap">
          <table className="table static">
            <thead>
              <tr>
                <th><span>Сотрудник</span></th>
                <th><span>Состояние</span></th>
                <th><span>Ссылка</span></th>
                <th><span>Изменено</span></th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((f) => {
                const link = linkState(f)
                const live = f.status === 'fix' || (f.status === 'waiting' && f.hoursLeft > 0)
                return (
                  <tr key={f.id}>
                    <td><PersonCell emp={f.emp} /></td>
                    <td>
                      <Pill tone={FORM_STATUS[f.status].tone}>{FORM_STATUS[f.status].label}</Pill>
                      {f.fixNote && <small className="block muted cell-note">{f.fixNote}</small>}
                    </td>
                    <td>
                      {link ? (
                        <span className={`link-state tone-${link.tone}`}>
                          <Clock size={14} />
                          {link.text}
                        </span>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td className="nowrap">{f.updated ? shortDate(f.updated) : <span className="muted">—</span>}</td>
                    <td className="actions">
                      {f.status === 'review' && (
                        <button type="button" className="btn btn-primary" onClick={() => setOpenId(f.id)}>
                          Проверить
                        </button>
                      )}
                      {f.status === 'approved' && (
                        <button type="button" className="btn" onClick={() => setOpenId(f.id)}>
                          Открыть
                        </button>
                      )}
                      {live && (
                        <Link to={`/form/${f.id}`} className="btn" title="Так анкету видит сотрудник по ссылке">
                          <ExternalLink size={15} />
                          Анкета сотрудника
                        </Link>
                      )}
                      {(f.status === 'none' || f.status === 'waiting') && (
                        <button type="button" className="btn" onClick={() => actions.issueLink(f.id)} disabled={f.hoursLeft === 48}>
                          <Send size={15} />
                          {f.status === 'none' ? 'Выдать ссылку' : f.hoursLeft === 48 ? 'Ссылка выдана' : f.hoursLeft ? 'Продлить' : 'Выдать заново'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {rows.length === 0 && <div className="table-empty"><p>В этом состоянии анкет нет.</p></div>}
        </div>
      </section>

      {issuing && (
        <Drawer
          title="Выдать ссылку на анкету"
          subtitle="Ссылка персональная и действует 48 часов"
          onClose={() => setIssuing(false)}
          footer={
            <button type="button" className="btn btn-primary" disabled={!issueId} onClick={issue}>
              <Send size={16} />
              Выдать ссылку
            </button>
          }
        >
          <div className="form">
            <SelectField
              label="Сотрудник"
              value={issueId}
              onChange={setIssueId}
              placeholder={canIssue.length ? 'Выберите сотрудника' : 'Всем уже выдано'}
              options={canIssue.map((f) => ({ value: f.id, label: `${f.emp.fullName} — ${f.emp.hotel || f.emp.company}` }))}
              required
            />
            <p className="sync-note">В списке — сотрудники без ссылки и те, у кого она истекла. Отправка в WhatsApp, Telegram и SMS в проект не входит: HR передаёт ссылку сам.</p>
          </div>
        </Drawer>
      )}

      {current && (
        <Drawer
          title="Личный листок"
          subtitle={`${current.emp.fullName} · ${current.emp.position}`}
          onClose={close}
          footer={
            current.status === 'review' ? (
              <>
                <button type="button" className="btn" onClick={requestFix} disabled={!note.trim()}>
                  Вернуть на исправление
                </button>
                <button type="button" className="btn btn-primary" onClick={approve}>
                  <Check size={16} />
                  Утвердить
                </button>
              </>
            ) : null
          }
        >
          <Pill tone={FORM_STATUS[current.status].tone}>{FORM_STATUS[current.status].label}</Pill>
          {current.answers && <Answers a={current.answers} />}
          <p className="sync-note">
            В демо показаны пять групп, которые выводятся в карточку. Полный перечень полей бланка утверждается отдельным приложением к ТЗ.
          </p>
          {current.status === 'review' && (
            <label className="textarea-label">
              Что исправить — увидит сотрудник
              <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Например: уточните год окончания" />
            </label>
          )}
        </Drawer>
      )}
    </>
  )
}

function Answers({ a }) {
  const groups = [
    ['Образование', a.education],
    ['Иностранные языки', a.languages],
    ['Предыдущее место работы', a.prevWork],
  ]
  return (
    <div className="answers">
      {groups.map(([title, items]) => (
        <div key={title}>
          <h3>{title}</h3>
          {items.length ? (
            <ul className="records">
              {items.map((it) => (
                <li key={it.title}>
                  <b>{it.title}</b>
                  <span>{it.note}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Не указано</p>
          )}
        </div>
      ))}
      <div>
        <h3>Семейное положение</h3>
        <p className={a.family ? '' : 'muted'}>{a.family || 'Не указано'}</p>
      </div>
      <div>
        <h3>Увлечения</h3>
        <p className={a.hobbies ? '' : 'muted'}>{a.hobbies || 'Не указано'}</p>
      </div>
    </div>
  )
}
