import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, RefreshControl, Linking, Alert, StatusBar } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useAnnouncements } from '../hooks/useFirestoreData';

// Firestore announcements hook
// The actual data will be fetched from Firestore
// The mock data is kept as fallback in case Firestore is unavailable

// Helper function to format dates
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Priority badge component
const PriorityBadge = ({ priority, isDarkMode }) => {
  const priorityStyles = {
    emergency: { backgroundColor: '#DC2626', text: 'EMERGENCY' },
    high: { backgroundColor: '#EA580C', text: 'HIGH' },
    medium: { backgroundColor: '#CA8A04', text: 'MEDIUM' },
    low: { backgroundColor: '#65A30D', text: 'LOW' }
  };

  const style = priorityStyles[priority] || priorityStyles.low;

  return (
    <View style={[styles.priorityBadge, { backgroundColor: style.backgroundColor }]}>
      <Text style={styles.priorityText}>{style.text}</Text>
    </View>
  );
};

// Category badge component
const CategoryBadge = ({ category, isDarkMode }) => {
  const categoryStyles = {
    general: { backgroundColor: '#94A3B8', text: 'General' },
    urgent: { backgroundColor: '#DC2626', text: 'Urgent' },
    event: { backgroundColor: '#0D9488', text: 'Event' },
    academic: { backgroundColor: '#4338CA', text: 'Academic' },
    administrative: { backgroundColor: '#7E22CE', text: 'Admin' }
  };

  const style = categoryStyles[category] || categoryStyles.general;

  return (
    <View style={[styles.categoryBadge, { backgroundColor: style.backgroundColor }]}>
      <Text style={styles.categoryText}>{style.text}</Text>
    </View>
  );
};

