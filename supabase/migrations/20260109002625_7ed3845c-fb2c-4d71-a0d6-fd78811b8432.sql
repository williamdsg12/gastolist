-- Create storage bucket for product images and receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true);

-- Allow authenticated users to upload images
CREATE POLICY "Users can upload images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'images' 
  AND auth.uid() IS NOT NULL
);

-- Allow authenticated users to view their images
CREATE POLICY "Users can view images"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'images'
);

-- Allow authenticated users to delete their images
CREATE POLICY "Users can delete their images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'images' 
  AND auth.uid() IS NOT NULL
);