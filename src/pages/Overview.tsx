import type { ReactElement } from 'react';
import { useStore } from '@/lib/store';
import { MUNICIPALITIES, DIRECTIONS, CIOS, CURRENT_OMSU, CURRENT_CIO } from '@/lib/data';
import type { RoleId } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, Circle, Clock, FileSignature, Info } from 'lucide-react';

const STAGES: { n: number; actor: string; text: string }[] = [
  { n: 1, actor: 'МЭФ', text: 'Передаёт перечень показателей и формулы расчёта рейтинга на отчётный период. Каждый показатель привязан к отраслевому ЦИО' },
  { n: 2, actor: 'Администратор КФ', text: 'Настраивает формы сбора и расчёт сводных форм для формирования рейтинга' },
  { n: 3, actor: 'Куратор МЭФ', text: 'Устанавливает дату запуска сбора данных и контрольные сроки этапов' },
  { n: 4, actor: 'КФ (автоматически)', text: 'В указанную дату рассылает уведомления о начале сбора и формы для заполнения' },
  { n: 5, actor: 'ОМСУ', text: 'Заполняют показатели, подписывают ЭЦП и отправляют на согласование отраслевому ЦИО. До согласования — возможен отзыв на изменение и повторная отправка' },
  { n: 6, actor: 'Отраслевой ЦИО', text: 'Согласовывает данные ОМСУ своей отрасли. После согласования изменение показателя ОМСУ блокируется' },
  { n: 7, actor: 'Отраслевой ЦИО', text: 'Вносит собственные показатели (отдельно от ОМСУ), подписывает ЭЦП' },
  { n: 8, actor: 'ЦИО → МЭФ', text: 'Подписанные данные ЦИО направляются на согласование в МЭФ. До согласования ЦИО может отозвать показатель и отправить повторно' },
  { n: 9, actor: 'КФ (автоматически)', text: 'После согласования всех данных рассчитывается итоговый сводный рейтинг' },
  { n: 10, actor: 'Куратор МЭФ', text: 'Формирует предварительный рейтинг по введённым (согласованным и несогласованным) данным в любой момент сбора' },
];

const STATUS_ICON: Record<string, ReactElement> = {
  not_filled: <Circle className="h-4 w-4 text-gray-300" />,
  draft: <Clock className="h-4 w-4 text-blue-500" />,
  pending_cio: <FileSignature className="h-4 w-4 text-amber-500" />,
  approved: <CheckCircle2 className="h-4 w-4 text-green-600" />,
  returned: <Circle className="h-4 w-4 text-red-500 fill-red-100" />,
};

const CAMPAIGN_BADGE: Record<string, { label: string; cls: string }> = {
  draft: { label: 'Подготовка', cls: 'bg-gray-100 text-gray-700' },
  scheduled: { label: 'Запланирован', cls: 'bg-blue-100 text-blue-700' },
  collecting: { label: 'Идёт сбор', cls: 'bg-amber-100 text-amber-800' },
  completed: { label: 'Завершён', cls: 'bg-green-100 text-green-700' },
};

