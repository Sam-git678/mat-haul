
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import {
  FlatList, StyleSheet, Text, TouchableOpacity,
  View
} from "react-native";

import { appStyles, colors } from "@/constants";
import { MediaUploadGridProps } from "@/types/media";


export default function MediaUploadGrid({
  files,
  maxFiles = 5,
  error,
  onAdd,
  onRemove,
  onPreview,
}: MediaUploadGridProps) {
  const remaining = maxFiles - files.length;

  const data =
    remaining > 0
      ? [...files, { upload: true }]
      : [...files];

  return (
    <View style={styles.container}>
      <FlatList
        scrollEnabled={false}
        data={data}
        numColumns={2}
        keyExtractor={(item) =>
          "upload" in item ? "upload-tile" : item.uri
        }
        columnWrapperStyle={styles.grid}
        renderItem={({ item, index }) => {
          if ("upload" in item) {
            return (
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.tile, styles.uploadTile]}
                onPress={onAdd}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={42}
                  color={colors.primary}
                />

                <Text
                  style={appStyles.uploadTitle}
                >
                  Add Photos
                </Text>

                <Text style={styles.uploadSubtitle}>
                  {remaining === 1
                    ? "1 upload left"
                    : `${remaining} uploads left`}
                </Text>
              </TouchableOpacity>
            );
          }

          const isVideo = item.mediaType?.startsWith("video");

          return (
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.tile}
              onPress={() => onPreview?.(item)}
            >
              <Image
                source={{ uri: item.uri }}
                contentFit="cover"
                transition={200}
                style={{
                  width: "100%",
                  height: "100%",
                }}
              />

              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => onRemove(index)}
              >
                <Ionicons
                  name="close"
                  size={15}
                  color="#FFF"
                />
              </TouchableOpacity>

              <View style={styles.mediaBadge}>
                <Text style={styles.badgeText}>
                  {isVideo ? "🎥" : "📷"}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {!!error && <Text style={appStyles.errorText}>{error}</Text>}
    </View>
  );
}















const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },

  grid: {
    justifyContent: "space-between",
  },

  tile: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#F2F4F7",
    marginBottom: 12,
    position: "relative",
  },

  uploadTile: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#D0D5DD",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,.65)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },

  uploadTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 10,
  },

  uploadSubtitle: {
    fontSize: 12,
    color: "#667085",
    marginTop: 4,
    textAlign: "center",
  },

  mediaBadge: {
    position: "absolute",
    left: 8,
    bottom: 8,
    backgroundColor: "rgba(0,0,0,.55)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },

  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },

  error: {
    color: "#D92D20",
    marginTop: 6,
  },
});