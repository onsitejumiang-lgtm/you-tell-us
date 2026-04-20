-- Replace broad SELECT policy with a non-listing equivalent.
-- Public URLs (CDN) still work because they bypass the listing API; this only prevents enumerating storage.objects via the API.
DROP POLICY IF EXISTS "Suggestion media is publicly readable" ON storage.objects;

-- No SELECT policy on storage.objects for this bucket = no listing/metadata enumeration.
-- The bucket remains marked public so direct file URLs continue to load via the CDN.