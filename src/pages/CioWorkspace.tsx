import { useState } from 'react';
import { useStore } from '@/lib/store';
import { MUNICIPALITIES, CURRENT_CIO, CIOS } from '@/lib/data';
import { OmsuStatusBadge, CioStatusBadge } from '@/components/StatusBadge';
import { SignDialog } from '@/components/SignDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { CheckCircle2, Undo2, FileSignature, Lock, Info } from 'lucide-react';
import { fmt } from '@/lib/rating';

export function CioWorkspace() {
  const { state, dispatch } = useStore();
  const cio = CIOS.find((c) => c.id === CURRENT_CIO)!;
  const [returnTarget, setReturnTarget] = useState<{ munId: string; indId: string } | null>(null);
  const [comment, setComment] = useState('');
  const [signTarget, setSignTarget] = useState<string | null>(null);

  const myIndicators = state.indicators.filter((i) => i.cioId === CURRENT_CIO);
  const pendingCount = MUNICIPALITIES.reduce(
    (acc, m) => acc + myIndicators.filter((i) => state.omsuValues[m.id]?.[i.id]?.status === 'pending_cio').length,
    0,
  );

  // Среднее значение по введённым показателям ОМСУ — по каждому показателю отрасли
  // и по каждому заполняемому полю (факт / прогноз базовый / прогноз целевой)
  const avgByInd = (indId: string, field: 'value' | 'base' | 'target') => {
    const vals = MUNICIPALITIES
      .map((m) => state.omsuValues[m.id]?.[indId]?.[field])
      .filter((x): x is number => x !== null && x !== undefined);
    return {
      avg: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null,
      count: vals.length,
    };
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Рабочее место отраслевого ЦИО — {cio.short}</h2>
        <p className="text-sm text-muted-foreground">{cio.name} · {state.campaign.period}</p>
      </div>

      <Tabs defaultValue="approve">
        <TabsList>
          <TabsTrigger value="approve">
            Согласование показателей ОМСУ
            {pendingCount > 0 && <Badge className="ml-2 bg-amber-500">{pendingCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="own">Собственные показатели ЦИО</TabsTrigger>
        </TabsList>

        <TabsContent value="approve" className="space-y-4 mt-4">
          <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm flex gap-2">
            <Info className="h-4 w-4 text-blue-700 mt-0.5 shrink-0" />
            <span>
              Согласуйте подписанные ЭЦП значения ОМСУ по показателям вашей отрасли или верните на доработку с комментарием.
              После согласования изменение показателя ОМСУ блокируется.
            </span>
          </div>

          {myIndicators.map((ind) => (
            <Card key={ind.id}>
              <CardHeader className="py-3">
                <CardTitle className="text-base">
                  {ind.num}. {ind.name} <span className="text-sm font-normal text-muted-foreground">({ind.unit})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th rowSpan={2} className="text-left p-2 align-middle">ОМСУ</th>
                      <th className="text-center p-1.5 w-24 border-l border-b bg-green-50/70">Отчёт 2026</th>
                      <th colSpan={2} className="text-center p-1.5 border-l border-b bg-blue-50/70">Прогноз (2027)</th>
                      <th rowSpan={2} className="text-left p-2 align-middle">Статус</th>
                      <th rowSpan={2} className="text-left p-2 align-middle">Обновлено</th>
                      <th rowSpan={2} className="text-right p-2 w-64 align-middle">Действия</th>
                    </tr>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="text-center p-1.5 border-l bg-green-50/70 font-medium">Факт</th>
                      <th className="text-center p-1.5 w-24 border-l bg-blue-50/70 font-medium">Базовый вариант</th>
                      <th className="text-center p-1.5 w-24 bg-blue-50/70 font-medium">Целевой вариант</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MUNICIPALITIES.map((m) => {
                      const v = state.omsuValues[m.id]?.[ind.id];
                      if (!v) return null;
                      return (
                        <tr key={m.id} className={`border-b ${v.status === 'pending_cio' ? 'bg-amber-50/60' : 'hover:bg-slate-50'}`}>
                          <td className="p-2 font-medium">{m.name}</td>
                          <td className="p-2 text-center font-medium bg-green-50/30">{fmt(v.value)}</td>
                          <td className="p-2 text-center bg-blue-50/30">{fmt(v.base ?? null)}</td>
                          <td className="p-2 text-center bg-blue-50/30">{fmt(v.target ?? null)}</td>
                          <td className="p-2"><OmsuStatusBadge status={v.status} /></td>
                          <td className="p-2 text-xs text-muted-foreground">{v.updatedAt ?? '—'}</td>
                          <td className="p-2 text-right whitespace-nowrap">
                            {v.status === 'pending_cio' && (
                              <div className="flex gap-1 justify-end">
                                <Button
                                  size="sm"
                                  onClick={() => dispatch({ type: 'CIO_APPROVE', munId: m.id, indId: ind.id, actor: cio.short })}
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Согласовать
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => { setReturnTarget({ munId: m.id, indId: ind.id }); setComment(''); }}
                                >
                                  <Undo2 className="h-3.5 w-3.5 mr-1" /> Вернуть
                                </Button>
                              </div>
                            )}
                            {v.status === 'approved' && (
                              <span className="inline-flex items-center gap-1 text-xs text-green-700">
                                <Lock className="h-3.5 w-3.5" /> заблокировано
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="own" className="space-y-4 mt-4">
          <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm flex gap-2">
            <Info className="h-4 w-4 text-blue-700 mt-0.5 shrink-0" />
            <span>
              ЦИО вносит собственные значения по тем же показателям, что заполняют ОМСУ его отрасли: факт отчётного периода,
              прогноз по базовому и целевому вариантам. Подпишите ЭЦП и отправьте на согласование в МЭФ. Пока МЭФ не согласовал —
              можно отозвать на изменение. Под каждым полем для справки отображается среднее значение по введённым данным ОМСУ
              (с указанием количества ОМСУ, внёсших значение).
            </span>
          </div>
          <Card>
            <CardContent className="pt-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th rowSpan={2} className="text-left p-2 align-middle">Показатель</th>
                    <th className="text-center p-1.5 w-28 border-l border-b bg-green-50/70">Отчёт 2026</th>
                    <th colSpan={2} className="text-center p-1.5 border-l border-b bg-blue-50/70">Прогноз (2027)</th>
                    <th rowSpan={2} className="text-left p-2 align-middle">Статус</th>
                    <th rowSpan={2} className="text-left p-2 align-middle">Комментарий МЭФ</th>
                    <th rowSpan={2} className="text-right p-2 w-64 align-middle">Действия</th>
                  </tr>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="text-center p-1.5 border-l bg-green-50/70 font-medium">Факт</th>
                    <th className="text-center p-1.5 w-28 border-l bg-blue-50/70 font-medium">Базовый вариант</th>
                    <th className="text-center p-1.5 w-28 bg-blue-50/70 font-medium">Целевой вариант</th>
                  </tr>
                </thead>
                <tbody>
                  {myIndicators.map((ind) => {
                    const v = state.cioValues[ind.id]?.[CURRENT_CIO] ?? { value: null, base: null, target: null, status: 'not_filled' as const, updatedAt: null };
                    const editable = v.status === 'not_filled' || v.status === 'draft' || v.status === 'returned';
                    return (
                      <tr key={ind.id} className="border-b hover:bg-slate-50 align-top">
                        <td className="p-2">
                          <div className="font-medium">{ind.num} {ind.name}</div>
                          <div className="text-xs text-muted-foreground">ед. изм.: {ind.unit} · формула: {ind.formula}</div>
                        </td>
                        {(['value', 'base', 'target'] as const).map((field) => {
                          const { avg, count } = avgByInd(ind.id, field);
                          return (
                            <td key={field} className={`p-2 text-center ${field !== 'value' ? 'bg-blue-50/30' : 'bg-green-50/30'}`}>
                              {editable ? (
                                <Input
                                  type="number"
                                  step="0.1"
                                  className="h-8 w-24 text-center mx-auto bg-white"
                                  placeholder="—"
                                  value={v[field] ?? ''}
                                  onChange={(e) =>
                                    dispatch({
                                      type: 'CIO_SET_OWN',
                                      cioIndId: ind.id,
                                      cioId: CURRENT_CIO,
                                      field,
                                      value: e.target.value === '' ? null : Number(e.target.value),
                                    })
                                  }
                                />
                              ) : (
                                <span className={field === 'value' ? 'font-medium' : ''}>{fmt(v[field] ?? null)}</span>
                              )}
                              <div className="mt-1 text-xs whitespace-nowrap">
                                <span className="text-muted-foreground">ср. ОМСУ: </span>
                                <span className="font-medium text-blue-800">{avg !== null ? fmt(avg) : '—'}</span>
                                <span className="text-muted-foreground"> · {count}</span>
                              </div>
                            </td>
                          );
                        })}
                        <td className="p-2"><CioStatusBadge status={v.status} /></td>
                        <td className="p-2 text-xs text-red-700">{v.comment ?? ''}</td>
                        <td className="p-2 text-right whitespace-nowrap">
                          {editable && v.value !== null && (
                            <Button size="sm" onClick={() => setSignTarget(ind.id)}>
                              <FileSignature className="h-3.5 w-3.5 mr-1" /> Подписать ЭЦП и отправить в МЭФ
                            </Button>
                          )}
                          {v.status === 'pending_mef' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => dispatch({ type: 'CIO_RECALL_OWN', cioIndId: ind.id, cioId: CURRENT_CIO, actor: cio.short })}
                            >
                              <Undo2 className="h-3.5 w-3.5 mr-1" /> Отозвать на изменение
                            </Button>
                          )}
                          {v.status === 'approved' && (
                            <span className="inline-flex items-center gap-1 text-xs text-green-700">
                              <Lock className="h-3.5 w-3.5" /> согласовано МЭФ
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Возврат ОМСУ на доработку */}
      <Dialog open={!!returnTarget} onOpenChange={(v) => !v && setReturnTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Возврат показателя на доработку</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Комментарий для ОМСУ (обязательно)"
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
                if (returnTarget)
                  dispatch({ type: 'CIO_RETURN', ...returnTarget, actor: cio.short, comment: comment.trim() });
                setReturnTarget(null);
              }}
            >
              Вернуть на доработку
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SignDialog
        open={!!signTarget}
        onOpenChange={(v) => !v && setSignTarget(null)}
        title="Собственный показатель ЦИО — направление на согласование в МЭФ"
        onSigned={() => {
          if (signTarget) dispatch({ type: 'CIO_SIGN_OWN', cioIndId: signTarget, cioId: CURRENT_CIO, actor: 'Петров С.И.' });
          setSignTarget(null);
        }}
      />
    </div>
  );
}
