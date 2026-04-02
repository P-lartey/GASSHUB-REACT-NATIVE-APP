import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { addInternshipWithNotification } from '../utils/notificationHelpers';

const AddInternshipScreen = ({ navigation, onBackPress }) => {
  const { colors } = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    requirements: '',
    duration: '',
    stipend: '',
    deadline: '',
    applyLink: '',
    isFeatured: false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.title || !formData.company || !formData.description) {
      Alert.alert('Missing Information', 'Please fill in all required fields (Title, Company, Description)');
      return;
    }

    setLoading(true);

    try {
      // Parse requirements as array
      const requirementsArray = formData.requirements
        .split(',')
        .map(req => req.trim())
        .filter(req => req.length > 0);

      // Prepare internship data
      const internshipData = {
        title: formData.title,
        company: formData.company,
        location: formData.location || 'Remote',
        description: formData.description,
        requirements: requirementsArray,
        duration: formData.duration || 'Not specified',
        stipend: formData.stipend || 'Not specified',
        deadline: formData.deadline || 'No deadline',
        applyLink: formData.applyLink,
        is_featured: formData.isFeatured,
        postedAt: new Date().toISOString(),
      };

      // Add internship WITH NOTIFICATION
      const result = await addInternshipWithNotification(internshipData);

      if (result.success) {
        Alert.alert(
          'Success!',
          'Internship added successfully and notification sent to all users!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Clear form
                setFormData({
                  title: '',
                  company: '',
                  location: '',
                  description: '',
                  requirements: '',
                  duration: '',
                  stipend: '',
                  deadline: '',
                  applyLink: '',
                  isFeatured: false,
                });
                
                // Go back or stay based on preference
                if (onBackPress) {
                  onBackPress();
                }
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to add internship');
      }
    } catch (error) {
      Alert.alert('Error', `Failed to add internship: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <Text style={[styles.backButtonText, { color: '#FFFFFF' }]}>⇦</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: '#FFFFFF' }]}>Add Internship</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.label, { color: colors.text }]}>Title *</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.card, 
            color: colors.text,
            borderColor: colors.border 
          }]}
          value={formData.title}
          onChangeText={(text) => updateField('title', text)}
          placeholder="e.g., Software Engineering Intern"
          placeholderTextColor={colors.textSecondary}
        />

        <Text style={[styles.label, { color: colors.text }]}>Company *</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.card, 
            color: colors.text,
            borderColor: colors.border 
          }]}
          value={formData.company}
          onChangeText={(text) => updateField('company', text)}
          placeholder="e.g., Google"
          placeholderTextColor={colors.textSecondary}
        />

        <Text style={[styles.label, { color: colors.text }]}>Location</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.card, 
            color: colors.text,
            borderColor: colors.border 
          }]}
          value={formData.location}
          onChangeText={(text) => updateField('location', text)}
          placeholder="e.g., New York, NY (or Remote)"
          placeholderTextColor={colors.textSecondary}
        />

        <Text style={[styles.label, { color: colors.text }]}>Description *</Text>
        <TextInput
          style={[styles.inputLarge, { 
            backgroundColor: colors.card, 
            color: colors.text,
            borderColor: colors.border 
          }]}
          value={formData.description}
          onChangeText={(text) => updateField('description', text)}
          placeholder="Describe the internship role, responsibilities, etc."
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={4}
        />

        <Text style={[styles.label, { color: colors.text }]}>Requirements</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.card, 
            color: colors.text,
            borderColor: colors.border 
          }]}
          value={formData.requirements}
          onChangeText={(text) => updateField('requirements', text)}
          placeholder="Comma-separated: JavaScript, React, Node.js"
          placeholderTextColor={colors.textSecondary}
        />

        <Text style={[styles.label, { color: colors.text }]}>Duration</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.card, 
            color: colors.text,
            borderColor: colors.border 
          }]}
          value={formData.duration}
          onChangeText={(text) => updateField('duration', text)}
          placeholder="e.g., 3 months, Summer 2024"
          placeholderTextColor={colors.textSecondary}
        />

        <Text style={[styles.label, { color: colors.text }]}>Stipend</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.card, 
            color: colors.text,
            borderColor: colors.border 
          }]}
          value={formData.stipend}
          onChangeText={(text) => updateField('stipend', text)}
          placeholder="e.g., $20/hour or Unpaid"
          placeholderTextColor={colors.textSecondary}
        />

        <Text style={[styles.label, { color: colors.text }]}>Application Deadline</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.card, 
            color: colors.text,
            borderColor: colors.border 
          }]}
          value={formData.deadline}
          onChangeText={(text) => updateField('deadline', text)}
          placeholder="e.g., December 31, 2024"
          placeholderTextColor={colors.textSecondary}
        />

        <Text style={[styles.label, { color: colors.text }]}>Application Link</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.card, 
            color: colors.text,
            borderColor: colors.border 
          }]}
          value={formData.applyLink}
          onChangeText={(text) => updateField('applyLink', text)}
          placeholder="https://company.com/apply"
          placeholderTextColor={colors.textSecondary}
          keyboardType="url"
        />

        <TouchableOpacity
          style={[
            styles.featuredToggle,
            { backgroundColor: formData.isFeatured ? colors.primary : colors.card, borderColor: colors.border }
          ]}
          onPress={() => updateField('isFeatured', !formData.isFeatured)}
        >
          <Text style={{ color: formData.isFeatured ? '#FFFFFF' : colors.text, fontWeight: 'bold' }}>
            {formData.isFeatured ? '✓ Featured Internship' : '○ Mark as Featured'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: loading ? colors.textSecondary : colors.primary },
            loading && { opacity: 0.5 }
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Adding Internship...' : 'Add Internship & Send Notification'}
          </Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            📱 When you click "Add Internship", this will:
          </Text>
          <Text style={styles.infoText}>• Save to Firebase Firestore</Text>
          <Text style={styles.infoText}>• Send push notification to all users</Text>
          <Text style={styles.infoText}>• Show as "New Opportunity" on their phones</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 15,
    backgroundColor: '#4A5FC1',
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
  content: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputLarge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  featuredToggle: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
    alignItems: 'center',
  },
  submitButton: {
    borderRadius: 8,
    padding: 18,
    marginTop: 25,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#EBF8FF',
    borderRadius: 8,
    padding: 15,
    marginTop: 25,
    borderWidth: 1,
    borderColor: '#4299E1',
  },
  infoText: {
    fontSize: 14,
    color: '#2D3748',
    marginBottom: 5,
  },
});

export default AddInternshipScreen;
