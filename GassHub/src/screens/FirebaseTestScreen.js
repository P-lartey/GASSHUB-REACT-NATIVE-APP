import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useFirebaseStorage } from '../hooks/useFirebaseStorage';
import { useAnnouncements, useJobOpportunities, useInternships, useSkillDevelopment, useResumeBuilding, useCourseMaterials } from '../hooks/useFirestoreData';
import { ref, listAll } from 'firebase/storage';
import { storage } from '../services/FirebaseConfig';

const FirebaseTestScreen = () => {
  const [testResults, setTestResults] = useState([]);
  
  // Firestore hooks
  const { announcements, loading: announcementsLoading, error: announcementsError } = useAnnouncements();
  const { jobs, loading: jobsLoading, error: jobsError } = useJobOpportunities();
  const { internships, loading: internshipsLoading, error: internshipsError } = useInternships();
  const { skills, loading: skillsLoading, error: skillsError } = useSkillDevelopment();
  const { resources, loading: resourcesLoading, error: resourcesError } = useResumeBuilding();
  const { materials, loading: materialsLoading, error: materialsError } = useCourseMaterials();
  
  // Storage hook
  const { getCourseMaterialsFromStorage, loading: storageLoading, error: storageError } = useFirebaseStorage();

  const runTests = async () => {
    const results = [];
    
    try {
      // Firestore Tests
      results.push('🧪 Testing Firestore connections...');
      
      // Test announcements
      results.push(`📋 Announcements: Loading=${announcementsLoading}, Count=${announcements.length}`);
      if (announcementsError) results.push(`❌ Announcements Error: ${announcementsError.message}`);
      
      // Test jobs
      results.push(`💼 Jobs: Loading=${jobsLoading}, Count=${jobs.length}`);
      if (jobsError) results.push(`❌ Jobs Error: ${jobsError.message}`);
      
      // Test internships
      results.push(`🎯 Internships: Loading=${internshipsLoading}, Count=${internships.length}`);
      if (internshipsError) results.push(`❌ Internships Error: ${internshipsError.message}`);
      
      // Test skills
      results.push(`📚 Skills: Loading=${skillsLoading}, Count=${skills.length}`);
      if (skillsError) results.push(`❌ Skills Error: ${skillsError.message}`);
      
      // Test resume building
      results.push(`📝 Resume Resources: Loading=${resourcesLoading}, Count=${resources.length}`);
      if (resourcesError) results.push(`❌ Resume Resources Error: ${resourcesError.message}`);
      
      // Test course materials
      results.push(`📖 Course Materials: Loading=${materialsLoading}, Count=${materials.length}`);
      if (materialsError) results.push(`❌ Course Materials Error: ${materialsError.message}`);
      if (materials.length > 0) {
        results.push(`📄 First 3 materials:`);
        materials.slice(0, 3).forEach((material, index) => {
          results.push(`  ${index + 1}. ${material.title || material.name || 'Untitled'} (ID: ${material.id})`);
        });
      }
      
      // Storage Tests
      results.push('\n💾 Testing Firebase Storage...');
      results.push(`📦 Storage Loading: ${storageLoading}`);
      if (storageError) results.push(`❌ Storage Error: ${storageError.message}`);
      
      // Test getting course materials from storage
      try {
        const mathMaterials = await getCourseMaterialsFromStorage('math171');
        results.push(`✅ Math 171 storage materials: Found ${mathMaterials.length} materials`);
        
        if (mathMaterials.length > 0) {
          results.push(`📄 Sample material: ${mathMaterials[0].name} (${mathMaterials[0].type})`);
        }
      } catch (err) {
        results.push(`⚠️ Storage materials test: ${err.message}`);
      }
      
      // Test all course materials folders
      try {
        const rootRef = ref(storage, 'courseMaterials');
        const courseFolders = await listAll(rootRef);
        results.push(`📁 Course folders found: ${courseFolders.prefixes.length}`);
        
        if (courseFolders.prefixes.length > 0) {
          courseFolders.prefixes.slice(0, 5).forEach((folder, index) => {
            results.push(`  Folder ${index + 1}: ${folder.name}`);
          });
        }
      } catch (err) {
        results.push(`⚠️ Course folders test: ${err.message}`);
      }
      
      results.push('\n🏁 Tests completed!');
      
    } catch (error) {
      results.push(`💥 Test suite error: ${error.message}`);
    }
    
    setTestResults(results);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Firebase Storage Test</Text>
      
      <TouchableOpacity 
        style={styles.testButton} 
        onPress={runTests}
        disabled={loading}
      >
        <Text style={styles.testButtonText}>
          {loading ? 'Testing...' : 'Run Firebase Tests'}
        </Text>
      </TouchableOpacity>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      )}

      <ScrollView style={styles.resultsContainer}>
        {testResults.map((result, index) => (
          <Text key={index} style={styles.resultText}>
            {result}
          </Text>
        ))}
      </ScrollView>

      <TouchableOpacity 
        style={styles.clearButton} 
        onPress={() => setTestResults([])}
      >
        <Text style={styles.clearButtonText}>Clear Results</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  testButton: {
    backgroundColor: '#1E3A8A',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  testButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#fee',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fcc',
  },
  errorText: {
    color: '#c33',
    textAlign: 'center',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  resultText: {
    fontSize: 14,
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  clearButton: {
    backgroundColor: '#666',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default FirebaseTestScreen;