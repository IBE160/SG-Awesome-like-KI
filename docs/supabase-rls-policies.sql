-- Enable RLS for all tables
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;

--
-- RLS Policies for `classes`
--
CREATE POLICY "Users can view their own classes"
ON classes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own classes"
ON classes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own classes"
ON classes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own classes"
ON classes FOR DELETE
USING (auth.uid() = user_id);

--
-- RLS Policies for `class_sections`
--
CREATE POLICY "Users can view sections for their own classes"
ON class_sections FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM classes
    WHERE classes.id = class_sections.class_id
      AND classes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert sections for their own classes"
ON class_sections FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM classes
    WHERE classes.id = class_sections.class_id
      AND classes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update sections for their own classes"
ON class_sections FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM classes
    WHERE classes.id = class_sections.class_id
      AND classes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete sections for their own classes"
ON class_sections FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM classes
    WHERE classes.id = class_sections.class_id
      AND classes.user_id = auth.uid()
  )
);

--
-- RLS Policies for `study_materials`
--
CREATE POLICY "Users can view study materials for their own classes"
ON study_materials FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM classes
    WHERE classes.id = study_materials.class_id
      AND classes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert study materials for their own classes"
ON study_materials FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM classes
    WHERE classes.id = study_materials.class_id
      AND classes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update study materials for their own classes"
ON study_materials FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM classes
    WHERE classes.id = study_materials.class_id
      AND classes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete study materials for their own classes"
ON study_materials FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM classes
    WHERE classes.id = study_materials.class_id
      AND classes.user_id = auth.uid()
  )
);

--
-- RLS Policies for `generated_content`
--
CREATE POLICY "Users can view generated content for their own classes"
ON generated_content FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM classes
    WHERE classes.id = generated_content.class_id
      AND classes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert generated content for their own classes"
ON generated_content FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM classes
    WHERE classes.id = generated_content.class_id
      AND classes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update generated content for their own classes"
ON generated_content FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM classes
    WHERE classes.id = generated_content.class_id
      AND classes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete generated content for their own classes"
ON generated_content FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM classes
    WHERE classes.id = generated_content.class_id
      AND classes.user_id = auth.uid()
  )
);
