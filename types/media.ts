export type OrderMediaFile = {
  uri: string;
  name: string;
  mimeType: string;
  mediaType: 'image' | 'video';
   size?: number;
};

export interface MediaUploadGridProps {
  files: OrderMediaFile[];
  maxFiles?: number;
  error?: string | null;

  onAdd: () => void;
  onRemove: (index: number) => void;
  onPreview?: (file: OrderMediaFile) => void;
}