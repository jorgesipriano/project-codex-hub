-- Create documents table
CREATE TABLE public.documents (
  id TEXT NOT NULL PRIMARY KEY,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create navigation table
CREATE TABLE public.navigation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  structure JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation ENABLE ROW LEVEL SECURITY;

-- RLS policies - only authenticated users can access
CREATE POLICY "Authenticated users can view documents"
ON public.documents
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert documents"
ON public.documents
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update documents"
ON public.documents
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete documents"
ON public.documents
FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can view navigation"
ON public.navigation
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert navigation"
ON public.navigation
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update navigation"
ON public.navigation
FOR UPDATE
TO authenticated
USING (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_navigation_updated_at
BEFORE UPDATE ON public.navigation
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();