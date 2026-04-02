import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, SafeAreaView, StatusBar } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const ProfileScreen = ({ navigation, onBackPress }) => {
  const { colors, isDarkMode } = useTheme();
  const { getUserFirstName, userDetails } = useAuth();

  // Function to format level display for profile
  const formatLevelForProfile = (level) => {
    if (!level) return '';
    
    // For regular levels (100, 200, 300, 400)
    if (['100', '200', '300', '400'].includes(level)) {
      return `Level ${level} Student`;
    }
    
    // For postgraduate and masters - just show the program name + "Student"
    if (level === 'postgraduate') {
      return 'Post Graduate Student';
    }
    if (level === 'masters') {
      return 'Masters Student';
    }
    
    return level;
  };

  const menuItems = [
    { id: 'personal', title: 'Personal Info', icon: '👤', screen: 'PersonalInfo' },
    { id: 'about', title: 'About Us', icon: 'ℹ️', screen: 'AboutUs' },
    { id: 'report', title: 'Report Issues', icon: '📝', screen: 'ReportConcern' },
  ];

  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.success) {
        // Navigate to login screen
        navigation.navigate('login');
      } else {
        Alert.alert('Error', result.error || 'Failed to logout');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const handleMenuItemPress = (screen) => {
    console.log('Menu item pressed:', screen);
    console.log('Navigation object:', navigation);
    if (screen === 'PersonalInfo') {
      console.log('Navigating to personal-info');
      navigation.navigate('personal-info');
    } else if (screen === 'ReportConcern') {
      console.log('Navigating to report-concern');
      navigation.navigate('report-concern');
    } else if (screen === 'AboutUs') {
      console.log('Navigating to AboutUs');
      navigation.navigate('AboutUs');
    } else {
      // Navigate to respective screens
      console.log(`Navigating to ${screen}`);
      navigation.navigate(screen);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Blue Header Bar for Battery/Time */}
      <View style={styles.profileHeaderBar}>
        <StatusBar barStyle="light-content" backgroundColor="#4A5FC1" />
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={onBackPress}
          >
            <Text style={styles.backButtonText}>⇦</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Section */}
        <View style={styles.userInfoContainer}>
          <Text style={styles.userName}>{getUserFirstName()}</Text>
          <Text style={styles.userLevel}>{formatLevelForProfile(userDetails?.level)}</Text>
        </View>

        {/* Branded Card */}
        <View style={[styles.brandedCard, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
          <View style={styles.cardContent}>
            <View style={styles.cardIllustration}>
              <Text style={styles.illustrationText}>🏠</Text>
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={[styles.cardTitle, { color: isDarkMode ? '#FFFFFF' : '#1E293B' }]}>
                GASSHUB Your Growth
              </Text>
              <Text style={[styles.cardDescription, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>
                Your ultimate platform for professional development, career advancement, and academic excellence
              </Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, { 
                backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                borderBottomWidth: 1,
                borderBottomColor: isDarkMode ? '#334155' : '#E2E8F0'
              }]}
              onPress={() => handleMenuItemPress(item.screen)}
            >
              <View style={styles.menuItemContent}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={[styles.menuText, { color: colors.text }]}>{item.title}</Text>
              </View>
              <Text style={[styles.arrowIcon, { color: colors.textSecondary }]}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { 
            backgroundColor: '#EF4444',
            marginTop: 20
          }]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeaderBar: {
    backgroundColor: '#4A5FC1',
    paddingTop: 35, // Push down for status bar
    paddingBottom: 10,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
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
  userInfoContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 8,
  },
  userLevel: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    color: '#64748B',
  },
  brandedCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIllustration: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1E40AF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  illustrationText: {
    fontSize: 28,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  menuContainer: {
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
  },
  arrowIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;