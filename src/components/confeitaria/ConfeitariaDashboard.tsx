import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, Package, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(152, 69%, 40%)', 'hsl(0, 72%, 51%)', 'hsl(199, 89%, 48%)', 'hsl(38, 92%, 50%)', 'hsl(270, 60%, 50%)', 'hsl(330, 60%, 50%)'];

export function ConfeitariaDashboard({ data }: { data: any }) {
  const { totalEntradas, totalSaidas, lucroLiquido, estoque, estoquesBaixos, financeiro, produtos } = data;

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Group financial by category for chart
  const gastosPorCategoria: Record<string, number> = {};
  financeiro.filter((f: any) => f.tipo === 'saida').forEach((f: any) => {
    gastosPorCategoria[f.categoria] = (gastosPorCategoria[f.categoria] || 0) + f.valor;
  });
  const pieData = Object.entries(gastosPorCategoria).map(([name, value]) => ({ name, value }));

  // Monthly data
  const mesesData: Record<string, { entradas: number; saidas: number }> = {};
  financeiro.forEach((f: any) => {
    const mes = f.data?.slice(0, 7) || 'N/A';
    if (!mesesData[mes]) mesesData[mes] = { entradas: 0, saidas: 0 };
    if (f.tipo === 'entrada') mesesData[mes].entradas += f.valor;
    else mesesData[mes].saidas += f.valor;
  });
  const barData = Object.entries(mesesData).sort().slice(-6).map(([mes, d]) => ({ mes: mes.slice(5), ...d }));

  const cards = [
    { title: 'Receita Total', value: fmt(totalEntradas), icon: TrendingUp, color: 'text-income' },
    { title: 'Despesas Total', value: fmt(totalSaidas), icon: TrendingDown, color: 'text-expense' },
    { title: 'Lucro Líquido', value: fmt(lucroLiquido), icon: DollarSign, color: lucroLiquido >= 0 ? 'text-income' : 'text-expense' },
    { title: 'Itens no Estoque', value: estoque.length.toString(), icon: Package, color: 'text-bills' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <Card key={i}>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs lg:text-sm text-muted-foreground">{card.title}</span>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <p className={`text-lg lg:text-2xl font-bold ${card.color}`}>{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      {estoquesBaixos.length > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="font-semibold text-sm">Estoque Baixo</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {estoquesBaixos.map((e: any) => (
                <span key={e.id} className="text-xs px-2 py-1 rounded-full bg-warning/10 text-warning">
                  {e.nome}: {e.quantidade} {e.unidade}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Receitas vs Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Bar dataKey="entradas" fill="hsl(152, 69%, 40%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="saidas" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                Nenhum dado financeiro ainda
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pie chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                Nenhuma despesa registrada
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Products summary */}
      {produtos.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Produtos Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {produtos.slice(0, 8).map((p: any) => (
                <div key={p.id} className="p-3 rounded-lg bg-muted/50">
                  <p className="font-medium text-sm truncate">{p.nome}</p>
                  <p className="text-xs text-muted-foreground">Custo: {fmt(p.custo_total)}</p>
                  <p className="text-sm font-semibold text-income">{fmt(p.preco_venda)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
