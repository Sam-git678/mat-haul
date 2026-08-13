import React, { useEffect, useRef } from "react";
import {
    Animated,
    Easing,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    SafeAreaView,
    ImageBackground
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Href } from "expo-router";



export default function SuccessScreen({ headerText, subHeaderText, onPress, buttonText, route }: any) {

    const router = useRouter();

  
    
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>

                {/* Success Icon Section */}
                <View style={styles.iconContainer}>
                    <View style={styles.outerCircle}>
                        <View style={styles.innerCircle}>
                            <Ionicons name="checkmark" size={60} color="white" />
                        </View>
                    </View>

                    {/* Decorative floating shapes - optional visual flair */}
                    <Ionicons name="ellipse-outline" size={20} color="#ADEBB3" style={styles.shape1} />
                    <Ionicons name="triangle-outline" size={20} color="#ADEBB3" style={styles.shape2} />
                </View>

                {/* Text Section */}
                <View style={styles.textContainer}>
                    <Text style={styles.headerText}>
                        {headerText} 
                    </Text>
                    <Text style={styles.subHeaderText}>{subHeaderText}</Text>
                    
                </View>

                {/* Action Button */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.replace(route)}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>{buttonText}</Text>
                </TouchableOpacity>

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    iconContainer: {
        marginBottom: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    outerCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#E8F5E9', // Light green background
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#10B981', // Solid green from screenshot
        justifyContent: 'center',
        alignItems: 'center',
        // Shadow for depth
        elevation: 5,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 60,
    },
    headerText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A202C',
        textAlign: 'center',
        lineHeight: 30,
        marginBottom: 15,
    },
    subHeaderText: {
        fontSize: 16,
        color: '#718096',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    button: {
        backgroundColor: '#10B981', // Matches the checkmark green
        width: '100%',
        height: 56,
        borderRadius: 30, // Fully rounded like the screenshot
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 40,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Decoration styling
    shape1: { position: 'absolute', top: -10, left: -40 },
    shape2: { position: 'absolute', bottom: 10, right: -40, transform: [{ rotate: '45deg' }] },
});