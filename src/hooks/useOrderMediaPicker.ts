import * as ImagePicker from 'expo-image-picker';
import { useCallback, useMemo, useState } from 'react';
import { OrderMediaFile } from "@/types/media";


const toMediaFile = (asset: ImagePicker.ImagePickerAsset, idx: number): OrderMediaFile => {
  const isVideo = asset.type === 'video';
  const ext = isVideo ? 'mp4' : 'jpg';
  return {
    uri: asset.uri,
    name: asset.fileName ?? `upload_${Date.now()}_${idx}.${ext}`,
    mimeType: asset.mimeType ?? (isVideo ? 'video/mp4' : 'image/jpeg'),
    size: asset.fileSize,
    mediaType: isVideo ? 'video' : 'image',
  };
};

export const useOrderMediaPicker = ({
  maxImages = 5,
  allowedVideo = true,
}: {
  maxImages?: number;
  allowedVideo?: boolean;
} = {}) => {
  const [files, setFiles] = useState<OrderMediaFile[]>([]);
  const [error, setError] = useState<string | null>(null);


  const hasVideo = files.some(file => file.mediaType === "video");

  const isFull = files.length >= maxImages;

  const isEmpty = files.length === 0;
  const pickMedia = useCallback(async () => {
    setError(null);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError('Media library permission is required.');
      return;
    }

    const remainingUploads = maxImages - files.length;
    if (isFull) {
      setError(`Maximum of ${maxImages} images allowed.`);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: allowedVideo ? ['images', 'videos'] : ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: remainingUploads,
    });

    if (result.canceled) return;
    const picked = result.assets.map(toMediaFile);
    const pickedVideo = picked.find((f) => f.mediaType === 'video');
    const pickedImages = picked.filter((f) => f.mediaType === 'image');

    if (pickedVideo) {
      setFiles([pickedVideo]);
      if (picked.length > 1) setError('Video selected. Only one video is allowed.');
      return;
    }

    setFiles((prev) => {
      

      const remainingUploads = Math.max(0, maxImages - files.length);

      const alreadyHasVideo = prev.some(file => file.mediaType === "video");
      if (alreadyHasVideo) {
        setError('Remove selected video before adding images.');
        return prev;
      }
      const merged = [...prev, ...pickedImages];
      const unique = merged.filter(
        (file, index, self) =>
          index === self.findIndex(f => f.uri === file.uri)
      );


      if (unique.length >= maxImages) {
        setError(`Maximum of ${maxImages} images allowed.`);
        return unique.slice(0, maxImages);
      }
      return unique;
      
    });
  }, [files, maxImages, allowedVideo]);

  const clearMedia = useCallback(() => {
    setFiles([]);
    setError(null);
  }, []);

  const removeMedia = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  const remainingUploads = maxImages - files.length;

  return {
    files,
    error,
    hasVideo,
    isFull,
    isEmpty,
    remainingUploads,
    pickMedia,
    clearMedia,
    removeMedia,
  };
};

