import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileDown, Loader2, TrendingUp, TrendingDown, ShoppingCart, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

interface RelatorioMensalProps {
  listaCompras?: { produto: string; quantidade: number; preco: number; categoria: string; comprado: boolean }[];
}

export function RelatorioMensal({ listaCompras = [] }: RelatorioMensalProps) {
  const { 
    getEntradasFiltradas, 
    getGastosFiltrados, 
    getResumoMensal,
    mesSelecionado, 
    anoSelecionado 
  } = useFinance();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [open, setOpen] = useState(false);

  const entradas = getEntradasFiltradas();
  const gastos = getGastosFiltrados();
  const resumo = getResumoMensal();

  const gastosPorCategoria = gastos.reduce((acc, g) => {
    acc[g.categoria] = (acc[g.categoria] || 0) + g.valor;
    return acc;
  }, {} as Record<string, number>);

  const entradasPorCategoria = entradas.reduce((acc, e) => {
    acc[e.categoria] = (acc[e.categoria] || 0) + e.valor;
    return acc;
  }, {} as Record<string, number>);

  const comprasPorCategoria = listaCompras.reduce((acc, item) => {
    if (item.comprado) {
      acc[item.categoria] = (acc[item.categoria] || 0) + (item.preco * item.quantidade);
    }
    return acc;
  }, {} as Record<string, number>);

  const totalCompras = listaCompras
    .filter(item => item.comprado)
    .reduce((sum, item) => sum + (item.preco * item.quantidade), 0);

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;
      
      // Header
      doc.setFontSize(24);
      doc.setTextColor(34, 197, 94); // Green
      doc.text('Relatório Financeiro', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 10;
      doc.setFontSize(14);
      doc.setTextColor(100);
      doc.text(`${mesSelecionado} de ${anoSelecionado}`, pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 20;
      
      // Resumo Geral
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text('Resumo Geral', 20, yPos);
      yPos += 10;
      
      doc.setFontSize(12);
      doc.setTextColor(34, 197, 94);
      doc.text(`Total Entradas: ${formatCurrency(resumo.totalEntradas)}`, 20, yPos);
      yPos += 8;
      
      doc.setTextColor(239, 68, 68);
      doc.text(`Total Gastos: ${formatCurrency(resumo.totalGastos)}`, 20, yPos);
      yPos += 8;
      
      doc.setTextColor(resumo.saldo >= 0 ? 34 : 239, resumo.saldo >= 0 ? 197 : 68, resumo.saldo >= 0 ? 94 : 68);
      doc.text(`Saldo: ${formatCurrency(resumo.saldo)}`, 20, yPos);
      yPos += 15;
      
      // Entradas
      if (entradas.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(34, 197, 94);
        doc.text('Entradas', 20, yPos);
        yPos += 8;
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        
        // Header da tabela
        doc.text('Data', 20, yPos);
        doc.text('Descrição', 50, yPos);
        doc.text('Categoria', 110, yPos);
        doc.text('Valor', 160, yPos);
        yPos += 6;
        
        doc.setDrawColor(200);
        doc.line(20, yPos, 190, yPos);
        yPos += 4;
        
        doc.setTextColor(0);
        entradas.slice(0, 15).forEach(entrada => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(new Date(entrada.data).toLocaleDateString('pt-BR'), 20, yPos);
          doc.text(entrada.descricao.substring(0, 25), 50, yPos);
          doc.text(entrada.categoria, 110, yPos);
          doc.text(formatCurrency(entrada.valor), 160, yPos);
          yPos += 6;
        });
        
        yPos += 10;
      }
      
      // Gastos
      if (gastos.length > 0) {
        if (yPos > 200) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(239, 68, 68);
        doc.text('Gastos', 20, yPos);
        yPos += 8;
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        
        doc.text('Data', 20, yPos);
        doc.text('Descrição', 50, yPos);
        doc.text('Categoria', 110, yPos);
        doc.text('Valor', 160, yPos);
        yPos += 6;
        
        doc.setDrawColor(200);
        doc.line(20, yPos, 190, yPos);
        yPos += 4;
        
        doc.setTextColor(0);
        gastos.slice(0, 15).forEach(gasto => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(new Date(gasto.data).toLocaleDateString('pt-BR'), 20, yPos);
          doc.text(gasto.descricao.substring(0, 25), 50, yPos);
          doc.text(gasto.categoria, 110, yPos);
          doc.text(formatCurrency(gasto.valor), 160, yPos);
          yPos += 6;
        });
        
        yPos += 10;
      }
      
      // Gastos por Categoria
      if (Object.keys(gastosPorCategoria).length > 0) {
        if (yPos > 220) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(100);
        doc.text('Gastos por Categoria', 20, yPos);
        yPos += 8;
        
        doc.setFontSize(10);
        Object.entries(gastosPorCategoria)
          .sort((a, b) => b[1] - a[1])
          .forEach(([cat, valor]) => {
            if (yPos > 270) {
              doc.addPage();
              yPos = 20;
            }
            doc.setTextColor(0);
            doc.text(`${cat}: ${formatCurrency(valor)}`, 25, yPos);
            yPos += 6;
          });
        
        yPos += 10;
      }
      
      // Lista de Compras
      if (listaCompras.length > 0) {
        if (yPos > 200) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(59, 130, 246);
        doc.text('Lista de Compras', 20, yPos);
        yPos += 8;
        
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text(`Total: ${formatCurrency(totalCompras)}`, 20, yPos);
        yPos += 8;
        
        doc.setTextColor(100);
        doc.text('Produto', 20, yPos);
        doc.text('Qtd', 90, yPos);
        doc.text('Preço', 110, yPos);
        doc.text('Status', 150, yPos);
        yPos += 6;
        
        doc.setDrawColor(200);
        doc.line(20, yPos, 190, yPos);
        yPos += 4;
        
        listaCompras.slice(0, 20).forEach(item => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.setTextColor(0);
          doc.text(item.produto.substring(0, 30), 20, yPos);
          doc.text(String(item.quantidade), 90, yPos);
          doc.text(formatCurrency(item.preco), 110, yPos);
          doc.setTextColor(item.comprado ? 34 : 239, item.comprado ? 197 : 68, item.comprado ? 94 : 68);
          doc.text(item.comprado ? 'Comprado' : 'Pendente', 150, yPos);
          yPos += 6;
        });
      }
      
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, 285, { align: 'center' });
      
      // Save PDF
      doc.save(`relatorio-${mesSelecionado}-${anoSelecionado}.pdf`);
      toast.success('Relatório gerado com sucesso!');
      setOpen(false);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar relatório');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileDown className="w-4 h-4" />
          Relatório PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="w-5 h-5 text-primary" />
            Gerar Relatório Mensal
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Relatório de <strong>{mesSelecionado} de {anoSelecionado}</strong>
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-income" />
                  <div>
                    <p className="text-xs text-muted-foreground">Entradas</p>
                    <p className="font-semibold text-income">{formatCurrency(resumo.totalEntradas)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-expense" />
                  <div>
                    <p className="text-xs text-muted-foreground">Gastos</p>
                    <p className="font-semibold text-expense">{formatCurrency(resumo.totalGastos)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Saldo</p>
                    <p className={`font-semibold ${resumo.saldo >= 0 ? 'text-income' : 'text-expense'}`}>
                      {formatCurrency(resumo.saldo)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Compras</p>
                    <p className="font-semibold text-blue-500">{formatCurrency(totalCompras)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p>O relatório incluirá:</p>
            <ul className="list-disc list-inside">
              <li>{entradas.length} entrada(s)</li>
              <li>{gastos.length} gasto(s)</li>
              <li>{Object.keys(gastosPorCategoria).length} categorias de gastos</li>
              <li>{listaCompras.length} item(s) da lista de compras</li>
            </ul>
          </div>
          
          <Button 
            onClick={generatePDF} 
            className="w-full" 
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4 mr-2" />
                Baixar Relatório PDF
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
