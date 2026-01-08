import { useFinance } from '@/contexts/FinanceContext';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Wallet, Target, AlertCircle, CheckCircle } from 'lucide-react';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export function WidgetResumo() {
  const { getResumoMensal, getMetasFiltradas, getProgressoMeta, mesSelecionado, anoSelecionado } = useFinance();
  const resumo = getResumoMensal();
  const metas = getMetasFiltradas();
  
  // Calculate goals progress
  const metasAtingidas = metas.filter(meta => {
    const { percentual } = getProgressoMeta(meta);
    if (meta.tipo === 'limite_gasto') {
      return percentual <= 100;
    }
    return percentual >= 100;
  }).length;

  const percentualSaude = resumo.totalEntradas > 0 
    ? Math.max(0, 100 - resumo.percentualGastos) 
    : 0;

  const getSaudeFinanceira = () => {
    if (resumo.percentualGastos > 100) return { label: 'Crítico', color: 'text-expense', bg: 'bg-expense-muted' };
    if (resumo.percentualGastos > 80) return { label: 'Atenção', color: 'text-warning', bg: 'bg-warning/10' };
    if (resumo.percentualGastos > 50) return { label: 'Bom', color: 'text-income', bg: 'bg-income-muted' };
    return { label: 'Excelente', color: 'text-income', bg: 'bg-income-muted' };
  };

  const saude = getSaudeFinanceira();

  return (
    <Card className="shadow-card overflow-hidden">
      <div 
        className="h-1"
        style={{
          background: resumo.saldo >= 0 
            ? 'linear-gradient(90deg, hsl(152 69% 40%), hsl(152 69% 50%))' 
            : 'linear-gradient(90deg, hsl(0 72% 51%), hsl(0 72% 60%))',
        }}
      />
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {mesSelecionado} {anoSelecionado}
            </span>
          </div>
          <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${saude.bg} ${saude.color}`}>
            {saude.label}
          </div>
        </div>

        {/* Main Balance */}
        <div className="text-center mb-4">
          <p className={`text-2xl font-bold ${resumo.saldo >= 0 ? 'text-income' : 'text-expense'}`}>
            {formatCurrency(resumo.saldo)}
          </p>
          <p className="text-xs text-muted-foreground">Saldo disponível</p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-2 rounded-lg bg-income-muted/50">
            <TrendingUp className="w-4 h-4 text-income mx-auto mb-1" />
            <p className="text-xs font-semibold text-income">{formatCurrency(resumo.totalEntradas)}</p>
            <p className="text-[10px] text-muted-foreground">Entradas</p>
          </div>
          
          <div className="text-center p-2 rounded-lg bg-expense-muted/50">
            <TrendingDown className="w-4 h-4 text-expense mx-auto mb-1" />
            <p className="text-xs font-semibold text-expense">{formatCurrency(resumo.totalGastos)}</p>
            <p className="text-[10px] text-muted-foreground">Gastos</p>
          </div>
          
          <div className="text-center p-2 rounded-lg bg-bills-muted/50">
            <AlertCircle className="w-4 h-4 text-bills mx-auto mb-1" />
            <p className="text-xs font-semibold text-bills">{resumo.contasPendentes}</p>
            <p className="text-[10px] text-muted-foreground">Pendentes</p>
          </div>
          
          <div className="text-center p-2 rounded-lg bg-secondary">
            {metas.length > 0 ? (
              <>
                <Target className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-xs font-semibold text-primary">{metasAtingidas}/{metas.length}</p>
                <p className="text-[10px] text-muted-foreground">Metas</p>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-xs font-semibold text-primary">{resumo.contasPagas}</p>
                <p className="text-[10px] text-muted-foreground">Pagas</p>
              </>
            )}
          </div>
        </div>

        {/* Budget Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-muted-foreground">Orçamento utilizado</span>
            <span className="font-medium">{Math.min(resumo.percentualGastos, 100).toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full transition-all duration-700 rounded-full"
              style={{ 
                width: `${Math.min(resumo.percentualGastos, 100)}%`,
                background: resumo.percentualGastos > 100 
                  ? 'linear-gradient(90deg, hsl(0 72% 51%), hsl(0 72% 60%))' 
                  : resumo.percentualGastos > 80 
                    ? 'linear-gradient(90deg, hsl(38 92% 50%), hsl(38 92% 55%))' 
                    : 'linear-gradient(90deg, hsl(152 69% 40%), hsl(152 69% 50%))'
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
