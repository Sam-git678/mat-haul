import { OrderMediaFile } from '@/types/media';
import { getPublicBaseUrl } from '@/utils/helper';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  View,
} from 'react-native';

type OrderMediaPreviewProps = {
  files: OrderMediaFile[];
  title?: string;
  subtitle?: string;
};

const resolveMediaUri = (uri: string) => {
  const raw = String(uri ?? '').trim();
  if (!raw) return '';
  if (/^(https?:|file:|content:)/i.test(raw)) return raw;

  const baseUrl = getPublicBaseUrl();
  if (!baseUrl) return raw.startsWith('/') ? raw : `/${raw}`;

  return raw.startsWith('/') ? `${baseUrl}${raw}` : `${baseUrl}/${raw}`;
};

const isVideo = (file: OrderMediaFile) =>
  file.mediaType === 'video' || /video/i.test(file.mimeType ?? '');

export default function OrderMediaPreview({
  files,
  title = 'Media',
  subtitle = 'Tap to view the uploaded photos and videos.',
}: OrderMediaPreviewProps) {
  const [visible, setVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<OrderMediaFile | null>(null);
  const normalizedFiles = useMemo(
    () =>
      files
        .map((file) => ({
          ...file,
          uri: resolveMediaUri(file.uri),
        }))
        .filter((file) => Boolean(file.uri)),
    [files]
  );

  if (!normalizedFiles.length) return null;

  const openFile = async (file: OrderMediaFile) => {
    if (isVideo(file)) {
      try {
        await Linking.openURL(file.uri);
      } catch {
        setSelectedFile(file);
      }
      return;
    }

    setSelectedFile(file);
  };

  return (
    <>
      <TouchableOpacity activeOpacity={0.9} onPress={() => setVisible(true)} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIconWrap}>
            <Ionicons name="images-outline" size={20} color="#0B4A8B" />
          </View>
          <View style={styles.cardTextWrap}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardSubtitle}>{subtitle}</Text>
          </View>
          <View style={styles.countPill}>
            <Text style={styles.countPillText}>{normalizedFiles.length} file{normalizedFiles.length === 1 ? '' : 's'}</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <Text style={styles.actionText}>View media</Text>
          <Ionicons name="chevron-forward" size={18} color="#0B4A8B" />
        </View>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>{title}</Text>
                <Text style={styles.sheetSubtitle}>Review the uploaded media before continuing.</Text>
              </View>
              <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
              <View style={styles.grid}>
                {normalizedFiles.map((file, index) => {
                  const video = isVideo(file);
                  return (
                    <TouchableOpacity
                      key={`${file.uri}-${index}`}
                      activeOpacity={0.88}
                      onPress={() => void openFile(file)}
                      style={styles.gridTile}
                    >
                      {!video ? (
                        <Image source={{ uri: file.uri }} style={styles.gridImage} resizeMode="cover" />
                      ) : (
                        <View style={[styles.gridImage, styles.videoGridTile]}>
                          <Ionicons name="play-circle" size={44} color="#FFFFFF" />
                          <Text style={styles.videoGridText}>Video</Text>
                        </View>
                      )}
                      <View style={styles.gridMeta}>
                        <Text style={styles.gridName} numberOfLines={1}>
                          {file.name || `Media ${index + 1}`}
                        </Text>
                        <Text style={styles.gridType}>{video ? 'Video' : 'Photo'}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={!!selectedFile} transparent animationType="fade" onRequestClose={() => setSelectedFile(null)}>
        <Pressable style={styles.overlay} onPress={() => setSelectedFile(null)}>
          <Pressable style={styles.detailSheet} onPress={(event) => event.stopPropagation()}>
            {selectedFile ? (
              <>
                <View style={styles.detailHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sheetTitle} numberOfLines={1}>
                      {selectedFile.name || 'Media preview'}
                    </Text>
                    <Text style={styles.sheetSubtitle}>{isVideo(selectedFile) ? 'Video preview' : 'Image preview'}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedFile(null)} style={styles.closeButton}>
                    <Ionicons name="close" size={20} color="#0F172A" />
                  </TouchableOpacity>
                </View>

                <View style={styles.detailBody}>
                  {!isVideo(selectedFile) ? (
                    <Image source={{ uri: selectedFile.uri }} style={styles.detailImage} resizeMode="contain" />
                  ) : (
                    <View style={styles.videoDetailCard}>
                      <Ionicons name="play-circle" size={64} color="#0B4A8B" />
                      <Text style={styles.videoDetailTitle}>Video file selected</Text>
                      <Text style={styles.videoDetailText}>
                        Open this file in your device player to review the video.
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.detailActions}>
                  {isVideo(selectedFile) ? (
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={async () => {
                        try {
                          await Linking.openURL(selectedFile.uri);
                        } catch {
                          setSelectedFile(null);
                        }
                      }}
                      style={[styles.detailButton, styles.primaryButton]}
                    >
                      <Text style={styles.primaryButtonText}>Open Video</Text>
                    </TouchableOpacity>
                  ) : null}

                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => setSelectedFile(null)}
                    style={[styles.detailButton, styles.secondaryButton]}
                  >
                    <Text style={styles.secondaryButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D6DFEA',
    padding: 14,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#101828',
  },
  cardSubtitle: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 18,
    color: '#667085',
  },
  countPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF4FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    flexShrink: 0,
  },
  countPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0B4A8B',
  },
  actionRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  actionText: {
    color: '#0B4A8B',
    fontWeight: '700',
    fontSize: 13,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.56)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    maxHeight: '78%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#101828',
  },
  sheetSubtitle: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: '#667085',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F4F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetContent: {
    paddingBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridTile: {
    width: '48.5%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gridImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#E2E8F0',
  },
  videoGridTile: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
  },
  videoGridText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  gridMeta: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  gridName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#101828',
  },
  gridType: {
    marginTop: 4,
    fontSize: 11,
    color: '#667085',
  },
  detailSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    maxHeight: '88%',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  detailBody: {
    minHeight: 260,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  detailImage: {
    width: '100%',
    height: 320,
    backgroundColor: '#F8FAFC',
  },
  videoDetailCard: {
    minHeight: 320,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#F8FAFC',
  },
  videoDetailTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '800',
    color: '#101828',
  },
  videoDetailText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    color: '#667085',
  },
  detailActions: {
    flexDirection: 'row',
    gap: 10,
  },
  detailButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#0B4A8B',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: '#F2F4F7',
  },
  secondaryButtonText: {
    color: '#101828',
    fontSize: 14,
    fontWeight: '800',
  },
});
