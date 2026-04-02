import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService from '../services/NotificationService';
import { useTheme } from '../theme/ThemeContext';

const NotificationSettingsScreen = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [courseMaterialsEnabled, setCourseMaterialsEnabled] = useState(true);
  const [internshipsEnabled, setInternshipsEnabled] = useState(true);
  const [jobsEnabled, setJobsEnabled] = useState(true);
  const [announcementsEnabled, setAnnouncementsEnabled] = useState(true);
  const [learningReminderEnabled, setLearningReminderEnabled] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('notificationSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setNotificationsEnabled(parsed.notificationsEnabled ?? true);
        setCourseMaterialsEnabled(parsed.courseMaterialsEnabled ?? true);
        setInternshipsEnabled(parsed.internshipsEnabled ?? true);
        setJobsEnabled(parsed.jobsEnabled ?? true);
        setAnnouncementsEnabled(parsed.announcementsEnabled ?? true);
        setLearningReminderEnabled(parsed.learningReminderEnabled ?? true);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      const settings = {
        notificationsEnabled,
        courseMaterialsEnabled,
        internshipsEnabled,
        jobsEnabled,
        announcementsEnabled,
        learningReminderEnabled,
      };
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
      
      // Handle learning reminder scheduling
      if (learningReminderEnabled && notificationsEnabled) {
        await notificationService.scheduleLearningReminder();
      } else {
        await notificationService.cancelScheduledNotification('learning_reminder');
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  useEffect(() => {
    saveSettings();
  }, [
    notificationsEnabled,
    courseMaterialsEnabled,
    internshipsEnabled,
    jobsEnabled,
    announcementsEnabled,
    learningReminderEnabled,
  ]);

  const handleResetPermissions = async () => {
    try {
      const status = await notificationService.getPermissionStatus();
      Alert.alert(
        'Notification Permissions',
        `Current status: ${status}. To change permissions, go to your device settings.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to check permissions');
    }
  };

  const SettingRow = ({ label, description, value, onValueChange, disabled = false }) => (
    <View style={[styles.settingRow, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
      <View style={styles.settingText}>
        <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
        {description && (
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled || !notificationsEnabled}
        trackColor={{ false: '#767577', true: '#81C784' }}
        thumbColor={value ? '#4CAF50' : '#f4f3f4'}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="#4A5FC1" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>⇦</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Toggle */}
        <View style={[styles.section, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
          <SettingRow
            label="All Notifications"
            description="Enable or disable all notifications"
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
        </View>

        {/* Notification Types */}
        {notificationsEnabled && (
          <>
            <View style={[styles.section, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Notification Types</Text>
              
              <SettingRow
                label="📚 Course Materials"
                description="Get notified when new learning resources are uploaded"
                value={courseMaterialsEnabled}
                onValueChange={setCourseMaterialsEnabled}
              />
              
              <SettingRow
                label="💼 Internships"
                description="Get notified about new internship opportunities"
                value={internshipsEnabled}
                onValueChange={setInternshipsEnabled}
              />
              
              <SettingRow
                label="🎯 Jobs"
                description="Get notified about new job postings"
                value={jobsEnabled}
                onValueChange={setJobsEnabled}
              />
              
              <SettingRow
                label="📢 Announcements"
                description="Get notified about important news and updates"
                value={announcementsEnabled}
                onValueChange={setAnnouncementsEnabled}
              />
            </View>

            {/* Reminders */}
            <View style={[styles.section, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Reminders</Text>
              
              <SettingRow
                label="💡 Learning Reminder"
                description="Receive a reminder every 5 hours to explore learning opportunities"
                value={learningReminderEnabled}
                onValueChange={setLearningReminderEnabled}
              />
            </View>
          </>
        )}

        {/* Permissions Info */}
        <View style={[styles.section, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Permissions</Text>
          <TouchableOpacity style={styles.infoButton} onPress={handleResetPermissions}>
            <Text style={[styles.infoButtonText, { color: colors.primary }]}>
              Check Notification Permissions
            </Text>
          </TouchableOpacity>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            To enable or disable notifications, you may need to update your device settings.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#4A5FC1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  settingText: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  infoButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(74, 95, 193, 0.1)',
    borderRadius: 8,
    marginBottom: 8,
  },
  infoButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});

export default NotificationSettingsScreen;
