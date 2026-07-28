import type {
  Role, Direction, Cio, Municipality, Indicator,
  OmsuValue, CioValue, AppState,
} from './types';

export const ROLES: Role[] = [
  {
    id: 'admin',
    name: 'Администратор КФ',
    org: 'ЦИОГВ, ГО МО',
    description: 'Настройка показателей, формул и сводных форм рейтинга по данным МЭФ',
  },
  {
    id: 'mef',
    name: 'МЭФ (куратор / согласующий)',
    org: 'Министерство экономики и финансов МО',
    description: 'Запуск сбора, контроль сроков, согласование данных ЦИО, предварительный и итоговый рейтинг',
  },
  {
    id: 'cio',
    name: 'Отраслевой ЦИО',
    org: 'Министерство ЖКХ Московской области',
    description: 'Согласование показателей ОМСУ своей отрасли, внесение собственных показателей',
  },
  {
    id: 'omsu',
    name: 'ОМСУ',
    org: 'г.о. Балашиха',
    description: 'Заполнение показателей, подписание ЭЦП, отправка на согласование отраслевому ЦИО',
  },
];

export const DIRECTIONS: Direction[] = [
  { id: 'd1', name: 'Жизненное пространство' },
  { id: 'd2', name: 'Социальная сфера' },
  { id: 'd3', name: 'Экономика и финансы' },
  { id: 'd4', name: 'Экология и безопасность' },
];

export const CIOS: Cio[] = [
  { id: 'c1', name: 'Министерство ЖКХ Московской области', short: 'МинЖКХ' },
  { id: 'c2', name: 'Министерство транспорта и дорожной инфраструктуры МО', short: 'Минтранс' },
  { id: 'c3', name: 'Министерство здравоохранения МО', short: 'Минздрав' },
  { id: 'c4', name: 'Министерство образования МО', short: 'Минобр' },
  { id: 'c5', name: 'Министерство экономики и финансов МО (отраслевой блок)', short: 'Минэкономики' },
  { id: 'c6', name: 'Министерство экологии и природопользования МО', short: 'Минэкологии' },
];

export const CURRENT_CIO = 'c1';      // текущий отраслевой ЦИО в демо
export const CURRENT_OMSU = 'm1';     // текущее ОМСУ в демо (Балашиха)

export const MUNICIPALITIES: Municipality[] = [
  { id: 'm1', name: 'Балашиха' },
  { id: 'm2', name: 'Химки' },
  { id: 'm3', name: 'Подольск' },
  { id: 'm4', name: 'Красногорск' },
  { id: 'm5', name: 'Мытищи' },
  { id: 'm6', name: 'Одинцовский' },
  { id: 'm7', name: 'Люберцы' },
  { id: 'm8', name: 'Королёв' },
  { id: 'm9', name: 'Домодедово' },
  { id: 'm10', name: 'Сергиево-Посадский' },
  { id: 'm11', name: 'Раменский' },
  { id: 'm12', name: 'Долгопрудный' },
];

