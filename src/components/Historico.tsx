import { useFinance } from '@/contexts/FinanceContext';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, PiggyBank, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, AreaChart, Area } from 'recharts';
import { useState } from 'react';
import { MESES } from '@/types/finance';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const formatCurrencyShort = (value: number) => {
  if (value >= 1000) {
    return `R$${(value / 1000).toFixed(1)}k`;
  }
  return `R$${value}`;
};

export function Historico() {
  const { entradas, gastos, anoSelecionado, setAnoSelecionado } = useFinance();
  const [viewType, setViewType] = useState<'linha' | 'barra' | 'area'>('area');

  const anos = [2024, 2025, 2026];

  // Calculate monthly data for the selected year
  const dadosMensais = MESES.map((mes, index) => {
    const mesKey = `${mes}-${anoSelecionado}`;
    
    const entradasMes = entradas.filter(e => e.mes === mesKey);
    const gastosMes = gastos.filter(g => g.mes === mesKey);
    
    const totalEntradas = entradasMes.reduce((s, e) => s + e.valor, 0);
    const totalGastos = gastosMes.reduce((s, g) => s + g.valor, 0);
    const economia = totalEntradas - totalGastos;

    // Per person
    const entradasWilliam = entradasMes.filter(e => e.responsavel === 'William').reduce((s, e) => s + e.valor, 0);
    const entradasAndressa = entradasMes.filter(e => e.responsavel === 'Andressa').reduce((s, e) => s + e.valor, 0);
    const gastosWilliam = gastosMes.filter(g => g.responsavel === 'William').reduce((s, g) => s + g.valor, 0);
    const gastosAndressa = gastosMes.filter(g => g.responsavel === 'Andressa').reduce((s, g) => s + g.valor, 0);

    return {
      mes: mes.substring(0, 3),
      mesCompleto: mes,
      entradas: totalEntradas,
      gastos: totalGastos,
      economia,
      entradasWilliam,
      entradasAndressa,
      gastosWilliam,
      gastosAndressa,
    };
  });

  // Calculate totals and averages
  const mesesComDados = dadosMensais.filter(d => d.entradas > 0 || d.gastos > 0);
  const totalEntradas = mesesComDados.reduce((s, d) => s + d.entradas, 0);
  const totalGastos = mesesComDados.reduce((s, d) => s + d.gastos, 0);
  const totalEconomia = totalEntradas - totalGastos;
  const mediaEntradas = mesesComDados.length > 0 ? totalEntradas / mesesComDados.length : 0;
  const mediaGastos = mesesComDados.length > 0 ? totalGastos / mesesComDados.length : 0;

  // Calculate trend (comparing last 3 months)
  const ultimosMeses = mesesComDados.slice(-3);
  const primeirosMeses = mesesComDados.slice(0, 3);
  const tendenciaGastos = ultimosMeses.length > 0 && primeirosMeses.length > 0
    ? (ultimosMeses.reduce((s, d) => s + d.gastos, 0) / ultimosMeses.length) - 
      (primeirosMeses.reduce((s, d) => s + d.gastos, 0) / primeirosMeses.length)
    : 0;

  const renderChart = () => {
    const commonProps = {
      data: dadosMensais,
      margin: { top: 5, right: 5, left: -20, bottom: 5 }
    };

    if (viewType === 'linha') {
      return (
        <LineChart {...commonProps}>
          <XAxis dataKey="mes" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatCurrencyShort} />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
          <Line type="monotone" dataKey="entradas" stroke="hsl(152, 69%, 40%)" strokeWidth={2} dot={{ r: 3 }} name="Entradas" />
          <Line type="monotone" dataKey="gastos" stroke="hsl(0, 72%, 51%)" strokeWidth={2} dot={{ r: 3 }} name="Gastos" />
          <Line type="monotone" dataKey="economia" stroke="hsl(199, 89%, 48%)" strokeWidth={2} dot={{ r: 3 }} name="Economia" />
        </LineChart>
      );
    }

    if (viewType === 'barra') {
      return (
        <BarChart {...commonProps}>
          <XAxis dataKey="mes" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatCurrencyShort} />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
          <Bar dataKey="entradas" fill="hsl(152, 69%, 40%)" radius={[2, 2, 0, 0]} name="Entradas" />
          <Bar dataKey="gastos" fill="hsl(0, 72%, 51%)" radius={[2, 2, 0, 0]} name="Gastos" />
        </BarChart>
      );
    }

    return (
      <AreaChart {...commonProps}>
        <defs>
          <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(152, 69%, 40%)" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="hsl(152, 69%, 40%)" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis dataKey="mes" fontSize={10} tickLine={false} axisLine={false} />
        <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatCurrencyShort} />
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
        <Area type="monotone" dataKey="entradas" stroke="hsl(152, 69%, 40%)" fillOpacity={1} fill="url(#colorEntradas)" strokeWidth={2} name="Entradas" />
        <Area type="monotone" dataKey="gastos" stroke="hsl(0, 72%, 51%)" fillOpacity={1} fill="url(#colorGastos)" strokeWidth={2} name="Gastos" />
      </AreaChart>
    );
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Filters */}
      <Card className="shadow-card animate-fade-in">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Select value={anoSelecionado.toString()} onValueChange={(v) => setAnoSelecionado(parseInt(v))}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {anos.map((ano) => (
                  <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={viewType} onValueChange={(v) => setViewType(v as 'linha' | 'barra' | 'area')}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="area">Área</SelectItem>
                <SelectItem value="linha">Linha</SelectItem>
                <SelectItem value="barra">Barras</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="shadow-card animate-fade-in">
          <CardContent className="p-3 text-center">
            <TrendingUp className="w-4 h-4 mx-auto mb-1 text-income" />
            <p className="text-[10px] text-muted-foreground">Total Ano</p>
            <p className="text-xs font-bold text-income">{formatCurrency(totalEntradas)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card animate-fade-in" style={{ animationDelay: '0.05s' }}>
          <CardContent className="p-3 text-center">
            <TrendingDown className="w-4 h-4 mx-auto mb-1 text-expense" />
            <p className="text-[10px] text-muted-foreground">Total Ano</p>
            <p className="text-xs font-bold text-expense">{formatCurrency(totalGastos)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-3 text-center">
            <PiggyBank className="w-4 h-4 mx-auto mb-1 text-bills" />
            <p className="text-[10px] text-muted-foreground">Economia</p>
            <p className={`text-xs font-bold ${totalEconomia >= 0 ? 'text-income' : 'text-expense'}`}>
              {formatCurrency(totalEconomia)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Evolution Chart */}
      <Card className="shadow-card animate-fade-in" style={{ animationDelay: '0.15s' }}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Evolução {anoSelecionado}
            </h3>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Averages */}
      <Card className="shadow-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-3">Médias Mensais</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Média de Entradas</span>
              <span className="font-medium text-income">{formatCurrency(mediaEntradas)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Média de Gastos</span>
              <span className="font-medium text-expense">{formatCurrency(mediaGastos)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-muted-foreground">Economia Média</span>
              <span className={`font-medium ${mediaEntradas - mediaGastos >= 0 ? 'text-income' : 'text-expense'}`}>
                {formatCurrency(mediaEntradas - mediaGastos)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trend Indicator */}
      <Card className="shadow-card animate-fade-in" style={{ animationDelay: '0.25s' }}>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-3">Tendência de Gastos</h3>
          <div className="flex items-center gap-3">
            {tendenciaGastos > 0 ? (
              <>
                <div className="p-2 rounded-lg bg-expense-muted">
                  <TrendingUp className="w-5 h-5 text-expense" />
                </div>
                <div>
                  <p className="text-sm font-medium text-expense">Gastos aumentando</p>
                  <p className="text-xs text-muted-foreground">
                    +{formatCurrency(Math.abs(tendenciaGastos))} em média nos últimos meses
                  </p>
                </div>
              </>
            ) : tendenciaGastos < 0 ? (
              <>
                <div className="p-2 rounded-lg bg-income-muted">
                  <TrendingDown className="w-5 h-5 text-income" />
                </div>
                <div>
                  <p className="text-sm font-medium text-income">Gastos diminuindo</p>
                  <p className="text-xs text-muted-foreground">
                    -{formatCurrency(Math.abs(tendenciaGastos))} em média nos últimos meses
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="p-2 rounded-lg bg-secondary">
                  <BarChart3 className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Gastos estáveis</p>
                  <p className="text-xs text-muted-foreground">
                    Sem variação significativa
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Per Person Comparison Chart */}
      <Card className="shadow-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-4">Gastos por Pessoa</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosMensais} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <XAxis dataKey="mes" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatCurrencyShort} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="gastosWilliam" fill="hsl(199, 89%, 48%)" radius={[2, 2, 0, 0]} name="William" />
                <Bar dataKey="gastosAndressa" fill="hsl(340, 82%, 52%)" radius={[2, 2, 0, 0]} name="Andressa" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}