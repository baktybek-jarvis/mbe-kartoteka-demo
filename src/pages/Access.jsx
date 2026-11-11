import { useState } from 'react'
import { KeyRound, Lock, Plus, Unlock } from 'lucide-react'
import { FIELD_RIGHTS, ROLE_MATRIX, getEmployee, shortDate } from '../data.js'
import { useRole } from '../App.jsx'
import { actions, tempPassword, toast, useStore } from '../store.js'
import { Drawer, NoAccess, PersonCell, Pill, Segmented, SelectField, TextField } from '../components/ui.jsx'

export default function Access() {
  const { role } = useRole()
  const s = useStore()
  const [tab, setTab] = useState('external')
  const [granting, setGranting] = useState(false)

  if (role !== 'hr') return <NoAccess text="Доступами управляет HR-администратор." />

  const rows = s.access
    .map((a) => ({ ...a, emp: getEmployee(a.id, s.employees) }))
    .filter((a) => a.emp && a.emp.status !== 'dismissed')
  // Доступ нужен тем, у кого нет аккаунта Битрикс24 и логин ещё не выдан.
  const candidates = s.employees.filter((e) => !e.b24 && e.status !== 'dismissed' && !s.access.some((a) => a.id === e.id))

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Доступы</h1>
          <p className="muted">
            Пользователи Битрикс24 входят без повторной авторизации. Остальным HR выдаёт логин и пароль для отдельной страницы
          </p>
        </div>
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: 'external', label: 'Внешний доступ', count: rows.length },
            { value: 'roles', label: 'Роли и права' },
          ]}
        />
      </div>

      {tab === 'external' ? (
        <section className="card">
          <div className="toolbar">
            <span className="muted">
              Сотрудник с внешним доступом видит только собственную карточку и свои формы.
              {candidates.length > 0 && ` Без логина: ${candidates.length}.`}
            </span>
            <button type="button" className="btn btn-primary push-right" onClick={() => setGranting(true)} disabled={candidates.length === 0}>
              <Plus size={16} />
              Выдать доступ
            </button>
          </div>
          <div className="table-wrap">
            <table className="table static">
              <thead>
                <tr>
                  <th><span>Сотрудник</span></th>
                  <th><span>Логин</span></th>
                  <th><span>Состояние</span></th>
                  <th><span>Последний вход</span></th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td><PersonCell emp={r.emp} /></td>
                    <td className="mono">{r.login}</td>
                    <td>
                      <Pill tone={r.blocked ? 'bad' : 'ok'}>{r.blocked ? 'Заблокирован' : 'Активен'}</Pill>
                    </td>
                    <td className="nowrap">{r.lastLogin ? shortDate(r.lastLogin) : <span className="muted">Ещё не входил</span>}</td>
                    <td className="actions">
                      <button type="button" className="btn" onClick={() => toast(`Новый первоначальный пароль для ${r.login}: ${tempPassword()}`)}>
                        <KeyRound size={15} />
                        Сбросить пароль
                      </button>
                      <button type="button" className="btn" onClick={() => actions.toggleBlock(r.id)}>
                        {r.blocked ? <Unlock size={15} /> : <Lock size={15} />}
                        {r.blocked ? 'Разблокировать' : 'Заблокировать'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <>
          <section className="card">
            <h2 className="card-title">Роли</h2>
            <div className="table-wrap">
              <table className="table static">
                <thead>
                  <tr>
                    <th><span>Роль</span></th>
                    <th><span>Область доступа</span></th>
                    <th><span>Ключевые действия</span></th>
                  </tr>
                </thead>
                <tbody>
                  {ROLE_MATRIX.map((r) => (
                    <tr key={r.role}>
                      <td><b>{r.role}</b></td>
                      <td>{r.scope}</td>
                      <td>{r.actions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card">
            <h2 className="card-title">Права по группам полей</h2>
            <div className="table-wrap">
              <table className="table static">
                <thead>
                  <tr>
                    <th><span>Группа полей</span></th>
                    <th><span>Кто заполняет и изменяет</span></th>
                    <th><span>Кто просматривает</span></th>
                  </tr>
                </thead>
                <tbody>
                  {FIELD_RIGHTS.map((r) => (
                    <tr key={r.group}>
                      <td><b>{r.group}</b></td>
                      <td>{r.edit}</td>
                      <td>{r.view}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="card-foot">Стартовая матрица из ТЗ. Утверждается заказчиком до разработки детальной модели доступа.</p>
          </section>
        </>
      )}

      {granting && <Grant candidates={candidates} logins={s.access.map((a) => a.login)} onClose={() => setGranting(false)} />}
    </>
  )
}

function Grant({ candidates, logins, onClose }) {
  const [empId, setEmpId] = useState(String(candidates[0]?.id ?? ''))
  const [login, setLogin] = useState(candidates[0] ? `mbe${1000 + candidates[0].id * 7}` : '')
  const [password] = useState(tempPassword)
  const taken = logins.includes(login.trim())
  const valid = empId && login.trim().length >= 4 && !taken

  const pick = (id) => {
    setEmpId(id)
    setLogin(id ? `mbe${1000 + Number(id) * 7}` : '')
  }
  const save = (e) => {
    e.preventDefault()
    if (!valid) return
    actions.grantAccess(Number(empId), login.trim())
    onClose()
  }

  return (
    <Drawer
      title="Выдать внешний доступ"
      subtitle="Для сотрудников без учётной записи Битрикс24"
      onClose={onClose}
      footer={
        <button type="submit" form="grant-form" className="btn btn-primary" disabled={!valid}>
          Выдать доступ
        </button>
      }
    >
      <form id="grant-form" className="form" onSubmit={save}>
        <SelectField
          label="Сотрудник"
          value={empId}
          onChange={pick}
          options={candidates.map((c) => ({ value: c.id, label: `${c.fullName} — ${c.hotel || c.company}` }))}
          required
        />
        <TextField label="Логин" value={login} onChange={setLogin} required hint={taken ? 'Этот логин уже занят' : 'Не короче 4 символов'} />
        <div className="input">
          <span>Первоначальный пароль</span>
          <output className="mono password">{password}</output>
          <small>Передайте его сотруднику лично. Саморегистрация, вход через соцсети и SMS не предусмотрены.</small>
        </div>
      </form>
    </Drawer>
  )
}
