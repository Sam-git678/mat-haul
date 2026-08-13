import React, { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

type ProductsSkeletonProps = {
    count?: number;
};

function SkeletonBlock({ style }: { style?: StyleProp<ViewStyle> }) {
    const opacity = useRef(new Animated.Value(0.45)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.9,
                    duration: 700,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.45,
                    duration: 700,
                    useNativeDriver: true,
                }),
            ])
        );

        animation.start();

        return () => animation.stop();
    }, [opacity]);

    return <Animated.View style={[styles.block, style, { opacity }]} />;
}

export default function ProductsSkeleton({ count = 6 }: ProductsSkeletonProps) {
    const items = useMemo(
        () => Array.from({ length: count }, (_, index) => index),
        [count]
    );

    return (
        <View style={styles.grid}>
            {items.map((index) => (
                <View key={index} style={styles.card}>
                    <SkeletonBlock style={styles.image} />
                    <View style={styles.details}>
                        <SkeletonBlock style={styles.title} />
                        <SkeletonBlock style={styles.subtitle} />
                        <SkeletonBlock style={styles.button} />
                    </View>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginTop: 4,
    },
    card: {
        width: "48%",
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        marginBottom: 16,
        overflow: "hidden",
    },
    block: {
        backgroundColor: "#E2E8F0",
    },
    image: {
        width: "100%",
        height: 180,
        backgroundColor: "#E2E8F0",
    },
    details: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: "#F8FAFC",
    },
    title: {
        height: 14,
        width: "70%",
        borderRadius: 999,
        marginBottom: 8,
    },
    subtitle: {
        height: 10,
        width: "100%",
        borderRadius: 999,
        marginBottom: 6,
    },
    button: {
        height: 10,
        width: "45%",
        borderRadius: 999,
        marginTop: 8,
    },
});
