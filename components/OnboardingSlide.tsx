import React from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  description: string;
  image: any;
};

const { width, height } = Dimensions.get("window");

export default function OnboardingSlide({ title, description, image }: Props) {
  return (
    <View style={styles.container}>
      
      <Image source={image} style={styles.image} />
      
      

      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
  },
  image: {
    width,
    height: height * 0.46,
    resizeMode: "contain",
  },
  textContainer: {
    width: "100%",
    marginTop: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#E4E7EC",
  },
});
