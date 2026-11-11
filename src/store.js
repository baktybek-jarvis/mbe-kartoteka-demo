// Общее состояние демо. Вместо сервера — память браузера (localStorage),
// поэтому действия в одном разделе видны в остальных и переживают перезагрузку.
import { useSyncExternalStore } from 'react'
import {
  CHARACTERISTICS, DEMO_USERS, EMPLOYEES, EXTERNAL_ACCESS, FORMS, HOTELS, REVIEWS, REVIEW_FORMS, TODAY_ISO,
  getDetails, getFormAnswers, makeEmployee,
} from './data.js'

const KEY = 'mbe-kartoteka-demo-v1'

function seed() {
  const forms = {}
  FORMS.forEach((f) => {
    forms[f.id] = {
      status: f.status,
      hoursLeft: f.hoursLeft,
      updated: f.updated,
      fixNote: f.fixNote,
      answers: ['approved', 'review', 'fix'].includes(f.status) ? getFormAnswers(f.emp) : null,
    }
  })
  return {
    employees: EMPLOYEES,
    hotels: HOTELS,
    forms,
    chars: CHARACTERISTICS,
    reviews: REVIEWS.map(({ emp, ...r }) => ({ ...r, empId: emp.id })),
    reviewForms: REVIEW_FORMS.map(({ slug, title, greeting, active, staffIds }) => ({ slug, title, greeting, active, staffIds })),
    // Нурланов (id 25) намеренно без доступа — на нём показываем выдачу логина.
    access: EXTERNAL_ACCESS.filter((a) => a.id !== 25).map(({ emp, ...a }) => a),
    dev: { 1: getDetails(EMPLOYEES[0]).development },
    career: {},
    units: [],
  }
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

let state = load() || seed()
const listeners = new Set()
const emit = () => listeners.forEach((l) => l())

function set(updater) {
  state = updater(state)
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Хранилище недоступно (приватный режим) — демо продолжает работать в памяти.
  }
  emit()
}

// Форма отзыва на планшете открыта в другой вкладке — подхватываем её изменения.
window.addEventListener('storage', (e) => {
  if (e.key !== KEY) return
  state = load() || seed()
  emit()
})

const subscribe = (l) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export const useStore = () => useSyncExternalStore(subscribe, () => state)

// ───── уведомления ─────

let toastValue = null
let toastTimer
const toastListeners = new Set()

export function toast(text) {
  toastValue = { text, id: Date.now() }
  toastListeners.forEach((l) => l())
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastValue = null
    toastListeners.forEach((l) => l())
  }, 4500)
}

export const useToast = () =>
  useSyncExternalStore(
    (l) => {
      toastListeners.add(l)
      return () => toastListeners.delete(l)
    },
    () => toastValue,
  )

// ───── выборки ─────

export const formOf = (s, id) => s.forms[id] || { status: 'none', hoursLeft: null, updated: null, fixNote: '', answers: null }
export const hotelStaff = (s, hotelName) => s.employees.filter((e) => e.hotel === hotelName && e.status !== 'dismissed')

