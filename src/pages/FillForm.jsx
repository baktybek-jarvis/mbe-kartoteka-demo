import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check, Clock, Plus, Trash2, X } from 'lucide-react'
import { getEmployee } from '../data.js'
import { actions, formOf, useStore } from '../store.js'

// Анкета, которую сотрудник открывает по персональной ссылке с телефона.
// В демо показаны пять групп сведений, которые выводятся в карточку.

const GROUPS = [
  { key: 'education', title: 'Образование', a: 'Учебное заведение', b: 'Специальность, год окончания' },
  { key: 'languages', title: 'Иностранные языки', a: 'Язык', b: 'Уровень владения' },
  { key: 'prevWork', title: 'Предыдущее место работы', a: 'Организация, город', b: 'Должность, годы работы' },
]
const FAMILY = ['Не женат / не замужем', 'Женат / замужем', 'Разведён / разведена', 'Вдовец / вдова']
const blank = () => ({ title: '', note: '' })

export default function FillForm() {
  const { id } = useParams()
  const s = useStore()
  const emp = getEmployee(id, s.employees)
  const form = emp ? formOf(s, emp.id) : null
  const [sent, setSent] = useState(false)
  const [a, setA] = useState(() => {
    const prev = form?.answers
    return {
      education: prev?.education?.length ? prev.education : [blank()],
      languages: prev?.languages?.length ? prev.languages : [blank()],
      prevWork: prev?.prevWork?.length ? prev.prevWork : [blank()],
      family: prev?.family || '',
      hobbies: prev?.hobbies || '',
    }
  })

  const open = form && (form.status === 'fix' || (form.status === 'waiting' && form.hoursLeft > 0))

  let stop = null
  if (!emp || form.status === 'none') stop = { icon: X, title: 'Ссылка недействительна', text: 'Попросите HR выдать новую ссылку.' }
  else if (sent || form.status === 'review') stop = { icon: Check, title: 'Анкета отправлена', text: 'HR проверит сведения. После утверждения они появятся в вашей карточке.' }
  else if (form.status === 'approved') stop = { icon: Check, title: 'Анкета утверждена', text: 'Сведения уже в вашей карточке.' }
  else if (!open) stop = { icon: Clock, title: 'Срок действия ссылки истёк', text: 'Ссылка действует 48 часов. Попросите HR выдать новую.' }

  const setRow = (key, i, field, value) =>
    setA((prev) => ({ ...prev, [key]: prev[key].map((row, n) => (n === i ? { ...row, [field]: value } : row)) }))
  const addRow = (key) => setA((prev) => ({ ...prev, [key]: [...prev[key], blank()] }))
  const removeRow = (key, i) => setA((prev) => ({ ...prev, [key]: prev[key].filter((_, n) => n !== i) }))

  const clean = (rows) => rows.map((r) => ({ title: r.title.trim(), note: r.note.trim() })).filter((r) => r.title)
  const valid = clean(a.education).length > 0 && a.family

  const submit = (e) => {
    e.preventDefault()
    if (!valid) return
    actions.submitForm(emp.id, {
      education: clean(a.education), languages: clean(a.languages), prevWork: clean(a.prevWork),
      family: a.family, hobbies: a.hobbies.trim(),
    })
    setSent(true)
  }

  return (
    <div className="fill">
      <header className="fill-head">
        <img src="./logo-mbe.svg" alt="MBE Group" />
        <span>Личный листок</span>
        <Link to="/forms" className="guest-exit" title="Вернуться в демо">
          <X size={18} />
        </Link>
      </header>

      {stop ? (
        <div className="fill-stop">
          <span className="fill-stop-icon">
            <stop.icon size={30} />
          </span>
          <h1>{stop.title}</h1>
          <p>{stop.text}</p>
          <Link to="/forms" className="btn">
            Вернуться в демо
          </Link>
        </div>
      ) : (
        <form className="fill-body" onSubmit={submit}>
          <div>
            <h1>{emp.firstName}, заполните анкету</h1>
            <p className="muted">
              {emp.position} · {emp.hotel || emp.company}
              {form.status === 'waiting' && ` · ссылка действует ещё ${form.hoursLeft} ч`}
            </p>
          </div>

          {form.status === 'fix' && form.fixNote && (
            <p className="banner-inline">
              <b>HR просит исправить:</b> {form.fixNote}
            </p>
          )}

          {GROUPS.map((g) => (
            <fieldset key={g.key} className="fill-group">
              <legend>{g.title}</legend>
              {a[g.key].map((row, i) => (
                <div className="fill-row" key={i}>
                  <input placeholder={g.a} value={row.title} onChange={(e) => setRow(g.key, i, 'title', e.target.value)} aria-label={g.a} />
                  <input placeholder={g.b} value={row.note} onChange={(e) => setRow(g.key, i, 'note', e.target.value)} aria-label={g.b} />
                  {a[g.key].length > 1 && (
                    <button type="button" className="icon-btn" onClick={() => removeRow(g.key, i)} aria-label="Удалить запись">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="fill-add" onClick={() => addRow(g.key)}>
                <Plus size={15} />
                Добавить запись
              </button>
            </fieldset>
          ))}

          <fieldset className="fill-group">
            <legend>Семейное положение</legend>
            <select value={a.family} onChange={(e) => setA((p) => ({ ...p, family: e.target.value }))} aria-label="Семейное положение">
              <option value="">Выберите</option>
              {FAMILY.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </fieldset>

          <fieldset className="fill-group">
            <legend>Увлечения</legend>
            <textarea rows={3} placeholder="По желанию" value={a.hobbies} onChange={(e) => setA((p) => ({ ...p, hobbies: e.target.value }))} aria-label="Увлечения" />
          </fieldset>

          <button type="submit" className="btn btn-primary fill-send" disabled={!valid}>
            Отправить HR на проверку
          </button>
          <p className="sync-note">Обязательны образование и семейное положение. Полный личный листок целиком видит только HR.</p>
        </form>
      )}
    </div>
  )
}
