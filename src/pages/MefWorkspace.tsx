import { useState } from 'react';
import { useStore } from '@/lib/store';
import { CIOS, MUNICIPALITIES } from '@/lib/data';
import { CioStatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { CheckCircle2, Undo2, PlayCircle, CalendarClock, Send, BarChart3 } from 'lucide-react';
import { approvalStats, allApproved, fmt } from '@/lib/rating';

export function MefWorkspace({ goRating }: { goRating: () => void }) {
  const { state, dispatch } = useStore();
  const [startDate, setStartDate] = useState(state.campaign.startDate ?? '2026-07-20');
  const [dlOmsu, setDlOmsu] = useState(state.campaign.deadlineOmsu);
  const [dlCio, setDlCio] = useState(state.campaign.deadlineCio);
  const [dlMef, setDlMef] = useState(state.campaign.deadlineMef);
  const [returnTarget, setReturnTarget] = useState<{ cioIndId: string; cioId: string } | null>(null);
  const [comment, setComment] = useState('');

  const stats = approvalStats(state);
  const complete = allApproved(state);

  // собственные значения ЦИО по показателям своей отрасли (те же показатели, что у ОМСУ)
  const ownRows = state.indicators.flatMap((ind) => {
    const perCio = state.cioValues[ind.id] ?? {};
    return Object.entries(perCio).map(([cioId, v]) => ({ ind, cioId, v }));
  });
  const pendingMef = ownRows.filter((r) => r.v.status === 'pending_mef');

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Рабочее место МЭФ</h2>
        <p className="text-sm text-muted-foreground">
          Куратор рейтинга: запуск сбора, контроль сроков, предварительный рейтинг · Согласующий: согласование данных ЦИО
        </p>
      </div>

      <Tabs defaultValue="manage">
        <TabsList>
          <TabsTrigger value="manage"><CalendarClock className="h-4 w-4 mr-1" /> Управление сбором</TabsTrigger>
          <TabsTrigger value="approve">
            Согласование данных ЦИО
            {pendingMef.length > 0 && <Badge className="ml-2 bg-amber-500">{pendingMef.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Параметры сбора</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-2 items-center gap-2">
                  <Label>Дата запуска сбора</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 items-center gap-2">
                  <Label>Срок заполнения ОМСУ</Label>
                  <Input type="date" value={dlOmsu} onChange={(e) => setDlOmsu(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 items-center gap-2">
                  <Label>Срок согласования ЦИО</Label>
                  <Input type="date" value={dlCio} onChange={(e) => setDlCio(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 items-center gap-2">
                  <Label>Срок согласования МЭФ</Label>
                  <Input type="date" value={dlMef} onChange={(e) => setDlMef(e.target.value)} />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      dispatch({ type: 'CAMPAIGN_SCHEDULE', startDate, deadlineOmsu: dlOmsu, deadlineCio: dlCio, deadlineMef: dlMef })
                    }
                  >
                    <CalendarClock className="h-4 w-4 mr-1" /> Сохранить даты
                  </Button>
                  {state.campaign.status !== 'collecting' && state.campaign.status !== 'completed' && (
                    <Button onClick={() => dispatch({ type: 'CAMPAIGN_LAUNCH' })}>
                      <PlayCircle className="h-4 w-4 mr-1" /> Запустить сбор
                    </Button>
                  )}
                  {state.campaign.status === 'collecting' && (
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                      <Send className="h-3.5 w-3.5 mr-1" />
                      Сбор запущен {state.campaign.launchedAt}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  В указанную дату КФ автоматически рассылает уведомления и формы: {MUNICIPALITIES.length} ОМСУ и {CIOS.length} ЦИО.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Готовность к итоговому рейтингу</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline" className="text-green-700 border-green-300">Согласовано ЦИО: {stats.approved}/{stats.total}</Badge>
                  <Badge variant="outline" className="text-amber-700 border-amber-300">На согласовании: {stats.pending}</Badge>
                  <Badge variant="outline" className="text-gray-600">Не заполнено/черновики: {stats.empty + stats.draft}</Badge>
                </div>
                <div className="rounded-md border p-3">
                  <div className="font-medium">Предварительный рейтинг</div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Доступен в любой момент: рассчитывается по введённым данным (согласованным и несогласованным).
                  </p>
                  <Button variant="outline" size="sm" onClick={goRating}>
                    <BarChart3 className="h-4 w-4 mr-1" /> Сформировать предварительный рейтинг
                  </Button>
                </div>
                <div className="rounded-md border p-3">
                  <div className="font-medium">Итоговый рейтинг</div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {complete
                      ? 'Все показатели согласованы. Можно формировать итоговый сводный рейтинг.'
                      : 'Доступен после согласования всех показателей: ОМСУ — отраслевыми ЦИО, ЦИО — МЭФ.'}
                  </p>
                  <Button size="sm" disabled={!complete} onClick={() => { dispatch({ type: 'PUBLISH_FINAL' }); goRating(); }}>
                    <CheckCircle2 className="h-4 w-4 mr-1" /> Сформировать итоговый рейтинг
                  </Button>
                  {state.finalPublished && (
                    <Badge className="ml-2 bg-green-100 text-green-700 hover:bg-green-100">Опубликован</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="approve" className="mt-4">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-base">Собственные значения ЦИО по показателям, направленные на согласование</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="text-left p-2">ЦИО</th>
                    <th className="text-left p-2">Показатель</th>
                    <th className="text-left p-2 w-28">Значение</th>
                    <th className="text-left p-2">Статус</th>
                    <th className="text-right p-2 w-56">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {ownRows.map(({ ind, cioId, v }) => (
                    <tr key={ind.id + cioId} className={`border-b ${v.status === 'pending_mef' ? 'bg-amber-50/60' : 'hover:bg-slate-50'}`}>
                      <td className="p-2"><Badge variant="secondary">{CIOS.find((c) => c.id === cioId)?.short}</Badge></td>
                      <td className="p-2 font-medium">{ind.num} {ind.name}</td>
                      <td className="p-2">{fmt(v.value)} {v.value !== null && ind.unit}</td>
                      <td className="p-2"><CioStatusBadge status={v.status} /></td>
                      <td className="p-2 text-right whitespace-nowrap">
                        {v.status === 'pending_mef' && (
                          <div className="flex gap-1 justify-end">
                            <Button
                              size="sm"
                              onClick={() => dispatch({ type: 'MEF_APPROVE', cioIndId: ind.id, cioId, actor: 'МЭФ' })}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Согласовать
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => { setReturnTarget({ cioIndId: ind.id, cioId }); setComment(''); }}
                            >
                              <Undo2 className="h-3.5 w-3.5 mr-1" /> Вернуть
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!returnTarget} onOpenChange={(v) => !v && setReturnTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Возврат показателя ЦИО на доработку</DialogTitle></DialogHeader>
          <Textarea
            placeholder="Комментарий для ЦИО (обязательно)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnTarget(null)}>Отмена</Button>
            <Button
              variant="destructive"
              disabled={!comment.trim()}
              onClick={() => {
                if (returnTarget) dispatch({ type: 'MEF_RETURN', ...returnTarget, actor: 'МЭФ', comment: comment.trim() });
                setReturnTarget(null);
              }}
            >
              Вернуть на доработку
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
