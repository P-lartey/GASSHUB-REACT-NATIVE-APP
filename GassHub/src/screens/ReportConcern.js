import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import styles from '../styles/ReportConcernStyles';

const ReportConcern = ({ onBackPress }) => {
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [issueTypes, setIssueTypes] = useState([]);
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState('');

  // Issue type options
  const issueTypeOptions = [
    'App not opening / crashing',
    'Login / account issues',
    'Course materials problem',
    'Chat/messaging issue',
    'Career centre issue',
    'AI feature issue',
    'Slow performance',
    'UI/Design problem',
    'Other'
  ];

  const toggleIssueType = (type) => {
    if (issueTypes.includes(type)) {
      setIssueTypes(issueTypes.filter(t => t !== type));
    } else {
      setIssueTypes([...issueTypes, type]);
    }
  };

  const handleSubmit = async () => {
    // Validate all fields
    if (issueTypes.length === 0) {
      Alert.alert('Required', 'Please select at least one issue type');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Required', 'Please describe your issue in detail');
      return;
    }
    if (!rating) {
      Alert.alert('Required', 'Please provide a rating');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'concerns'), {
        issueTypes,
        description,
        rating: parseInt(rating),
        status: 'new',
        submittedAt: Timestamp.now(),
        read: false,
      });

      Alert.alert('Success!', 'Thank you for your feedback. We\'ll look into this issue shortly.', [
        { text: 'OK', onPress: () => onBackPress && onBackPress() }
      ]);
    } catch (error) {
      console.error('Error submitting concern:', error);
      Alert.alert('Error', 'Failed to submit concern. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButtonWrapper} 
          onPress={onBackPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backButtonText}>⇦</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Report a Concern</Text>
      </View>

      <View style={styles.formContainer}>
        {/* Form Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>🔷 GASSHub – Report a Concern</Text>
          <Text style={styles.descriptionText}>
            We value your feedback.{"\n"}
            Use this form to report any issues, concerns, or suggestions regarding the GASSHub app.{"\n"}
            Your input helps us improve your experience
          </Text>
        </View>

        {/* Question 1: Issue Types */}
        <View style={styles.formGroup}>
          <Text style={styles.questionTitle}>What type of issue are you experiencing? (Required)</Text>
          <Text style={styles.subtitle}>Multiple choice:</Text>
          <ScrollView 
            style={styles.issuesScrollView} 
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            <View style={styles.issuesGrid}>
              {issueTypeOptions.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.issueChip,
                    issueTypes.includes(type) && styles.issueChipSelected
                  ]}
                  onPress={() => toggleIssueType(type)}
                >
                  <Text style={[
                    styles.issueChipText,
                    issueTypes.includes(type) && styles.issueChipTextSelected
                  ]}>
                    {issueTypes.includes(type) ? '✓ ' : '○ '}
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Question 2: Description */}
        <View style={styles.formGroup}>
          <Text style={styles.questionTitle}>Describe the issue in detail (Required)</Text>
          <Text style={styles.subtitle}>Paragraph</Text>
          <TextInput
            style={[styles.textArea, styles.focusedTextArea]}
            multiline
            numberOfLines={6}
            value={description}
            onChangeText={setDescription}
            placeholder="Please describe what happened, when it occurred, and any other relevant details..."
            placeholderTextColor="#95a5a6"
          />
          <Text style={styles.charCount}>{description.length} characters</Text>
        </View>

        {/* Question 3: Star Rating */}
        <View style={styles.formGroup}>
          <Text style={styles.questionTitle}>Rate the app on scale of 5</Text>
          <View style={styles.starRatingContainer}>
            {[1, 2, 3, 4, 5].map((num) => (
              <TouchableOpacity
                key={num}
                style={styles.starButton}
                onPress={() => setRating(num.toString())}
              >
                <Text style={[
                  styles.starText,
                  parseInt(rating) >= num && styles.starTextFilled
                ]}>
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Feedback</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ReportConcern;
