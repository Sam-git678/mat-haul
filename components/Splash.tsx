import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function SplashScreen() {
  return (
    <View style={styles.container}>

      <Image
        source={require("../assets/images/charismat-icon.png")}
        style={styles.logo}
      />

      <Text style={styles.text}>
        Smart Ordering for Building Materials
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#FCFCFC",
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    width: 160,
    height: 160,
    resizeMode: "contain",
    marginBottom: 24,
   
  },

  text: {
    fontSize: 14,
    color: "#0B4A8B",
    textAlign: "center",
    position: 'absolute',
    bottom: 40
  
  },

});