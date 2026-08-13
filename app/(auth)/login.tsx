import FormField from '@/components/FormField';
import { appStyles, colors, spacing, typography } from "@/constants";
import { authApi } from "@/src/config/api";
import { LoginData, loginSchema } from "@/src/schemas/auth.schema";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,

  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/authcontext";




export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { control, handleSubmit, formState: { errors } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleLogin = async (loginData: LoginData) => {

    setIsSubmitting(true);
    setError(null);



    const credentials = {

      email: loginData.email.trim().toLowerCase(),
      password: loginData.password,

    };



    const result = await authApi.login(credentials);


    if (result.success) {

      const data = result.data as any;

      const { tokens, user } = data;
      await login({ tokens, user });
      setIsSubmitting(false);

      router.replace("/home");
    } else {
      setError(result.message || "Login failed. Please try again.");
      setIsSubmitting(false);
      return;
    }

  };



  return (

    <SafeAreaView style={appStyles.containerWhite} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={appStyles.authScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={appStyles.authContent}>
            {/* Logo Section */}
            <View style={appStyles.logoContainer}>
              <View style={appStyles.logoWrapper}>
                <Image
                  source={require("../../assets/images/charismat-icon.png")}
                  style={appStyles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={appStyles.authTitle}>Welcome Back</Text>
              <Text style={appStyles.authSubtitle}>Login to access your dashboard</Text>
            </View>

            {/* Email Field */}
            

            <FormField
              required=''
              label="Email Address"
              placeholder="name@example.com"
              icon="mail-outline"
              control={control}
              name="email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={true}
              editable={!isSubmitting}
              errorText={errors.email?.message}
            />

            {/* Password Field */}
            

            <FormField
              required=''
              label="Password"
              placeholder="Enter your password"
              secureTextEntry={!passwordVisible}
              icon="lock-closed-outline"
              control={control}
              name="password"
              keyboardType="default"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSubmitting}
              errorText={errors.password?.message}

              rightIcon={
                <TouchableOpacity
                  onPress={() => setPasswordVisible(!passwordVisible)}
                >
                  <Ionicons
                    name={
                      passwordVisible
                        ? "eye-off-outline"
                        : "eye-outline"
                    }
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              }
            />



            <View style={appStyles.forgotWrapper}>
              <Text><Link href={"/forgot-password"} style={appStyles.linkText}>Forgot Password?</Link></Text>

            </View>

            <TouchableOpacity
              style={[appStyles.primaryButton, isSubmitting && appStyles.buttonDisabled]}
              activeOpacity={0.8}
              onPress={handleSubmit(handleLogin)}
              disabled={isSubmitting}
            >

              {isSubmitting ? (
                <ActivityIndicator size="small" color={colors.white} style={{ marginRight: spacing[2] }} />
              ) : (
                <Text style={appStyles.primaryButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {error ? (
              <View style={appStyles.errorContainer}>
                <Text style={appStyles.errorText}>{error}</Text>
              </View>
            ) : null}




            {/* Registration Link */}
            <View style={appStyles.registerContainer}>
              <Text style={appStyles.helperText}>Don&apos;t have an account? </Text>
              <Link href={"./signup"} asChild>
                <TouchableOpacity>
                  <Text style={[appStyles.linkText, { fontWeight: typography.fontWeight.extrabold }]}>Signup</Text>
                </TouchableOpacity>
              </Link>
            </View>



          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

