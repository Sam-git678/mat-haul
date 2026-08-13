import { appStyles } from '@/constants';

import React from 'react';
import { Text, View } from 'react-native';


export const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <View style={appStyles.summaryRow}>
    <Text style={appStyles.summaryRowLabel}>{label}</Text>
    <Text style={appStyles.summaryRowValue}>{value}</Text>
  </View>
);