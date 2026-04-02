import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Modal } from 'react-native';
import WebView from 'react-native-webview';
import { useTheme } from '../theme/ThemeContext';
import { useResumeBuilding } from '../hooks/useFirestoreData';

const ResumeBuildingScreen = ({ navigation, onBackPress, showHeader = true }) => {
  const { colors, isDarkMode } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState('');
  
  // Get resume building data from Firestore - no fallback
  const { resources: resumeData, loading: resumeLoading, error: resumeError } = useResumeBuilding();
  
  // Use Firestore data exclusively
  const resumeResources = (!resumeLoading && !resumeError && resumeData && resumeData.length > 0) ? resumeData : [];

  const openURL = (url) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  const openVideoModal = (videoUrl) => {
    setSelectedVideoUrl(videoUrl);
    setModalVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {showHeader && (
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <Text style={[styles.backButtonText, { color: '#FFFFFF' }]}>⇦</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: '#FFFFFF' }]}>Resume Building</Text>
          <View style={styles.headerRight} />
        </View>
      )}

      <ScrollView style={[styles.content, !showHeader && { paddingTop: 20 }]} showsVerticalScrollIndicator={false}>
        <Text style={[styles.subtitle, { color: colors.textSecondary, marginBottom: 20, textAlign: 'center' }]}>
          Video tutorials + external resume builder links
        </Text>

        {resumeLoading ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Loading resources...</Text>
          </View>
        ) : resumeResources.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 16, textAlign: 'center' }}>
              No information available yet{String.fromCharCode(10)}Please check later
            </Text>
          </View>
        ) : (
          resumeResources.map(resource => (
          <View 
            key={resource.resource_id} 
            style={{
              backgroundColor: isDarkMode ? '#334155' : '#EBF8FF',
              borderRadius: 12,
              padding: 15,
              marginBottom: 15,
              borderWidth: 1,
              borderColor: isDarkMode ? '#475569' : '#FFFFFF'
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <View style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: resource.type === 'video' ? '#EF4444' : resource.type === 'tool' ? '#3B82F6' : '#10B981',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 10
              }}>
                <Text style={{ color: '#FFFFFF', fontSize: 16 }}>
                  {resource.type === 'video' ? '▶' : resource.type === 'tool' ? '🛠' : '📄'}
                </Text>
              </View>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: isDarkMode ? '#F1F5F9' : '#1E293B', flex: 1 }}>
                {resource.title}
              </Text>
            </View>
            
            <Text style={{ fontSize: 14, color: isDarkMode ? '#CBD5E1' : '#334155', marginBottom: 15, lineHeight: 20 }}>
              {resource.description}
            </Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B' }}>
                By {resource.author} • {resource.category}
              </Text>
              <TouchableOpacity 
                style={{ backgroundColor: colors.primary, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 }}
                onPress={() => {
                  if (resource.type === 'video') {
                    openVideoModal(resource.url);
                  } else {
                    // Support both camelCase and snake_case field names
                    openURL(resource.url || resource.file_url || resource.fileUrl);
                  }
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 }}>
                  {resource.type === 'video' ? 'Watch' : resource.type === 'tool' ? 'Open Tool' : 'Download'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )))}
      </ScrollView>

      {/* Video Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60 }}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Career Development Video</Text>
            <TouchableOpacity 
              style={{ padding: 8 }}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.backButtonText, { color: colors.text, fontSize: 18 }]}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={{ flex: 1 }}>
            <WebView
              source={{ uri: selectedVideoUrl }}
              style={{ flex: 1 }}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowsFullscreenVideo={true}
            />
          </View>
          
          <View style={{ padding: 20 }}>
            <TouchableOpacity
              style={{ padding: 15, alignItems: 'center', marginTop: 10 }}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.backButtonText, { color: colors.text }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 15,
    backgroundColor: '#4A5FC1',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
  },
});

export default ResumeBuildingScreen;