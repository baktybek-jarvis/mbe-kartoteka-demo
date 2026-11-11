// Демо-данные. Все сотрудники вымышленные.

// «Сегодня» зафиксировано, чтобы стаж и дни рождения в демо не плавали.
export const TODAY = new Date(2026, 10, 10)
export const TODAY_ISO = '2026-11-10'

// От чьего имени в демо действует каждая роль.
export const DEMO_USERS = { hr: 'Шаршеева Гульнара', gm: 'Иманалиев Тимур', head: 'Касымова Элнура', self: 'Сапарова Айдана' }

export const COMPANIES = [
  'Jannat Hotels & Resorts',
  'Sultan Hotels',
  'Центральный офис',
  'ТЦ «Ташрабат»',
  'Капитал плюс',
]

export const HOTELS = [
  { slug: 'koi-tash', name: 'Jannat Resort Koi-Tash', company: 'Jannat Hotels & Resorts' },
  { slug: 'osh', name: 'Jannat Resort Osh', company: 'Jannat Hotels & Resorts' },
  { slug: 'jalal-abad', name: 'Jannat Regency Jalal-Abad', company: 'Jannat Hotels & Resorts' },
  { slug: 'bishkek', name: 'Jannat Regency Bishkek', company: 'Jannat Hotels & Resorts' },
  { slug: 'sultan-bishkek', name: 'Sultan Bishkek', company: 'Sultan Hotels' },
  { slug: 'sultan-jalal-abad', name: 'Sultan Jalal-Abad', company: 'Sultan Hotels' },
  { slug: 'sultan-kyzyl-kia', name: 'Sultan Kyzyl-Kia', company: 'Sultan Hotels' },
]

export const STATUSES = {
  active: 'Активен',
  vacation: 'В отпуске',
  dismissed: 'Уволен',
}

export const ROLES = {
  hr: 'HR-администратор',
  gm: 'Генеральный менеджер',
  head: 'Руководитель службы',
  self: 'Сотрудник',
}

// Отель и служба, которыми в демо «управляют» роли ГМ и руководителя.
export const DEMO_SCOPE = {
  hotel: 'Jannat Resort Koi-Tash',
  dept: 'Служба приёма',
  selfId: 1,
  headId: 2,
}

const J = COMPANIES[0]
const S = COMPANIES[1]
const HQ = COMPANIES[2]
const TR = COMPANIES[3]
const KP = COMPANIES[4]

