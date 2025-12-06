-- Create a new migration to add nullable class_id and class_section_id to the generated_content table.
-- These columns will allow generated content to exist without being immediately assigned to a class or section,
-- enabling the "unorganized" state described in the story's Acceptance Criteria 2.

ALTER TABLE public.generated_content
ADD COLUMN class_id uuid NULL;

ALTER TABLE public.generated_content
ADD COLUMN class_section_id uuid NULL;

-- Add foreign key constraints for the new columns.
-- Using ON DELETE SET NULL ensures that if a class or section is deleted,
-- the associated generated content remains, but becomes unassigned.
ALTER TABLE public.generated_content
ADD CONSTRAINT fk_generated_content_class_id
FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL;

ALTER TABLE public.generated_content
ADD CONSTRAINT fk_generated_content_class_section_id
FOREIGN KEY (class_section_id) REFERENCES public.class_sections(id) ON DELETE SET NULL;

-- Optional: Add RLS policies for the new columns if necessary,
-- but typically RLS is handled at the table level and will apply to all columns.
