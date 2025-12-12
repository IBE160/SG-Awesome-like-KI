
ALTER TABLE public.generated_content
ADD COLUMN IF NOT EXISTS class_id uuid NULL;

ALTER TABLE public.generated_content
ADD COLUMN IF NOT EXISTS class_section_id uuid NULL;

ALTER TABLE public.generated_content
ADD CONSTRAINT fk_generated_content_class_id
FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL;

ALTER TABLE public.generated_content
ADD CONSTRAINT fk_generated_content_class_section_id
FOREIGN KEY (class_section_id) REFERENCES public.class_sections(id) ON DELETE SET NULL;

