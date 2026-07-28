import { useState } from 'react';
import { useStore } from '@/lib/store';
import { DIRECTIONS, CIOS, CURRENT_OMSU, MUNICIPALITIES } from '@/lib/data';
import { OmsuStatusBadge } from '@/components/StatusBadge';
import { SignDialog } from '@/components/SignDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileSignature, Undo2, Lock, AlertTriangle, Info } from 'lucide-react';
import { fmt } from '@/lib/rating';

export function OmsuForm() {
  const { state, dispatch } = useStore();
  const munId = CURRENT_OMSU;
  const mun = MUNICIPALITIES.find((m) => m.id === munId)!;
  const [signTarget, setSignTarget] = useState<string | null>(null);

  const values = state.omsuValues[munId];
  const total = state.indicators.length;
  const approved = state.indicators.filter((i) => values[i.id]?.status === 'approved').length;
  const pending = state.indicators.filter((i) => values[i.id]?.status === 'pending_cio').length;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">Форма сбора — {mun.name}</h2>
          <p className="text-sm text-muted-foreground">
            {state.campaign.name}, {state.campaign.period} · срок заполнения: {state.campaign.deadlineOmsu.split('-').reverse().join('.')}
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <Badge variant="outline" className="text-green-700 border-green-300">Согласовано: {approved}/{total}</Badge>
          <Badge variant="outline" className="text-amber-700 border-amber-300">На согласовании: {pending}</Badge>
        </div>
      </div>

      <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm flex gap-2">
        <Info className="h-4 w-4 text-blue-700 mt-0.5 shrink-0" />
        <span>
          Заполните значения, подпишите ЭЦП и отправьте на согласование отраслевому ЦИО.
          Пока показатель не согласован, его можно <b>отозвать на изменение</b> и отправить повторно.
          После согласования ЦИО изменение блокируется.
        </span>
      </div>

      {DIRECTIONS.map((d) => {
        const inds = state.indicators.filter((i) => i.directionId === d.id);
        if (!inds.length) return null;
        return (
          <Card key={d.id}>
            <CardHeader className="py-3">
              <CardTitle className="text-base">{d.name}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="text-left p-2 w-12">№</th>
                    <th className="text-left p-2">Показатель</th>
                    <th className="text-left p-2">ЦИО</th>
                    <th className="text-left p-2 w-32">Значение</th>
                    <th className="text-left p-2">Статус</th>
                    <th className="text-left p-2">Комментарий / подпись</th>
                    <th className="text-right p-2 w-56">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {inds.map((ind) => {
                    const v = values[ind.id];
                    const editable = v.status === 'not_filled' || v.status === 'draft' || v.status === 'returned';
                    return (
                      <tr key={ind.id} className="border-b hover:bg-slate-50 align-top">
                        <td className="p-2 text-muted-foreground">{ind.num}</td>
                        <td className="p-2">
                          <div className="font-medium">{ind.name}</div>
                          <div className="text-xs text-muted-foreground">ед. изм.: {ind.unit} · формула: {ind.formula}</div>
                        </td>
                        <td className="p-2"><Badge variant="secondary">{CIOS.find((c) => c.id === ind.cioId)?.short}</Badge></td>
                        <td className="p-2">
                          {editable ? (
                            <Input
                              type="number"
                              step="0.01"
                              className="h-8 w-28"
                              placeholder="—"
                              value={v.value ?? ''}
                              onChange={(e) =>
                                dispatch({
                                  type: 'OMSU_SET_VALUE',
                                  munId,
                                  indId: ind.id,
                                  value: e.target.value === '' ? null : Number(e.target.value),
                                })
                              }
                            />
                          ) : (
                            <span className="font-medium">{fmt(v.value)}</span>
                          )}
                        </td>
                        <td className="p-2"><OmsuStatusBadge status={v.status} /></td>
                        <td className="p-2 text-xs">
                          {v.comment && (
                            <div className="flex gap-1 text-red-700">
                              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                              <span>{v.comment}</span>
                            </div>
                          )}
                          {v.signedBy && v.status !== 'draft' && (
                            <div className="text-muted-foreground mt-0.5">ЭЦП: {v.signedBy}</div>
                          )}
                        </td>
                        <td className="p-2 text-right whitespace-nowrap">
                          {editable && v.value !== null && (
                            <Button size="sm" variant="default" onClick={() => setSignTarget(ind.id)}>
                              <FileSignature className="h-3.5 w-3.5 mr-1" />
                              Подписать ЭЦП и отправить
                            </Button>
                          )}
                          {v.status === 'pending_cio' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => dispatch({ type: 'OMSU_RECALL', munId, indId: ind.id, actor: mun.name })}
                            >
                              <Undo2 className="h-3.5 w-3.5 mr-1" />
                              Отозвать на изменение
                            </Button>
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
        );
      })}

      <SignDialog
        open={!!signTarget}
        onOpenChange={(v) => !v && setSignTarget(null)}
        title={`Показатель ${state.indicators.find((i) => i.id === signTarget)?.num ?? ''} — направление на согласование отраслевому ЦИО`}
        onSigned={() => {
          if (signTarget) dispatch({ type: 'OMSU_SIGN_SEND', munId, indId: signTarget, actor: 'Иванова А.П.' });
          setSignTarget(null);
        }}
      />
    </div>
  );
}
