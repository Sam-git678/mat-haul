import { useAuth } from '@/app/context/authcontext';
import { appStyles } from "@/constants";
import { getPublicBaseUrl } from '@/utils/helper';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';

const Avatar = () => {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [profileImageUrl, setProfileImageUrl] = useState("");
    const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

   
    const baseUrl = getPublicBaseUrl();
    const profileImagePath = `${baseUrl}${user?.profileimageurl}`;
    useEffect(() => {
            
        const avatar = (user as any)?.profileimageurl?.trim();
        if (avatar) {
            setProfileImageUrl(profileImagePath);
            setAvatarLoadFailed(false);
        } else {
            setProfileImageUrl("");
            setAvatarLoadFailed(false);
        }
    }, [user]);

    const shouldShowProfileImage = Boolean(profileImageUrl) && !avatarLoadFailed;
    return (
        <View>
            <TouchableOpacity onPress={() => router.push('/profile')}>
                {shouldShowProfileImage ? (
                    <Image
                        source={{ uri: profileImageUrl }}
                        style={appStyles.avatar}
                        onError={() => setAvatarLoadFailed(true)}
                    />
                ) : (
                    <View
                        style={[
                            appStyles.avatar,
                            { backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
                        ]}
                    >
                        <Ionicons name="person" size={24} color="#64748B" />
                    </View>
                )}
            </TouchableOpacity>

            
        </View>
    )
}

export default Avatar