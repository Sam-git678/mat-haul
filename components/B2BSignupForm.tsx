import { appStyles } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet, Text,
  TextInput, TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

import { authApi } from "@/src/config/api";
import { B2BSignupFormData, b2bSignupSchema } from "@/src/schemas/auth.schema";



export default function B2BSignupForm() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<B2BSignupFormData>({
    resolver: zodResolver(b2bSignupSchema),
    defaultValues: {
      firstName: '', lastName: '', companyName: '',
      companyAddress: '', email: '',
      phone: '', password: '', confirmPassword: ''
    }
  });


  const router = useRouter();

  const onSubmit = async (data: B2BSignupFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    const normalizePhone = (input: string) => {
      const raw = input.trim();
      if (raw.startsWith('+234')) return raw;
      if (raw.startsWith('0')) return `+234${raw.slice(1)}`;
      return raw;
    };

    const payload = {
      firstname: data.firstName.trim(),
      lastname: data.lastName.trim(),
      companyname: data.companyName.trim(),
      companyaddress: data.companyAddress.trim(),
      email: data.email.trim().toLowerCase(),
      phone: normalizePhone(data.phone),
      password: data.password,
      password_confirmation: data.confirmPassword,
      usertype: "b2b",
    };

    const result = await authApi.register(payload);

    if (result.success) {
      setIsSubmitting(false);

      router.push({
        pathname: "/verify-otp",
        params: { email: payload.email }
      });



    } else {
      setError(result.message || "Signup failed. Please try again.");
      setIsSubmitting(false);
      return;
    }
  }


  const [password, setPassword] = useState("");

  const getStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 0) score = 1;
    if (pass.length >= 6) score = 2;
    if (pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass)) score = 3;
    return score;
  };

  const strength = getStrength(password);

  const strengthColor = ["#E2E8F0", "#E53E3E", "#ECC94B", "#38A169"];
  const strengthLabel = ["", "Weak", "Medium", "Strong"];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}

      >
        <ScrollView contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">



          <Text style={styles.headerText}>Create your Charissatics Business Account</Text>
          <Text style={styles.subHeaderText}>Sign up or log in using your email.</Text>


          {/* First Name Field */}
          <View style={appStyles.inputWrapper}>
            <Text style={styles.label}>First Name</Text>
            <View style={appStyles.inputContainer}>
              <Controller
                control={control}
                name="firstName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.flexInput}
                    placeholder="Enter your first name"
                    placeholderTextColor="#94A3B8"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="words"
                  />
                )}
              />
            </View>
            {errors.firstName && (
              <Text style={styles.errorText}>{errors.firstName.message}</Text>
            )}
          </View>

          {/* Last Name Field */}
          <View style={appStyles.inputWrapper}>
            <Text style={styles.label}>Last Name</Text>
            <View style={appStyles.inputContainer}>
              <Controller
                control={control}
                name="lastName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.flexInput}
                    placeholder="Enter your last name"
                    placeholderTextColor="#94A3B8"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="words"
                  />
                )}
              />
            </View>
            {errors.lastName && (
              <Text style={styles.errorText}>{errors.lastName.message}</Text>
            )}
          </View>

          <View style={appStyles.inputWrapper}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={appStyles.inputContainer}>
              <View style={styles.countryPicker}>
                <Text style={styles.countryText}>+234</Text>
                <Ionicons name="chevron-down" size={16} color="grey" />
              </View>
              <View style={styles.divider} />
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.flexInput}
                    placeholder="08012345678"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>
            {errors.phone && (
              <Text style={styles.errorText}>{errors.phone.message}</Text>
            )}
          </View>


          <View style={appStyles.inputWrapper}>
            <Text style={styles.label}>Company Name</Text>
            <View style={appStyles.inputContainer}>
              <Controller
                control={control}
                name="companyName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.flexInput}
                    placeholder="Enter your company name"
                    placeholderTextColor="#94A3B8"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="words"
                  />
                )}
              />
            </View>
            {errors.companyName && (
              <Text style={styles.errorText}>{errors.companyName.message}</Text>
            )}
          </View>

          <View style={appStyles.inputWrapper}>
            <Text style={styles.label}>Company Address</Text>
            <View style={appStyles.inputContainer}>
              <Controller
                control={control}
                name="companyAddress"

                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.flexInput}
                    placeholder="Enter your company address"
                    placeholderTextColor="#94A3B8"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="words"
                  />
                )}
              />
            </View>
            {errors.companyAddress && (
              <Text style={styles.errorText}>{errors.companyAddress.message}</Text>
            )}
          </View>

          {/* Email Field */}
          <View style={appStyles.inputWrapper}>
            <Text style={styles.label}>Email Address</Text>
            <View style={appStyles.inputContainer}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.flexInput}
                    placeholder="example@gmail.com"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>
            {errors.email && (
              <Text style={styles.errorText}>{errors.email.message}</Text>
            )}
          </View>




          {/* Password Input */}
          <View style={appStyles.inputWrapper}>
            <Text style={styles.label}>Password</Text>
            <View style={[appStyles.inputContainer,
            errors.password && { borderColor: '#E53E3E', borderWidth: 1.5 }]}>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.flexInput}
                    placeholder="***********"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!isPasswordVisible}
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      onChange(text);
                      setPassword(text);
                    }}
                    value={value}
                  />
                )}
              />
            </View>

            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
              <Ionicons name={isPasswordVisible ? "eye-off" : "eye"} size={20} color="grey" />
            </TouchableOpacity>

          </View>

          <View style={styles.strengthWrapper}>
            <View style={styles.strengthBarContainer}>
              {/* Three segments that light up based on score */}
              {[1, 2, 3].map((index) => (
                <View
                  key={index}
                  style={[
                    styles.strengthSegment,
                    { backgroundColor: strength >= index ? strengthColor[strength] : "#E2E8F0" }
                  ]}
                />
              ))}
            </View>
            <Text style={[styles.strengthText, { color: strengthColor[strength] }]}>
              {strengthLabel[strength]}
            </Text>
          </View>

          <Text style={styles.label}>Confirm Password</Text>
          <View style={[styles.inputContainer,
          errors.confirmPassword && { borderColor: '#E53E3E', borderWidth: 1.5 }]}>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.flexInput}
                  placeholder="Re-enter password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!isConfirmVisible}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />

            <TouchableOpacity onPress={() => setIsConfirmVisible(!isConfirmVisible)}>
              <Ionicons name={isConfirmVisible ? "eye-off" : "eye"} size={20} color="grey" />
            </TouchableOpacity>

          </View>

          {errors.confirmPassword && (
            <Text style={{ color: 'red', fontSize: 12, marginTop: -15, marginBottom: 10 }}>
              {errors.confirmPassword.message}
            </Text>
          )}


          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Custom Button */}


          <TouchableOpacity
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
            ) : (

              <Text style={styles.buttonText}>Continue</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 50 }} />

          <TouchableOpacity style={styles.footerLink}>
            <Text>Already have an account?<Link style={{ color: '#0B4A8B', fontWeight: 'bold' }} href={"/login"}> Login</Link></Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: appStyles.containerWhite,
  scrollContent: { padding: 24, paddingBottom: 60, flexGrow: 1, justifyContent: "center", },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f0f4f8', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  headerText: { fontSize: 24, fontWeight: 'bold', color: '#0B4A8B', marginBottom: 8 },
  subHeaderText: { fontSize: 14, color: 'grey', marginBottom: 30 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 55,
    marginBottom: 20
  },
  countryPicker: { flexDirection: 'row', alignItems: 'center', paddingRight: 10 },
  countryText: { marginRight: 5, fontWeight: '500' },
  divider: { width: 1, height: '60%', backgroundColor: '#E2E8F0', marginRight: 10 },
  flexInput: { flex: 1, height: '100%', color: '#000000' },
  button: { backgroundColor: '#0B4A8B', height: 55, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  footerLink: { marginTop: 20, alignItems: 'center' },
  errorText: {
    color: '#E53E3E',
    fontSize: 12,
    fontWeight: '500',
    marginTop: -15,
    marginLeft: 5,
  },

  strengthWrapper: {
    marginTop: -10,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  strengthBarContainer: {
    flexDirection: 'row',
    flex: 1,
    height: 4,
    marginRight: 10,
  },
  strengthSegment: {
    flex: 1,
    height: '100%',
    borderRadius: 2,
    marginRight: 4,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
    width: 50,
  },
});

