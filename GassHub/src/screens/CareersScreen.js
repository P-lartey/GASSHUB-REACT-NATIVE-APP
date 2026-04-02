import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground, Dimensions, Linking, StatusBar } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useSkillDevelopment } from '../hooks/useFirestoreData';
import ResumeBuildingScreen from './ResumeBuildingScreen';
import InternshipBoardScreen from './InternshipBoardScreen';
import JobOpportunitiesScreen from './JobOpportunitiesScreen';

const {width} = Dimensions.get('window');

const CareersScreen = ({ navigation, onBackPress }) => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('home');

  // Function to go back to home screen
  const goHome = () => {
    setActiveTab('home');
  };

  // Placeholder for the different sections
  const renderContent = () => {
    switch(activeTab) {
      case 'skills':
        // Render the skill development content inline instead of navigating
        return <SkillsDevelopmentContent goBack={goHome} />;
      case 'resume':
        return <ResumeBuildingContent goBack={goHome} />;
      case 'internships':
        return <InternshipOpportunitiesContent goBack={goHome} />;
      case 'jobs':
        return <JobOpportunitiesContent goBack={goHome} />;
      default:
        return <HomeContent setActiveTab={setActiveTab} />;
    }
  };

  // Update the header title based on active tab
  const getHeaderTitle = () => {
    switch(activeTab) {
      case 'skills':
        return 'Skill Development';
      case 'resume':
        return 'Resume Building';
      case 'internships':
        return 'Internship Opportunities';
      case 'jobs':
        return 'Job Opportunities';
      default:
        return 'Career Centre';
    }
  };

  // Update the back button behavior based on active tab
  const handleBackPress = () => {
    if (activeTab !== 'home') {
      goHome(); // Go back to home if we're in a section
    } else {
      onBackPress(); // Otherwise, go back to previous screen
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="#4A5FC1" />
      <View style={[styles.header, { backgroundColor: '#4A5FC1', zIndex: 10, position: 'relative' }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={[styles.backButtonText, { color: '#FFFFFF' }]}>⇦</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: '#FFFFFF' }]}>{getHeaderTitle()}</Text>
        <View style={styles.headerRight} />
      </View>
      
      {renderContent()}
    </View>
  );
};

// Circular Badge Component
const CircularBadge = ({ text, style, showLike = false }) => {
  return (
    <View style={[styles.circularBadge, style]}>
      {showLike && <Text style={styles.likeIcon}>🤍</Text>}
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
};

// Home Screen with vertically arranged big buttons
const HomeContent = ({ setActiveTab }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.homeContainer}>
      <ScrollView 
        style={styles.verticalScrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity 
          style={[styles.verticalButtonContainer, { backgroundColor: '#4A5FC1' }]}
          onPress={() => setActiveTab('skills')}
        >
          <ImageBackground 
            source={require('../../assets/images/skills.png')}
            style={styles.verticalButtonImage}
            imageStyle={styles.verticalButtonImageStyle}
          >
            <CircularBadge text="LEARN" style={styles.verticalBadge} showLike={true} />
          </ImageBackground>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.verticalButtonContainer, { backgroundColor: '#10B981' }]}
          onPress={() => setActiveTab('resume')}
        >
          <ImageBackground 
            source={require('../../assets/images/resumeimage.png')}
            style={styles.verticalButtonImage}
            imageStyle={styles.verticalButtonImageStyle}
          >
            <CircularBadge text="RESUME" style={styles.verticalBadge} showLike={true} />
          </ImageBackground>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.verticalButtonContainer, { backgroundColor: '#F59E0B' }]}
          onPress={() => setActiveTab('internships')}
        >
          <ImageBackground 
            source={require('../../assets/images/Internship.png')}
            style={styles.verticalButtonImage}
            imageStyle={styles.verticalButtonImageStyle}
          >
            <CircularBadge text="INTERNSHIPS" style={styles.verticalBadge} showLike={true} />
          </ImageBackground>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.verticalButtonContainer, { backgroundColor: '#EF4444' }]}
          onPress={() => setActiveTab('jobs')}
        >
          <ImageBackground 
            source={require('../../assets/images/jobsearch.png')}
            style={styles.verticalButtonImage}
            imageStyle={styles.verticalButtonImageStyle}
          >
            <CircularBadge text="JOBS" style={styles.verticalBadge} showLike={true} />
          </ImageBackground>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// Skills Development Content
const SkillsDevelopmentContent = ({ goBack }) => {
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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ flex: 1, padding: 20 }} showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 10, textAlign: 'center' }}>
          Skill Development
        </Text>
        <Text style={{ fontSize: 16, fontWeight: '400', lineHeight: 22, color: colors.textSecondary, marginBottom: 20, textAlign: 'center' }}>
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
                <CircularBadge text="FEATURED" style={{ 
                  position: 'absolute', 
                  top: 10, 
                  right: 10,
                  backgroundColor: '#F59E0B'
                }} />
              )}
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B' }}>
                  Duration: {course.duration} • Level: {course.level}
                </Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: course.is_free ? '#10B981' : colors.primary, marginTop: 3 }}>
                  {course.is_free ? 'FREE' : course.cost}
                </Text>
              </View>
              <TouchableOpacity 
                style={{ backgroundColor: colors.primary, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 }}
                onPress={() => openURL(course.link || course.courseUrl || course.url)}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 }}>Enroll</Text>
              </TouchableOpacity>
            </View>
          </View>
        )))}
      </ScrollView>
    </View>
  );
};

// Resume Building Content - now using the dedicated screen component
const ResumeBuildingContent = ({ goBack }) => {
  return <ResumeBuildingScreen onBackPress={goBack} showHeader={false} />;
};

// Internship Opportunities Content - now using the dedicated screen component
const InternshipOpportunitiesContent = ({ goBack }) => {
  return <InternshipBoardScreen onBackPress={goBack} showHeader={false} />;
};

// Job Opportunities Content - now using the dedicated screen component
const JobOpportunitiesContent = ({ goBack }) => {
  return <JobOpportunitiesScreen onBackPress={goBack} showHeader={false} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 10,
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
  homeContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: 'transparent',
  },
  // Vertical Scroll Container
  verticalScrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  // Vertical Button Styles
  verticalButtonContainer: {
    height: 180,
    marginBottom: 25,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  verticalButtonImage: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
    paddingBottom: 10,
  },
  verticalButtonImageStyle: {
    borderRadius: 25,
  },
  verticalButtonContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  // White background overlay for text readability at bottom
  textOverlay: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  verticalButtonText: {
    color: '#333333',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },

  verticalBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
  },
  likeIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 5,
  },
  badgeX: {
    color: '#FF0000',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 5,
  },
  badgeText: {
    color: '#FF0000',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  // Circular Badge Styles
  circularBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF0000',
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 5,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  sectionHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sectionDescription: {
    fontSize: 16,
    opacity: 0.7,
  },
  contentScroll: {
    flex: 1,
    padding: 20,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
  },
});

export default CareersScreen;