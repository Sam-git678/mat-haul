import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type AppButtonProps = {
    title: string;
    onPress: () => void;
    icon?: React.ReactNode;
    disabled?: boolean;
    style?: any;
    textStyle?: any;
};


export default function AppButton({
  title,
  onPress,
  icon,
  disabled = false,
  style,
  textStyle,
}: AppButtonProps) {
  return (
    <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        disabled={disabled}
        style={[
            styles.button,
            disabled && styles.disabled,
            style,
        ]}
    >
      <View style={styles.content}>
        {icon && <View style={styles.icon}>{icon}</View>}

        <Text style={[styles.text, textStyle]}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  disabled: {
    opacity: 0.5,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    marginRight: 8,
  },
  
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});