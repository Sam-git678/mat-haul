import { appStyles, colors, typography } from "@/constants";
import { authApi } from "@/src/config/api";
import { ForgotPasswordFormData, forgotPasswordSchema } from "@/src/schemas/auth.schema";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";





export default function ForgotPassword() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: "" },
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsSubmitting(true);
        setError(null);
        setSuccessMessage(null);

        const payload = {
            email: data.email.trim().toLowerCase(),
        };

        const result = await authApi.forgotPassword(payload);

        if (result.success) {
            setSuccessMessage(
                result.message || "If that email is registered, a reset link has been sent."
            );
        } else {
            setError(result.message || "Unable to send reset link. Please try again.");
        }

        setIsSubmitting(false);
    };

    return (
        <SafeAreaView style={appStyles.containerWhite} edges={["top", "bottom"]}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={appStyles.contentCompact}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={appStyles.headerSection}>
                        
                        <Text style={appStyles.authTitle}>Forgot Password?</Text>
                        <Text style={appStyles.subHeaderText}>
                            Enter your registered email address and we&apos;ll send you a reset link.
                        </Text>
                    </View>

                    <View style={appStyles.formSection}>
                        <Text style={appStyles.formLabel}>Email Address</Text>
                        <View
                            style={[
                                appStyles.inputContainer,
                                errors.email && appStyles.inputError,
                            ]}
                        >
                            <Ionicons
                                name="mail-outline"
                                size={20}
                                color={colors.textSubtle}
                                style={appStyles.inputIcon}
                            />
                            <Controller
                                control={control}
                                name="email"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        style={appStyles.inputText}
                                        placeholder="example@email.com"
                                        placeholderTextColor={colors.textSubtle}
                                        keyboardType="email-address"
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                )}
                            />
                        </View>
                        {errors.email ? (
                            <Text style={appStyles.errorText}>{errors.email.message}</Text>
                        ) : null}

                        {error ? (
                            <View style={appStyles.errorContainer}>
                                <Text style={appStyles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        {successMessage ? (
                            <View
                                style={{
                                    backgroundColor: colors.successBg,
                                    borderColor: colors.success,
                                    borderWidth: 1,
                                    borderRadius: 10,
                                    paddingVertical: 10,
                                    paddingHorizontal: 12,
                                    marginTop: 8,
                                }}
                            >
                                <Text
                                    style={{
                                        color: colors.success,
                                        fontSize: typography.fontSize.sm,
                                        fontWeight: typography.fontWeight.medium,
                                    }}
                                >
                                    {successMessage}
                                </Text>
                            </View>
                        ) : null}

                        <TouchableOpacity
                            style={[
                                appStyles.primaryButton,
                                appStyles.primaryButtonSpaced,
                                isSubmitting && appStyles.buttonDisabled,
                            ]}
                            onPress={handleSubmit(onSubmit)}
                            activeOpacity={0.8}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color={colors.white} />
                            ) : (
                                <Text style={appStyles.primaryButtonText}>Send Reset Code</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={appStyles.footerRowCentered}>
                        <Text style={appStyles.helperText}>Remember your password?</Text>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text
                                style={[
                                    appStyles.linkText,
                                    { fontWeight: typography.fontWeight.extrabold },
                                ]}
                            >
                                {" "}
                                Login
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
