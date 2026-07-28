// ===== Доменные типы прототипа КФ «Рейтинг ОМСУ» =====

export type RoleId = 'admin' | 'mef' | 'cio' | 'omsu';

export interface Role {
  id: RoleId;
  name: string;
  org: string;
  description: string;
}

/** Статус значения показателя ОМСУ */
export type OmsuStatus =
  | 'not_filled'   // не заполнен
  | 'draft'        // черновик (заполнен, не подписан)
  | 'pending_cio'  // подписан ЭЦП, на согласовании у ЦИО
  | 'approved'     // согласован ЦИО (изменение заблокировано)
  | 'returned';    // возвращён ЦИО на доработку

/** Статус собственного показателя ЦИО */
export type CioStatus =
  | 'not_filled'
  | 'draft'
  | 'pending_mef'  // подписан ЭЦП, на согласовании у МЭФ
  | 'approved'     // согласован МЭФ
  | 'returned';

export interface Direction {
  id: string;
  name: string;
}

export interface Cio {
  id: string;
  name: string;
  short: string;
}

export interface Municipality {
  id: string;
  name: string;
}

export interface Indicator {
  id: string;
  num: string;           // порядковый номер, напр. "4.2"
  name: string;
  directionId: string;
  cioId: string;         // отраслевой ЦИО, к которому привязан показатель
  unit: string;
  optimum: 'max' | 'min'; // что лучше: больше или меньше
  weight: number;
  formula: string;        // формула нормирования/расчёта
}

export interface OmsuValue {
  value: number | null;
  status: OmsuStatus;
  updatedAt: string | null;
  comment?: string;      // комментарий при возврате
  signedBy?: string;
}

export interface CioValue {
  value: number | null;
  status: CioStatus;
  updatedAt: string | null;
  comment?: string;
  signedBy?: string;
}

export type CampaignStatus = 'draft' | 'scheduled' | 'collecting' | 'completed';

export interface Campaign {
  name: string;
  period: string;
  status: CampaignStatus;
  startDate: string | null;   // дата запуска сбора
  deadlineOmsu: string;       // срок заполнения ОМСУ
  deadlineCio: string;        // срок согласования ЦИО
  deadlineMef: string;        // срок согласования МЭФ
  launchedAt: string | null;
}

export interface NotificationItem {
  id: number;
  at: string;
  text: string;
  forRoles: RoleId[];
}

export interface HistoryItem {
  at: string;
  actor: string;
  action: string;
}

export interface AppState {
  campaign: Campaign;
  indicators: Indicator[];
  omsuValues: Record<string, Record<string, OmsuValue>>; // munId -> indId -> value
  cioValues: Record<string, Record<string, CioValue>>;   // indId -> cioId -> собственное значение ЦИО по тому же показателю
  history: HistoryItem[];
  notifications: NotificationItem[];
  ratingMode: 'preview' | 'final';
  finalPublished: boolean;
}