// [id, фамилия, имя, отчество, компания, отель, подразделение, должность,
//  статус, дата приёма, дата рождения, оформление, рейтинг, отзывов, аккаунт Б24]
const ROWS = [
  [1, 'Сапарова', 'Айдана', 'Бакытовна', J, HOTELS[0].name, 'Служба приёма', 'Старший администратор', 'active', '2024-06-15', '1998-11-12', 'Штат', 4.9, 41, false],
  [2, 'Касымова', 'Элнура', 'Маратовна', J, HOTELS[0].name, 'Служба приёма', 'Руководитель службы приёма', 'active', '2021-03-01', '1990-04-22', 'Штат', 4.8, 63, true],
  [3, 'Токтогулов', 'Бекзат', 'Нурланович', J, HOTELS[0].name, 'Ресторан', 'Официант', 'active', '2025-05-12', '2001-07-03', 'Штат', 4.6, 28, false],
  [4, 'Абдыкадырова', 'Жылдыз', 'Сагынбековна', J, HOTELS[0].name, 'Хозяйственная служба', 'Горничная', 'vacation', '2023-09-04', '1987-02-17', 'Штат', 4.7, 19, false],
  [5, 'Иманалиев', 'Тимур', 'Кубанычбекович', J, HOTELS[0].name, 'Администрация', 'Генеральный менеджер', 'active', '2019-02-11', '1982-09-30', 'Штат', null, 0, true],
  [6, 'Осмонова', 'Айгерим', 'Талантовна', J, HOTELS[3].name, 'СПА', 'Администратор СПА', 'active', '2024-01-22', '1996-12-05', 'Штат', 4.9, 34, false],
  [7, 'Жумабеков', 'Адилет', 'Азаматович', J, HOTELS[3].name, 'Кухня', 'Су-шеф', 'active', '2022-08-15', '1991-06-11', 'ИП', null, 0, false],
  [8, 'Маматова', 'Назгуль', 'Эркиновна', J, HOTELS[1].name, 'Служба приёма', 'Администратор', 'active', '2025-03-03', '1999-01-25', 'Штат', 4.5, 22, false],
  [9, 'Ташиев', 'Улан', 'Жолдошбекович', J, HOTELS[1].name, 'Служба безопасности', 'Старший смены', 'active', '2020-10-19', '1985-11-14', 'Штат', null, 0, false],
  [10, 'Садыкова', 'Мээрим', 'Алмазовна', J, HOTELS[2].name, 'Ресторан', 'Менеджер ресторана', 'active', '2022-04-04', '1993-03-08', 'Штат', 4.7, 37, true],
  [11, 'Эргешов', 'Нурсултан', 'Бакирович', J, HOTELS[2].name, 'Инженерная служба', 'Главный инженер', 'vacation', '2018-06-25', '1979-08-19', 'Штат', null, 0, true],
  [12, 'Алымкулова', 'Бегимай', 'Руслановна', S, HOTELS[4].name, 'Служба приёма', 'Администратор', 'active', '2026-02-09', '2002-05-29', 'Штат', 4.3, 12, false],
  [13, 'Кадыров', 'Эрлан', 'Мирланович', S, HOTELS[4].name, 'Администрация', 'Генеральный менеджер', 'active', '2021-11-01', '1984-10-02', 'Штат', null, 0, true],
  [14, 'Турдубаева', 'Сезим', 'Канатовна', S, HOTELS[5].name, 'Хозяйственная служба', 'Супервайзер', 'active', '2023-05-15', '1994-11-27', 'Штат', 4.6, 15, false],
  [15, 'Мамытов', 'Азиз', 'Темирбекович', S, HOTELS[6].name, 'Служба приёма', 'Администратор', 'active', '2025-09-01', '2000-02-14', 'ИП', 4.1, 9, false],
  [16, 'Шаршеева', 'Гульнара', 'Асановна', HQ, null, 'Управление персоналом', 'HR-менеджер', 'active', '2020-01-13', '1988-07-21', 'Штат', null, 0, true],
  [17, 'Бейшеналиев', 'Данияр', 'Омурбекович', HQ, null, 'Финансовый департамент', 'Финансовый аналитик', 'active', '2022-10-03', '1992-12-18', 'Штат', null, 0, true],
  [18, 'Исакова', 'Асель', 'Жаныбековна', HQ, null, 'Коммерческий департамент', 'Менеджер по продажам', 'active', '2023-07-17', '1995-09-09', 'Штат', null, 0, true],
  [19, 'Орозбаев', 'Кайрат', 'Сыргакович', TR, null, 'Администрация ТЦ', 'Управляющий', 'active', '2017-04-10', '1980-01-06', 'Штат', null, 0, true],
  [20, 'Темирова', 'Алина', 'Бакытбековна', TR, null, 'Арендный отдел', 'Менеджер по аренде', 'active', '2024-11-11', '1997-04-15', 'Штат', null, 0, false],
  [21, 'Сыдыков', 'Максат', 'Эмилевич', KP, null, 'Кредитный отдел', 'Кредитный специалист', 'active', '2023-02-20', '1993-06-30', 'Штат', null, 0, false],
  [22, 'Кенжебаева', 'Диана', 'Улановна', KP, null, 'Касса', 'Кассир', 'vacation', '2025-01-14', '1999-10-10', 'Штат', null, 0, false],
  [23, 'Асанов', 'Руслан', 'Таалайбекович', J, HOTELS[0].name, 'Ресторан', 'Бармен', 'dismissed', '2022-05-02', '1996-03-12', 'Штат', 4.4, 17, false],
  [25, 'Нурланов', 'Эмир', 'Кайратович', J, HOTELS[0].name, 'Служба приёма', 'Администратор', 'active', '2026-04-06', '2001-03-19', 'Штат', null, 0, false],
  [24, 'Байтикова', 'Чолпон', 'Нурбековна', S, HOTELS[5].name, 'Ресторан', 'Официант', 'active', '2026-06-01', '2003-08-08', 'Штат', 4.8, 8, false],
]

