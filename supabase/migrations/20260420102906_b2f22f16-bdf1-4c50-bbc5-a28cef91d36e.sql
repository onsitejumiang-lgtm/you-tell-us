-- Roles enum + table (security best practice: roles in separate table)
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer to avoid recursive RLS
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Suggestion status enum
CREATE TYPE public.suggestion_status AS ENUM ('new', 'sourcing', 'sourced', 'rejected');

-- Product suggestions table
CREATE TABLE public.product_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL CHECK (char_length(product_name) BETWEEN 1 AND 200),
  intended_use TEXT NOT NULL CHECK (char_length(intended_use) BETWEEN 1 AND 1000),
  preferred_brand TEXT CHECK (preferred_brand IS NULL OR char_length(preferred_brand) <= 100),
  expected_price NUMERIC(12,2) CHECK (expected_price IS NULL OR expected_price >= 0),
  currency TEXT NOT NULL DEFAULT 'NGN' CHECK (char_length(currency) <= 8),
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image','video') OR media_type IS NULL),
  status suggestion_status NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_suggestions_created_at ON public.product_suggestions (created_at DESC);
CREATE INDEX idx_product_suggestions_status ON public.product_suggestions (status);
CREATE INDEX idx_product_suggestions_user_id ON public.product_suggestions (user_id);

ALTER TABLE public.product_suggestions ENABLE ROW LEVEL SECURITY;

-- Anyone (anon or authenticated) can insert a suggestion
CREATE POLICY "Anyone can submit a suggestion"
  ON public.product_suggestions FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    -- if logged in, user_id must match; if anon, user_id must be null
    (auth.uid() IS NULL AND user_id IS NULL)
    OR (auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid()))
  );

-- Only admins can read submissions
CREATE POLICY "Admins can view all suggestions"
  ON public.product_suggestions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can update
CREATE POLICY "Admins can update suggestions"
  ON public.product_suggestions FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete
CREATE POLICY "Admins can delete suggestions"
  ON public.product_suggestions FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_product_suggestions_updated_at
  BEFORE UPDATE ON public.product_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for media uploads (public read for admin previews)
INSERT INTO storage.buckets (id, name, public)
VALUES ('suggestion-media', 'suggestion-media', true);

CREATE POLICY "Anyone can upload suggestion media"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'suggestion-media');

CREATE POLICY "Suggestion media is publicly readable"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'suggestion-media');

CREATE POLICY "Admins can delete suggestion media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'suggestion-media' AND public.has_role(auth.uid(), 'admin'));