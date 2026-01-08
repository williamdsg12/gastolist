-- Create shopping list table (lista_compras)
CREATE TABLE public.lista_compras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  produto TEXT NOT NULL,
  quantidade NUMERIC NOT NULL DEFAULT 1,
  unidade TEXT DEFAULT 'un',
  preco NUMERIC DEFAULT 0,
  categoria TEXT NOT NULL DEFAULT 'Outros',
  comprado BOOLEAN NOT NULL DEFAULT false,
  loja TEXT,
  observacao TEXT,
  foto_url TEXT,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.lista_compras ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own shopping items" 
ON public.lista_compras 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shopping items" 
ON public.lista_compras 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shopping items" 
ON public.lista_compras 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shopping items" 
ON public.lista_compras 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add index for faster queries
CREATE INDEX idx_lista_compras_user_id ON public.lista_compras(user_id);
CREATE INDEX idx_lista_compras_data ON public.lista_compras(data);