export function tempPassword() {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

// ───── действия ─────

const patchForm = (id, patch) =>
  set((s) => ({ ...s, forms: { ...s.forms, [id]: { ...formOf(s, id), ...patch, updated: TODAY_ISO } } }))

export const actions = {
  reset() {
    set(() => seed())
    toast('Демо возвращено в исходное состояние')
  },

  // Создаёт сотрудника или сохраняет изменения. Возвращает id.
  saveEmployee(fields, id) {
    let savedId = id
    set((s) => {
      if (id == null) {
        savedId = Math.max(...s.employees.map((e) => e.id)) + 1
        const emp = makeEmployee({
          ...fields, id: savedId, rating: null, reviews: 0, b24: false,
          oneCId: `MBE-${String(400 + savedId).padStart(5, '0')}`,
        })
        return { ...s, employees: [...s.employees, emp] }
      }
      const prev = s.employees.find((e) => e.id === id)
      const next = makeEmployee({ ...prev, ...fields })
      let { career, reviewForms } = s
      // Смена должности или подразделения — это кадровое событие, история не затирается.
      if (prev.position !== next.position || prev.dept !== next.dept) {
        const event = { date: TODAY_ISO, type: 'Перевод', position: next.position, dept: next.dept, note: '' }
        career = { ...career, [id]: [event, ...(career[id] || [])] }
      }
      if (next.status === 'dismissed' && prev.status !== 'dismissed') {
        const event = { date: TODAY_ISO, type: 'Увольнение', position: next.position, dept: next.dept, note: '' }
        career = { ...career, [id]: [event, ...(career[id] || [])] }
        // Уволенный сразу пропадает из форм отзывов.
        reviewForms = reviewForms.map((f) => ({ ...f, staffIds: f.staffIds.filter((x) => x !== id) }))
      }
      return { ...s, employees: s.employees.map((e) => (e.id === id ? next : e)), career, reviewForms }
    })
    return savedId
  },

  issueLink(id) {
    patchForm(id, { status: 'waiting', hoursLeft: 48 })
    toast('Ссылка на анкету выдана на 48 часов')
  },
  submitForm(id, answers) {
    patchForm(id, { status: 'review', hoursLeft: null, answers, fixNote: '' })
  },
  approveForm(id) {
    patchForm(id, { status: 'approved', fixNote: '' })
    toast('Анкета утверждена — сведения появились в карточке')
  },
  returnForm(id, note) {
    patchForm(id, { status: 'fix', fixNote: note, hoursLeft: 48 })
    toast('Анкета возвращена сотруднику на исправление')
  },

  // Черновик или отправка на утверждение. Новая версия получает следующий номер.
  saveChar(empId, texts, status, id) {
    set((s) => {
      if (id) {
        return { ...s, chars: s.chars.map((c) => (c.id === id ? { ...c, ...texts, status, date: TODAY_ISO } : c)) }
      }
      const version = Math.max(0, ...s.chars.filter((c) => c.empId === empId).map((c) => c.version)) + 1
      const char = { id: `${empId}-${version}`, empId, version, status, author: DEMO_USERS.head, date: TODAY_ISO, ...texts }
      return { ...s, chars: [char, ...s.chars] }
    })
    toast(status === 'pending' ? 'Характеристика отправлена ГМ на утверждение' : 'Черновик сохранён')
  },
  approveChar(id) {
    set((s) => ({
      ...s,
      chars: s.chars.map((c) => (c.id === id ? { ...c, status: 'approved', approvedBy: DEMO_USERS.gm, approvedAt: TODAY_ISO } : c)),
    }))
    toast('Характеристика утверждена')
  },

  saveDev(empId, text) {
    set((s) => ({ ...s, dev: { ...s.dev, [empId]: { text, author: DEMO_USERS.hr, date: TODAY_ISO } } }))
    toast('Сведения сохранены')
  },

  addReview(empId, rating, text) {
    set((s) => ({
      ...s,
      reviews: [{ id: Date.now(), empId, date: TODAY_ISO, rating, text }, ...s.reviews],
      employees: s.employees.map((e) => {
        if (e.id !== empId) return e
        const count = e.reviews || 0
        const avg = ((e.rating || 0) * count + rating) / (count + 1)
        return { ...e, rating: Math.round(avg * 10) / 10, reviews: count + 1 }
      }),
    }))
  },

  toggleReviewForm(slug) {
    set((s) => ({ ...s, reviewForms: s.reviewForms.map((f) => (f.slug === slug ? { ...f, active: !f.active } : f)) }))
  },
  saveReviewForm(slug, patch) {
    set((s) => ({ ...s, reviewForms: s.reviewForms.map((f) => (f.slug === slug ? { ...f, ...patch } : f)) }))
    toast('Форма отзывов сохранена')
  },
  addHotel(name, company) {
    set((s) => {
      const slug = `hotel-${s.hotels.length + 1}`
      return {
        ...s,
        hotels: [...s.hotels, { slug, name, company }],
        reviewForms: [...s.reviewForms, { slug, title: `Оцените сотрудника · ${name}`, greeting: 'Кто помог вам сегодня?', active: true, staffIds: [] }],
      }
    })
    toast(`Отель «${name}» добавлен, форма отзывов создана`)
  },

  grantAccess(empId, login) {
    set((s) => ({ ...s, access: [...s.access, { id: empId, login, blocked: false, lastLogin: null }] }))
    toast('Доступ выдан')
  },
  toggleBlock(id) {
    set((s) => ({ ...s, access: s.access.map((a) => (a.id === id ? { ...a, blocked: !a.blocked } : a)) }))
  },

  addUnit(unit) {
    set((s) => ({ ...s, units: [...s.units, unit] }))
    toast(`Подразделение «${unit.name}» создано`)
  },
  // Переименование затрагивает и пустое подразделение, и сотрудников внутри него.
  renameDept({ company, hotel, from, to }) {
    const same = (x) => x.company === company && (x.hotel || null) === (hotel || null)
    set((s) => ({
      ...s,
      units: s.units.map((u) => (same(u) && u.name === from ? { ...u, name: to } : u)),
      employees: s.employees.map((e) => (same(e) && e.dept === from ? { ...e, dept: to } : e)),
    }))
    toast('Подразделение переименовано')
  },
}
