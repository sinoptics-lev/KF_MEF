import { useState } from 'react';
import { StoreProvider, useStore } from '@/lib/store';
import { ROLES } from '@/lib/data';
import type { RoleId } from '@/lib/types';
import { Overview } from '@/pages/Overview';
import { Setup } from '@/pages/Setup';
import { OmsuForm } from '@/pages/OmsuForm';
import { CioWorkspace } from '@/pages/CioWorkspace';
import { MefWorkspace } from '@/pages/MefWorkspace';
import { RatingView } from '@/pages/RatingView';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bell, Landmark, UserRound } from 'lucide-react';

type PageId = 'overview' | 'setup' | 'omsu' | 'cio' | 'mef' | 'rating';

const NAV: Record<RoleId, { id: PageId; label: string }[]> = {
  admin: [
    { id: 'overview', label: 'Обзор сбора' },
    { id: 'setup', label: 'Настройка рейтинга' },
    { id: 'rating', label: 'Рейтинг' },
  ],
  mef: [
    { id: 'overview', label: 'Обзор сбора' },
    { id: 'mef', label: 'Управление и согласование' },
    { id: 'rating', label: 'Рейтинг' },
  ],
  cio: [
    { id: 'overview', label: 'Обзор сбора' },
    { id: 'cio', label: 'Рабочее место ЦИО' },
  ],
  omsu: [
    { id: 'overview', label: 'Обзор сбора' },
    { id: 'omsu', label: 'Форма ОМСУ' },
  ],
};

const DEFAULT_PAGE: Record<RoleId, PageId> = {
  admin: 'setup',
  mef: 'mef',
  cio: 'cio',
  omsu: 'omsu',
};

function Shell() {
  const { state } = useStore();
  const [role, setRole] = useState<RoleId>('admin');
  const [page, setPage] = useState<PageId>('setup');

  const roleInfo = ROLES.find((r) => r.id === role)!;
  const notifs = state.notifications.filter((n) => n.forRoles.includes(role)).slice(-8).reverse();

  const switchRole = (r: RoleId) => {
    setRole(r);
    setPage(DEFAULT_PAGE[r]);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Шапка в стиле ГАС "Управление" МО */}
      <header className="bg-gradient-to-r from-[#1e5c8f] via-[#2a6ea6] to-[#3a83bd] text-white shadow">
        <div className="mx-auto max-w-[1400px] px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 shrink-0">
              <Landmark className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold leading-tight truncate">
                ГАС «Управление» МО · Конструктор форм
              </div>
              <div className="text-xs text-white/80">
                Прототип модуля «Формирование рейтинга ОМСУ» · служба техподдержки: support.mosreg.ru
              </div>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <button className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/15 hover:bg-white/25">
                  <Bell className="h-5 w-5" />
                  {notifs.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold">
                      {notifs.length}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-0" align="end">
                <div className="border-b px-3 py-2 text-sm font-medium">Уведомления</div>
                <ul className="max-h-72 overflow-auto">
                  {notifs.length === 0 && <li className="px-3 py-4 text-sm text-muted-foreground">Нет уведомлений</li>}
                  {notifs.map((n) => (
                    <li key={n.id} className="border-b px-3 py-2 text-sm last:border-0">
                      <div className="text-xs text-muted-foreground">{n.at}</div>
                      {n.text}
                    </li>
                  ))}
                </ul>
              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-2 rounded-md bg-white/10 px-2 py-1">
              <UserRound className="h-4 w-4" />
              <Select value={role} onValueChange={(v) => switchRole(v as RoleId)}>
                <SelectTrigger className="h-8 w-[240px] border-0 bg-transparent text-white focus:ring-0 [&>span]:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Навигация */}
        <div className="bg-[#16486f]/60">
          <div className="mx-auto max-w-[1400px] px-4 flex gap-1">
            {NAV[role].map((item) => (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  page === item.id
                    ? 'border-white text-white'
                    : 'border-transparent text-white/70 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Контекст роли */}
      <div className="mx-auto max-w-[1400px] px-4 py-2">
        <div className="rounded-md bg-white border px-3 py-2 text-xs text-muted-foreground flex flex-wrap gap-x-4">
          <span><b className="text-slate-700">{roleInfo.name}</b> · {roleInfo.org}</span>
          <span>{roleInfo.description}</span>
        </div>
      </div>

      <main className="mx-auto max-w-[1400px] px-4 pb-10">
        {page === 'overview' && <Overview role={role} />}
        {page === 'setup' && <Setup />}
        {page === 'omsu' && <OmsuForm />}
        {page === 'cio' && <CioWorkspace />}
        {page === 'mef' && <MefWorkspace goRating={() => setPage('rating')} />}
        {page === 'rating' && <RatingView />}
      </main>

      <footer className="border-t bg-white py-3">
        <div className="mx-auto max-w-[1400px] px-4 text-xs text-muted-foreground">
          Прототип доработки ИС «Конструктор форм» — модуль формирования рейтинга ОМСУ. Данные демонстрационные.
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
