import React from "react";
import { Image, StyleSheet, View } from "react-native";

export default function BackgroundDesign() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/onboardingframe.png")}
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: -1,
  },

  image: {
    width: "100%",
    height: 420,
    resizeMode: "cover",
  },
});