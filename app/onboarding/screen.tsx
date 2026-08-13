import OnboardingSlide from "@/components/OnboardingSlide";
import { slides } from "@/constants/index";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useRef, useState } from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewToken,
    useWindowDimensions
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const viewabilityConfig = useMemo(
    () => ({ viewAreaCoveragePercentThreshold: 50 }),
    []
  );

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]?.index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const setOnboarded = async () => {
    await AsyncStorage.setItem("onboarded", "true");
  };

  const scrollTo = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      scrollTo(currentIndex + 1);
      return;
    }
    await setOnboarded();
    router.replace("/signup");
  };

  
  const handleSkip = async () => {
    await setOnboarded();
    router.replace("/login");
  };

  
  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" style="light" />

      <Image
        source={require("../../assets/images/onboardingframe.png")}
        style={styles.background}
      />

      <View style={styles.swipeArea}>
        <FlatList
          ref={flatListRef}
          data={slides}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={{ width }}>
              <OnboardingSlide
                title={item.title}
                description={item.description}
                image={item.image}
              />
            </View>
          )}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />
        
      </View>

      <View style={[styles.footer, { marginBottom: insets.bottom }]}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View key={index} style={index === currentIndex ? styles.activeDot : styles.dot} />
          ))}
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
          <Text style={styles.primaryText}>
            {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleSkip}>
          <Text style={styles.secondaryText}>
            {currentIndex === slides.length - 1 ? "Login" : "Skip"}
            </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  background: {
    position: "absolute",
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  swipeArea: {
    flex: 1,
    justifyContent: "flex-end",
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    
  },
  pagination: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  activeDot: {
    width: 28,
    height: 6,
    borderRadius: 5,
    backgroundColor: "#0B4A8B",
  },
  dot: {
    width: 10,
    height: 6,
    borderRadius: 5,
    backgroundColor: "#B0C0D0",
  },
  primaryButton: {
    backgroundColor: "#0B4A8B",
    padding: 16,
    borderRadius: 100,
    alignItems: "center",
  },
  primaryText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D0D5DD",
    padding: 16,
    borderRadius: 100,
    alignItems: "center",
    marginTop: 10,
  },
  secondaryText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#344054",
  },
});
