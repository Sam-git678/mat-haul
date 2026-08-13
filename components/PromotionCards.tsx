import { openLink } from '@/utils/helper';
import React, { useState } from 'react';
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Carousel from "react-native-reanimated-carousel";

export default function PromotionCards() {
    const { width: screenWidth } = useWindowDimensions();
    const [activeIndex, setActiveIndex] = useState(0);
    const learnMoreUrl = "https://charissatics.com/about-us/";
    const promotionCards = [
        {
            id: 1,
            title: 'Pay Only for What You Receive',
            backgroundImage: require('../assets/images/product_card_bg1.png'),
            foregroundImage: require('../assets/images/truck.png'),

        },

        {
            id: 2,
            title: 'Track Your Order in Real-Time',
            backgroundImage: require('../assets/images/product_card_bg2.png'),
            foregroundImage: require('../assets/images/smartphone.png'),

        },

        {
            id: 3,
            title: 'Secure Wallet Payments',
            backgroundImage: require('../assets/images/product_card_bg3.png'),
            foregroundImage: require('../assets/images/shield.png'),
        }
    ];

    return (
        <View style={styles.carouselWrapper}>
            <Carousel
                loop
                autoPlay
                autoPlayInterval={4000}
                scrollAnimationDuration={800}
                width={screenWidth - 32}
                height={186}
                data={promotionCards}
                pagingEnabled
                onSnapToItem={setActiveIndex}
                renderItem={({ item }) => (
                    <View style={styles.slide}>
                        <View style={styles.slideInner}>
                            <ImageBackground
                                source={item.backgroundImage}
                                style={styles.cardContainer}
                                imageStyle={{ borderRadius: 20 }}
                            >
                                <View style={styles.contentWrapper}>
                                    <View style={styles.textSection}>
                                        <Text style={styles.title}>{item.title}</Text>
                                        <TouchableOpacity style={styles.button}
                                            onPress={() => openLink(learnMoreUrl)}
                                        
                                        >
                                            <Text style={styles.buttonText}>Learn More</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <Image
                                        source={item.foregroundImage}
                                        style={styles.foregroundImage}
                                    />
                                </View>
                            </ImageBackground>
                        </View>
                    </View>
                )}
            />
            <View style={styles.pagination}>
                {promotionCards.map((item, index) => (
                    <View
                        key={item.id}
                        style={index === activeIndex ? styles.paginationActiveDot : styles.paginationDot}
                    />
                ))}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    slide: {
        height: 186,
    },
    slideInner: {
        height: 186,
        paddingHorizontal: 2,
    },
    cardContainer: {
        height: 176,
        overflow: 'hidden',
        marginHorizontal: 2,
        borderRadius: 20,
    },

    contentWrapper: {
        height: '100%',
        flexDirection: 'row',
        paddingTop: 18,
        paddingBottom: 14,
        paddingLeft: 18,
        paddingRight: 12,
        alignItems: 'center',
    },


    textSection: {
        flex: 0.64,
        zIndex: 2,
    },
    title: {
        fontSize: 21,
        fontWeight: 'bold',
        color: '#0B4A8B',
        marginBottom: 12,
        lineHeight: 27,
    },
    button: {
        backgroundColor: '#E6A500',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 25,
        alignSelf: 'flex-start',
    },
    buttonText: {
        color: '#FFF',
        fontWeight: '600',
    },

    carouselWrapper: {
        height: 186,
        marginTop: 14,
        marginBottom: 6,
    },

    foregroundImage: {
        position: 'absolute',
        right: -18,
        bottom: -4,
        width: 156,
        height: 124,
        resizeMode: 'contain',
    },
    pagination: {
        position: 'absolute',
        bottom: -2,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 999,
        marginHorizontal: 4,
        backgroundColor: 'rgba(0, 51, 102, 0.22)',
    },
    paginationActiveDot: {
        width: 24,
        height: 8,
        borderRadius: 999,
        marginHorizontal: 4,
        backgroundColor: '#0B4A8B',
    },

})

