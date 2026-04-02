import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  Animated,
  Dimensions,
  Linking,
  Platform
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

const { width } = Dimensions.get('window');

const AboutUsScreen = ({ navigation, onBackPress }) => {
  const { colors, isDarkMode } = useTheme();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  // Team members data
  const teamMembers = [
    {
      id: '1',
      name: 'Prince Philip Lartey Annoh',
      role: 'Founder & Lead Developer',
      image: require('../../assets/images/developer.jpg'),
      color: '#4A5FC1',
      gradient: ['#4A5FC1', '#6366F1'],
    },
    {
      id: '2',
      name: 'Agbledzorwu Gabriel',
      role: 'Co-Founder',
      image: require('../../assets/images/gabby.jpg'),
      color: '#EF4444',
      gradient: ['#EF4444', '#F97316'],
    },
    {
      id: '3',
      name: 'Hebert Ayisi Boadu',
      role: 'GASS President',
      image: require('../../assets/images/presidentpic.jpeg'),
      color: '#10B981',
      gradient: ['#10B981', '#3B82F6'],
    },
    {
      id: '4',
      name: 'Dr. Wilhemina Adoma Pels',
      role: 'Patron',
      image: require('../../assets/images/patronpic.jpg'),
      color: '#F59E0B',
      gradient: ['#F59E0B', '#EC4899'],
    },
  ];

  // Contact information
  const contactInfo = {
    email: 'gassknust26@gmail.com',
    department: 'Department of Statistics & Actuarial Science',
    faculty: 'Fac.: Physical & Computational Sciences',
    college: 'College of Science',
    address: 'KNUST, PMB, Kumasi-Ghana',
  };

  // Social media links
  const socialLinks = {
    linkedin: 'https://www.linkedin.com/company/ghana-association-of-statistics-students-knust/posts/?feedView=all',
    tiktok: 'https://www.tiktok.com/@knuststats_27/video/7571765490893344012?is_from_webapp=1',
  };

  useEffect(() => {
    // Staggered animation sequence
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${contactInfo.email}`);
  };

  const handleLinkedInPress = () => {
    Linking.openURL(socialLinks.linkedin);
  };

  const handleTikTokPress = () => {
    Linking.openURL(socialLinks.tiktok);
  };

  const renderTeamMember = (member, index) => {
    const memberFadeAnim = useRef(new Animated.Value(0)).current;
    const memberSlideAnim = useRef(new Animated.Value(30)).current;
    
    useEffect(() => {
      Animated.delay(index * 150).start();
      Animated.parallel([
        Animated.timing(memberFadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(memberSlideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    return (
      <Animated.View 
        key={member.id}
        style={[
          styles.teamCard,
          { 
            backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
            transform: [{ translateY: memberSlideAnim }, { scale: scaleAnim }],
            opacity: memberFadeAnim,
          },
        ]}
      >
        <View style={[styles.imageContainer, { borderColor: member.color }]}>
          <Image source={member.image} style={styles.teamImage} />
          <View style={[styles.roleBadge, { backgroundColor: member.color }]}>
            <Text style={styles.roleBadgeText}>{member.role}</Text>
          </View>
        </View>
        <View style={styles.memberInfo}>
          <Text style={[styles.memberName, { color: isDarkMode ? '#FFFFFF' : '#1E293B' }]}>
            {member.name}
          </Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <StatusBar barStyle="light-content" backgroundColor="#4A5FC1" />
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={onBackPress}
          >
            <Text style={styles.backButtonText}>⇦</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>About us</Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section with Gradient Effect */}
        <Animated.View 
          style={[
            styles.welcomeSection,
            {
              transform: [{ translateY: slideAnim }],
              opacity: fadeAnim,
            }
          ]}
        >
          <View style={[styles.welcomeCard, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
            <Text style={[styles.welcomeTitle, { color: isDarkMode ? '#FFFFFF' : '#1E293B' }]}>
              Meet Our Team ✨
            </Text>
            <Text style={[styles.welcomeSubtitle, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>
              The brilliant minds behind GASSHUB's success
            </Text>
            <View style={styles.decorativeLine}>
              <View style={[styles.lineSegment, { backgroundColor: '#4A5FC1' }]} />
              <View style={[styles.lineSegment, { backgroundColor: '#EF4444' }]} />
              <View style={[styles.lineSegment, { backgroundColor: '#10B981' }]} />
            </View>
          </View>
        </Animated.View>

        {/* Team Members Grid */}
        <View style={styles.teamGrid}>
          {teamMembers.map((member, index) => renderTeamMember(member, index))}
        </View>

        {/* Contact Information Section */}
        <Animated.View 
          style={[
            styles.contactSection,
            { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' },
            {
              transform: [{ translateY: slideAnim }],
              opacity: fadeAnim,
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFFFFF' : '#1E293B' }]}>
              📬 Contact Information
            </Text>
            <View style={[styles.sectionLine, { backgroundColor: '#4A5FC1' }]} />
          </View>

          <TouchableOpacity 
            style={styles.contactItem}
            onPress={handleEmailPress}
          >
            <View style={[styles.contactIconBox, { backgroundColor: '#4A5FC1' }]}>
              <Text style={styles.contactIcon}>📧</Text>
            </View>
            <View style={styles.contactTextContainer}>
              <Text style={[styles.contactLabel, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>
                Official Email
              </Text>
              <Text style={[styles.contactValue, { color: isDarkMode ? '#FFFFFF' : '#1E293B' }]}>
                {contactInfo.email}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.contactItem}>
            <View style={[styles.contactIconBox, { backgroundColor: '#10B981' }]}>
              <Text style={styles.contactIcon}>📍</Text>
            </View>
            <View style={styles.contactTextContainer}>
              <Text style={[styles.contactLabel, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>
                Department Address
              </Text>
              <Text style={[styles.contactValue, { color: isDarkMode ? '#FFFFFF' : '#1E293B' }]}>
                {contactInfo.department}
              </Text>
              <Text style={[styles.contactValue, { color: isDarkMode ? '#FFFFFF' : '#1E293B' }]}>
                {contactInfo.faculty}
              </Text>
              <Text style={[styles.contactValue, { color: isDarkMode ? '#FFFFFF' : '#1E293B' }]}>
                {contactInfo.college}
              </Text>
              <Text style={[styles.contactValue, { color: isDarkMode ? '#FFFFFF' : '#1E293B' }]}>
                {contactInfo.address}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Social Media Section */}
        <Animated.View 
          style={[
            styles.socialSection,
            { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' },
            {
              transform: [{ translateY: slideAnim }],
              opacity: fadeAnim,
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFFFFF' : '#1E293B' }]}>
              🌐 Follow Us on Social Media
            </Text>
            <View style={[styles.sectionLine, { backgroundColor: '#EF4444' }]} />
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: '#0077B5' }]}
              onPress={handleLinkedInPress}
            >
              <Text style={styles.socialButtonText}>💼 LinkedIn</Text>
              <Text style={styles.socialButtonSubtext}>Connect with us professionally</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: '#000000' }]}
              onPress={handleTikTokPress}
            >
              <Text style={styles.socialButtonText}>🎵 TikTok</Text>
              <Text style={styles.socialButtonSubtext}>Watch our creative videos</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={[styles.footerCard, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
            <Text style={[styles.footerTitle, { color: isDarkMode ? '#FFFFFF' : '#1E293B' }]}>
              Ghana Association of Statistics Students
            </Text>
            <Text style={[styles.footerSubtitle, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>
              KNUST Chapter © 2026
            </Text>
            <View style={styles.footerDecorative}>
              <View style={[styles.footerDot, { backgroundColor: '#4A5FC1' }]} />
              <View style={[styles.footerDot, { backgroundColor: '#EF4444' }]} />
              <View style={[styles.footerDot, { backgroundColor: '#10B981' }]} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    backgroundColor: '#4A5FC1',
    paddingTop: Platform.OS === 'android' ? 35 : 0,
    paddingBottom: 10,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 10,
    minWidth: 44,
    minHeight: 44,
  },
  backButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeSection: {
    alignItems: 'center',
    marginVertical: 30,
  },
  welcomeCard: {
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 15,
  },
  decorativeLine: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 5,
  },
  lineSegment: {
    height: 4,
    width: 30,
    borderRadius: 2,
  },
  teamGrid: {
    marginBottom: 30,
  },
  teamCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 4,
    borderRadius: 100,
    padding: 5,
  },
  teamImage: {
    width: 160,
    height: 160,
    borderRadius: 80,
    resizeMode: 'cover',
  },
  roleBadge: {
    position: 'absolute',
    bottom: -10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  roleBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'lowercase',
    letterSpacing: 0.5,
  },
  memberInfo: {
    alignItems: 'center',
  },
  memberName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  contactSection: {
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  sectionHeader: {
    marginBottom: 25,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionLine: {
    height: 4,
    width: 100,
    borderRadius: 2,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingVertical: 10,
  },
  contactIconBox: {
    width: 55,
    height: 55,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  contactIcon: {
    fontSize: 26,
  },
  contactTextContainer: {
    flex: 1,
    paddingTop: 5,
  },
  contactLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'lowercase',
    letterSpacing: 0.5,
  },
  contactValue: {
    fontSize: 16,
    lineHeight: 24,
  },
  socialSection: {
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  socialButton: {
    flex: 1,
    padding: 22,
    borderRadius: 18,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  socialButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  socialButtonSubtext: {
    color: '#FFFFFF',
    fontSize: 13,
    opacity: 0.9,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    marginVertical: 30,
    marginBottom: 40,
  },
  footerCard: {
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  footerSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 15,
  },
  footerDecorative: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 5,
  },
  footerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default AboutUsScreen;