export const INDICATORS: Indicator[] = [
  { id: 'i1', num: '1.1', name: 'Собираемость платежей ЖКХ', directionId: 'd1', cioId: 'c1', unit: '%', optimum: 'max', weight: 1, formula: 'Σ поступлений / Σ начислений × 100' },
  { id: 'i2', num: '1.2', name: 'Доля МКД, соответствующих стандарту содержания', directionId: 'd1', cioId: 'c1', unit: '%', optimum: 'max', weight: 1, formula: 'N мкд соотв. / N мкд всего × 100' },
  { id: 'i3', num: '1.3', name: 'Доля дорог в нормативном состоянии', directionId: 'd1', cioId: 'c2', unit: '%', optimum: 'max', weight: 1, formula: 'L норм. / L всего × 100' },
  { id: 'i4', num: '2.1', name: 'Средний балл ЕГЭ по муниципалитету', directionId: 'd2', cioId: 'c4', unit: 'балл', optimum: 'max', weight: 1, formula: 'Σ баллов / N выпускников' },
  { id: 'i5', num: '2.2', name: 'Доля дефицитных мест в ДОУ', directionId: 'd2', cioId: 'c4', unit: '%', optimum: 'min', weight: 1, formula: 'N дефицит / N потребность × 100' },
  { id: 'i6', num: '2.3', name: 'Смертность населения на 1000 чел.', directionId: 'd2', cioId: 'c3', unit: 'промилле', optimum: 'min', weight: 1, formula: 'N умерших / N населения × 1000' },
  { id: 'i7', num: '2.4', name: 'Обеспеченность врачами на 10 тыс. населения', directionId: 'd2', cioId: 'c3', unit: 'чел.', optimum: 'max', weight: 1, formula: 'N врачей / N населения × 10000' },
  { id: 'i8', num: '3.1', name: 'Темп роста инвестиций в основной капитал', directionId: 'd3', cioId: 'c5', unit: '%', optimum: 'max', weight: 1, formula: 'I отч. / I баз. × 100 − 100' },
  { id: 'i9', num: '3.2', name: 'Доля собственных доходов бюджета', directionId: 'd3', cioId: 'c5', unit: '%', optimum: 'max', weight: 1, formula: 'Д собств. / Д всего × 100' },
  { id: 'i10', num: '4.1', name: 'Доля ликвидированных несанкционированных свалок', directionId: 'd4', cioId: 'c6', unit: '%', optimum: 'max', weight: 1, formula: 'N ликв. / N выявл. × 100' },
  { id: 'i11', num: '4.2', name: 'Доля направленных на переработку ТКО', directionId: 'd4', cioId: 'c6', unit: '%', optimum: 'max', weight: 1, formula: 'V перераб. / V образ. × 100' },
  { id: 'i12', num: '4.3', name: 'Уровень уличной преступности на 10 тыс. чел.', directionId: 'd4', cioId: 'c6', unit: 'случаев', optimum: 'min', weight: 1, formula: 'N преступл. / N населения × 10000' },
];

// --- Генерация начальных значений ОМСУ (детерминированный "рандом") ---
function seedRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const RANGES: Record<string, [number, number]> = {
  i1: [78, 99], i2: [55, 98], i3: [60, 96], i4: [52, 74], i5: [0, 22],
  i6: [9, 15], i7: [18, 42], i8: [-5, 25], i9: [45, 88], i10: [60, 100],
  i11: [8, 45], i12: [40, 120],
};

/** статусы ОМСУ по умолчанию для "фоновых" муниципалитетов */
const STATUS_POOL: OmsuValue['status'][] = [
  'approved', 'approved', 'approved', 'pending_cio', 'pending_cio', 'draft', 'not_filled',
];

function buildOmsuValues(): AppState['omsuValues'] {
  const res: AppState['omsuValues'] = {};
  const rnd = seedRand(42);
  MUNICIPALITIES.forEach((m, mi) => {
    res[m.id] = {};
    INDICATORS.forEach((ind, ii) => {
      const [lo, hi] = RANGES[ind.id];
      const v = Math.round((lo + rnd() * (hi - lo)) * 100) / 100;
      if (m.id === CURRENT_OMSU) {
        // текущее ОМСУ — часть показателей уже в разных статусах для демонстрации
        const demo: Record<string, OmsuValue> = {
          i1: { value: 91.4, status: 'approved', updatedAt: '24.07.2026 11:20', signedBy: 'Иванова А.П. (ЭЦП)' },
          i2: { value: 83.2, status: 'pending_cio', updatedAt: '25.07.2026 09:05', signedBy: 'Иванова А.П. (ЭЦП)' },
          i3: { value: 77.6, status: 'returned', updatedAt: '25.07.2026 14:40', comment: 'Уточните методику: протяжённость по актам КОМОС отличается от паспорта дорог', signedBy: 'Иванова А.П. (ЭЦП)' },
          i4: { value: 63.5, status: 'draft', updatedAt: '26.07.2026 10:12' },
        };
        res[m.id][ind.id] = demo[ind.id] ?? { value: null, status: 'not_filled', updatedAt: null };
      } else {
        const st = STATUS_POOL[(mi * 3 + ii * 5) % STATUS_POOL.length];
        res[m.id][ind.id] = st === 'not_filled'
          ? { value: null, status: st, updatedAt: null }
          : { value: v, status: st, updatedAt: `${20 + ((mi + ii) % 6)}.07.2026 ${9 + (ii % 8)}:${10 + mi}` };
      }
    });
  });
  return res;
}

