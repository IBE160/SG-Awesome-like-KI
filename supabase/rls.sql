-- Enable RLS for all tables
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;

--
-- RLS Policies for `classes`
--
DROP POLICY IF EXISTS "Users can view their own classes" ON classes;
DROP POLICY IF EXISTS "Users can insert their own classes" ON classes;
DROP POLICY IF EXISTS "Users can update their own classes" ON classes;
DROP POLICY IF EXISTS "Users can delete their own classes" ON classes;

CREATE POLICY "Users can view their own classes" ON classes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own classes" ON classes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own classes" ON classes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own classes" ON classes FOR DELETE USING (auth.uid() = user_id);

--
-- RLS Policies for `class_sections`
--
DROP POLICY IF EXISTS "Users can view sections for their own classes" ON class_sections;
DROP POLICY IF EXISTS "Users can insert sections for their own classes" ON class_sections;
DROP POLICY IF EXISTS "Users can update sections for their own classes" ON class_sections;
DROP POLICY IF EXISTS "Users can delete sections for their own classes" ON class_sections;

CREATE POLICY "Users can view sections for their own classes" ON class_sections FOR SELECT USING (EXISTS (SELECT 1 FROM classes WHERE classes.id = class_sections.class_id AND classes.user_id = auth.uid()));
CREATE POLICY "Users can insert sections for their own classes" ON class_sections FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM classes WHERE classes.id = class_sections.class_id AND classes.user_id = auth.uid()));
CREATE POLICY "Users can update sections for their own classes" ON class_sections FOR UPDATE USING (EXISTS (SELECT 1 FROM classes WHERE classes.id = class_sections.class_id AND classes.user_id = auth.uid()));
CREATE POLICY "Users can delete sections for their own classes" ON class_sections FOR DELETE USING (EXISTS (SELECT 1 FROM classes WHERE classes.id = class_sections.class_id AND classes.user_id = auth.uid()));

--
-- RLS Policies for `study_materials` (CORRECTED AND SIMPLIFIED)
--
DROP POLICY IF EXISTS "Users can view study materials for their own classes" ON study_materials;
DROP POLICY IF EXISTS "Users can insert study materials for their own classes" ON study_materials;
DROP POLICY IF EXISTS "Users can update study materials for their own classes" ON study_materials;
DROP POLICY IF EXISTS "Users can delete study materials for their own classes" ON study_materials;

-- New, simpler policies that correctly handle materials with or without a class
CREATE POLICY "Users can view their own study_materials" ON study_materials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own study_materials" ON study_materials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own study_materials" ON study_materials FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own study_materials" ON study_materials FOR DELETE USING (auth.uid() = user_id);

--
-- RLS Policies for `generated_content`
--
DROP POLICY IF EXISTS "Users can view their own generated content" ON generated_content;
DROP POLICY IF EXISTS "Users can insert their own generated content" ON generated_content;
DROP POLICY IF EXISTS "Users can update their own generated content" ON generated_content;
DROP POLICY IF EXISTS "Users can delete their own generated content" ON generated_content;

CREATE POLICY "Users can view their own generated content" ON generated_content FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own generated content" ON generated_content FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own generated content" ON generated_content FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own generated content" ON generated_content FOR DELETE USING (auth.uid() = user_id);

--
-- RLS Policies for Storage `study-materials`
--
DROP POLICY IF EXISTS "Users can view their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

CREATE POLICY "Users can view their own folder" ON storage.objects FOR SELECT USING (bucket_id = 'study-materials' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can upload to their own folder" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'study-materials' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can update their own files" ON storage.objects FOR UPDATE USING (bucket_id = 'study-materials' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete their own files" ON storage.objects FOR DELETE USING (bucket_id = 'study-materials' AND (storage.foldername(name))[1] = auth.uid()::text);

--
-- RLS Policies for `profiles`
--
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

