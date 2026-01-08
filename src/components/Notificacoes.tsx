import { useEffect, useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, X, AlertTriangle, Calendar, Target, CheckCircle2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';

interface Notificacao {
  id: string;
  tipo: 'conta_vencendo' | 'meta_alerta' | 'meta_atingida';
  titulo: string;
  mensagem: string;
  data: Date;
  lida: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export function Notificacoes() {
  const { getContasFiltradas, getMetasFiltradas, getProgressoMeta, contas, metas, mesSelecionado, anoSelecionado } = useFinance();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const novasNotificacoes: Notificacao[] = [];
    const hoje = new Date();
    const mesKey = `${mesSelecionado}-${anoSelecionado}`;

    // Check bills due soon (within 3 days)
    const contasDoMes = contas.filter(c => c.mes === mesKey && !c.pago);
    contasDoMes.forEach(conta => {
      const vencimento = new Date(conta.vencimento);
      const diffDias = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDias <= 3 && diffDias >= 0) {
        novasNotificacoes.push({
          id: `conta-${conta.id}`,
          tipo: 'conta_vencendo',
          titulo: diffDias === 0 ? 'Conta vence hoje!' : `Conta vence em ${diffDias} dia${diffDias > 1 ? 's' : ''}`,
          mensagem: `${conta.conta} - ${formatCurrency(conta.valor)}`,
          data: vencimento,
          lida: false,
        });
      } else if (diffDias < 0) {
        novasNotificacoes.push({
          id: `conta-vencida-${conta.id}`,
          tipo: 'conta_vencendo',
          titulo: 'Conta vencida!',
          mensagem: `${conta.conta} - ${formatCurrency(conta.valor)} (venceu há ${Math.abs(diffDias)} dias)`,
          data: vencimento,
          lida: false,
        });
      }
    });

    // Check spending limit goals
    const metasDoMes = metas.filter(m => m.mes === mesKey);
    metasDoMes.forEach(meta => {
      const progresso = getProgressoMeta(meta);
      
      if (meta.tipo === 'limite_gasto') {
        if (progresso.percentual >= 100) {
          novasNotificacoes.push({
            id: `meta-excedida-${meta.id}`,
            tipo: 'meta_alerta',
            titulo: 'Limite de gasto excedido!',
            mensagem: `${meta.nome}: ${formatCurrency(progresso.atual)} de ${formatCurrency(meta.valorMeta)}`,
            data: new Date(),
            lida: false,
          });
        } else if (progresso.percentual >= 80) {
          novasNotificacoes.push({
            id: `meta-alerta-${meta.id}`,
            tipo: 'meta_alerta',
            titulo: 'Próximo do limite!',
            mensagem: `${meta.nome}: ${progresso.percentual.toFixed(0)}% do limite usado`,
            data: new Date(),
            lida: false,
          });
        }
      } else if (progresso.percentual >= 100) {
        novasNotificacoes.push({
          id: `meta-atingida-${meta.id}`,
          tipo: 'meta_atingida',
          titulo: 'Meta atingida! 🎉',
          mensagem: `${meta.nome}: ${formatCurrency(progresso.atual)}`,
          data: new Date(),
          lida: false,
        });
      }
    });

    setNotificacoes(novasNotificacoes);
  }, [contas, metas, mesSelecionado, anoSelecionado, getProgressoMeta]);

  const marcarComoLida = (id: string) => {
    setNotificacoes(prev => prev.filter(n => n.id !== id));
  };

  const limparTodas = () => {
    setNotificacoes([]);
  };

  const getIcone = (tipo: string) => {
    switch (tipo) {
      case 'conta_vencendo':
        return <Calendar className="w-5 h-5 text-warning" />;
      case 'meta_alerta':
        return <AlertTriangle className="w-5 h-5 text-expense" />;
      case 'meta_atingida':
        return <CheckCircle2 className="w-5 h-5 text-income" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const naoLidas = notificacoes.filter(n => !n.lida).length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {naoLidas > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-expense text-expense-foreground text-[10px]"
            >
              {naoLidas}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificações
            </span>
            {notificacoes.length > 0 && (
              <Button variant="ghost" size="sm" onClick={limparTodas} className="text-xs">
                Limpar todas
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-3">
          {notificacoes.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="p-6 text-center text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Nenhuma notificação</p>
                <p className="text-sm">Você está em dia! 🎉</p>
              </CardContent>
            </Card>
          ) : (
            notificacoes.map((notificacao) => (
              <Card 
                key={notificacao.id} 
                className={`shadow-card animate-fade-in ${
                  notificacao.tipo === 'meta_atingida' ? 'border-income/30 bg-income/5' :
                  notificacao.tipo === 'meta_alerta' ? 'border-expense/30 bg-expense/5' :
                  'border-warning/30 bg-warning/5'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      notificacao.tipo === 'meta_atingida' ? 'bg-income-muted' :
                      notificacao.tipo === 'meta_alerta' ? 'bg-expense-muted' :
                      'bg-warning/20'
                    }`}>
                      {getIcone(notificacao.tipo)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notificacao.titulo}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notificacao.mensagem}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      onClick={() => marcarComoLida(notificacao.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}