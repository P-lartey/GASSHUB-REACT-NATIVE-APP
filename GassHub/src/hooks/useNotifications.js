import notificationService from '../services/NotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Custom hook to send notifications based on user preferences
 * Returns functions to trigger different types of notifications
 */
export const useNotifications = () => {
  /**
   * Check if a specific notification type is enabled
   */
  const isNotificationEnabled = async (type) => {
    try {
      const settingsString = await AsyncStorage.getItem('notificationSettings');
      if (!settingsString) return true; // Default to enabled
      
      const settings = JSON.parse(settingsString);
      
      // If all notifications are disabled, return false
      if (settings.notificationsEnabled === false) return false;
      
      // Check specific notification type
      switch (type) {
        case 'course_material':
          return settings.courseMaterialsEnabled !== false;
        case 'internship':
          return settings.internshipsEnabled !== false;
        case 'job':
          return settings.jobsEnabled !== false;
        case 'announcement':
          return settings.announcementsEnabled !== false;
        case 'learning_reminder':
          return settings.learningReminderEnabled !== false;
        default:
          return true;
      }
    } catch (error) {
      console.error('Error checking notification settings:', error);
      return true; // Default to enabled on error
    }
  };

  /**
   * Send course material upload notification
   */
  const sendCourseMaterialNotification = async (courseName, materialTitle) => {
    const enabled = await isNotificationEnabled('course_material');
    if (enabled) {
      await notificationService.notifyCourseMaterialUpload(courseName, materialTitle);
    }
  };

  /**
   * Send internship opportunity notification
   */
  const sendInternshipNotification = async (companyName, position) => {
    const enabled = await isNotificationEnabled('internship');
    if (enabled) {
      await notificationService.notifyInternshipUpdate(companyName, position);
    }
  };

  /**
   * Send job opportunity notification
   */
  const sendJobNotification = async (companyName, position) => {
    const enabled = await isNotificationEnabled('job');
    if (enabled) {
      await notificationService.notifyJobUpdate(companyName, position);
    }
  };

  /**
   * Send announcement notification
   */
  const sendAnnouncementNotification = async (title, message) => {
    const enabled = await isNotificationEnabled('announcement');
    if (enabled) {
      await notificationService.notifyAnnouncement(title, message);
    }
  };

  /**
   * Send immediate custom notification
   */
  const sendCustomNotification = async (title, body, data = {}) => {
    await notificationService.sendImmediateNotification(title, body, data);
  };

  return {
    sendCourseMaterialNotification,
    sendInternshipNotification,
    sendJobNotification,
    sendAnnouncementNotification,
    sendCustomNotification,
    isNotificationEnabled,
  };
};

export default useNotifications;
