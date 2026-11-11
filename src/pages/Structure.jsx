import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, ChevronDown, ChevronRight, Hotel, Network, Pencil, Plus, Users } from 'lucide-react'
import { COMPANIES, DEMO_SCOPE, pluralEmployees } from '../data.js'
import { useRole } from '../App.jsx'
import { actions, useStore } from '../store.js'
import { Avatar, Drawer, NoAccess, Pill, SelectField, Source, TextField } from '../components/ui.jsx'

const HEAD_RE = /Руководитель|Менеджер ресторана|Главный|Управляющий|Супервайзер/

function buildTree({ employees, hotels, units }) {
  const staff = employees.filter((e) => e.status !== 'dismissed')
  let seq = 100
  // Подразделения собираются из сотрудников и из созданных вручную пустых подразделений.
  const depts = (company, hotel) => {
    const here = staff.filter((e) => e.company === company && (e.hotel || null) === hotel)
    const names = new Set([...here.map((e) => e.dept), ...units.filter((u) => u.company === company && (u.hotel || null) === hotel).map((u) => u.name)])
    return [...names].sort((a, b) => a.localeCompare(b, 'ru')).map((name) => {
      const list = here.filter((e) => e.dept === name)
      return {
        id: `d-${hotel || company}-${name}`, b24: ++seq, type: 'dept', name, company, hotel,
        employees: list, managers: list.filter((e) => HEAD_RE.test(e.position)), children: [],
      }
    })
  }

  const companies = COMPANIES.map((company) => {
    const own = hotels.filter((h) => h.company === company)
    const children = own.length
      ? own.map((h) => ({
          id: `h-${h.name}`, b24: ++seq, type: 'hotel', name: h.name, company, hotel: h.name, employees: [],
          managers: staff.filter((e) => e.hotel === h.name && e.position === 'Генеральный менеджер'),
          children: depts(company, h.name),
        }))
      : depts(company, null)
    return { id: `c-${company}`, b24: ++seq, type: 'company', name: company, company, hotel: null, employees: [], managers: [], children }
  })
  return { id: 'root', b24: 1, type: 'root', name: 'MBE Group', hotel: null, employees: [], managers: [], children: companies }
}

const allEmployees = (node) => [...node.employees, ...node.children.flatMap(allEmployees)]
const findNode = (node, test) => (test(node) ? node : node.children.map((c) => findNode(c, test)).find(Boolean))
const findParent = (node, id) => (node.children.some((c) => c.id === id) ? node : node.children.map((c) => findParent(c, id)).find(Boolean))

const TYPE = {
  root: { label: 'Холдинг', icon: Network },
  company: { label: 'Компания / направление', icon: Building2 },
  hotel: { label: 'Отель', icon: Hotel },
  dept: { label: 'Подразделение', icon: Users },
}

