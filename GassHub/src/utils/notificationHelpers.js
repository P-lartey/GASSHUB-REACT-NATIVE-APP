import { collection, addDoc, updateDoc, uploadBytes, ref, getStorage } from 'firebase/firestore';
import { db, storage } from '../services/FirebaseConfig';
import notificationService from '../services/NotificationService';

/**
 * Notification-Enabled Firebase Operations
 * 
 * Use these functions to automatically send notifications
 * when data is updated in Firebase.
 */

// ============ Course Materials ============

/**
 * Upload course material and send notification
 */
export const uploadCourseMaterialWithNotification = async (courseName, materialData) => {
  try {
    // Upload material to Firestore
    const docRef = await addDoc(collection(db, 'courseMaterials'), {
      ...materialData,
      courseName,
      uploadedAt: new Date().toISOString(),
    });

    // Send notification to users
    await notificationService.notifyCourseMaterialUpload(
      courseName,
      materialData.title || 'New Material'
    );

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error uploading course material:', error);
    return { success: false, error: error.message };
  }
};

// ============ Internships ============

/**
 * Add new internship opportunity and send notification
 */
export const addInternshipWithNotification = async (internshipData) => {
  try {
    // Add internship to Firestore
    const docRef = await addDoc(collection(db, 'internships'), {
      ...internshipData,
      postedAt: new Date().toISOString(),
    });

    // Send notification to users
    await notificationService.notifyInternshipUpdate(
      internshipData.companyName,
      internshipData.position
    );

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding internship:', error);
    return { success: false, error: error.message };
  }
};

// ============ Jobs ============

/**
 * Add new job opportunity and send notification
 */
export const addJobWithNotification = async (jobData) => {
  try {
    // Add job to Firestore
    const docRef = await addDoc(collection(db, 'jobs'), {
      ...jobData,
      postedAt: new Date().toISOString(),
    });

    // Send notification to users
    await notificationService.notifyJobUpdate(
      jobData.companyName,
      jobData.position
    );

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding job:', error);
    return { success: false, error: error.message };
  }
};

// ============ Announcements ============

/**
 * Create announcement and send notification
 */
export const createAnnouncementWithNotification = async (announcementData) => {
  try {
    // Add announcement to Firestore
    const docRef = await addDoc(collection(db, 'announcements'), {
      ...announcementData,
      createdAt: new Date().toISOString(),
    });

    // Send notification to users
    await notificationService.notifyAnnouncement(
      announcementData.title,
      announcementData.message
    );

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating announcement:', error);
    return { success: false, error: error.message };
  }
};

// ============ News Updates ============

/**
 * Add news update and send notification
 */
export const addNewsWithNotification = async (newsData) => {
  try {
    // Add news to Firestore
    const docRef = await addDoc(collection(db, 'news'), {
      ...newsData,
      publishedAt: new Date().toISOString(),
    });

    // Send notification to users
    await notificationService.notifyAnnouncement(
      `📰 ${newsData.headline}`,
      newsData.summary || 'Check out the latest news on GassHub'
    );

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding news:', error);
    return { success: false, error: error.message };
  }
};

// ============ File Upload with Notification ============

/**
 * Upload file to Firebase Storage and send notification
 */
export const uploadFileWithNotification = async (fileUri, path, metadata = {}) => {
  try {
    // Fetch the file
    const response = await fetch(fileUri);
    const blob = await response.blob();

    // Upload to Firebase Storage
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob);

    // Get download URL
    const downloadURL = await getStorage().ref(path).getDownloadURL();

    return { success: true, url: downloadURL };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { success: false, error: error.message };
  }
};