/** Собственные значения ЦИО по тем же показателям, что заполняют ОМСУ (по своей отрасли) */
function buildCioValues(): AppState['cioValues'] {
  const res: AppState['cioValues'] = {};
  const rnd = seedRand(7);
  INDICATORS.forEach((ind) => {
    res[ind.id] = {};
    if (ind.cioId === CURRENT_CIO) {
      res[ind.id][ind.cioId] = { value: null, status: 'not_filled', updatedAt: null };
    } else {
      const [lo, hi] = RANGES[ind.id];
      const v = Math.round((lo + rnd() * (hi - lo)) * 100) / 100;
      const st: CioValue['status'] = rnd() > 0.5 ? 'approved' : 'pending_mef';
      res[ind.id][ind.cioId] = { value: v, status: st, updatedAt: '23.07.2026 15:30' };
    }
  });
  return res;
}

export const INITIAL_STATE: AppState = {
  campaign: {
    name: 'Рейтинг ОМСУ',
    period: '3 квартал 2026',
    status: 'collecting',
    startDate: '2026-07-20',
    deadlineOmsu: '2026-07-31',
    deadlineCio: '2026-08-07',
    deadlineMef: '2026-08-14',
    launchedAt: '20.07.2026 09:00',
  },
  indicators: INDICATORS,
  omsuValues: buildOmsuValues(),
  cioValues: buildCioValues(),
  history: [
    { at: '15.07.2026 10:00', actor: 'МЭФ', action: 'Передан перечень показателей и формулы расчёта рейтинга на 3 квартал 2026' },
    { at: '16.07.2026 12:30', actor: 'Администратор КФ', action: 'Настроены формы сбора и расчёт сводных форм рейтинга' },
    { at: '17.07.2026 09:15', actor: 'Куратор МЭФ', action: 'Установлена дата запуска сбора: 20.07.2026' },
    { at: '20.07.2026 09:00', actor: 'КФ (автоматически)', action: 'Разосланы уведомления и формы: 12 ОМСУ, 6 ЦИО' },
  ],
  notifications: [
    { id: 1, at: '20.07.2026 09:00', text: 'Начат сбор данных «Рейтинг ОМСУ — 3 квартал 2026». Срок заполнения — 31.07.2026', forRoles: ['omsu', 'cio', 'mef'] },
    { id: 2, at: '25.07.2026 14:40', text: 'Показатель 1.3 возвращён ЦИО на доработку (г.о. Балашиха)', forRoles: ['omsu'] },
  ],
  ratingMode: 'preview',
  finalPublished: false,
};

export const OMSU_STATUS_META: Record<OmsuValue['status'], { label: string; color: string; bg: string }> = {
  not_filled: { label: 'Не заполнен', color: '#6b7280', bg: '#f3f4f6' },
  draft: { label: 'Черновик', color: '#1d4ed8', bg: '#dbeafe' },
  pending_cio: { label: 'На согласовании у ЦИО', color: '#b45309', bg: '#fef3c7' },
  approved: { label: 'Согласован ЦИО', color: '#15803d', bg: '#dcfce7' },
  returned: { label: 'Возвращён на доработку', color: '#b91c1c', bg: '#fee2e2' },
};

export const CIO_STATUS_META: Record<CioValue['status'], { label: string; color: string; bg: string }> = {
  not_filled: { label: 'Не заполнен', color: '#6b7280', bg: '#f3f4f6' },
  draft: { label: 'Черновик', color: '#1d4ed8', bg: '#dbeafe' },
  pending_mef: { label: 'На согласовании у МЭФ', color: '#b45309', bg: '#fef3c7' },
  approved: { label: 'Согласован МЭФ', color: '#15803d', bg: '#dcfce7' },
  returned: { label: 'Возвращён на доработку', color: '#b91c1c', bg: '#fee2e2' },
};
