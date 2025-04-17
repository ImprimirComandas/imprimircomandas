
-- Create motoboys table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS public.motoboys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    telefone TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS motoboys_user_id_idx ON public.motoboys(user_id);

-- Enable Row Level Security
ALTER TABLE public.motoboys ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own motoboys"
ON public.motoboys FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own motoboys"
ON public.motoboys FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own motoboys"
ON public.motoboys FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own motoboys"
ON public.motoboys FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