// Attachment item component
const AttachmentItem = ({ attachment }) => {
  const handleAttachmentPress = () => {
    Alert.alert(
      'Open Attachment',
      `Would you like to open ${attachment.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open', onPress: () => Linking.openURL(attachment.url) }
      ]
    );
  };

  return (
    <TouchableOpacity 
      style={styles.attachmentItem}
      onPress={handleAttachmentPress}
    >
      <Text style={styles.attachmentIcon}>
        {attachment.type === 'pdf' ? '📄' : attachment.type === 'image' ? '🖼️' : '📎'}
      </Text>
      <View style={styles.attachmentInfo}>
        <Text style={styles.attachmentName}>{attachment.name}</Text>
        <Text style={styles.attachmentSize}>{attachment.size}</Text>
      </View>
      <Text style={styles.downloadIcon}>⬇️</Text>
    </TouchableOpacity>
  );
};

// Announcement card component
const AnnouncementCard = ({ announcement, isDarkMode, onPress }) => {
  const isPinned = announcement.is_pinned;
  const priority = announcement.priority;
  
  return (
    <TouchableOpacity 
      style={[
        styles.announcementCard, 
        { 
          backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
          borderColor: isDarkMode ? '#334155' : '#E2E8F0'
        }
      ]}
      onPress={() => onPress(announcement)}
    >
      {/* Pinned indicator */}
      {isPinned && (
        <View style={styles.pinnedIndicator}>
          <Text style={styles.pinnedText}>📌 PINNED</Text>
        </View>
      )}
      
      {/* Header with title and priority */}
      <View style={styles.cardHeader}>
        <Text style={[
          styles.announcementTitle, 
          { color: isDarkMode ? '#F1F5F9' : '#1E293B' }
        ]}>
          {announcement.title}
        </Text>
        <PriorityBadge priority={priority} isDarkMode={isDarkMode} />
      </View>
      
      {/* Author and date */}
      <View style={styles.authorSection}>
        <Text style={[
          styles.authorName, 
          { color: isDarkMode ? '#94A3B8' : '#64748B' }
        ]}>
          {announcement.author_name}
        </Text>
        <Text style={[
          styles.publishDate, 
          { color: isDarkMode ? '#94A3B8' : '#64748B' }
        ]}>
          {formatDate(announcement.publish_date)}
        </Text>
      </View>
      
      {/* Content preview */}
      <Text 
        style={[
          styles.announcementPreview, 
          { color: isDarkMode ? '#CBD5E1' : '#334155' }
        ]}
        numberOfLines={3}
      >
        {announcement.content}
      </Text>
      
      {/* Category and attachments */}
      <View style={styles.footerSection}>
        <CategoryBadge category={announcement.category} isDarkMode={isDarkMode} />
        {announcement.attachments && announcement.attachments.length > 0 && (
          <Text style={[
            styles.attachmentCount, 
            { color: isDarkMode ? '#94A3B8' : '#64748B' }
          ]}>
            📎 {announcement.attachments.length} attachment{announcement.attachments.length > 1 ? 's' : ''}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Main Announcements Screen Component
const AnnouncementsScreen = ({ onBackPress }) => {
  const { colors, isDarkMode } = useTheme();
  
  // Get announcements from Firestore with error handling
  const announcementsHookResult = useAnnouncements();
  const firestoreAnnouncements = announcementsHookResult?.announcements || [];
  const announcementsLoading = announcementsHookResult?.loading || false;
  const announcementsError = announcementsHookResult?.error || null;
  
  // Fallback to mock data if Firestore data is not available
  const announcements = (!announcementsLoading && !announcementsError && firestoreAnnouncements && firestoreAnnouncements.length > 0) 
    ? firestoreAnnouncements 
    : [
        {
          id: 'ann_001',
          title: 'Mid-Term Examination Schedule',
          content: 'The mid-term examinations for all courses will be held from March 10-20, 2025. Please check the timetable on the department notice board. All students must bring their ID cards.',
          category: 'academic',
          priority: 'high',
          author_name: 'Prof. Sarah Williams',
          author_role: 'department_head',
          target_audience: ['students'],
          is_published: true,
          is_pinned: true,
          publish_date: '2025-01-15T09:00:00Z',
          expiry_date: '2025-03-20T23:59:59Z',
          attachments: [
            {
              name: 'exam_schedule.pdf',
              url: 'https://cdn.dept.com/exams/midterm_2025.pdf',
              type: 'pdf',
              size: '1.2 MB'
            }
          ],
          read_count: 342,
          allow_comments: true
        },
        {
          id: 'ann_003',
          title: 'EMERGENCY: Campus Closure Tomorrow',
          content: 'Due to severe weather warning, the campus will be closed tomorrow, January 21st. All classes and activities are cancelled. Stay safe.',
          category: 'urgent',
          priority: 'emergency',
          author_name: 'Dr. Robert Kim',
          author_role: 'department_head',
          target_audience: ['all'],
          is_published: true,
          is_pinned: true,
          publish_date: '2025-01-20T18:00:00Z',
          expiry_date: '2025-01-21T23:59:59Z',
          attachments: [],
          read_count: 512,
          allow_comments: false
        },
        {
          id: 'ann_004',
          title: 'Guest Lecture: AI in Healthcare',
          content: 'Join us for a special guest lecture by Dr. Amanda Rodriguez from TechMed Inc. Date: Jan 25, 3 PM. Venue: Auditorium A.',
          category: 'event',
          priority: 'medium',
          author_name: 'Dr. James Wilson',
          author_role: 'faculty',
          target_audience: ['students', 'faculty'],
          is_published: true,
          is_pinned: false,
          publish_date: '2025-01-18T10:00:00Z',
          expiry_date: '2025-01-25T17:00:00Z',
          attachments: [
            {
              name: 'lecture_poster.jpg',
              url: 'https://cdn.dept.com/events/ai_lecture.jpg',
              type: 'image',
              size: '850 KB'
            }
          ],
          read_count: 127,
          allow_comments: true
        },
        {
          id: 'ann_002',
          title: 'Student Council Elections',
          content: 'Nominations for Student Council positions are now open. Submit your nominations by January 30th. Voting will be held on February 5th.',
          category: 'event',
          priority: 'medium',
          author_name: 'Michael Chen',
          author_role: 'student_leader',
          target_audience: ['students'],
          is_published: true,
          is_pinned: false,
          publish_date: '2025-01-10T14:30:00Z',
          expiry_date: '2025-02-05T23:59:59Z',
          attachments: [],
          read_count: 189,
          allow_comments: true
        }
      ];
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  
  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    // In a real app, we would refresh the Firestore data here
    // For now, we'll just simulate a refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };



  const handleAnnouncementPress = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowDetail(true);
  };

  const closeDetail = () => {
    setShowDetail(false);
    setSelectedAnnouncement(null);
  };

  // Separate pinned and regular announcements
  const pinnedAnnouncements = announcements.filter(a => a.is_pinned);
  const regularAnnouncements = announcements.filter(a => !a.is_pinned);

  // Render detail view
  if (showDetail && selectedAnnouncement) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Blue Header Bar for Battery/Time */}
        <View style={styles.detailHeaderBar}>
          <StatusBar barStyle="light-content" backgroundColor="#4A5FC1" />
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={closeDetail}>
              <Text style={styles.backButtonTextWhite}>⇦</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitleWhite}>Announcement</Text>
            <View style={styles.headerSpacer} />
          </View>
        </View>

        <ScrollView 
          style={styles.detailContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Priority and category badges */}
          <View style={styles.detailBadges}>
            <PriorityBadge priority={selectedAnnouncement.priority} isDarkMode={isDarkMode} />
            <CategoryBadge category={selectedAnnouncement.category} isDarkMode={isDarkMode} />
          </View>

          {/* Title */}
          <Text style={[
            styles.detailTitle, 
            { color: isDarkMode ? '#F1F5F9' : '#1E293B' }
          ]}>
            {selectedAnnouncement.title}
          </Text>

          {/* Author and date */}
          <View style={styles.detailAuthorSection}>
            <Text style={[
              styles.detailAuthorName, 
              { color: isDarkMode ? '#94A3B8' : '#64748B' }
            ]}>
              By {selectedAnnouncement.author_name}
            </Text>
            <Text style={[
              styles.detailPublishDate, 
              { color: isDarkMode ? '#94A3B8' : '#64748B' }
            ]}>
              Published: {formatDate(selectedAnnouncement.publish_date)}
            </Text>
            {selectedAnnouncement.expiry_date && (
              <Text style={[
                styles.detailExpiryDate, 
                { color: isDarkMode ? '#94A3B8' : '#64748B' }
              ]}>
                Expires: {formatDate(selectedAnnouncement.expiry_date)}
              </Text>
            )}
          </View>

          {/* Content */}
          <Text style={[
            styles.detailContentText, 
            { color: isDarkMode ? '#CBD5E1' : '#334155' }
          ]}>
            {selectedAnnouncement.content}
          </Text>

          {/* Attachments */}
          {selectedAnnouncement.attachments && selectedAnnouncement.attachments.length > 0 && (
            <View style={styles.attachmentsSection}>
              <Text style={[
                styles.attachmentsTitle, 
                { color: isDarkMode ? '#F1F5F9' : '#1E293B' }
              ]}>
                Attachments
              </Text>
              {selectedAnnouncement.attachments.map((attachment, index) => (
                <AttachmentItem key={index} attachment={attachment} />
              ))}
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsSection}>
            <Text style={[
              styles.statsText, 
              { color: isDarkMode ? '#94A3B8' : '#64748B' }
            ]}>
              👁️ {selectedAnnouncement.read_count} views
            </Text>
            {selectedAnnouncement.allow_comments && (
              <Text style={[
                styles.statsText, 
                { color: isDarkMode ? '#94A3B8' : '#64748B' }
              ]}>
                💬 Comments enabled
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  // Render list view
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="#4A5FC1" />
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#4A5FC1' }]}>
        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <Text style={[styles.backButtonText, { color: '#FFFFFF' }]}>⇦</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: '#FFFFFF' }]}>Announcements</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Pinned announcements section */}
        {pinnedAnnouncements.length > 0 && (
          <View style={styles.section}>
            <Text style={[
              styles.sectionTitle, 
              { color: isDarkMode ? '#F1F5F9' : '#1E293B' }
            ]}>
              🔴 Important Announcements
            </Text>
            {pinnedAnnouncements.map((announcement) => (
              <AnnouncementCard 
                key={announcement.id}
                announcement={announcement}
                isDarkMode={isDarkMode}
                onPress={handleAnnouncementPress}
              />
            ))}
          </View>
        )}

        {/* Regular announcements section */}
        {regularAnnouncements.length > 0 && (
          <View style={styles.section}>
            <Text style={[
              styles.sectionTitle, 
              { color: isDarkMode ? '#F1F5F9' : '#1E293B' }
            ]}>
              📢 Latest Updates
            </Text>
            {regularAnnouncements.map((announcement) => (
              <AnnouncementCard 
                key={announcement.id}
                announcement={announcement}
                isDarkMode={isDarkMode}
                onPress={handleAnnouncementPress}
              />
            ))}
          </View>
        )}

        {/* Empty state */}
        {announcements.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[
              styles.emptyStateTitle, 
              { color: isDarkMode ? '#94A3B8' : '#64748B' }
            ]}>
              No announcements yet
            </Text>
            <Text style={[
              styles.emptyStateText, 
              { color: isDarkMode ? '#94A3B8' : '#64748B' }
            ]}>
              Check back later for updates
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  detailHeaderBar: {
    backgroundColor: '#4A5FC1',
    paddingTop: 35, // Push down for status bar
    paddingBottom: 10,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButtonTextWhite: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerTitleWhite: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    marginLeft: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 15,
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
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  detailContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 10,
  },
  announcementCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pinnedIndicator: {
    marginBottom: 8,
  },
  pinnedText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    paddingRight: 10,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  authorSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  authorName: {
    fontSize: 12,
    fontWeight: '600',
  },
  publishDate: {
    fontSize: 12,
  },
  announcementPreview: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  attachmentCount: {
    fontSize: 12,
  },
  detailBadges: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 15,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  detailAuthorSection: {
    marginBottom: 20,
  },
  detailAuthorName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  detailPublishDate: {
    fontSize: 12,
    marginBottom: 2,
  },
  detailExpiryDate: {
    fontSize: 12,
  },
  detailContentText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  attachmentsSection: {
    marginBottom: 20,
  },
  attachmentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    marginBottom: 8,
  },
  attachmentIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  attachmentSize: {
    fontSize: 12,
    color: '#64748B',
  },
  downloadIcon: {
    fontSize: 16,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  statsText: {
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 14,
  },
});

export default AnnouncementsScreen;