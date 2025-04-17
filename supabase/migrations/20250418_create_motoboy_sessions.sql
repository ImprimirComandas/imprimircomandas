
-- Create motoboy_sessions table
CREATE TABLE IF NOT EXISTS public.motoboy_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    motoboy_id UUID NOT NULL REFERENCES public.motoboys(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS motoboy_sessions_motoboy_id_idx ON public.motoboy_sessions(motoboy_id);
CREATE INDEX IF NOT EXISTS motoboy_sessions_user_id_idx ON public.motoboy_sessions(user_id);

-- Enable Row Level Security
ALTER TABLE public.motoboy_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own motoboy sessions"
ON public.motoboy_sessions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own motoboy sessions"
ON public.motoboy_sessions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own motoboy sessions"
ON public.motoboy_sessions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);
