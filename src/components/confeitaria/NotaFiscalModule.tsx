import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, Loader2, Check, AlertCircle, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function NotaFiscalModule({ data }: { data: any }) {
  const { notasFiscais, itensNota, estoque, fornecedores, addNotaFiscal, addItemNotaFiscal, addEstoqueItem, addMovimentacao, addFinanceiro, addFornecedor, userId, fetchAll } = data;
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [editingItems, setEditingItems] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    setParsedData(null);
    setEditingItems([]);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;

        const { data: result, error } = await supabase.functions.invoke('parse-invoice', {
          body: { imageBase64: base64 },
        });

        if (error) throw error;

        setParsedData(result);
        setEditingItems(
          (result.produtos || []).map((p: any, i: number) => ({
            ...p,
            idx: i,
            status: p.status || 'confirmado',
            matchedEstoqueId: findMatchingEstoque(p.nome_produto),
          }))
        );
        toast({ title: 'Nota processada pela IA!' });
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      toast({ title: 'Erro ao processar', description: err.message, variant: 'destructive' });
    } finally {
      setScanning(false);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const findMatchingEstoque = (nome: string) => {
    const match = estoque.find((e: any) => e.nome.toLowerCase() === nome?.toLowerCase());
    return match?.id || null;
  };

  const handleConfirmNota = async () => {
    if (!parsedData || !userId) return;
    setScanning(true);

    try {
      // Create or find fornecedor
      let fornecedorId = null;
      if (parsedData.nome_emitente) {
        const existingForn = fornecedores.find((f: any) => f.cnpj === parsedData.cnpj || f.nome.toLowerCase() === parsedData.nome_emitente?.toLowerCase());
        if (existingForn) {
          fornecedorId = existingForn.id;
        } else {
          await addFornecedor({ nome: parsedData.nome_emitente, cnpj: parsedData.cnpj || '' });
          await fetchAll();
        }
      }

      // Create nota fiscal
      const nf = await addNotaFiscal({
        fornecedor_id: fornecedorId,
        numero: parsedData.numero || '',
        cnpj_emitente: parsedData.cnpj || '',
        nome_emitente: parsedData.nome_emitente || '',
        data_emissao: parsedData.data_emissao || new Date().toISOString().slice(0, 10),
        valor_total: editingItems.reduce((s: number, i: any) => s + (i.valor_total || 0), 0),
        status: 'processada',
      });

      if (!nf) throw new Error('Falha ao criar nota fiscal');

      // Process each item
      for (const item of editingItems) {
        if (item.status === 'ignorado') continue;

        let estoqueId = item.matchedEstoqueId;

        if (!estoqueId) {
          // Create new stock item
          await addEstoqueItem({
            nome: item.nome_produto,
            quantidade: 0,
            unidade: item.unidade || 'un',
            custo_medio: item.valor_unitario || 0,
            estoque_minimo: 0,
            categoria: 'Geral',
          });
          await fetchAll();
          const newItem = data.estoque.find((e: any) => e.nome === item.nome_produto);
          estoqueId = newItem?.id;
        }

        if (estoqueId) {
          // Add movement to update stock
          await addMovimentacao({
            estoque_id: estoqueId,
            tipo: 'entrada',
            quantidade: item.quantidade || 0,
            custo_unitario: item.valor_unitario || 0,
            nota_fiscal_id: nf.id,
            observacao: `NF: ${parsedData.nome_emitente || 'N/A'}`,
            data: new Date().toISOString(),
          });
        }

        await addItemNotaFiscal({
          nota_fiscal_id: nf.id,
          nome_produto: item.nome_produto,
          quantidade: item.quantidade || 0,
          valor_unitario: item.valor_unitario || 0,
          valor_total: item.valor_total || 0,
          estoque_id: estoqueId,
          status: item.status,
        });
      }

      // Add financial record
      const totalNota = editingItems.filter((i: any) => i.status !== 'ignorado').reduce((s: number, i: any) => s + (i.valor_total || 0), 0);
      await addFinanceiro({
        tipo: 'saida',
        categoria: 'Ingredientes',
        descricao: `Compra - ${parsedData.nome_emitente || 'Nota Fiscal'}`,
        valor: totalNota,
        data: parsedData.data_emissao || new Date().toISOString().slice(0, 10),
        nota_fiscal_id: nf.id,
      });

      toast({ title: 'Nota fiscal importada com sucesso!', description: `${editingItems.filter((i: any) => i.status !== 'ignorado').length} itens processados` });
      setParsedData(null);
      setEditingItems([]);
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setScanning(false);
    }
  };

  const updateEditingItem = (idx: number, field: string, value: any) => {
    setEditingItems(prev => prev.map(item => item.idx === idx ? { ...item, [field]: value } : item));
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="p-4 rounded-full bg-muted/50 w-16 h-16 mx-auto flex items-center justify-center">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">Upload de Nota Fiscal</h3>
              <p className="text-sm text-muted-foreground">Envie imagem ou PDF de NFC-e ou DANFE</p>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
            <Button onClick={() => fileInputRef.current?.click()} disabled={scanning} className="w-full sm:w-auto">
              {scanning ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processando IA...</> : <><Upload className="w-4 h-4 mr-2" />Selecionar Arquivo</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Parsed Data Review */}
      {parsedData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Check className="w-4 h-4 text-income" />
              Dados Extraídos - Revise antes de confirmar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <div><span className="text-muted-foreground">Estabelecimento</span><p className="font-medium">{parsedData.nome_emitente || 'N/A'}</p></div>
              <div><span className="text-muted-foreground">CNPJ</span><p className="font-medium">{parsedData.cnpj || 'N/A'}</p></div>
              <div><span className="text-muted-foreground">Data</span><p className="font-medium">{parsedData.data_emissao || 'N/A'}</p></div>
              <div><span className="text-muted-foreground">Total</span><p className="font-medium text-expense">{fmt(editingItems.reduce((s: number, i: any) => s + (i.valor_total || 0), 0))}</p></div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Produtos ({editingItems.length})</h4>
              {editingItems.map((item, i) => (
                <div key={i} className={`p-3 rounded-lg border ${item.status === 'verificar' ? 'border-warning/50 bg-warning/5' : item.status === 'ignorado' ? 'opacity-50' : 'border-border'}`}>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                    <Input value={item.nome_produto} onChange={e => updateEditingItem(i, 'nome_produto', e.target.value)} className="text-sm sm:col-span-2" />
                    <Input type="number" value={item.quantidade} onChange={e => updateEditingItem(i, 'quantidade', Number(e.target.value))} placeholder="Qtd" className="text-sm" />
                    <Input type="number" step="0.01" value={item.valor_unitario} onChange={e => {
                      const vu = Number(e.target.value);
                      updateEditingItem(i, 'valor_unitario', vu);
                      updateEditingItem(i, 'valor_total', vu * (item.quantidade || 1));
                    }} placeholder="Val. Unit." className="text-sm" />
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium w-20">{fmt(item.valor_total || 0)}</span>
                      <Select value={item.status} onValueChange={v => updateEditingItem(i, 'status', v)}>
                        <SelectTrigger className="h-8 text-xs w-24"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="confirmado">OK</SelectItem>
                          <SelectItem value="verificar">Verificar</SelectItem>
                          <SelectItem value="ignorado">Ignorar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {item.status === 'verificar' && (
                    <p className="text-xs text-warning mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Item requer verificação manual</p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleConfirmNota} disabled={scanning} className="flex-1">
                {scanning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                Confirmar e Importar
              </Button>
              <Button variant="outline" onClick={() => { setParsedData(null); setEditingItems([]); }}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History */}
      <Card>
        <CardHeader><CardTitle className="text-base">Histórico de Notas Fiscais</CardTitle></CardHeader>
        <CardContent>
          {notasFiscais.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-6">Nenhuma nota fiscal importada</p>
          ) : (
            <div className="space-y-2">
              {notasFiscais.map((nf: any) => {
                const items = itensNota.filter((i: any) => i.nota_fiscal_id === nf.id);
                return (
                  <div key={nf.id} className="p-3 rounded-lg border border-border">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{nf.nome_emitente || 'Nota Fiscal'}</p>
                        <p className="text-xs text-muted-foreground">
                          {nf.cnpj_emitente && `CNPJ: ${nf.cnpj_emitente} • `}
                          {nf.data_emissao && new Date(nf.data_emissao).toLocaleDateString('pt-BR')}
                          {` • ${items.length} itens`}
                        </p>
                      </div>
                      <span className="font-semibold text-sm text-expense">{fmt(nf.valor_total)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
