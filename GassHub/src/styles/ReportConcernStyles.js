import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  // Main Container
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },

  // Header Section
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backButtonWrapper: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 20,
    color: '#2c3e50',
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2c3e50',
    letterSpacing: -0.5,
    flex: 1,
  },

  // Form Container
  formContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
    backgroundColor: 'transparent',
  },
  
  // Form Description
  descriptionContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2c3e50',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  descriptionText: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 22,
  },

  // Form Group
  formGroup: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
    width: '100%',
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 13,
    color: '#7f8c8d',
    marginBottom: 10,
    fontWeight: '500',
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#34495e',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  pickerContainer: {
    borderWidth: 2,
    borderColor: '#e8ecf1',
    borderRadius: 12,
    backgroundColor: '#fafbfc',
    overflow: 'visible',
    width: '100%',
  },
  picker: {
    height: 58,
    width: '100%',
  },

  // Issue Chips
  issuesScrollView: {
    maxHeight: 280,
    marginBottom: 5,
    backgroundColor: 'transparent',
  },
  issuesGrid: {
    gap: 10,
    backgroundColor: 'transparent',
    paddingBottom: 5,
  },
  issueChip: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e8ecf1',
    backgroundColor: '#fff',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  issueChipSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#3498db',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  issueChipText: {
    fontSize: 14,
    color: '#34495e',
    fontWeight: '500',
  },
  issueChipTextSelected: {
    color: '#2980b9',
    fontWeight: '700',
  },

  // Text Area
  textArea: {
    borderWidth: 2,
    borderColor: '#e8ecf1',
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: '#34495e',
    backgroundColor: '#fafbfc',
    minHeight: 140,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  focusedTextArea: {
    borderColor: '#3498db',
    backgroundColor: '#fff',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  charCount: {
    fontSize: 13,
    color: '#95a5a6',
    textAlign: 'right',
    marginTop: 8,
    fontWeight: '500',
  },

  // Star Rating
  starRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginVertical: 15,
  },
  starButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e8ecf1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  starText: {
    fontSize: 28,
    color: '#e0e0e0',
    fontWeight: 'bold',
  },
  starTextFilled: {
    color: '#f39c12',
    textShadowColor: '#f39c12',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },

  // Submit Button
  submitButton: {
    backgroundColor: '#3498db',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
