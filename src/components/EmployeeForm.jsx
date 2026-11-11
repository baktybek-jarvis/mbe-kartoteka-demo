import { useState } from 'react'
import { COMPANIES, STATUSES, TODAY_ISO } from '../data.js'
import { actions, toast, useStore } from '../store.js'
import { Drawer, SelectField, TextField } from './ui.jsx'

const BLANK = {
  lastName: '', firstName: '', patronymic: '', company: COMPANIES[0], hotel: '', dept: '', position: '',
  status: 'active', hired: TODAY_ISO, birth: '', phone: '+996 ', form: 'Штат',
}

// Создание и редактирование сотрудника. onSaved получает id сохранённой записи.
export default function EmployeeForm({ emp, onClose, onSaved }) {
  const s = useStore()
  const [f, setF] = useState(emp ? { ...BLANK, ...emp, hotel: emp.hotel || '' } : BLANK)
  const set = (key) => (value) => setF((prev) => ({ ...prev, [key]: value }))

  const hotels = s.hotels.filter((h) => h.company === f.company)
  const depts = [...new Set([...s.employees, ...s.units].filter((x) => x.company === f.company).map((x) => x.dept || x.name))].sort((a, b) => a.localeCompare(b, 'ru'))
  // «Отель» обязателен только для гостиничных компаний.
  const valid = f.lastName.trim() && f.firstName.trim() && (hotels.length === 0 || f.hotel)

  const save = (e) => {
    e.preventDefault()
    if (!valid) return
    const fields = {
      lastName: f.lastName.trim(), firstName: f.firstName.trim(), patronymic: f.patronymic.trim(),
      company: f.company, hotel: hotels.length ? f.hotel : null,
      dept: f.dept.trim() || 'Без подразделения', position: f.position.trim() || 'Должность не указана',
      status: f.status, hired: f.hired || TODAY_ISO, birth: f.birth || '1990-01-01', phone: f.phone.trim(), form: f.form,
    }
    const id = actions.saveEmployee(fields, emp?.id)
    toast(emp ? 'Изменения сохранены' : 'Сотрудник добавлен в реестр')
    onSaved?.(id)
    onClose()
  }

  return (
    <Drawer
      title={emp ? 'Редактирование сотрудника' : 'Новый сотрудник'}
      subtitle={emp ? emp.fullName : 'Аккаунт Битрикс24 не требуется'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Отмена
          </button>
          <button type="submit" form="employee-form" className="btn btn-primary" disabled={!valid}>
            {emp ? 'Сохранить' : 'Добавить'}
          </button>
        </>
      }
    >
      <form id="employee-form" className="form" onSubmit={save}>
        <div className="form-row">
          <TextField label="Фамилия" value={f.lastName} onChange={set('lastName')} required autoFocus />
          <TextField label="Имя" value={f.firstName} onChange={set('firstName')} required />
        </div>
        <TextField label="Отчество" value={f.patronymic} onChange={set('patronymic')} />
        <SelectField label="Компания / направление" value={f.company} onChange={(v) => setF((p) => ({ ...p, company: v, hotel: '' }))} options={COMPANIES} required />
        {hotels.length > 0 && (
          <SelectField label="Отель" value={f.hotel} onChange={set('hotel')} options={hotels.map((h) => h.name)} placeholder="Выберите отель" required />
        )}
        <div className="form-row">
          <TextField label="Подразделение" value={f.dept} onChange={set('dept')} list="dept-list" />
          <TextField label="Должность" value={f.position} onChange={set('position')} />
        </div>
        <datalist id="dept-list">
          {depts.map((d) => (
            <option key={d} value={d} />
          ))}
        </datalist>
        <div className="form-row">
          <TextField label="Дата приёма" type="date" value={f.hired} onChange={set('hired')} />
          <TextField label="Дата рождения" type="date" value={f.birth} onChange={set('birth')} />
        </div>
        <div className="form-row">
          <TextField label="Телефон" value={f.phone} onChange={set('phone')} />
          <SelectField label="Форма оформления" value={f.form} onChange={set('form')} options={['Штат', 'ИП']} />
        </div>
        <SelectField
          label="Статус"
          value={f.status}
          onChange={set('status')}
          options={Object.entries(STATUSES).map(([value, label]) => ({ value, label }))}
        />
        {f.status === 'dismissed' && <p className="sync-note">Карточка перейдёт в архив, сотрудник пропадёт из форм отзывов. История сохранится.</p>}
        <p className="sync-note">В рабочей версии кадровые поля приходят из 1С; HR правит их в пределах своих прав.</p>
      </form>
    </Drawer>
  )
}
