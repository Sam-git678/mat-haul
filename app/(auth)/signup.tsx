import B2BSignupForm from '@/components/B2BSignupForm';
import B2CSignupForm from '@/components/B2CSignupForm';
import { appStyles } from "@/constants";
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignupScreen() {
  const [userType, setUserType] = useState('b2c');

  return (
    <SafeAreaView style={appStyles.containerWhite} edges={['top', 'bottom']}>
      <View style={appStyles.switcherWrap}>
        <Text style={appStyles.switcherLabel}>Account Type</Text>
        <View style={appStyles.segmentedControl}>
          <TouchableOpacity 
            style={[appStyles.segmentedTab, userType === 'b2c' && appStyles.segmentedTabActive]} 
            onPress={() => setUserType('b2c')}
            activeOpacity={0.9}
          >
            <Text style={[appStyles.segmentedEyebrow, userType === 'b2c' && appStyles.segmentedEyebrowActive]}>Individual</Text>
            <Text style={[appStyles.segmentedText, userType === 'b2c' && appStyles.segmentedTextActive]}>B2C</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[appStyles.segmentedTab, userType === 'b2b' && appStyles.segmentedTabActive]} 
            onPress={() => setUserType('b2b')}
            activeOpacity={0.9}
          >
            <Text style={[appStyles.segmentedEyebrow, userType === 'b2b' && appStyles.segmentedEyebrowActive]}>Company</Text>
            <Text style={[appStyles.segmentedText, userType === 'b2b' && appStyles.segmentedTextActive]}>B2B</Text>
          </TouchableOpacity>
        </View>
      </View>

      
      {userType === 'b2c' ? <B2CSignupForm /> : <B2BSignupForm />}
      
    </SafeAreaView>
  );
}
