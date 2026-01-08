import { useFinance } from '@/contexts/FinanceContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MESES, Responsavel } from '@/types/finance';
import { Calendar, User } from 'lucide-react';

export function MonthFilter() {
  const { 
    mesSelecionado, 
    anoSelecionado, 
    responsavelFiltro,
    setMesSelecionado, 
    setAnoSelecionado,
    setResponsavelFiltro 
  } = useFinance();

  const anos = [2024, 2025, 2026];

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-card rounded-lg shadow-card animate-fade-in">
      <div className="flex items-center gap-2 flex-1 min-w-[140px]">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <Select value={mesSelecionado} onValueChange={setMesSelecionado}>
          <SelectTrigger className="flex-1 h-9">
            <SelectValue placeholder="Mês" />
          </SelectTrigger>
          <SelectContent>
            {MESES.map((mes) => (
              <SelectItem key={mes} value={mes}>
                {mes}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Select value={anoSelecionado.toString()} onValueChange={(v) => setAnoSelecionado(parseInt(v))}>
        <SelectTrigger className="w-[90px] h-9">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          {anos.map((ano) => (
            <SelectItem key={ano} value={ano.toString()}>
              {ano}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2 flex-1 min-w-[140px]">
        <User className="w-4 h-4 text-muted-foreground" />
        <Select value={responsavelFiltro} onValueChange={(v) => setResponsavelFiltro(v as Responsavel)}>
          <SelectTrigger className="flex-1 h-9">
            <SelectValue placeholder="Responsável" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos</SelectItem>
            <SelectItem value="William">William</SelectItem>
            <SelectItem value="Andressa">Andressa</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
