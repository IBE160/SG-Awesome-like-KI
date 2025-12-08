-- Make class_id nullable in study_materials table
ALTER TABLE public.study_materials ALTER COLUMN class_id DROP NOT NULL;
