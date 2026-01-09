import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Camera, FileImage, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReceiptData {
  descricao: string;
  valor: number;
  data: string;
  categoria: string;
}

interface ReceiptScannerProps {
  tipo: 'entrada' | 'gasto';
  onResult: (data: ReceiptData) => void;
  trigger?: React.ReactNode;
}

export function ReceiptScanner({ tipo, onResult, trigger }: ReceiptScannerProps) {
  const [open, setOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione apenas imagens');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleProcess = async () => {
    if (!preview) return;

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('parse-receipt', {
        body: { imageBase64: preview, tipo }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      onResult({
        descricao: data.descricao || '',
        valor: parseFloat(data.valor) || 0,
        data: data.data || new Date().toISOString().split('T')[0],
        categoria: data.categoria || (tipo === 'entrada' ? 'Outros' : 'Outros'),
      });

      toast.success('Dados extraídos com sucesso!');
      setOpen(false);
      setPreview(null);
    } catch (error: any) {
      console.error('Receipt scan error:', error);
      toast.error(error.message || 'Erro ao processar comprovante');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className="gap-2"
        >
          <FileImage className="w-4 h-4" />
          Escanear Comprovante
        </Button>
      )}

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Escanear Comprovante
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {!preview ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="p-6 rounded-full bg-muted">
                  <Camera className="w-12 h-12 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Tire uma foto ou selecione uma imagem do seu comprovante/nota fiscal
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <Camera className="w-4 h-4 mr-2" />
                    Tirar Foto
                  </Button>
                  <Button variant="outline" onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.removeAttribute('capture');
                      fileInputRef.current.click();
                      fileInputRef.current.setAttribute('capture', 'environment');
                    }
                  }}>
                    <FileImage className="w-4 h-4 mr-2" />
                    Galeria
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden border border-border">
                  <img 
                    src={preview} 
                    alt="Preview do comprovante" 
                    className="w-full max-h-64 object-contain bg-muted"
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  A IA irá extrair automaticamente as informações do comprovante
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            {preview && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setPreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                >
                  Trocar Foto
                </Button>
                <Button onClick={handleProcess} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Extrair Dados
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
