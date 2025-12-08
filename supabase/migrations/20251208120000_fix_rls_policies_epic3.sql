-- Fix RLS policies for study_materials and generated_content

--
-- RLS Policies for `study_materials`
--

-- Drop existing policies for study_materials
DROP POLICY IF EXISTS "Users can view study materials for their own classes" ON public.study_materials;
DROP POLICY IF EXISTS "Users can insert study materials for their own classes" ON public.study_materials;
DROP POLICY IF EXISTS "Users can update study materials for their own classes" ON public.study_materials;
DROP POLICY IF EXISTS "Users can delete study materials for their own classes" ON public.study_materials;
DROP POLICY IF EXISTS "Users can insert their own study materials" ON public.study_materials;


-- Create corrected policies for study_materials
CREATE POLICY "Users can view their own study materials"
ON public.study_materials FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study materials"
ON public.study_materials FOR INSERT
WITH CHECK (
  (user_id = auth.uid())
  AND
  (
    class_id IS NULL
    OR
    EXISTS (
      SELECT 1
      FROM classes
      WHERE classes.id = study_materials.class_id
        AND classes.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update their own study materials"
ON public.study_materials FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  (user_id = auth.uid())
  AND
  (
    class_id IS NULL
    OR
    EXISTS (
      SELECT 1
      FROM classes
      WHERE classes.id = study_materials.class_id
        AND classes.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can delete their own study materials"
ON public.study_materials FOR DELETE
USING (auth.uid() = user_id);


--
-- RLS Policies for `generated_content`
--

-- Drop existing policies for generated_content
DROP POLICY IF EXISTS "Users can view generated content for their own classes" ON public.generated_content;
DROP POLICY IF EXISTS "Users can insert generated content for their own classes" ON public.generated_content;
DROP POLICY IF EXISTS "Users can update generated content for their own classes" ON public.generated_content;
DROP POLICY IF EXISTS "Users can delete generated content for their own classes" ON public.generated_content;
DROP POLICY IF EXISTS "Users can view generated content for their own study materials" ON public.generated_content;
DROP POLICY IF EXISTS "Users can insert generated content for their own study materials" ON public.generated_content;
DROP POLICY IF EXISTS "Users can update generated content for their own study materials" ON public.generated_content;
DROP POLICY IF EXISTS "Users can delete generated content for their own study materials" ON public.generated_content;


-- Create corrected policies for generated_content
CREATE POLICY "Users can access generated content for their own study materials"
ON public.generated_content FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM study_materials
    WHERE study_materials.id = generated_content.study_material_id
      AND study_materials.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM study_materials
    WHERE study_materials.id = generated_content.study_material_id
      AND study_materials.user_id = auth.uid()
  )
);
