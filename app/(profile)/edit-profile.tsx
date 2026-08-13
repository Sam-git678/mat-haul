import { appStyles, colors } from "@/constants";
import { profileApi } from '@/src/config/api';
import { EditProfileFormData, editProfileSchema } from '@/src/schemas/editprofile.schema';
import { pickProfileImage } from '@/utils/fileupload';
import { handleSessionExpired } from '@/utils/helper';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/authcontext';

export default function EditProfileScreen() {
  const { accesstoken, logout, updateUser, user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

  const { control, handleSubmit, formState: { errors }, reset } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: '', lastName: '', email: '',
      phone: '',
      companyName: '',
      companyAddress: '',
      companyRegistrationNumber: '',
    }
  });
  const lastNameRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const normalizedUserType = String(
    (user as any)?.usertype ??
    (user as any)?.userType ??
    (user as any)?.accounttype ??
    (user as any)?.accountType ??
    ''
  )
    .trim()
    .toLowerCase();

  const isB2BUser =
    normalizedUserType === 'b2b' ||
    normalizedUserType === 'business' ||
    Boolean((user as any)?.companyname || (user as any)?.companyName);

  useEffect(() => {
    if (!user) return;

    reset({
      firstName: String((user as any)?.firstname ?? '').trim(),
      lastName: String((user as any)?.lastname ?? '').trim(),
      email: String((user as any)?.email ?? '').trim().toLowerCase(),
      phone: String((user as any)?.phone ?? '').trim(),
      companyName: String((user as any)?.companyname ?? '').trim(),
      companyAddress: String((user as any)?.companyaddress ?? '').trim(),
      companyRegistrationNumber: String((user as any)?.companyregistrationnumber ?? '').trim(),
    });
  }, [reset, user]);

  const onSubmit = async (data: EditProfileFormData) => {
    
    setError(null);
    setIsSubmitting(true);

    try {
      let uploadedImageUrl: string | undefined;

      if (selectedImage?.uri) {
        const imageForm = new FormData();
        imageForm.append('image', {
          uri: selectedImage.uri,
          name: selectedImage.fileName || 'profile.jpg',
          type: selectedImage.mimeType || 'image/jpeg',
        } as any);

        const imageUploadResult = await profileApi.uploadProfileImage(imageForm, accesstoken);

        if (await handleSessionExpired(imageUploadResult, logout, (path) => router.replace(path as any))) {
          return;
        }

        if (!imageUploadResult.success) {
          setError(imageUploadResult.message || 'Failed to upload profile image. Please try again.');
          return;
        }

        const uploadData = imageUploadResult.data as any;
        uploadedImageUrl = String(
          uploadData?.data?.profileimageurl ??
          uploadData?.profileimageurl ??
          uploadData?.data?.url ??
          uploadData?.url ??
          ''
        ).trim() || undefined;
      }

      const updatePayload: Record<string, string> = {
        firstname: data.firstName.trim(),
        lastname: data.lastName.trim(),
        email: data.email.trim().toLowerCase(),
      };
      const currentPhone = String((user as any)?.phone ?? '').trim();
      
      

      if (isB2BUser) {
        updatePayload.companyname = String(data.companyName ?? '').trim();
        updatePayload.companyaddress = String(data.companyAddress ?? '').trim();
        updatePayload.companyregistrationnumber = String(data.companyRegistrationNumber ?? '').trim();
      }

      if (uploadedImageUrl) {
        updatePayload.profileimageurl = uploadedImageUrl;
      }

      const result = await profileApi.updateProfile(updatePayload, accesstoken);

      

      await handleSessionExpired(result, logout, (path) => router.replace(path as any));
        

      if (!result.success) {
        setError(result.message || 'Failed to update profile. Please try again.');
        return;
      }

      const responseData = result.data as any;
      const returnedUser = responseData?.profile ?? responseData?.data?.profile ?? responseData?.data?.user ?? {};

      await updateUser({
        firstname: returnedUser?.firstname ?? data.firstName.trim(),
        lastname: returnedUser?.lastname ?? data.lastName.trim(),
        name: `${data.firstName.trim()} ${data.lastName.trim()}`.trim(),
        email: returnedUser?.email ?? data.email.trim().toLowerCase(),
        phone: returnedUser?.phone ?? currentPhone,
        profileimageurl: returnedUser?.profileimageurl ?? uploadedImageUrl ?? String((user as any)?.profileimageurl ?? '').trim(),
      });
      

      router.back();
    } finally {
      setIsSubmitting(false);
    }
  };

  const onInvalidSubmit = () => {
    const messages = [
      errors.firstName?.message,
      errors.lastName?.message,
      errors.phone?.message,
      errors.email?.message,
    ].filter(Boolean);

    Alert.alert(
      'Cannot save yet',
      messages.length > 0 ? String(messages[0]) : 'Please complete all required fields correctly.'
    );
  };

  const handlePickImage = async () => {
    const image = await pickProfileImage();
    if (image) {
      setSelectedImage(image);
      setAvatarLoadFailed(false);
    }
  }

  const profileImageSource = selectedImage?.uri || String((user as any)?.profileimageurl ?? '').trim();
  const shouldShowProfileImage = Boolean(profileImageSource) && !avatarLoadFailed;

  return (
    <SafeAreaView style={appStyles.containerGray} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, backgroundColor: '#F9FAFB' }}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={appStyles.pageHeaderBetween}>
          <TouchableOpacity onPress={() => router.back()} style={appStyles.circleIconButton}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={appStyles.pageHeaderTitle}>Edit Profile</Text>
          <View style={appStyles.pageHeaderSpacer} />
        </View>

        <ScrollView contentContainerStyle={appStyles.formPageContent} showsVerticalScrollIndicator={false}>
          <View style={appStyles.avatarContainer}>
            <View>
              {shouldShowProfileImage ? (
                <Image
                  source={{ uri: profileImageSource }}
                  style={appStyles.avatarImage}
                  onError={() => setAvatarLoadFailed(true)}
                />
              ) : (
                <View
                  style={[
                    appStyles.avatarImage,
                    { backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
                  ]}
                >
                  <Ionicons name="person" size={52} color="#64748B" />
                </View>
              )}
              <TouchableOpacity style={appStyles.avatarCameraBadge} onPress={handlePickImage}>
                <Ionicons name="camera" size={18} color="white" />
              </TouchableOpacity>
            </View>
            <Text style={localStyles.profileName}>
              {String((user as any)?.name ?? `${(user as any)?.firstname ?? ''} ${(user as any)?.lastname ?? ''}`).trim() || 'Your Profile'}
            </Text>
            <Text style={localStyles.profileEmail}>{String((user as any)?.email ?? '').trim()}</Text>
          </View>

          <View style={appStyles.formCard}>
            <Text style={appStyles.formCardTitle}>Basic Information</Text>
            <View style={appStyles.divider} />

            <Text style={appStyles.formLabel}>First Name</Text>
            <View style={appStyles.formInputContainer}>
              <Controller
                control={control}
                name="firstName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={appStyles.formInputText}
                    placeholder="Enter your first name"
                    placeholderTextColor="#94A3B8"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="words"
                    returnKeyType="next"
                    onSubmitEditing={() => lastNameRef.current?.focus()}
                  />
                )}
              />
            </View>
            {errors.firstName && <Text style={appStyles.errorTextTight}>{errors.firstName.message}</Text>}

            <Text style={appStyles.formLabel}>Last Name</Text>
            <View style={appStyles.formInputContainer}>
              <Controller
                control={control}
                name="lastName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    ref={lastNameRef}
                    style={appStyles.formInputText}
                    placeholder="Enter your last name"
                    placeholderTextColor="#94A3B8"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="words"
                    returnKeyType="next"
                    onSubmitEditing={() => phoneRef.current?.focus()}
                  />
                )}
              />
            </View>
            {errors.lastName && <Text style={appStyles.errorTextTight}>{errors.lastName.message}</Text>}

            <Text style={appStyles.formLabel}>Phone Number</Text>
            <View style={appStyles.formInputContainer}>
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    ref={phoneRef}
                    style={appStyles.formInputText}
                    placeholder="Enter your phone number"
                    placeholderTextColor="#94A3B8"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="none"
                    keyboardType="phone-pad"
                    returnKeyType="next"
                    onSubmitEditing={() => emailRef.current?.focus()}
                  />
                )}
              />
            </View>
            {errors.phone && <Text style={appStyles.errorTextTight}>{errors.phone.message}</Text>}

            <Text style={appStyles.formLabel}>Email Address</Text>
            <View style={appStyles.formInputContainer}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    ref={emailRef}
                    style={appStyles.formInputText}
                    placeholder="Enter your email address"
                    placeholderTextColor="#94A3B8"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    returnKeyType="done"
                  />
                )}
              />
            </View>
            {errors.email && <Text style={appStyles.errorTextTight}>{errors.email.message}</Text>}
            {error && <Text style={appStyles.errorText}>{error}</Text>}
          </View>

          {isB2BUser ? (
            <View style={appStyles.formCard}>
              <Text style={appStyles.formCardTitle}>B2B Accounts</Text>
              <View style={appStyles.divider} />

              <Text style={appStyles.formLabel}>Company Name</Text>
              <View style={appStyles.formInputContainer}>
                <Controller
                  control={control}
                  name="companyName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={appStyles.formInputText}
                      placeholder="Enter company name"
                      placeholderTextColor="#94A3B8"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      autoCapitalize="words"
                    />
                  )}
                />
              </View>

              <Text style={appStyles.formLabel}>Company Address</Text>
              <View style={appStyles.formInputContainer}>
                <Controller
                  control={control}
                  name="companyAddress"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={appStyles.formInputText}
                      placeholder="Enter company address"
                      placeholderTextColor="#94A3B8"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </View>

              <Text style={appStyles.formLabel}>Company Registration Number</Text>
              <View style={appStyles.formInputContainer}>
                <Controller
                  control={control}
                  name="companyRegistrationNumber"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={appStyles.formInputText}
                      placeholder="Enter registration number"
                      placeholderTextColor="#94A3B8"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      autoCapitalize="characters"
                    />
                  )}
                />
              </View>
            </View>
          ) : null}

          <View style={{ height: 50 }} />
        </ScrollView>

        <View style={[appStyles.stickyFooter, { paddingBottom: insets.bottom + 10 }]}>
          <TouchableOpacity
            style={[appStyles.pillPrimaryButton, isSubmitting && appStyles.buttonDisabled]}
            onPress={handleSubmit(onSubmit, onInvalidSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <View style={localStyles.buttonBusyRow}>
                <ActivityIndicator size="small" color={colors.white} />
                <Text style={[appStyles.pillPrimaryButtonText, { marginLeft: 8 }]}>Saving...</Text>
              </View>
            ) : (
              <Text style={appStyles.pillPrimaryButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  profileName: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '700',
    color: '#101828',
  },
  profileEmail: {
    marginTop: 2,
    fontSize: 14,
    color: '#667085',
  },
  buttonBusyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
