import { useState } from 'react'
import { Send } from 'lucide-react'
import { DEMO_USERS, tenure } from '../data.js'
import { actions } from '../store.js'
import { AreaField, Drawer, SelectField } from './ui.jsx'

const FIELDS = [
  ['strengths', 'Сильные стороны'],
  ['achievements', 'Достижения'],
  ['improve', 'Что развивать'],
  ['readiness', 'Готовность к росту'],
]

// Руководитель составляет характеристику: emp задан — для него, иначе выбор из candidates.
// draft — существующий черновик, который дописывают.
export default function CharForm({ emp, candidates = [], draft, onClose }) {
  const [empId, setEmpId] = useState(emp?.id ?? draft?.empId ?? '')
  const [texts, setTexts] = useState(() => Object.fromEntries(FIELDS.map(([key]) => [key, draft?.[key] || ''])))

  const target = emp || candidates.find((c) => c.id === Number(empId))
  const complete = FIELDS.every(([key]) => texts[key].trim())

  const save = (status) => {
    actions.saveChar(target.id, texts, status, draft?.id)
    onClose()
  }

  return (
    <Drawer
      title={draft ? `Характеристика · версия ${draft.version}` : 'Новая характеристика'}
      subtitle={target ? `${target.fullName} · ${target.position} · стаж ${tenure(target.hired)}` : 'Выберите сотрудника'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn" disabled={!target} onClick={() => save('draft')}>
            Сохранить черновик
          </button>
          <button type="button" className="btn btn-primary" disabled={!target || !complete} onClick={() => save('pending')}>
            <Send size={16} />
            Отправить ГМ
          </button>
        </>
      }
    >
      <div className="form">
        {!emp && !draft && (
          <SelectField
            label="Сотрудник"
            value={empId}
            onChange={setEmpId}
            placeholder="Выберите подчинённого"
            options={candidates.map((c) => ({ value: c.id, label: `${c.fullName} — ${c.position}` }))}
            required
          />
        )}
        {FIELDS.map(([key, label]) => (
          <AreaField key={key} label={label} rows={4} value={texts[key]} onChange={(v) => setTexts((t) => ({ ...t, [key]: v }))} required />
        ))}
        <p className="sync-note">
          ФИО, должность и стаж подставляются автоматически. Автор — {DEMO_USERS.head}. Чтобы отправить на утверждение, заполните все четыре пункта.
        </p>
      </div>
    </Drawer>
  )
}
