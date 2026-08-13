import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

const MAX_PROFILE_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

export async function pickProfileImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert("Permission Denied, Please grant access to upload a new photo.")
        return null;

    }


    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) return null;

    const asset = result.assets[0];
    const mimeType = String(asset.mimeType ?? '').toLowerCase();
    const fileSize = Number(asset.fileSize ?? 0);

    if (mimeType && !ALLOWED_MIME_TYPES.includes(mimeType)) {
      Alert.alert('Invalid image type', 'Please upload a JPG, PNG, or WEBP image.');
      return null;
    }

    if (fileSize > MAX_PROFILE_IMAGE_SIZE_BYTES) {
      Alert.alert('Image too large', 'Please choose an image that is 2MB or less.');
      return null;
    }

    return asset;
        
}


