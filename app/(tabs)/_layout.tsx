import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import React, { memo, useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from "../context/authcontext";

const BRAND_BLUE = '#0B4A8B';


const TabPill = memo(function TabPill({
  focused,
  activeIcon,
  inactiveIcon,
  label,
}: {
  focused: boolean;
  activeIcon: React.ComponentProps<typeof Ionicons>["name"];
  inactiveIcon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
}) {
  const progress = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: focused ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [focused, progress]);

  const animatedPillStyle = {
    opacity: progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.9, 1],
    }),
    transform: [
      {
        scale: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.98, 1],
        }),
      },
    ],
  };

  const animatedLabelStyle = {
    opacity: progress,
    transform: [{
      translateX: progress.interpolate({
        inputRange: [0, 1],
        outputRange: [-4, 0],
      }),
    }],
  };

  const animatedBackgroundStyle = {
    opacity: progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
  };

  return (
    <Animated.View style={[styles.pillContainer, animatedPillStyle]}>
      <Animated.View style={[styles.activePillBg, animatedBackgroundStyle]} />
      
      <Ionicons
        name={focused ? activeIcon : inactiveIcon}
        color={focused ? '#fff' : '#91a3b4'}
        size={18}
      />
      <Animated.View style={[styles.labelWrap, animatedLabelStyle]}>
        <Text numberOfLines={1} style={styles.pillText}>{label}</Text>
      </Animated.View>
   
    </Animated.View>
  );
});

export default function TabsLayout() {

  
  const { accesstoken, isLoading } = useAuth();
  const insets = useSafeAreaInsets();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="small" color={BRAND_BLUE} />
      </View>
    );
  }

  if (!accesstoken) {
    return <Redirect href="/login" />;
  }

  return (
    <View style={{
      flex: 1,
    }}>

      <Tabs screenOptions={{
        headerShown: false,
        animation: 'none',
        freezeOnBlur: true,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          elevation: 0,
          
          borderTopWidth: 0,
          height: 54,
          paddingHorizontal: 5,
          paddingTop: 10,
          paddingBottom: 6,
          position: 'absolute',

          bottom: insets.bottom,

        },
        
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: BRAND_BLUE,
        tabBarItemStyle: {
          overflow: 'visible',
        },
        tabBarIconStyle: {
          width: 'auto',
          overflow: 'visible',
        },
      }}>
        <Tabs.Screen
          name="home"
          options={{

            tabBarLabel: "Home",
            tabBarLabelStyle: { display: 'none' },
            tabBarIcon: ({ color, size, focused }) => (
              <TabPill focused={focused} activeIcon="home" inactiveIcon="home-outline" label="Home" />
            ),

          }}
        />

        <Tabs.Screen
          name="order"
          options={{

            tabBarLabel: "Order",
            tabBarLabelStyle: { display: 'none' },
            tabBarIcon: ({ color, size, focused }) => (
              <TabPill focused={focused} activeIcon="receipt" inactiveIcon="receipt-outline" label="Orders" />
            ),

          }}
        />

        <Tabs.Screen
          name="wallet"
          options={{

            tabBarLabel: "Wallet",
            tabBarLabelStyle: { display: 'none' },
            tabBarIcon: ({ color, size, focused }) => (
              <TabPill focused={focused} activeIcon="wallet" inactiveIcon="wallet-outline" label="Wallet" />
            ),

          }}
        />


        <Tabs.Screen
          name="profile"
          options={{

            tabBarLabel: "Profile",
            tabBarLabelStyle: { display: 'none' },
            tabBarIcon: ({ color, size, focused }) => (
              <TabPill focused={focused} activeIcon="person" inactiveIcon="person-outline" label="Profile" />
            ),

          }}
        />
      </Tabs>



    </View>

  );
}


const styles = StyleSheet.create({
  pillContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    minWidth: 44,
    borderRadius: 25,
    height: 45,
    overflow: 'hidden',
  },
  activePillBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BRAND_BLUE,
    borderRadius: 25,
  },
  labelWrap: {
    marginLeft: 6,
    overflow: 'hidden',
  },
  pillText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    includeFontPadding: false,
  },

});
