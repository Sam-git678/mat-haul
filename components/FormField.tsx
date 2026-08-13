import { appStyles, colors } from "@/constants";
import { Ionicons } from '@expo/vector-icons';
import React, { ComponentProps, memo, useState } from 'react';
import { Control, FieldErrors, FieldPath, FieldValues, useController } from 'react-hook-form';
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    View
} from 'react-native';

interface FormFieldProps<T extends FieldValues> {
    label: string;
    required: string;
    placeholder?: string;
    icon?: ComponentProps<typeof Ionicons>['name'];
    value?: string;
    onChangeText?: (text: string) => void;
    editable?: boolean;
    inputOnChangeText?: (text: string) => void;
    onBlur?: () => void;
    readOnly?: boolean;
    keyboardType?: TextInputProps['keyboardType'];
    control?: Control<any>;
    name?: FieldPath<any>;
    errors?: FieldErrors<any>;
    errorText?: string;
    secureTextEntry?: boolean;
    autoCapitalize?: TextInputProps['autoCapitalize'];
    autoCorrect?: boolean;
    rightIcon?: React.ReactNode;
}

type ControlledInputProps = {
    control: Control<any>;
    name: FieldPath<any>;
    placeholder?: string;
    editable?: boolean;
    readOnly: boolean;
    keyboardType?: TextInputProps['keyboardType'];
    secureTextEntry?: boolean;
    autoCapitalize?: TextInputProps['autoCapitalize'];
    autoCorrect?: boolean;
    inputOnChangeText?: (text: string) => void;
    onBlur?: () => void;
    onFocusChange: (focused: boolean) => void;
};

function ControlledInput({
    control,
    name,
    placeholder,
    editable,
    readOnly,
    keyboardType,
    secureTextEntry,
    autoCapitalize,
    autoCorrect,
    inputOnChangeText,
    onBlur,
    onFocusChange,
}: ControlledInputProps) {
    const { field } = useController({
        control,
        name,
        defaultValue: '' as any,
    });

    return (
        <TextInput
            style={styles.inputText}
            placeholder={placeholder}
            placeholderTextColor={colors.textSubtle}
            value={typeof field.value === 'string' ? field.value : field.value == null ? '' : String(field.value)}
            onChangeText={(text) => {
                field.onChange(text);
                inputOnChangeText?.(text);
            }}
            onFocus={() => onFocusChange(true)}
            onBlur={() => {
                onFocusChange(false);
                field.onBlur();
                onBlur?.();
            }}
            editable={editable ?? !readOnly}
            keyboardType={keyboardType}
            secureTextEntry={secureTextEntry}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
        />
    );
}

function FormField({
    label,
    required,
    icon,
    placeholder,
    value,
    onChangeText,
    editable,
    inputOnChangeText,
    onBlur,
    readOnly = false,
    keyboardType,
    control,
    name,
    errorText,
    secureTextEntry,
    autoCapitalize,
    autoCorrect,
    rightIcon
}: FormFieldProps<any>) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={appStyles.inputWrapper}>
            <Text style={appStyles.formLabel}>
                {label}
                <Text style={appStyles.requiredStar}>{required}</Text>
            </Text>
            <View style={[styles.focusShell, isFocused && styles.focusShellFocused]}>
                <View style={[appStyles.inputContainer, isFocused && styles.focusedInputContainer]}>
                    {icon && <Ionicons name={icon} size={20} color="#757575" style={styles.fieldIcon} />}

                    {control && name ? (
                        <ControlledInput
                            control={control}
                            name={name}
                            placeholder={placeholder}
                            editable={editable}
                            readOnly={readOnly}
                            keyboardType={keyboardType}
                            secureTextEntry={secureTextEntry}
                            autoCapitalize={autoCapitalize}
                            autoCorrect={autoCorrect}
                            inputOnChangeText={inputOnChangeText}
                            onBlur={onBlur}
                            onFocusChange={setIsFocused}
                        />
                    ) : (
                        <TextInput
                            style={styles.inputText}
                            placeholder={placeholder}
                            placeholderTextColor={colors.textSubtle}
                            value={value}
                            onChangeText={(text) => {
                                onChangeText?.(text);
                                inputOnChangeText?.(text);
                            }}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => {
                                setIsFocused(false);
                                onBlur?.();
                            }}
                            editable={editable ?? !readOnly}
                            keyboardType={keyboardType}
                            secureTextEntry={secureTextEntry}
                            autoCapitalize={autoCapitalize}
                            autoCorrect={autoCorrect}
                        />
                    )}
                    {rightIcon}
                </View>
            </View>
            {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    focusShell: {
        borderRadius: 12,
        backgroundColor: 'transparent',
    },
    focusShellFocused: {
        // shadowColor: '#0B4A8B',
        // shadowOpacity: 0.18,
        // shadowRadius: 8,
        // shadowOffset: { width: 0, height: 4 },
        // elevation: 4,
    },
    focusedInputContainer: {
        borderColor: '#0B4A8B',
    },
    fieldContainer: { marginBottom: 15 },
    label: { fontWeight: '600', marginBottom: 8, fontSize: 14 },
    required: { color: 'red' },
    fieldIcon: { marginHorizontal: 10 },
    inputText: { flex: 1, color: '#333' },
    errorText: { marginTop: 4, color: '#E53E3E', fontSize: 12 },
});

export default memo(FormField);
