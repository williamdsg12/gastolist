import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export function RelatoriosModule({ data }: { data: any }) {
  const { financeiro, estoque, produtos, fornecedores, notasFiscais } = data;

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Monthly trend
  const mesesData: Record<string, { entradas: number; saidas: number; lucro: number }> = {};
  financeiro.forEach((f: any) => {
    const mes = f.data?.slice(0, 7) || 'N/A';
    if (!mesesData[mes]) mesesData[mes] = { entradas: 0, saidas: 0, lucro: 0 };
    if (f.tipo === 'entrada') mesesData[mes].entradas += f.valor;
    else mesesData[mes].saidas += f.valor;
    mesesData[mes].lucro = mesesData[mes].entradas - mesesData[mes].saidas;
  });
  const trendData = Object.entries(mesesData).sort().map(([mes, d]) => ({ mes: mes.slice(5), ...d }));

  // Top expenses by category
  const catData: Record<string, number> = {};
  financeiro.filter((f: any) => f.tipo === 'saida').forEach((f: any) => {
    catData[f.categoria] = (catData[f.categoria] || 0) + f.valor;
  });
  const topCategorias = Object.entries(catData).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));

  // Most expensive stock items
  const topEstoque = [...estoque].sort((a: any, b: any) => b.custo_medio * b.quantidade - a.custo_medio * a.quantidade).slice(0, 5);

  // Top suppliers
  const fornData: Record<string, { total: number; count: number }> = {};
  notasFiscais.forEach((nf: any) => {
    const nome = nf.nome_emitente || 'Desconhecido';
    if (!fornData[nome]) fornData[nome] = { total: 0, count: 0 };
    fornData[nome].total += nf.valor_total;
    fornData[nome].count++;
  });
  const topFornecedores = Object.entries(fornData).sort((a, b) => b[1].total - a[1].total).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Produtos</p><p className="text-2xl font-bold">{produtos.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Itens Estoque</p><p className="text-2xl font-bold">{estoque.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Fornecedores</p><p className="text-2xl font-bold">{fornecedores.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Notas Fiscais</p><p className="text-2xl font-bold">{notasFiscais.length}</p></CardContent></Card>
      </div>

      {/* Trend chart */}
      <Card>
        <CardHeader><CardTitle className="text-base">Evolução Mensal</CardTitle></CardHeader>
        <CardContent>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="mes" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Line type="monotone" dataKey="entradas" stroke="hsl(152, 69%, 40%)" strokeWidth={2} />
                <Line type="monotone" dataKey="saidas" stroke="hsl(0, 72%, 51%)" strokeWidth={2} />
                <Line type="monotone" dataKey="lucro" stroke="hsl(199, 89%, 48%)" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-muted-foreground text-sm py-8">Sem dados ainda</p>}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top categories */}
        <Card>
          <CardHeader><CardTitle className="text-base">Maiores Custos</CardTitle></CardHeader>
          <CardContent>
            {topCategorias.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topCategorias} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" fontSize={12} />
                  <YAxis dataKey="name" type="category" fontSize={12} width={100} />
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Bar dataKey="value" fill="hsl(0, 72%, 51%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-muted-foreground text-sm py-8">Sem dados</p>}
          </CardContent>
        </Card>

        {/* Insights */}
        <Card>
          <CardHeader><CardTitle className="text-base">Insights</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {topEstoque.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">Itens mais caros no estoque</h4>
                {topEstoque.map((e: any) => (
                  <div key={e.id} className="flex justify-between text-sm py-1">
                    <span>{e.nome}</span>
                    <span className="font-medium">{fmt(e.custo_medio * e.quantidade)}</span>
                  </div>
                ))}
              </div>
            )}
            {topFornecedores.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">Principais fornecedores</h4>
                {topFornecedores.map(([nome, d]) => (
                  <div key={nome} className="flex justify-between text-sm py-1">
                    <span>{nome} <span className="text-muted-foreground">({d.count}x)</span></span>
                    <span className="font-medium">{fmt(d.total)}</span>
                  </div>
                ))}
              </div>
            )}
            {topEstoque.length === 0 && topFornecedores.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-4">Adicione dados para ver insights</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
