-- Create students table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "fullName" TEXT NOT NULL,
    "studentPhone" TEXT UNIQUE NOT NULL,
    "parentPhone" TEXT,
    "stageId" TEXT NOT NULL,
    password TEXT NOT NULL,
    progress INTEGER DEFAULT 0,
    "lastQuiz" TEXT DEFAULT 'لا يوجد',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on Row Level Security (RLS)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated access for local development & testing
CREATE POLICY "Allow public read access on students" ON public.students
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on students" ON public.students
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access on students" ON public.students
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access on students" ON public.students
    FOR DELETE USING (true);

-- Create initial demo student for local testing
INSERT INTO public.students ("fullName", "studentPhone", "parentPhone", "stageId", password, progress, "lastQuiz")
VALUES 
('أحمد محمد علي (طالب محلي تجريبي)', '01012345678', '01098765432', 'sec3', 'password123', 80, 'المحاضرة الأولى: قواعد الأزمنة')
ON CONFLICT ("studentPhone") DO NOTHING;

-- Grant permissions to Supabase roles
GRANT ALL ON TABLE public.students TO anon, authenticated, service_role;
