import { useRef } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Building2, ClipboardList, Eye, FileText, MessageSquareHeart, RotateCcw, Settings, Tablet, Users } from 'lucide-react'
import { ROLES } from '../data.js'
import { useRole } from '../App.jsx'
import { actions } from '../store.js'
import { Toast } from './ui.jsx'

// roles — кому раздел виден в меню; права дополнительно проверяются на самой странице.
const NAV = [
  { to: '/', icon: Users, label: 'Сотрудники', roles: ['hr', 'gm', 'head', 'self'], match: (p) => p === '/' },
  { to: '/structure', icon: Building2, label: 'Структура', roles: ['hr', 'gm', 'head'] },
  { to: '/forms', icon: ClipboardList, label: 'Личные листки', roles: ['hr'] },
  { to: '/characteristics', icon: FileText, label: 'Характеристики', roles: ['hr', 'gm', 'head'] },
  { to: '/reviews', icon: MessageSquareHeart, label: 'Отзывы гостей', roles: ['hr', 'gm', 'head'] },
  { to: '/access', icon: Settings, label: 'Доступы', roles: ['hr'] },
]

export default function Layout() {
  const { role, setRole } = useRole()
  const { pathname } = useLocation()

  // Карточку сотрудника открывают из разных разделов: запоминаем, из какого,
  // чтобы «Назад» и подсветка меню вели туда же.
  const origin = useRef('/')
  const onCard = pathname.startsWith('/employee')
  if (!onCard) origin.current = pathname
  const section = NAV.find((n) => n.to === origin.current && n.roles.includes(role)) || NAV[0]
  const current = onCard ? section.to : pathname
  return (
    <div className="shell">
      <aside className="sidebar">
        <Link to="/" className="brand">
          <img src="./logo-mbe.svg" alt="MBE Group" />
          <span>Картотека персонала</span>
        </Link>

        <nav className="nav">
          {NAV.filter((n) => n.roles.includes(role)).map(({ to, icon: Icon, label, match }) => {
            const active = match ? match(current) : current.startsWith(to)
            return (
              <Link key={to} to={to} className={`nav-item${active ? ' active' : ''}`} aria-current={active ? 'page' : undefined}>
                <Icon size={18} />
                {role === 'self' && to === '/' ? 'Моя карточка' : label}
              </Link>
            )
          })}
        </nav>

        {role !== 'self' && (
          <Link to="/review/koi-tash" className="nav-tablet">
            <Tablet size={18} />
            <span>
              Форма отзыва
              <small>как видит гость на планшете</small>
            </span>
          </Link>
        )}
      </aside>

      <div className="main">
        <header className="topbar">
          <span className="demo-tag">
            Демо · данные вымышленные
            <button type="button" className="link reset-demo" onClick={actions.reset} title="Вернуть все данные демо в исходное состояние">
              <RotateCcw size={13} />
              Сбросить демо
            </button>
          </span>
          <label className="role-switch">
            <Eye size={16} />
            <span>Смотреть как</span>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              {Object.entries(ROLES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </header>
        <main className="content">
          <Outlet context={{ backTo: section.to, backLabel: section.label }} />
        </main>
      </div>
      <Toast />
    </div>
  )
}
