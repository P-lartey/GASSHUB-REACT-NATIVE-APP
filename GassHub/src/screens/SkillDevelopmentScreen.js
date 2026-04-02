import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useSkillDevelopment } from '../hooks/useFirestoreData';

const SkillDevelopmentScreen = ({ navigation, onBackPress }) => {
  const { colors, isDarkMode } = useTheme();
  
  // Get skill development data from Firestore - no fallback
  const { skills: skillDevData, loading: skillDevLoading, error: skillDevError } = useSkillDevelopment();
  
  // Use Firestore data exclusively
  const courses = (!skillDevLoading && !skillDevError && skillDevData && skillDevData.length > 0) ? skillDevData : [];

  const openURL = (url) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <Text style={[styles.backButtonText, { color: '#FFFFFF' }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: '#FFFFFF' }]}>Skill Development</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.subtitle, { color: colors.textSecondary, marginBottom: 20, textAlign: 'center' }]}>
          Curated online courses for department-specific skill enhancement
        </Text>

        {skillDevLoading ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Loading courses...</Text>
          </View>
        ) : courses.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 16, textAlign: 'center' }}>
              No information available yet{String.fromCharCode(10)}Please check later
            </Text>
          </View>
        ) : (
          courses.map(course => (
          <View 
            key={course.course_id} 
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
                  {course.title}
                </Text>
                <Text style={{ fontSize: 14, color: colors.primary, marginBottom: 8 }}>
                  {course.platform}
                </Text>
                <Text style={{ fontSize: 14, color: isDarkMode ? '#CBD5E1' : '#334155', marginBottom: 10, lineHeight: 20 }}>
                  {course.description}
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
                  {course.category.map((cat, index) => (
                    <View 
                      key={index} 
                      style={{
                        backgroundColor: isDarkMode ? '#475569' : '#EBF8FF',
                        borderRadius: 20,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        marginRight: 8,
                        marginBottom: 5
                      }}
                    >
                      <Text style={{ fontSize: 12, color: isDarkMode ? '#E2E8F0' : '#475569' }}>
                        {cat}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
              {course.featured && (
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
              <View>
                <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B' }}>
                  Duration: {course.duration} • Level: {course.level}
                </Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: course.is_free ? '#10B981' : colors.primary, marginTop: 3 }}>
                  {course.is_free ? 'FREE' : course.cost}
                </Text>
              </View>
              <TouchableOpacity 
                style={{ backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }}
                onPress={() => openURL(course.link || course.courseUrl || course.url)}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Enroll</Text>
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

export default SkillDevelopmentScreen;