// Собирает запись сотрудника с производными полями (полное и короткое имя).
export function makeEmployee(e) {
  return {
    ...e,
    fullName: [e.lastName, e.firstName, e.patronymic].filter(Boolean).join(' '),
    shortName: `${e.lastName} ${e.firstName}`,
  }
}

export const EMPLOYEES = ROWS.map(
  ([id, lastName, firstName, patronymic, company, hotel, dept, position, status, hired, birth, form, rating, reviews, b24]) =>
    makeEmployee({
      id, lastName, firstName, patronymic, company, hotel, dept, position, status,
      hired, birth, form, rating, reviews, b24,
      phone: `+996 55${id % 10} ${String(120 + id * 37).slice(0, 3)} ${String(400 + id * 13).slice(0, 3)}`,
      oneCId: `MBE-${String(400 + id).padStart(5, '0')}`,
    }),
)

export const getEmployee = (id, list = EMPLOYEES) => list.find((e) => e.id === Number(id))

// ───── форматирование ─────

const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']

export function formatDate(iso, withYear = true) {
  const d = new Date(iso)
  return `${d.getDate()} ${MONTHS[d.getMonth()]}${withYear ? ` ${d.getFullYear()}` : ''}`
}

export function shortDate(iso) {
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

function plural(n, one, few, many) {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few
  return many
}

export function tenure(iso) {
  const d = new Date(iso)
  let months = (TODAY.getFullYear() - d.getFullYear()) * 12 + (TODAY.getMonth() - d.getMonth())
  if (TODAY.getDate() < d.getDate()) months -= 1
  const y = Math.floor(months / 12)
  const m = months % 12
  const parts = []
  if (y) parts.push(`${y} ${plural(y, 'год', 'года', 'лет')}`)
  if (m || !y) parts.push(`${m} мес.`)
  return parts.join(' ')
}

export function daysToBirthday(iso) {
  const d = new Date(iso)
  let next = new Date(TODAY.getFullYear(), d.getMonth(), d.getDate())
  if (next < TODAY) next = new Date(TODAY.getFullYear() + 1, d.getMonth(), d.getDate())
  return Math.round((next - TODAY) / 86400000)
}

export const pluralReviews = (n) => plural(n, 'отзыв', 'отзыва', 'отзывов')
export const pluralEmployees = (n) => plural(n, 'сотрудник', 'сотрудника', 'сотрудников')
export const pluralDays = (n) => plural(n, 'день', 'дня', 'дней')

// ───── детали карточки ─────

export function getManagers(emp, list = EMPLOYEES) {
  const head = list.find(
    (e) => e.id !== emp.id && e.hotel === emp.hotel && e.dept === emp.dept && /Руководитель|Менеджер ресторана|Главный/.test(e.position),
  )
  const gm = list.find((e) => e.id !== emp.id && emp.hotel && e.hotel === emp.hotel && e.position === 'Генеральный менеджер')
  return [head, gm].filter(Boolean)
}

const RICH = {
  1: {
    vacationNext: '14 – 27 декабря 2026',
    vacationLeft: 11,
    education: [
      { title: 'Кыргызский экономический университет', note: 'Туризм и гостеприимство · заочно, 3 курс' },
      { title: 'Колледж сервиса и туризма, Бишкек', note: 'Гостиничное дело · 2019' },
    ],
    languages: [
      { title: 'Кыргызский', note: 'Родной' },
      { title: 'Русский', note: 'Свободно' },
      { title: 'Английский', note: 'B1 — средний' },
    ],
    prevWork: [
      { title: 'Гостевой дом «Ала-Тоо», Бишкек', note: 'Администратор · 2022 – 2024' },
      { title: 'Кафе «Арча», Чолпон-Ата', note: 'Официант, сезон · 2021 – 2022' },
    ],
    family: 'Замужем',
    hobbies: 'Горные походы, фотография',
    formStatus: 'approved',
    career: [
      { date: '2026-10-14', type: 'Повышение', position: 'Старший администратор', dept: 'Служба приёма', note: 'Переведена по итогам сезона: наставляет двух новых администраторов.' },
      { date: '2024-09-15', type: 'Перевод', position: 'Администратор', dept: 'Служба приёма', note: 'Испытательный срок пройден.' },
      { date: '2024-06-15', type: 'Приём', position: 'Администратор (стажёр)', dept: 'Служба приёма', note: '' },
    ],
    characteristics: [
      {
        version: 2, status: 'approved', author: 'Касымова Элнура', date: '2026-10-07', approvedBy: 'Иманалиев Тимур', approvedAt: '2026-10-10',
        strengths: 'Уверенно ведёт групповые заезды до 40 гостей. Спокойно разрешает спорные ситуации на стойке, гости часто отмечают её по имени.',
        achievements: 'В августе без ошибок оформила заезд конференции на 38 человек. Три месяца подряд без расхождений по кассе.',
        improve: 'Продажа дополнительных услуг на стойке: СПА, трансфер, экскурсии.',
        readiness: 'Готова к должности руководителя смены в течение года при выполнении цели по дополнительным продажам.',
      },
      {
        version: 1, status: 'approved', author: 'Касымова Элнура', date: '2025-06-20', approvedBy: 'Иманалиев Тимур', approvedAt: '2025-06-24',
        strengths: 'Быстро освоила систему бронирования, внимательна к деталям.',
        achievements: 'Прошла испытательный срок без замечаний.',
        improve: 'Английский язык, работа с групповыми заездами.',
        readiness: 'Рассматривается на должность старшего администратора.',
      },
    ],
    development: {
      text: 'В кадровом резерве на должность «Руководитель смены службы приёма» с октября 2026. Рекомендовано: тренинг по дополнительным продажам (ноябрь 2026), английский до уровня B2 (до июня 2027).',
      author: 'Шаршеева Гульнара',
      date: '2026-10-12',
    },
    reviewList: [
      { date: '2026-11-08', rating: 5, text: 'Помогла с поздним заселением и трансфером, всё быстро и вежливо.' },
      { date: '2026-11-03', rating: 5, text: 'Подсказала, куда съездить на день, заказала такси.' },
      { date: '2026-10-27', rating: 5, text: '' },
      { date: '2026-10-19', rating: 4, text: 'Заселение заняло дольше, чем ждали, но извинились и угостили чаем.' },
      { date: '2026-10-11', rating: 5, text: 'Очень внимательная, запомнила наши пожелания с прошлого визита.' },
    ],
    monthRating: 5.0,
    monthReviews: 2,
  },
}

export function getDetails(emp) {
  if (RICH[emp.id]) return RICH[emp.id]
  const hasReviews = emp.rating != null
  return {
    vacationNext: emp.status === 'vacation' ? 'Сейчас в отпуске до 17 ноября 2026' : 'Не запланирован',
    vacationLeft: 8 + (emp.id % 14),
    education: [],
    languages: [],
    prevWork: [],
    family: null,
    hobbies: null,
    // В карточку сведения попадают только из утверждённого листка.
    ...(formStatusOf(emp) === 'approved' ? SAMPLE_ANSWERS : {}),
    formStatus: formStatusOf(emp),
    career: [{ date: emp.hired, type: 'Приём', position: emp.position, dept: emp.dept, note: '' }],
    characteristics: [],
    development: null,
    reviewList: hasReviews
      ? [
          { date: '2026-11-05', rating: 5, text: 'Спасибо за внимательное отношение.' },
          { date: '2026-10-22', rating: Math.round(emp.rating), text: '' },
        ]
      : [],
    monthRating: hasReviews ? emp.rating : null,
    monthReviews: hasReviews ? 1 : 0,
  }
}

export const FORM_STATUS = {
  none: { label: 'Ссылка не выдана', tone: 'muted' },
  waiting: { label: 'Ожидает заполнения', tone: 'muted' },
  review: { label: 'На проверке', tone: 'warn' },
  fix: { label: 'Требует исправления', tone: 'bad' },
  approved: { label: 'Утверждена', tone: 'ok' },
}

// ───── личные листки ─────

const FORM_OVERRIDES = { 25: 'none', 1: 'approved', 2: 'approved', 5: 'approved', 8: 'fix', 10: 'approved', 13: 'approved', 16: 'approved', 17: 'approved', 19: 'approved' }

export function formStatusOf(emp) {
  if (FORM_OVERRIDES[emp.id]) return FORM_OVERRIDES[emp.id]
  return emp.id % 3 === 0 ? 'review' : 'waiting'
}

const SAMPLE_ANSWERS = {
  education: [{ title: 'Бишкекский государственный университет', note: 'Менеджмент · 2018' }],
  languages: [
    { title: 'Кыргызский', note: 'Родной' },
    { title: 'Русский', note: 'Свободно' },
    { title: 'Английский', note: 'A2 — базовый' },
  ],
  prevWork: [{ title: 'Гостиница «Достук», Бишкек', note: 'Администратор · 2020 – 2023' }],
  family: 'Не женат / не замужем',
  hobbies: 'Волейбол, чтение',
}

export function getFormAnswers(emp) {
  const rich = RICH[emp.id]
  return rich
    ? { education: rich.education, languages: rich.languages, prevWork: rich.prevWork, family: rich.family, hobbies: rich.hobbies }
    : SAMPLE_ANSWERS
}

// Ссылка на анкету живёт 48 часов; часть ссылок в демо уже истекла.
export const FORMS = EMPLOYEES.filter((e) => e.status !== 'dismissed').map((e) => {
  const status = formStatusOf(e)
  const hoursLeft = status === 'waiting' ? (e.id % 5 === 0 ? 0 : ((e.id * 7) % 46) + 2) : null
  return {
    id: e.id,
    emp: e,
    status,
    hoursLeft,
    updated: `2026-11-${String(10 - (e.id % 9)).padStart(2, '0')}`,
    fixNote: status === 'fix' ? 'Уточните название учебного заведения и год окончания.' : '',
  }
})

// ───── характеристики ─────

export const CHAR_STATUS = {
  draft: { label: 'Черновик', tone: 'muted' },
  pending: { label: 'На утверждении', tone: 'warn' },
  approved: { label: 'Утверждена', tone: 'ok' },
}

export const CHARACTERISTICS = [
  ...RICH[1].characteristics.map((c) => ({ ...c, id: `1-${c.version}`, empId: 1 })),
  {
    id: '3-1', empId: 3, version: 1, status: 'pending', author: 'Асанова Айнура', date: '2026-11-06',
    strengths: 'Быстро обслуживает большие столы, хорошо знает меню и винную карту.',
    achievements: 'Лучший средний чек смены в октябре.',
    improve: 'Английский язык для работы с иностранными гостями.',
    readiness: 'Через полгода можно рассматривать на старшего официанта.',
  },
  {
    id: '4-1', empId: 4, version: 1, status: 'draft', author: 'Турсунова Гулзат', date: '2026-11-09',
    strengths: 'Аккуратность, стабильно высокое качество уборки номеров.',
    achievements: '',
    improve: '',
    readiness: '',
  },
  {
    id: '6-1', empId: 6, version: 1, status: 'approved', author: 'Мусаева Жаркын', date: '2026-09-18', approvedBy: 'Алиев Бакыт', approvedAt: '2026-09-22',
    strengths: 'Внимательна к гостям, уверенно продаёт курсы процедур.',
    achievements: 'Рост повторных записей в СПА на треть за квартал.',
    improve: 'Планирование загрузки мастеров.',
    readiness: 'Готова к должности старшего администратора СПА.',
  },
  {
    id: '14-1', empId: 14, version: 1, status: 'pending', author: 'Жолдошева Нурзат', date: '2026-11-04',
    strengths: 'Хорошо организует смену, быстро закрывает замечания гостей.',
    achievements: 'Сократила время подготовки номера к заселению.',
    improve: 'Обучение новых горничных по стандартам.',
    readiness: 'Кандидат на руководителя хозяйственной службы.',
  },
]

// ───── отзывы гостей ─────

// [сотрудник, дата, оценка, текст]
const REVIEW_ROWS = [
  [1, '2026-11-08', 5, 'Помогла с поздним заселением и трансфером, всё быстро и вежливо.'],
  [3, '2026-11-08', 2, 'Долго ждали заказ, официант забыл про напитки.'],
  [6, '2026-11-07', 5, 'Отличный сервис в СПА, всё объяснили и подобрали процедуру.'],
  [12, '2026-11-07', 4, ''],
  [10, '2026-11-06', 5, 'Ужин был организован безупречно.'],
  [8, '2026-11-06', 5, ''],
  [14, '2026-11-05', 5, 'Номер идеально чистый, спасибо.'],
  [15, '2026-11-05', 1, 'Не смогли найти нашу бронь, заселение заняло больше часа.'],
  [2, '2026-11-04', 5, 'Решила вопрос с номером за пять минут.'],
  [24, '2026-11-04', 5, 'Очень приветливая девушка.'],
  [1, '2026-11-03', 5, 'Подсказала, куда съездить на день, заказала такси.'],
  [4, '2026-11-02', 4, 'Всё хорошо, но полотенца принесли не сразу.'],
  [3, '2026-11-01', 5, 'Посоветовал отличное блюдо.'],
  [6, '2026-10-30', 5, ''],
  [10, '2026-10-29', 4, 'Вкусно, но в зале было шумно.'],
  [8, '2026-10-28', 3, 'Заселение прошло нормально, без особого внимания.'],
  [12, '2026-10-27', 5, 'Спасибо за ранний заезд.'],
  [1, '2026-10-27', 5, ''],
]

export const REVIEWS = REVIEW_ROWS.map(([empId, date, rating, text], i) => ({ id: i + 1, emp: getEmployee(empId), date, rating, text }))

export const REVIEW_FORMS = HOTELS.map((h, i) => ({
  ...h,
  title: `Оцените сотрудника · ${h.name}`,
  greeting: 'Кто помог вам сегодня?',
  active: i !== 6,
  staffIds: EMPLOYEES.filter((e) => e.hotel === h.name && e.status !== 'dismissed' && e.rating != null).map((e) => e.id),
}))

// ───── внешний доступ и роли ─────

export const EXTERNAL_ACCESS = EMPLOYEES.filter((e) => !e.b24 && e.status !== 'dismissed').map((e) => ({
  id: e.id,
  emp: e,
  login: `mbe${1000 + e.id * 7}`,
  blocked: e.id === 15,
  lastLogin: e.id % 4 === 0 ? null : `2026-11-${String(10 - (e.id % 8)).padStart(2, '0')}`,
}))

export const ROLE_MATRIX = [
  { role: 'HR-администратор', scope: 'Все сотрудники и подразделения холдинга в пределах назначенных прав', actions: 'Создание, изменение, анкеты, архив, права' },
  { role: 'Генеральный менеджер', scope: 'Сотрудники своего отеля', actions: 'Просмотр и утверждение характеристик' },
  { role: 'Директор по отелям', scope: 'Сеть отелей', actions: 'Просмотр разрешённых данных' },
  { role: 'Руководитель службы', scope: 'Подчинённые подразделения', actions: 'Просмотр и подготовка характеристик' },
  { role: 'Обычный сотрудник', scope: 'Только собственная карточка', actions: 'Просмотр своей информации, заполнение своих форм' },
]

export const FIELD_RIGHTS = [
  { group: 'Основные кадровые', edit: '1С; HR в пределах прав', view: 'HR, ГМ, директор, руководитель, сам сотрудник' },
  { group: 'Полный личный листок', edit: 'Сотрудник по ссылке; подтверждает и изменяет HR', view: 'Только HR' },
  { group: 'Пять сведений из листка', edit: 'Сотрудник; утверждает HR', view: 'В пределах прав на карточку' },
  { group: 'Карьера', edit: '1С / HR; предварительная анкета сотрудника', view: 'В пределах полномочий' },
  { group: 'Характеристика', edit: 'Руководитель; утверждает ГМ', view: 'HR, ГМ, уполномоченные руководители; сотруднику — после согласования' },
  { group: 'Развитие и резерв', edit: 'HR', view: 'HR и назначенные руководители' },
  { group: 'Отзыв и оценка', edit: 'Гость, через форму', view: 'В пределах прав; гость чужие отзывы не видит' },
  { group: 'Формы отзывов', edit: 'HR', view: 'HR, уполномоченные роли' },
]
