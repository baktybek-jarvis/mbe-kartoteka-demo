import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Star, X } from 'lucide-react'
import { actions, useStore } from '../store.js'
import { Avatar } from '../components/ui.jsx'

const LABELS = ['', 'Плохо', 'Ниже ожиданий', 'Нормально', 'Хорошо', 'Отлично']

export default function GuestReview() {
  const { hotel: slug } = useParams()
  const s = useStore()
  const hotel = s.hotels.find((h) => h.slug === slug)
  const form = s.reviewForms.find((f) => f.slug === slug)
  const staff = form ? s.employees.filter((e) => form.staffIds.includes(e.id) && e.status !== 'dismissed') : []

  const [emp, setEmp] = useState(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [sent, setSent] = useState(false)

  const reset = () => {
    setEmp(null)
    setRating(0)
    setComment('')
    setSent(false)
  }
  const send = () => {
    // Отзыв привязывается к id сотрудника, а не к ФИО: однофамильцы не перепутаются.
    actions.addReview(emp.id, rating, comment.trim())
    setSent(true)
  }

  // После отправки планшет сам возвращается к начальному экрану для следующего гостя.
  useEffect(() => {
    if (!sent) return undefined
    const t = setTimeout(reset, 5000)
    return () => clearTimeout(t)
  }, [sent])

  let body
  if (!hotel || !form) {
    body = (
      <div className="guest-body guest-center">
        <h1>Форма не найдена</h1>
        <p>Проверьте ссылку на планшете.</p>
      </div>
    )
  } else if (!form.active) {
    body = (
      <div className="guest-body guest-center">
        <h1>Форма временно отключена</h1>
        <p>Сейчас отзывы в этом отеле не принимаются.</p>
      </div>
    )
  } else if (sent) {
    body = (
      <div className="guest-body guest-center">
        <span className="guest-check">
          <Check size={40} />
        </span>
        <h1>Спасибо за отзыв!</h1>
        <p>Мы передадим ваши слова команде отеля.</p>
      </div>
    )
  } else if (!emp) {
    body = (
      <div className="guest-body">
        <h1>{form.greeting}</h1>
        <p>Выберите сотрудника, чтобы оценить его работу</p>
        {staff.length === 0 && <p>Сотрудники для оценки пока не выбраны.</p>}
        <div className="guest-grid">
          {staff.map((e) => (
            <button key={e.id} type="button" className="guest-person" onClick={() => setEmp(e)}>
              <Avatar emp={e} size={84} />
              <b>
                {e.firstName} {e.lastName}
              </b>
              <span>{e.position}</span>
            </button>
          ))}
        </div>
      </div>
    )
  } else {
    body = (
      <div className="guest-body guest-center">
        <button type="button" className="guest-back" onClick={() => setEmp(null)}>
          <ArrowLeft size={18} />
          Выбрать другого сотрудника
        </button>
        <Avatar emp={emp} size={96} />
        <h1>
          {emp.firstName} {emp.lastName}
        </h1>
        <p>{emp.position}</p>

        <div className="guest-stars" role="radiogroup" aria-label="Оценка">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} из 5`} className={n <= rating ? 'on' : ''} onClick={() => setRating(n)}>
              <Star size={56} strokeWidth={1.4} fill={n <= rating ? 'currentColor' : 'none'} />
            </button>
          ))}
        </div>
        <div className="guest-label">{LABELS[rating] || 'Поставьте оценку'}</div>

        <textarea placeholder="Комментарий — по желанию" value={comment} onChange={(e) => setComment(e.target.value)} rows={3} />
        <button type="button" className="guest-send" disabled={!rating} onClick={send}>
          Отправить отзыв
        </button>
      </div>
    )
  }

  return (
    <div className="guest">
      <Link to="/reviews" className="guest-exit" title="Вернуться в демо">
        <X size={18} />
      </Link>
      <header className="guest-head">
        <img src="./logo-mbe.svg" alt="MBE Group" />
        <span>{hotel?.name}</span>
      </header>
      {body}
    </div>
  )
}
