-- Create the `classes` table
CREATE TABLE public.classes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    user_id uuid NOT NULL,
    CONSTRAINT classes_pkey PRIMARY KEY (id),
    CONSTRAINT classes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Create the `class_sections` table
CREATE TABLE public.class_sections (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    class_id uuid NOT NULL,
    CONSTRAINT class_sections_pkey PRIMARY KEY (id),
    CONSTRAINT class_sections_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes (id) ON DELETE CASCADE
);

-- Create the `study_materials` table
CREATE TABLE public.study_materials (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    file_name text NOT NULL,
    original_name text NOT NULL,
    storage_path text NOT NULL,
    file_type text NOT NULL,
    file_size integer NOT NULL,
    extracted_text text NULL,
    class_id uuid NULL, -- Changed to NULLable based on tech-spec
    class_section_id uuid NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    is_archived boolean NOT NULL DEFAULT false,
    CONSTRAINT study_materials_pkey PRIMARY KEY (id),
    CONSTRAINT study_materials_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes (id) ON DELETE CASCADE,
    CONSTRAINT study_materials_class_section_id_fkey FOREIGN KEY (class_section_id) REFERENCES public.class_sections (id) ON DELETE CASCADE,
    CONSTRAINT study_materials_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Create the `generated_content` table
CREATE TABLE public.generated_content (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    type text NOT NULL,
    content jsonb NOT NULL,
    study_material_id uuid NOT NULL,
    class_id uuid NULL,
    class_section_id uuid NULL,
    CONSTRAINT generated_content_pkey PRIMARY KEY (id),
    CONSTRAINT generated_content_study_material_id_fkey FOREIGN KEY (study_material_id) REFERENCES public.study_materials (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_generated_content_class_id FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL,
    CONSTRAINT fk_generated_content_class_section_id FOREIGN KEY (class_section_id) REFERENCES public.class_sections(id) ON DELETE SET NULL
);

-- Drop redundant junction tables
DROP TABLE IF EXISTS public.generated_content_materials;
DROP TABLE IF EXISTS public.generated_content_sections;

