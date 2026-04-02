import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, StatusBar, Alert, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const PersonalInfoScreen = ({ navigation, onBackPress }) => {
  const { colors, isDarkMode } = useTheme();
  const { userDetails, setUserDetails } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    firstName: userDetails?.firstName || 'Not provided',
    lastName: userDetails?.lastName || 'Not provided',
    email: userDetails?.email || 'Not provided',
    gender: userDetails?.gender || 'Not provided',
    phoneNumber: userDetails?.phoneNumber || 'Not provided',
    level: userDetails?.level || ''
  });

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      saveUserData();
    }
    setIsEditing(!isEditing);
  };

  const saveUserData = async () => {
    try {
      // Update in AsyncStorage
      const updatedDetails = {
        ...userDetails,
        firstName: userData.firstName,
        lastName: userData.lastName,
        gender: userData.gender,
        phoneNumber: userData.phoneNumber,
        level: userData.level
      };
      
      await AsyncStorage.setItem('userDetails', JSON.stringify(updatedDetails));
      setUserDetails(updatedDetails);
      
      Alert.alert('Success', 'Personal information updated successfully!');
    } catch (error) {
      console.error('Error saving user data:', error);
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    }
  };

  const handleInputChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Function to format level display
  const formatLevelDisplay = (level) => {
    if (!level) return '';
    
    // For regular levels (100, 200, 300, 400)
    if (['100', '200', '300', '400'].includes(level)) {
      return `Level ${level} Student`;
    }
    
    // For postgraduate and masters
    if (level === 'postgraduate') {
      return 'Post Graduate Student';
    }
    if (level === 'masters') {
      return 'Masters Student';
    }
    
    return level;
  };

  const renderEditableField = (label, field, placeholder, keyboardType = 'default') => (
    <View style={styles.fieldContainer}>
      <Text style={[styles.fieldLabel, { color: colors.text }]}>{label}</Text>
      {isEditing ? (
        <TextInput
          style={[styles.inputField, { 
            backgroundColor: isDarkMode ? '#334155' : '#F1F5F9',
            color: colors.text,
            borderColor: isDarkMode ? '#475569' : '#CBD5E1'
          }]}
          value={userData[field]}
          onChangeText={(value) => handleInputChange(field, value)}
          placeholder={placeholder}
          placeholderTextColor={isDarkMode ? '#94A3B8' : '#94A3B8'}
          keyboardType={keyboardType}
        />
      ) : (
        <Text style={[styles.fieldValue, { color: colors.textSecondary }]}>
          {userData[field] && userData[field] !== 'Not provided' ? userData[field] : 'Not provided'}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Blue Header Bar */}
      <View style={styles.personalInfoHeaderBar}>
        <StatusBar barStyle="light-content" backgroundColor="#4A5FC1" />
        
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onBackPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backButtonText}>⇦</Text>
        </TouchableOpacity>
        
        {/* Title - Centered */}
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Personal info</Text>
        </View>
        
        {/* Edit Button */}
        <TouchableOpacity 
          style={styles.editButton}
          onPress={handleEditToggle}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.editIcon}>{isEditing ? '✅' : '✎'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* User Info Card */}
        <View style={[styles.infoCard, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
          {renderEditableField('First Name', 'firstName', 'Enter first name')}
          {renderEditableField('Surname', 'lastName', 'Enter surname')}
          {renderEditableField('Email', 'email', 'Enter email', 'email-address')}
          {renderEditableField('Gender', 'gender', 'Enter gender')}
          {renderEditableField('Phone Number', 'phoneNumber', 'Enter phone number', 'phone-pad')}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Academic Level</Text>
            <Text style={[styles.fieldValue, { color: colors.textSecondary }]}>
              {userData.level ? formatLevelDisplay(userData.level) : 'Not provided'}
            </Text>
          </View>
        </View>

        {isEditing && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.cancelButton, { backgroundColor: '#EF4444' }]}
              onPress={() => {
                // Reset to original data
                setUserData({
                  firstName: userDetails?.firstName || 'Not provided',
                  lastName: userDetails?.lastName || 'Not provided',
                  email: userDetails?.email || 'Not provided',
                  gender: userDetails?.gender || 'Not provided',
                  phoneNumber: userDetails?.phoneNumber || 'Not provided',
                  level: userDetails?.level || ''
                });
                setIsEditing(false);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: '#10B981' }]}
              onPress={handleEditToggle}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  personalInfoHeaderBar: {
    backgroundColor: '#4A5FC1',
    paddingTop: Platform.OS === 'ios' ? 0 : 0,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 44,
    minHeight: 44,
  },
  editIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputField: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  fieldValue: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 10,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PersonalInfoScreen;