import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useInternships } from '../hooks/useFirestoreData';

const InternshipBoardScreen = ({ navigation, onBackPress, showHeader = true }) => {
  const { colors, isDarkMode } = useTheme();
  
  // Get internship board data from Firestore
  const { internships: internshipData, loading: internshipLoading, error: internshipError } = useInternships();
  
  // Use Firestore data exclusively - no fallback
  const internships = (!internshipLoading && !internshipError && internshipData && internshipData.length > 0) ? internshipData : [];

  const openURL = (url) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {showHeader && (
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <Text style={[styles.backButtonText, { color: '#FFFFFF' }]}>⇦</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: '#FFFFFF' }]}>Internship Board</Text>
          <View style={styles.headerRight} />
        </View>
      )}

      <ScrollView style={[styles.content, !showHeader && { paddingTop: 20 }]} showsVerticalScrollIndicator={false}>
        <Text style={[styles.subtitle, { color: colors.textSecondary, marginBottom: 20, textAlign: 'center' }]}>
          Current internship opportunities with application details
        </Text>

        {internshipLoading ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Loading internships...</Text>
          </View>
        ) : internships.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 16, textAlign: 'center' }}>
              No information available yet{String.fromCharCode(10)}Please check later
            </Text>
          </View>
        ) : (
          internships.map(internship => (
          <View 
            key={internship.internship_id} 
            style={{
              backgroundColor: isDarkMode ? '#334155' : '#EBF8FF',
              borderRadius: 12,
              padding: 15,
              marginBottom: 15,
              borderWidth: 1,
              borderColor: isDarkMode ? '#475569' : '#FFFFFF'
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: isDarkMode ? '#F1F5F9' : '#1E293B', marginBottom: 5 }}>
                  {internship.title}
                </Text>
                <Text style={{ fontSize: 16, color: colors.primary, marginBottom: 8 }}>
                  {internship.company}
                </Text>
                <Text style={{ fontSize: 14, color: isDarkMode ? '#94A3B8' : '#64748B', marginBottom: 10 }}>
                  📍 {internship.location}
                </Text>
                <Text style={{ fontSize: 14, color: isDarkMode ? '#CBD5E1' : '#334155', marginBottom: 15, lineHeight: 20 }}>
                  {internship.description}
                </Text>
                
                <View style={{ marginBottom: 15 }}>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: isDarkMode ? '#F1F5F9' : '#1E293B', marginBottom: 5 }}>
                    Requirements:
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {internship.requirements.map((req, index) => (
                      <View 
                        key={index} 
                        style={{
                          backgroundColor: isDarkMode ? '#475569' : '#FFFFFF',
                          borderRadius: 20,
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          marginRight: 8,
                          marginBottom: 5
                        }}
                      >
                        <Text style={{ fontSize: 12, color: isDarkMode ? '#E2E8F0' : '#475569' }}>
                          {req}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
              {internship.is_featured && (
                <View style={{
                  backgroundColor: '#F59E0B',
                  borderRadius: 4,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  marginLeft: 10
                }}>
                  <Text style={{ fontSize: 10, color: '#FFF', fontWeight: 'bold' }}>FEATURED</Text>
                </View>
              )}
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B' }}>
                  Duration: {internship.duration} • Stipend: {internship.stipend}
                </Text>
                <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B', marginTop: 3 }}>
                  Deadline: {internship.deadline}
                </Text>
              </View>
              <TouchableOpacity 
                style={{ backgroundColor: colors.primary, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 }}
                onPress={() => openURL(internship.applyLink || internship.apply_link)}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 }}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        )))}
      </ScrollView>
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

export default InternshipBoardScreen;