export default function Structure() {
  const { role } = useRole()
  const s = useStore()
  const tree = useMemo(() => buildTree(s), [s])

  const root = useMemo(() => {
    if (role === 'gm') return findNode(tree, (n) => n.type === 'hotel' && n.name === DEMO_SCOPE.hotel)
    if (role === 'head') return findNode(tree, (n) => n.type === 'dept' && n.hotel === DEMO_SCOPE.hotel && n.name === DEMO_SCOPE.dept)
    return tree
  }, [tree, role])

  const [selectedId, setSelectedId] = useState(null)
  const [open, setOpen] = useState(() => new Set(['root', `c-${COMPANIES[0]}`, `h-${DEMO_SCOPE.hotel}`]))
  const [adding, setAdding] = useState(false)
  const [renaming, setRenaming] = useState(false)

  if (role === 'self') return <NoAccess text="Структуру холдинга видят HR и руководители." />

  const selected = (selectedId && findNode(root, (n) => n.id === selectedId)) || root
  const parent = findParent(tree, selected.id)
  const toggle = (id) =>
    setOpen((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  // Подразделение можно создать в отеле или в компании без отелей.
  const parents = tree.children.flatMap((c) => (c.children.some((x) => x.type === 'hotel') ? c.children : [c]))

  const renderNode = (node, depth) => {
    const Icon = TYPE[node.type].icon
    const hasChildren = node.children.length > 0
    const isOpen = open.has(node.id) || node.id === root.id
    const count = allEmployees(node).length
    return (
      <li key={node.id}>
        <div className={`tree-row${selected.id === node.id ? ' on' : ''}`} style={{ paddingLeft: 10 + depth * 22 }}>
          {hasChildren ? (
            <button type="button" className="tree-toggle" onClick={() => toggle(node.id)} aria-label={isOpen ? 'Свернуть' : 'Развернуть'}>
              {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <span className="tree-toggle" />
          )}
          <button type="button" className="tree-label" onClick={() => setSelectedId(node.id)}>
            <Icon size={16} />
            <span>{node.name}</span>
            <small>{count}</small>
          </button>
        </div>
        {hasChildren && isOpen && <ul>{node.children.map((c) => renderNode(c, depth + 1))}</ul>}
      </li>
    )
  }

  const people = allEmployees(selected)

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Структура</h1>
          <p className="muted">
            {role === 'hr'
              ? 'Базовое дерево приходит из Битрикс24 и дополняется здесь: отели, вложенные подразделения, сотрудники без аккаунта'
              : 'Вы видите подразделения в пределах своих полномочий'}
          </p>
        </div>
        {role === 'hr' && (
          <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}>
            <Plus size={16} />
            Добавить подразделение
          </button>
        )}
      </div>

      <div className="split">
        <section className="card tree-card">
          <ul className="tree">{renderNode(root, 0)}</ul>
        </section>

        <section className="card pad">
          <div className="doc-head">
            <div>
              <h3>{TYPE[selected.type].label}</h3>
              <h2 className="unit-title">{selected.name}</h2>
            </div>
            <div className="row-actions">
              <Pill tone="ok">Активно</Pill>
              {role === 'hr' && selected.type === 'dept' && (
                <button type="button" className="btn" onClick={() => setRenaming(true)}>
                  <Pencil size={15} />
                  Переименовать
                </button>
              )}
            </div>
          </div>

          <dl className="fields">
            <div className="field">
              <dt>Родитель <Source type={selected.type === 'dept' ? 'hr' : 'auto'} /></dt>
              <dd>{parent ? parent.name : <span className="muted">Верхний уровень</span>}</dd>
            </div>
            <div className="field">
              <dt>Отель <Source type="hr" /></dt>
              <dd>{selected.hotel || <span className="muted">Не привязано — негостиничное подразделение</span>}</dd>
            </div>
            <div className="field">
              <dt>Руководители <Source type="hr" /></dt>
              <dd>
                {selected.managers.length ? (
                  <span className="people">
                    {selected.managers.map((m) => (
                      <Link key={m.id} to={`/employee/${m.id}`} className="person-mini">
                        <Avatar emp={m} size={24} />
                        {m.shortName}
                      </Link>
                    ))}
                  </span>
                ) : (
                  <span className="muted">Не назначены</span>
                )}
              </dd>
            </div>
            <div className="field">
              <dt>Сотрудников</dt>
              <dd>
                {people.length} {pluralEmployees(people.length)}
                {selected.children.length > 0 && <span className="muted"> · включая вложенные подразделения</span>}
              </dd>
            </div>
            <div className="field">
              <dt>ID в Битрикс24 <Source type="auto" /></dt>
              <dd>{selected.b24}</dd>
            </div>
          </dl>

          <h3>Сотрудники</h3>
          {people.length === 0 && <p className="muted">Пока никого. Назначьте подразделение сотруднику в его карточке.</p>}
          <ul className="people-list">
            {people.map((e) => (
              <li key={e.id}>
                <Link to={`/employee/${e.id}`} className="person">
                  <Avatar emp={e} size={34} />
                  <span>
                    <b>{e.shortName}</b>
                    <small>
                      {e.position}
                      {selected.type !== 'dept' && ` · ${e.dept}`}
                    </small>
                  </span>
                </Link>
                {!e.b24 && <span className="tag">без аккаунта Б24</span>}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {adding && (
        <AddUnit
          parents={parents}
          initial={selected.type === 'hotel' || (selected.type === 'company' && parents.includes(selected)) ? selected.id : parent && parents.some((p) => p.id === parent.id) ? parent.id : ''}
          onClose={() => setAdding(false)}
          onCreated={(parentNode, name) => {
            setOpen((prev) => new Set(prev).add(parentNode.id).add(`c-${parentNode.company}`))
            setSelectedId(`d-${parentNode.hotel || parentNode.company}-${name}`)
          }}
        />
      )}
      {renaming && (
        <RenameUnit
          node={selected}
          siblings={parent.children.map((c) => c.name)}
          onClose={() => setRenaming(false)}
          onRenamed={(name) => setSelectedId(`d-${selected.hotel || selected.company}-${name}`)}
        />
      )}
    </>
  )
}

function AddUnit({ parents, initial, onClose, onCreated }) {
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState(initial)
  const parentNode = parents.find((p) => p.id === parentId)
  const taken = parentNode?.children.some((c) => c.name.toLowerCase() === name.trim().toLowerCase())
  const valid = name.trim() && parentNode && !taken
  const save = (e) => {
    e.preventDefault()
    if (!valid) return
    actions.addUnit({ name: name.trim(), company: parentNode.company, hotel: parentNode.hotel })
    onCreated(parentNode, name.trim())
    onClose()
  }
  return (
    <Drawer
      title="Новое подразделение"
      subtitle="Создаётся внутри приложения, аккаунты Битрикс24 не нужны"
      onClose={onClose}
      footer={
        <button type="submit" form="unit-form" className="btn btn-primary" disabled={!valid}>
          Создать
        </button>
      }
    >
      <form id="unit-form" className="form" onSubmit={save}>
        <TextField label="Название" value={name} onChange={setName} required autoFocus maxLength={255} hint={taken ? 'Такое подразделение здесь уже есть' : undefined} />
        <SelectField
          label="Родитель"
          value={parentId}
          onChange={setParentId}
          placeholder="Выберите отель или направление"
          options={parents.map((p) => ({ value: p.id, label: p.type === 'hotel' ? `${p.name} (отель)` : p.name }))}
          required
        />
        <p className="sync-note">Привязка к отелю ставится автоматически, если родитель — отель. Для остальных подразделений она необязательна.</p>
      </form>
    </Drawer>
  )
}

function RenameUnit({ node, siblings, onClose, onRenamed }) {
  const [name, setName] = useState(node.name)
  const next = name.trim()
  const taken = next.toLowerCase() !== node.name.toLowerCase() && siblings.some((x) => x.toLowerCase() === next.toLowerCase())
  const valid = next && next !== node.name && !taken
  const save = (e) => {
    e.preventDefault()
    if (!valid) return
    actions.renameDept({ company: node.company, hotel: node.hotel, from: node.name, to: next })
    onRenamed(next)
    onClose()
  }
  return (
    <Drawer
      title="Переименовать подразделение"
      subtitle={node.hotel || node.company}
      onClose={onClose}
      footer={
        <button type="submit" form="rename-form" className="btn btn-primary" disabled={!valid}>
          Сохранить
        </button>
      }
    >
      <form id="rename-form" className="form" onSubmit={save}>
        <TextField label="Название" value={name} onChange={setName} required autoFocus maxLength={255} hint={taken ? 'Такое подразделение здесь уже есть' : undefined} />
        <p className="sync-note">Название обновится в карточках всех сотрудников подразделения.</p>
      </form>
    </Drawer>
  )
}
