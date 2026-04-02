import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import useNotifications from '../hooks/useNotifications';

/**
 * Test Notifications Component
 * Use this to test that notifications are working properly
 */
const TestNotifications = () => {
  const { 
    sendCourseMaterialNotification,
    sendInternshipNotification,
    sendJobNotification,
    sendAnnouncementNotification,
    sendCustomNotification 
  } = useNotifications();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Notifications</Text>
      
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: '#4CAF50' }]}
        onPress={() => sendCourseMaterialNotification('Mathematics', 'Algebra Basics')}
      >
        <Text style={styles.buttonText}>📚 Test Course Material</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: '#2196F3' }]}
        onPress={() => sendInternshipNotification('Google', 'Software Engineering Intern')}
      >
        <Text style={styles.buttonText}>💼 Test Internship</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: '#FF9800' }]}
        onPress={() => sendJobNotification('Microsoft', 'Senior Developer')}
      >
        <Text style={styles.buttonText}>🎯 Test Job</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: '#9C27B0' }]}
        onPress={() => sendAnnouncementNotification('Test Announcement', 'This is a test notification message')}
      >
        <Text style={styles.buttonText}>📢 Test Announcement</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: '#F44336' }]}
        onPress={() => sendCustomNotification(
          '💡 It\'s time for Learning',
          'Time to explore new opportunities and enhance your skills on GassHub!'
        )}
      >
        <Text style={styles.buttonText}>💡 Test Learning Reminder</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TestNotifications;