export function Overview({ role }: { role: RoleId }) {
  const { state } = useStore();

  // Область видимости: ОМСУ — только своё ОМСУ; ЦИО — только показатели своей отрасли
  const scopeMuns = role === 'omsu' ? MUNICIPALITIES.filter((m) => m.id === CURRENT_OMSU) : MUNICIPALITIES;
  const scopeInds = role === 'cio' ? state.indicators.filter((i) => i.cioId === CURRENT_CIO) : state.indicators;
  const scoped = role === 'omsu' || role === 'cio';

  // Статистика по области видимости
  let total = 0, approved = 0, pending = 0, returned = 0, draft = 0, empty = 0;
  scopeMuns.forEach((m) => {
    scopeInds.forEach((ind) => {
      const v = state.omsuValues[m.id]?.[ind.id];
      total += 1;
      if (!v || v.status === 'not_filled') empty += 1;
      else if (v.status === 'approved') approved += 1;
      else if (v.status === 'pending_cio') pending += 1;
      else if (v.status === 'returned') returned += 1;
      else draft += 1;
    });
  });
  const stats = { total, approved, pending, returned, draft, empty };
  const pct = total ? Math.round((approved / total) * 100) : 0;
  const camp = CAMPAIGN_BADGE[state.campaign.status];

  const progressLabel =
    role === 'omsu' ? 'Согласовано ваших показателей' :
    role === 'cio' ? 'Согласовано показателей вашей отрасли' :
    'Согласовано показателей ОМСУ';

  const scopeNote =
    role === 'omsu' ? 'Отображаются данные только вашего ОМСУ.' :
    role === 'cio' ? 'Отображаются данные только по показателям вашей отрасли.' :
    null;

  return (
    <div className="space-y-4">
      {scopeNote && (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-2.5 text-xs text-blue-900 flex gap-2 items-center">
          <Info className="h-4 w-4 shrink-0" /> {scopeNote}
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {state.campaign.name} — {state.campaign.period}
              </CardTitle>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${camp.cls}`}>{camp.label}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-md bg-slate-50 p-3">
                <div className="text-xs text-muted-foreground">Дата запуска</div>
                <div className="font-medium">{state.campaign.startDate?.split('-').reverse().join('.') ?? '—'}</div>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <div className="text-xs text-muted-foreground">Срок ОМСУ</div>
                <div className="font-medium">{state.campaign.deadlineOmsu.split('-').reverse().join('.')}</div>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <div className="text-xs text-muted-foreground">Срок ЦИО</div>
                <div className="font-medium">{state.campaign.deadlineCio.split('-').reverse().join('.')}</div>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <div className="text-xs text-muted-foreground">Срок МЭФ</div>
                <div className="font-medium">{state.campaign.deadlineMef.split('-').reverse().join('.')}</div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{progressLabel}: {stats.approved} из {stats.total}</span>
                <span>{pct}%</span>
              </div>
              <Progress value={pct} className="h-2" />
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant="outline" className="text-green-700 border-green-300">Согласовано: {stats.approved}</Badge>
              <Badge variant="outline" className="text-amber-700 border-amber-300">На согласовании: {stats.pending}</Badge>
              <Badge variant="outline" className="text-blue-700 border-blue-300">Черновики: {stats.draft}</Badge>
              <Badge variant="outline" className="text-red-700 border-red-300">Возвращено: {stats.returned}</Badge>
              <Badge variant="outline" className="text-gray-600">Не заполнено: {stats.empty}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{scoped ? 'Ваш участок сбора' : 'Участники сбора'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {role === 'omsu' && (
              <>
                <div className="flex justify-between"><span className="text-muted-foreground">ОМСУ</span><span className="font-medium">{scopeMuns[0]?.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Показатели к заполнению</span><span className="font-medium">{scopeInds.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Направления</span><span className="font-medium">{DIRECTIONS.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Согласующие ЦИО</span><span className="font-medium">{CIOS.length}</span></div>
              </>
            )}
            {role === 'cio' && (
              <>
                <div className="flex justify-between"><span className="text-muted-foreground">Отраслевой ЦИО</span><span className="font-medium">{CIOS.find((c) => c.id === CURRENT_CIO)?.short}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Показатели отрасли</span><span className="font-medium">{scopeInds.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">ОМСУ на согласовании</span><span className="font-medium">{MUNICIPALITIES.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Срок согласования</span><span className="font-medium">{state.campaign.deadlineCio.split('-').reverse().join('.')}</span></div>
              </>
            )}
            {!scoped && (
              <>
                <div className="flex justify-between"><span className="text-muted-foreground">ОМСУ</span><span className="font-medium">{MUNICIPALITIES.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Отраслевые ЦИО</span><span className="font-medium">{CIOS.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Направления</span><span className="font-medium">{DIRECTIONS.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Показатели ОМСУ</span><span className="font-medium">{state.indicators.length}</span></div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="stages">
        <TabsList>
          <TabsTrigger value="stages">Этапы процесса</TabsTrigger>
          <TabsTrigger value="monitor">Мониторинг наполняемости</TabsTrigger>
          <TabsTrigger value="history">Журнал событий</TabsTrigger>
        </TabsList>

        <TabsContent value="stages">
          <Card>
            <CardContent className="pt-4">
              <ol className="relative space-y-4 border-l border-slate-200 ml-3">
                {STAGES.map((s) => (
                  <li key={s.n} className="ml-6">
                    <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-700 text-white text-xs font-semibold">
                      {s.n}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-blue-800 bg-blue-50 rounded px-2 py-0.5">{s.actor}</span>
                    </div>
                    <p className="text-sm text-slate-700 mt-1">{s.text}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitor">
          <Card>
            <CardContent className="pt-4 overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium sticky left-0 bg-white min-w-[160px]">ОМСУ / показатель</th>
                    {scopeInds.map((ind) => (
                      <th key={ind.id} className="p-2 font-medium text-center" title={ind.name}>{ind.num}</th>
                    ))}
                    <th className="p-2 font-medium text-center">Готовность</th>
                  </tr>
                </thead>
                <tbody>
                  {scopeMuns.map((m) => {
                    const vals = scopeInds.map((ind) => state.omsuValues[m.id]?.[ind.id]);
                    const appr = vals.filter((v) => v?.status === 'approved').length;
                    const ready = Math.round((appr / scopeInds.length) * 100);
                    return (
                      <tr key={m.id} className="border-b hover:bg-slate-50">
                        <td className="p-2 font-medium sticky left-0 bg-white">{m.name}</td>
                        {scopeInds.map((ind) => {
                          const v = state.omsuValues[m.id]?.[ind.id];
                          return (
                            <td key={ind.id} className="p-2 text-center" title={`${ind.name}: ${v?.status ?? 'not_filled'}`}>
                              <span className="inline-flex">{STATUS_ICON[v?.status ?? 'not_filled']}</span>
                            </td>
                          );
                        })}
                        <td className="p-2 text-center">
                          <div className="flex items-center gap-1 justify-center">
                            <div className="w-16 h-1.5 rounded bg-slate-100 overflow-hidden">
                              <div className="h-full bg-green-500" style={{ width: `${ready}%` }} />
                            </div>
                            <span className="text-muted-foreground">{ready}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">{STATUS_ICON.not_filled} не заполнен</span>
                <span className="flex items-center gap-1">{STATUS_ICON.draft} черновик</span>
                <span className="flex items-center gap-1">{STATUS_ICON.pending_cio} на согласовании у ЦИО</span>
                <span className="flex items-center gap-1">{STATUS_ICON.approved} согласован</span>
                <span className="flex items-center gap-1">{STATUS_ICON.returned} возвращён</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="pt-4">
              <ul className="space-y-2 text-sm">
                {[...state.history].reverse().map((h, i) => (
                  <li key={i} className="flex gap-3 items-start border-b pb-2 last:border-0">
                    <span className="text-xs text-muted-foreground whitespace-nowrap pt-0.5 w-[120px]">{h.at}</span>
                    <span className="text-xs font-medium text-blue-800 whitespace-nowrap pt-0.5">{h.actor}</span>
                    <span>{h.action}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
