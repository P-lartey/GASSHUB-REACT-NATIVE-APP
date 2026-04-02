import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useJobOpportunities } from '../hooks/useFirestoreData';

const JobOpportunitiesScreen = ({ navigation, onBackPress, showHeader = true }) => {
  const { colors, isDarkMode } = useTheme();

  // Get job opportunities data from Firestore - no fallback
  const { jobs: firestoreJobs, loading, error } = useJobOpportunities();
  
  // Use Firestore data exclusively
  const jobs = (!loading && !error && firestoreJobs && firestoreJobs.length > 0) ? firestoreJobs : [];

  const openURL = (url) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  // Show loading indicator while fetching data from Firestore
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>        
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {showHeader && (
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <Text style={[styles.backButtonText, { color: '#FFFFFF' }]}>⇦</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: '#FFFFFF' }]}>Job Opportunities</Text>
          <View style={styles.headerRight} />
        </View>
      )}

      <ScrollView style={[styles.content, !showHeader && { paddingTop: 20 }]} showsVerticalScrollIndicator={false}>
        <Text style={[styles.subtitle, { color: colors.textSecondary, marginBottom: 20, textAlign: 'center' }]}>
          Full-time job listings for graduates/alumni
        </Text>

        {jobs.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 16, textAlign: 'center' }}>
              No information available yet{String.fromCharCode(10)}Please check later
            </Text>
          </View>
        ) : (
          jobs.map(job => (
          <View 
            key={job.job_id} 
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
                  {job.title}
                </Text>
                <Text style={{ fontSize: 16, color: colors.primary, marginBottom: 8 }}>
                  {job.company}
                </Text>
                <Text style={{ fontSize: 14, color: isDarkMode ? '#94A3B8' : '#64748B', marginBottom: 10 }}>
                  📍 {job.location}
                </Text>
                <Text style={{ fontSize: 14, color: isDarkMode ? '#CBD5E1' : '#334155', marginBottom: 15, lineHeight: 20 }}>
                  {job.description}
                </Text>
                
                <View style={{ marginBottom: 15 }}>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: isDarkMode ? '#F1F5F9' : '#1E293B', marginBottom: 5 }}>
                    Requirements:
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {job.requirements.map((req, index) => (
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
                
                <View style={{ marginBottom: 15 }}>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: isDarkMode ? '#F1F5F9' : '#1E293B', marginBottom: 5 }}>
                    Benefits:
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {job.benefits.map((benefit, index) => (
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
                          {benefit}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
              {job.is_urgent && (
                <View style={{
                  backgroundColor: '#EF4444',
                  borderRadius: 4,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  marginLeft: 10
                }}>
                  <Text style={{ fontSize: 10, color: '#FFF', fontWeight: 'bold' }}>URGENT</Text>
                </View>
              )}
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: isDarkMode ? '#F1F5F9' : '#1E293B' }}>
                  {job.salary_range}
                </Text>
                <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B', marginTop: 3 }}>
                  Experience: {job.experience_level} • Type: {job.job_type}
                </Text>
                <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B', marginTop: 3 }}>
                  Deadline: {job.deadline}
                </Text>
              </View>
              <TouchableOpacity 
                style={{ backgroundColor: colors.primary, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 }}
                onPress={() => openURL(job.applyLink || job.apply_link)}
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

export default JobOpportunitiesScreen;