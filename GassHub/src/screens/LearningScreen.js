import React, {useState, useCallback, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  RefreshControl,
  Image,
  ImageBackground,
  Modal,
  Animated,
  Linking,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  Share,
  StatusBar
} from 'react-native';
import { WebView } from 'react-native-webview';

import AISearchScreen from './AISearchScreen';

const slideImage = require('../../assets/images/slideimage.jpg');
import {useTheme} from '../theme/ThemeContext';
import { useCourseMaterials } from '../hooks/useFirestoreData';
import { useFirebaseStorage } from '../hooks/useFirebaseStorage';

const LearningScreen = ({navigation, onBackPress}) => {
  const {colors, isDarkMode, toggleTheme} = useTheme();
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [activeSemester, setActiveSemester] = useState('first');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [downloading, setDownloading] = useState({});
  const [expandedCourse, setExpandedCourse] = useState(null); // For collapse effect
  const [showAISearch, setShowAISearch] = useState(false); // For AI search modal
  const [webViewModalVisible, setWebViewModalVisible] = useState(false); // For WebView modal
  const [webViewUrl, setWebViewUrl] = useState(''); // URL for WebView
  const [previewLoading, setPreviewLoading] = useState({}); // Track loading state for previews
  const [previewMethod, setPreviewMethod] = useState({}); // Track which preview method to use
  const [webViewLoading, setWebViewLoading] = useState(false); // Track WebView loading state
  const [currentViewingFile, setCurrentViewingFile] = useState(null); // Track currently viewing file
  const [retryCount, setRetryCount] = useState(0); // Track retry attempts
  const [currentWebViewUrl, setCurrentWebViewUrl] = useState(''); // Track current WebView URL
  
  // Helper function to extract file extension
  const getFileExtension = (filename) => {
    if (!filename) return '';
    // Handle URLs by extracting filename first
    if (filename.includes('://')) {
      try {
        const url = new URL(filename);
        const pathname = url.pathname;
        const fileName = pathname.split('/').pop();
        return fileName.split('.').pop()?.toLowerCase() || '';
      } catch (e) {
        // If URL parsing fails, try to extract extension from the string
        const lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex > -1) {
          const ext = filename.substring(lastDotIndex + 1).split(/[?#]/)[0];
          return ext.toLowerCase();
        }
        return '';
      }
    }
    // Handle regular filenames
    return filename.split('.').pop()?.toLowerCase() || '';
  };
  
  // Helper function to extract file ID from Google Drive/Docs URL
  const extractIdFromUrl = (url) => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('drive.google.com')) {
        const params = new URLSearchParams(urlObj.search);
        return params.get('id') || '';
      } else if (urlObj.hostname.includes('docs.google.com')) {
        const parts = urlObj.pathname.split('/');
        return parts[parts.indexOf('d') + 1] || '';
      }
      return '';
    } catch {
      return '';
    }
  };
  
    const aiButtonScale = useRef(new Animated.Value(1)).current;
  
  // Get course materials from Firestore
  const { materials: courseMaterials, loading: materialsLoading, error: materialsError } = useCourseMaterials();
  
  // Get Firebase Storage utilities
  const { getCourseMaterialsFromStorage, loading: storageLoading } = useFirebaseStorage();
  
  // State for storage materials
  const [storageMaterials, setStorageMaterials] = useState({});
  
  // Load materials from Firebase Storage when Firestore materials load
  useEffect(() => {
    if (!materialsLoading && courseMaterials && courseMaterials.length > 0) {
      // Load storage materials for each course
      courseMaterials.forEach(async (material) => {
        try {
          // Pass the entire material object which contains storagePath or level/semester/courseCode
          const storageFiles = await getCourseMaterialsFromStorage(material);
          if (storageFiles.length > 0) {
            setStorageMaterials(prev => ({
              ...prev,
              [material.id]: storageFiles
            }));
          }
        } catch (error) {
          console.log(`No storage materials found for ${material.courseCode || material.id}`);
        }
      });
    }
  }, [courseMaterials, materialsLoading]);
  
  // Debug logging for troubleshooting
  useEffect(() => {
    console.log('=== LEARNING SCREEN DEBUG ===');
    console.log('Course materials from hook:', courseMaterials);
    console.log('Storage materials:', storageMaterials);
    console.log('Loading state:', materialsLoading);
    console.log('Storage loading:', storageLoading);
    console.log('Error state:', materialsError);
    console.log('Number of materials:', courseMaterials?.length);
    if (courseMaterials && courseMaterials.length > 0) {
      console.log('First few materials:', courseMaterials.slice(0, 3));
      courseMaterials.forEach(mat => {
        console.log(`Material ${mat.courseCode || mat.title}:`, {
          hasFileUrl: !!mat.fileUrl,
          fileUrl: mat.fileUrl?.substring(0, 50) + '...',
          fileName: mat.fileName,
          fileSize: mat.fileSize,
          storagePath: mat.storagePath
        });
      });
    }
    console.log('================================');
  }, [courseMaterials, storageMaterials, materialsLoading, storageLoading, materialsError]);
  
  // Use Firestore data exclusively - no static fallback
  const effectiveCourseMaterials = (!materialsLoading && courseMaterials && courseMaterials.length > 0) ? courseMaterials : [];
  
  // Add default values for optional fields and ensure files array exists
  const materialsWithDefaults = effectiveCourseMaterials.map(material => {
    // Use ONLY the file from Firebase Firestore (admin upload metadata)
    // Do NOT include duplicate files from Storage folder listing
    let firestoreFiles = [];
      
    // Use direct fileUrl from admin upload (Firebase Storage URL with metadata)
    if (material.fileUrl) {
      console.log(`✅ Using Firebase file for ${material.courseCode || material.title}`);
      firestoreFiles = [
        {
          name: material.fileName || 'Course Material', // Use exact filename from Firebase
          url: material.fileUrl,
          type: 'file',
          fileType: getFileExtension(material.fileUrl),
          size: material.fileSize ? `${(material.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Unknown',
          fromAdmin: true // Mark as from admin upload
        }
      ];
    }
    
    // Use ONLY Firestore files - NO duplicates from Storage
    const allFiles = firestoreFiles;
    
    return {
      ...material,
      // Map Firebase fields to app fields
      code: material.courseCode || material.code || 'Unknown Code',
      name: material.courseName || material.title || material.name || 'Untitled',
      title: material.courseName || material.title || material.name || 'Untitled',
      rating: typeof material.rating !== 'undefined' ? material.rating : 4.0, // Default rating for display
      color: material.color || '#3B82F6',
      level: material.level || '',
      semester: material.semester || '',
      files: allFiles.map(file => ({
        ...file,
        type: (file.type || 'slides').split('?')[0].split('#')[0], // Clean type from query parameters
        name: file.name || material.name || material.code || 'Course Material',
        url: file.url || file.previewUrl || material.fileUrl || 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        size: file.size || 'Unknown',
        downloads: file.downloads || 0,
        previewUrl: file.previewUrl || file.url || material.fileUrl || 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        fileType: file.fileType || getFileExtension(file.url || material.fileUrl || ''),
        pageCount: file.pageCount || 1,
        duration: file.duration || '0:00',
        // Add computed properties for preview
        isImage: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes((file.fileType || '').toLowerCase()) || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(getFileExtension(file.url || material.fileUrl || '')),
        isPdf: (file.fileType || '').toLowerCase() === 'pdf' || getFileExtension(file.url || material.fileUrl || '') === 'pdf',
        isText: ['txt', 'md', 'csv'].includes((file.fileType || '').toLowerCase()) || ['txt', 'md', 'csv'].includes(getFileExtension(file.url || material.fileUrl || ''))
      }))
    };
  });
  
  
  // Group materials by course code to avoid duplicates
  const groupByCourseCode = (materials) => {
    const grouped = {};
    
    materials.forEach(material => {
      // Create a unique course code key (case-insensitive)
      const courseCodeKey = (material.code || 'UNKNOWN').toUpperCase().trim();
      
      if (!grouped[courseCodeKey]) {
        // First occurrence of this course code - create new course entry
        grouped[courseCodeKey] = {
          ...material,
          code: courseCodeKey,
          files: [...(material.files || [])]
        };
      } else {
        // Course code already exists - merge files into existing course
        grouped[courseCodeKey].files = [
          ...grouped[courseCodeKey].files,
          ...(material.files || [])
        ];
        
        // Update course name if current one is empty and new one has value
        if (!grouped[courseCodeKey].name && material.name) {
          grouped[courseCodeKey].name = material.name;
          grouped[courseCodeKey].title = material.title;
        }
      }
    });
    
    // Convert back to array
    return Object.values(grouped);
  };
  
  const learningData = {
    '100': {
      first: groupByCourseCode(materialsWithDefaults.filter(material => 
        material.level === '100' && 
        (material.semester || '').toLowerCase().includes('first')
      )),
      second: groupByCourseCode(materialsWithDefaults.filter(material => 
        material.level === '100' && 
        (material.semester || '').toLowerCase().includes('second')
      )),
    },
    '200': {
      first: groupByCourseCode(materialsWithDefaults.filter(material => 
        material.level === '200' && 
        (material.semester || '').toLowerCase().includes('first')
      )),
      second: groupByCourseCode(materialsWithDefaults.filter(material => 
        material.level === '200' && 
        (material.semester || '').toLowerCase().includes('second')
      )),
    },
    '300': {
      first: groupByCourseCode(materialsWithDefaults.filter(material => 
        material.level === '300' && 
        (material.semester || '').toLowerCase().includes('first')
      )),
      second: groupByCourseCode(materialsWithDefaults.filter(material => 
        material.level === '300' && 
        (material.semester || '').toLowerCase().includes('second')
      )),
    },
    '400': {
      first: groupByCourseCode(materialsWithDefaults.filter(material => 
        material.level === '400' && 
        (material.semester || '').toLowerCase().includes('first')
      )),
      second: groupByCourseCode(materialsWithDefaults.filter(material => 
        material.level === '400' && 
        (material.semester || '').toLowerCase().includes('second')
      )),
    },
  };

  // Debug logging for filtered data
  useEffect(() => {
    console.log('=== FILTERED LEARNING DATA (GROUPED BY COURSE CODE) ===');
    console.log('Total materials before grouping:', materialsWithDefaults.length);
    console.log('300 Level First Semester:', learningData['300'].first.length, 'unique courses');
    if (learningData['300'].first.length > 0) {
      console.log('300 Level First Semester courses:', learningData['300'].first.map(m => ({
        code: m.code,
        name: m.name,
        semester: m.semester,
        level: m.level,
        filesCount: m.files?.length || 0,
        fileNames: m.files?.map(f => f.name)
      })));
      
      // Log first course details
      const firstCourse = learningData['300'].first[0];
      console.log('FIRST COURSE DETAILS (ALL FILES GROUPED):', {
        id: firstCourse.id,
        code: firstCourse.code,
        name: firstCourse.name,
        files: firstCourse.files?.map(f => ({ 
          name: f.name, 
          url: f.url?.substring(0, 50) + '...',
          fromAdmin: f.fromAdmin
        }))
      });
    }
    console.log('===========================');
  }, [materialsWithDefaults]);

  const backPressTimer = useRef(null);
  const themeToggleTimer = useRef(null);

  // Back navigation with debouncing (simplified to avoid hook order issues)
  const handleBackPress = () => {
    // Clear any existing timer
    if (backPressTimer.current) {
      clearTimeout(backPressTimer.current);
    }
    
    // Set a timer to prevent accidental double taps
    backPressTimer.current = setTimeout(() => {
      onBackPress();
    }, 50); // Very short delay for responsiveness
  };

  // Theme toggle with debouncing (simplified to avoid hook order issues)
  const handleThemeToggle = () => {
    // Clear any existing timer
    if (themeToggleTimer.current) {
      clearTimeout(themeToggleTimer.current);
    }
    
    // Set a timer to prevent accidental double taps
    themeToggleTimer.current = setTimeout(() => {
      toggleTheme();
    }, 50); // Very short delay for responsiveness
  };

  // AI Button Animation
  const animateAiButton = () => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(aiButtonScale, {
          toValue: 1.05,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(aiButtonScale, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    setShowAISearch(true);
  };

  // Static animation for the AI button (removed pulsing)
  useEffect(() => {
    // Button remains static without continuous pulsing
    return () => {};
  }, []);

  // Updated data structure with the specified courses for Level 100
  const staticLearningData = {
    '100': {
      first: [
        {
          id: 'math171',
          code: 'MATH 171',
          name: 'Calculus I',
          files: [
            {
              type: 'slides',
              name: 'Limits and Continuity',
              size: '2.4MB',
              downloads: 1240,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 12
            },
            {
              type: 'textbook',
              name: 'Derivatives Fundamentals',
              size: '15.2MB',
              downloads: 890,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 245
            },
            {
              type: 'past-questions',
              name: '2019-2023 Past Questions',
              size: '3.1MB',
              downloads: 1560,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 32
            },
            {
              type: 'video',
              name: 'Differentiation Techniques',
              size: '45MB',
              downloads: 560,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '24:15'
            },
            {
              type: 'assignment',
              name: 'Problem Set 1',
              size: '1.2MB',
              downloads: 720,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 8
            },
          ],
          rating: 4.8,
          color: '#3B82F6',
        },
        {
          id: 'math173',
          code: 'MATH 173',
          name: 'Logic and Set Theory',
          files: [
            {
              type: 'slides',
              name: 'Propositional Logic',
              size: '1.8MB',
              downloads: 980,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 18
            },
            {
              type: 'textbook',
              name: 'Set Operations',
              size: '12.5MB',
              downloads: 670,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 198
            },
            {
              type: 'past-questions',
              name: '2020-2024 Past Questions',
              size: '2.8MB',
              downloads: 1120,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 28
            },
            {
              type: 'video',
              name: 'Predicate Logic Tutorial',
              size: '32MB',
              downloads: 420,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '18:42'
            },
            {
              type: 'assignment',
              name: 'Set Theory Exercises',
              size: '0.9MB',
              downloads: 650,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 6
            },
          ],
          rating: 4.6,
          color: '#2563EB',
        },
        {
          id: 'math175',
          code: 'MATH 175',
          name: 'Vectors and Mechanics',
          files: [
            {
              type: 'slides',
              name: 'Vector Algebra',
              size: '2.1MB',
              downloads: 890,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 15
            },
            {
              type: 'textbook',
              name: 'Mechanics Principles',
              size: '14.3MB',
              downloads: 780,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 210
            },
            {
              type: 'past-questions',
              name: '2018-2023 Past Questions',
              size: '3.4MB',
              downloads: 1320,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 35
            },
            {
              type: 'video',
              name: 'Kinematics Video Lecture',
              size: '52MB',
              downloads: 610,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '32:17'
            },
            {
              type: 'assignment',
              name: 'Vector Problem Set',
              size: '1.5MB',
              downloads: 580,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 10
            },
          ],
          rating: 4.7,
          color: '#3B82F6',
        },
        {
          id: 'math177',
          code: 'MATH 177',
          name: 'Computing for Mathematics I',
          files: [
            {
              type: 'slides',
              name: 'Programming Basics',
              size: '1.9MB',
              downloads: 1020,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 14
            },
            {
              type: 'textbook',
              name: 'MATLAB Fundamentals',
              size: '16.7MB',
              downloads: 910,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 265
            },
            {
              type: 'past-questions',
              name: '2019-2024 Past Questions',
              size: '2.9MB',
              downloads: 1420,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 31
            },
            {
              type: 'video',
              name: 'MATLAB Tutorial Series',
              size: '68MB',
              downloads: 740,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '45:33'
            },
            {
              type: 'assignment',
              name: 'Programming Assignment 1',
              size: '1.1MB',
              downloads: 820,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 7
            },
          ],
          rating: 4.5,
          color: '#10B981',
        },
        {
          id: 'bio155',
          code: 'BIO 155',
          name: 'Biology for Mathematics',
          files: [
            {
              type: 'slides',
              name: 'Cell Biology Overview',
              size: '2.3MB',
              downloads: 870,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 16
            },
            {
              type: 'textbook',
              name: 'Genetics Principles',
              size: '18.2MB',
              downloads: 650,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 312
            },
            {
              type: 'past-questions',
              name: '2020-2025 Past Questions',
              size: '3.2MB',
              downloads: 980,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 29
            },
            {
              type: 'video',
              name: 'Biochemistry Introduction',
              size: '55MB',
              downloads: 530,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '38:45'
            },
            {
              type: 'assignment',
              name: 'Cell Division Worksheet',
              size: '1.4MB',
              downloads: 710,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 9
            },
          ],
          rating: 4.4,
          color: '#8B5CF6',
        },
        {
          id: 'econs151',
          code: 'ECONS 151',
          name: 'Elements of Economics I',
          files: [
            {
              type: 'slides',
              name: 'Supply and Demand',
              size: '2.7MB',
              downloads: 1150,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 20
            },
            {
              type: 'textbook',
              name: 'Microeconomics Fundamentals',
              size: '21.5MB',
              downloads: 890,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 387
            },
            {
              type: 'past-questions',
              name: '2018-2023 Past Questions',
              size: '3.8MB',
              downloads: 1620,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 37
            },
            {
              type: 'video',
              name: 'Market Equilibrium Analysis',
              size: '48MB',
              downloads: 680,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '35:22'
            },
            {
              type: 'assignment',
              name: 'Economic Problem Set',
              size: '1.7MB',
              downloads: 920,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 12
            },
          ],
          rating: 4.6,
          color: '#F59E0B',
        },
        {
          id: 'engl157',
          code: 'ENGL 157',
          name: 'Communication Skills I',
          files: [
            {
              type: 'slides',
              name: 'Effective Writing Techniques',
              size: '1.5MB',
              downloads: 1320,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 13
            },
            {
              type: 'textbook',
              name: 'Public Speaking Guide',
              size: '9.8MB',
              downloads: 1050,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 156
            },
            {
              type: 'past-questions',
              name: '2019-2024 Past Questions',
              size: '2.4MB',
              downloads: 1420,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 26
            },
            {
              type: 'video',
              name: 'Presentation Skills Workshop',
              size: '62MB',
              downloads: 890,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '42:18'
            },
            {
              type: 'assignment',
              name: 'Essay Writing Assignment',
              size: '0.8MB',
              downloads: 1150,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 5
            },
          ],
          rating: 4.7,
          color: '#EF4444',
        },
      ],
      second: [
        {
          id: 'math172',
          code: 'MATH 172',
          name: 'Calculus II',
          files: [
            {
              type: 'slides',
              name: 'Integration Techniques',
              size: '2.6MB',
              downloads: 1120,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 18
            },
            {
              type: 'textbook',
              name: 'Applications of Integration',
              size: '17.3MB',
              downloads: 920,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 278
            },
            {
              type: 'past-questions',
              name: '2019-2024 Past Questions',
              size: '3.5MB',
              downloads: 1680,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 34
            },
            {
              type: 'video',
              name: 'Definite Integrals Tutorial',
              size: '51MB',
              downloads: 750,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '36:44'
            },
            {
              type: 'assignment',
              name: 'Integration Problem Set',
              size: '1.3MB',
              downloads: 890,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 11
            },
          ],
          rating: 4.8,
          color: '#3B82F6',
        },
        {
          id: 'math174',
          code: 'MATH 174',
          name: 'Discrete Mathematics',
          files: [
            {
              type: 'slides',
              name: 'Logic and Proofs',
              size: '2.2MB',
              downloads: 1050,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 16
            },
            {
              type: 'textbook',
              name: 'Set Theory and Relations',
              size: '15.7MB',
              downloads: 870,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 234
            },
            {
              type: 'past-questions',
              name: '2020-2025 Past Questions',
              size: '3.1MB',
              downloads: 1420,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 30
            },
            {
              type: 'video',
              name: 'Graph Theory Basics',
              size: '44MB',
              downloads: 680,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '31:27'
            },
            {
              type: 'assignment',
              name: 'Discrete Math Exercises',
              size: '1.6MB',
              downloads: 760,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 9
            },
          ],
          rating: 4.6,
          color: '#2563EB',
        },
        {
          id: 'math176',
          code: 'MATH 176',
          name: 'Linear Algebra I',
          files: [
            {
              type: 'slides',
              name: 'Vector Spaces',
              size: '2.8MB',
              downloads: 980,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 19
            },
            {
              type: 'textbook',
              name: 'Matrix Theory',
              size: '19.2MB',
              downloads: 810,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 298
            },
            {
              type: 'past-questions',
              name: '2018-2023 Past Questions',
              size: '3.7MB',
              downloads: 1520,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 36
            },
            {
              type: 'video',
              name: 'Eigenvalues and Eigenvectors',
              size: '58MB',
              downloads: 710,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '41:15'
            },
            {
              type: 'assignment',
              name: 'Linear Algebra Problem Set',
              size: '1.4MB',
              downloads: 820,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 10
            },
          ],
          rating: 4.7,
          color: '#3B82F6',
        },
        {
          id: 'engl178',
          code: 'ENGL 178',
          name: 'Computing for Mathematics II',
          files: [
            {
              type: 'slides',
              name: 'Advanced Programming',
              size: '2.3MB',
              downloads: 1120,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 17
            },
            {
              type: 'textbook',
              name: 'Numerical Methods',
              size: '21.3MB',
              downloads: 980,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 345
            },
            {
              type: 'past-questions',
              name: '2019-2024 Past Questions',
              size: '3.2MB',
              downloads: 1620,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 32
            },
            {
              type: 'video',
              name: 'Python for Math Tutorial',
              size: '72MB',
              downloads: 840,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '48:32'
            },
            {
              type: 'assignment',
              name: 'Programming Project',
              size: '1.8MB',
              downloads: 910,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 13
            },
          ],
          rating: 4.5,
          color: '#10B981',
        },
        {
          id: 'stat166',
          code: 'STAT 166',
          name: 'Probability and Statistics',
          files: [
            {
              type: 'slides',
              name: 'Descriptive Statistics',
              size: '2.5MB',
              downloads: 1250,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 18
            },
            {
              type: 'textbook',
              name: 'Probability Theory',
              size: '23.1MB',
              downloads: 1020,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 412
            },
            {
              type: 'past-questions',
              name: '2020-2025 Past Questions',
              size: '3.9MB',
              downloads: 1820,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 38
            },
            {
              type: 'video',
              name: 'Data Visualization',
              size: '55MB',
              downloads: 920,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '39:45'
            },
            {
              type: 'assignment',
              name: 'Statistical Analysis',
              size: '1.5MB',
              downloads: 1050,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 11
            },
          ],
          rating: 4.8,
          color: '#8B5CF6',
        },
        {
          id: 'econs152',
          code: 'ECONS 152',
          name: 'Elements of Economics II',
          files: [
            {
              type: 'slides',
              name: 'Macroeconomics Basics',
              size: '3.1MB',
              downloads: 980,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 22
            },
            {
              type: 'textbook',
              name: 'Economic Growth Models',
              size: '25.7MB',
              downloads: 760,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 378
            },
            {
              type: 'past-questions',
              name: '2018-2023 Past Questions',
              size: '4.2MB',
              downloads: 1320,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 41
            },
            {
              type: 'video',
              name: 'Inflation and Unemployment',
              size: '64MB',
              downloads: 810,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '44:18'
            },
            {
              type: 'assignment',
              name: 'Economics Problem Set',
              size: '2.1MB',
              downloads: 890,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 14
            },
          ],
          rating: 4.4,
          color: '#F59E0B',
        },
        {
          id: 'engl158',
          code: 'ENGL 158',
          name: 'Communication Skills II',
          files: [
            {
              type: 'slides',
              name: 'Academic Writing',
              size: '2.9MB',
              downloads: 1180,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 20
            },
            {
              type: 'textbook',
              name: 'Research Paper Writing',
              size: '22.4MB',
              downloads: 950,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 321
            },
            {
              type: 'past-questions',
              name: '2019-2024 Past Questions',
              size: '3.6MB',
              downloads: 1580,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 35
            },
            {
              type: 'video',
              name: 'Presentation Skills',
              size: '59MB',
              downloads: 870,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '41:33'
            },
            {
              type: 'assignment',
              name: 'Communication Exercises',
              size: '1.9MB',
              downloads: 1020,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 12
            },
          ],
          rating: 4.7,
          color: '#EF4444',
        },
      ],
    },
    '200': {
      first: [
        {
          id: 'math265',
          code: 'MATH 265',
          name: 'Mathematical Methods I',
          files: [
            {
              type: 'slides',
              name: 'Complex Numbers',
              size: '2.1MB',
              downloads: 890,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 14
            },
            {
              type: 'textbook',
              name: 'Series and Sequences',
              size: '16.3MB',
              downloads: 720,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 210
            },
            {
              type: 'past-questions',
              name: '2019-2024 Past Questions',
              size: '3.2MB',
              downloads: 1320,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 28
            },
            {
              type: 'video',
              name: 'Fourier Series Tutorial',
              size: '48MB',
              downloads: 610,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '35:22'
            },
            {
              type: 'assignment',
              name: 'Methods Problem Set 1',
              size: '1.3MB',
              downloads: 580,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 8
            },
          ],
          rating: 4.6,
          color: '#3B82F6',
        },
        {
          id: 'stat266',
          code: 'STAT 266',
          name: 'Statistical Inference',
          files: [
            {
              type: 'slides',
              name: 'Estimation Theory',
              size: '2.4MB',
              downloads: 920,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 16
            },
            {
              type: 'textbook',
              name: 'Hypothesis Testing',
              size: '18.7MB',
              downloads: 780,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 265
            },
            {
              type: 'past-questions',
              name: '2020-2025 Past Questions',
              size: '3.5MB',
              downloads: 1420,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 32
            },
            {
              type: 'video',
              name: 'Confidence Intervals',
              size: '52MB',
              downloads: 680,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '38:45'
            },
            {
              type: 'assignment',
              name: 'Inference Exercises',
              size: '1.6MB',
              downloads: 750,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 10
            },
          ],
          rating: 4.7,
          color: '#2563EB',
        },
        {
          id: 'math277',
          code: 'MATH 277',
          name: 'Real Analysis I',
          files: [
            {
              type: 'slides',
              name: 'Sequences and Series',
              size: '2.7MB',
              downloads: 850,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 18
            },
            {
              type: 'textbook',
              name: 'Metric Spaces',
              size: '21.2MB',
              downloads: 710,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 312
            },
            {
              type: 'past-questions',
              name: '2018-2023 Past Questions',
              size: '3.8MB',
              downloads: 1280,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 35
            },
            {
              type: 'video',
              name: 'Continuity and Differentiability',
              size: '56MB',
              downloads: 620,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '41:15'
            },
            {
              type: 'assignment',
              name: 'Analysis Problem Set',
              size: '1.9MB',
              downloads: 690,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 12
            },
          ],
          rating: 4.8,
          color: '#3B82F6',
        },
        {
          id: 'math275',
          code: 'MATH 275',
          name: 'Linear Algebra II',
          files: [
            {
              type: 'slides',
              name: 'Eigenvalues and Eigenvectors',
              size: '2.3MB',
              downloads: 910,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 15
            },
            {
              type: 'textbook',
              name: 'Diagonalization',
              size: '19.8MB',
              downloads: 790,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 278
            },
            {
              type: 'past-questions',
              name: '2019-2024 Past Questions',
              size: '3.4MB',
              downloads: 1380,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 31
            },
            {
              type: 'video',
              name: 'Inner Product Spaces',
              size: '54MB',
              downloads: 720,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '39:45'
            },
            {
              type: 'assignment',
              name: 'Algebra Problem Set',
              size: '1.7MB',
              downloads: 810,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 11
            },
          ],
          rating: 4.5,
          color: '#10B981',
        },
        {
          id: 'math279',
          code: 'MATH 279',
          name: 'Mathematical Programming',
          files: [
            {
              type: 'slides',
              name: 'Linear Programming',
              size: '2.6MB',
              downloads: 870,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 17
            },
            {
              type: 'textbook',
              name: 'Optimization Methods',
              size: '22.1MB',
              downloads: 820,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 345
            },
            {
              type: 'past-questions',
              name: '2020-2025 Past Questions',
              size: '3.7MB',
              downloads: 1480,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 34
            },
            {
              type: 'video',
              name: 'Simplex Algorithm',
              size: '62MB',
              downloads: 750,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '45:33'
            },
            {
              type: 'assignment',
              name: 'Programming Assignment',
              size: '1.8MB',
              downloads: 890,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 13
            },
          ],
          rating: 4.4,
          color: '#8B5CF6',
        },
        {
          id: 'stat265',
          code: 'STAT 265',
          name: 'Probability Distributions',
          files: [
            {
              type: 'slides',
              name: 'Discrete Distributions',
              size: '2.2MB',
              downloads: 940,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 14
            },
            {
              type: 'textbook',
              name: 'Continuous Distributions',
              size: '20.5MB',
              downloads: 850,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 298
            },
            {
              type: 'past-questions',
              name: '2018-2023 Past Questions',
              size: '3.6MB',
              downloads: 1520,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 33
            },
            {
              type: 'video',
              name: 'Multivariate Distributions',
              size: '58MB',
              downloads: 780,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '42:18'
            },
            {
              type: 'assignment',
              name: 'Distribution Exercises',
              size: '1.5MB',
              downloads: 920,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 9
            },
          ],
          rating: 4.6,
          color: '#F59E0B',
        },
        {
          id: 'engl263',
          code: 'ENGL 263',
          name: 'Literature in English I',
          files: [
            {
              type: 'slides',
              name: 'Poetry Analysis',
              size: '1.9MB',
              downloads: 1020,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 12
            },
            {
              type: 'textbook',
              name: 'Shakespeare Studies',
              size: '17.8MB',
              downloads: 950,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 234
            },
            {
              type: 'past-questions',
              name: '2019-2024 Past Questions',
              size: '2.8MB',
              downloads: 1320,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 26
            },
            {
              type: 'video',
              name: 'Drama Workshop',
              size: '49MB',
              downloads: 870,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '36:44'
            },
            {
              type: 'assignment',
              name: 'Literary Essay',
              size: '1.1MB',
              downloads: 1050,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 6
            },
          ],
          rating: 4.7,
          color: '#EF4444',
        },
      ],
      second: [
        {
          id: 'math278',
          code: 'MATH 278',
          name: 'Real Analysis II',
          files: [
            {
              type: 'slides',
              name: 'Integration Theory',
              size: '2.5MB',
              downloads: 890,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 16
            },
            {
              type: 'textbook',
              name: 'Measure Theory',
              size: '23.4MB',
              downloads: 760,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 378
            },
            {
              type: 'past-questions',
              name: '2018-2023 Past Questions',
              size: '3.9MB',
              downloads: 1420,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 36
            },
            {
              type: 'video',
              name: 'Lebesgue Integration',
              size: '64MB',
              downloads: 810,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '48:32'
            },
            {
              type: 'assignment',
              name: 'Analysis Exercises',
              size: '2.1MB',
              downloads: 890,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 14
            },
          ],
          rating: 4.8,
          color: '#3B82F6',
        },
        {
          id: 'math266',
          code: 'MATH 266',
          name: 'Mathematical Methods II',
          files: [
            {
              type: 'slides',
              name: 'Partial Differential Equations',
              size: '2.8MB',
              downloads: 920,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 19
            },
            {
              type: 'textbook',
              name: 'Special Functions',
              size: '21.7MB',
              downloads: 810,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 321
            },
            {
              type: 'past-questions',
              name: '2019-2024 Past Questions',
              size: '3.6MB',
              downloads: 1520,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 35
            },
            {
              type: 'video',
              name: 'Integral Transforms',
              size: '59MB',
              downloads: 870,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '41:33'
            },
            {
              type: 'assignment',
              name: 'Methods Problem Set 2',
              size: '1.9MB',
              downloads: 1020,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 12
            },
          ],
          rating: 4.7,
          color: '#2563EB',
        },
        {
          id: 'math276',
          code: 'MATH 276',
          name: 'Numerical Analysis I',
          files: [
            {
              type: 'slides',
              name: 'Error Analysis',
              size: '2.4MB',
              downloads: 850,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 15
            },
            {
              type: 'textbook',
              name: 'Root Finding Methods',
              size: '19.3MB',
              downloads: 780,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 265
            },
            {
              type: 'past-questions',
              name: '2020-2025 Past Questions',
              size: '3.3MB',
              downloads: 1320,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 30
            },
            {
              type: 'video',
              name: 'Interpolation Techniques',
              size: '55MB',
              downloads: 710,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '38:45'
            },
            {
              type: 'assignment',
              name: 'Numerical Exercises',
              size: '1.6MB',
              downloads: 820,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 10
            },
          ],
          rating: 4.5,
          color: '#3B82F6',
        },
        {
          id: 'stat266b',
          code: 'STAT 266',
          name: 'Statistical Inference',
          files: [
            {
              type: 'slides',
              name: 'Bayesian Inference',
              size: '2.7MB',
              downloads: 890,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 18
            },
            {
              type: 'textbook',
              name: 'Non-parametric Methods',
              size: '22.8MB',
              downloads: 820,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 345
            },
            {
              type: 'past-questions',
              name: '2019-2024 Past Questions',
              size: '3.8MB',
              downloads: 1480,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 37
            },
            {
              type: 'video',
              name: 'Regression Analysis',
              size: '62MB',
              downloads: 850,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '44:18'
            },
            {
              type: 'assignment',
              name: 'Inference Problem Set',
              size: '2.2MB',
              downloads: 910,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 15
            },
          ],
          rating: 4.6,
          color: '#10B981',
        },
        {
          id: 'math286',
          code: 'MATH 286',
          name: 'Differential Equations I',
          files: [
            {
              type: 'slides',
              name: 'First Order ODEs',
              size: '2.3MB',
              downloads: 910,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 14
            },
            {
              type: 'textbook',
              name: 'Second Order ODEs',
              size: '20.1MB',
              downloads: 840,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 298
            },
            {
              type: 'past-questions',
              name: '2018-2023 Past Questions',
              size: '3.5MB',
              downloads: 1380,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 32
            },
            {
              type: 'video',
              name: 'Systems of ODEs',
              size: '58MB',
              downloads: 780,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '41:15'
            },
            {
              type: 'assignment',
              name: 'DE Problem Set',
              size: '1.7MB',
              downloads: 890,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 11
            },
          ],
          rating: 4.7,
          color: '#8B5CF6',
        },
        {
          id: 'engl264',
          code: 'ENGL 264',
          name: 'Literature in English II',
          files: [
            {
              type: 'slides',
              name: 'Modern Poetry',
              size: '2.1MB',
              downloads: 980,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 13
            },
            {
              type: 'textbook',
              name: 'Contemporary Fiction',
              size: '18.9MB',
              downloads: 910,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 278
            },
            {
              type: 'past-questions',
              name: '2020-2025 Past Questions',
              size: '3.1MB',
              downloads: 1420,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 29
            },
            {
              type: 'video',
              name: 'Literary Criticism',
              size: '53MB',
              downloads: 850,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '39:45'
            },
            {
              type: 'assignment',
              name: 'Critical Essay',
              size: '1.4MB',
              downloads: 980,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 8
            },
          ],
          rating: 4.8,
          color: '#F59E0B',
        },
        {
          id: 'stat267',
          code: 'STAT 267',
          name: 'Statistical Reasoning',
          files: [
            {
              type: 'slides',
              name: 'Data Interpretation',
              size: '2.6MB',
              downloads: 1050,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 17
            },
            {
              type: 'textbook',
              name: 'Statistical Fallacies',
              size: '24.2MB',
              downloads: 980,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 412
            },
            {
              type: 'past-questions',
              name: '2019-2024 Past Questions',
              size: '4.1MB',
              downloads: 1580,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 38
            },
            {
              type: 'video',
              name: 'Experimental Design',
              size: '67MB',
              downloads: 920,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '46:22'
            },
            {
              type: 'assignment',
              name: 'Reasoning Exercises',
              size: '2.3MB',
              downloads: 1050,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 16
            },
          ],
          rating: 4.9,
          color: '#EF4444',
        },
      ],
    },
    '300': {
      first: [
        {
          id: 'math365',
          code: 'MATH 365',
          name: 'Differential Equations II',
          files: [
            {
              type: 'slides',
              name: 'Higher Order DEs',
              size: '2.8MB',
              downloads: 780,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 19
            },
            {
              type: 'textbook',
              name: 'Boundary Value Problems',
              size: '24.1MB',
              downloads: 690,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&format=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 387
            },
            {
              type: 'past-questions',
              name: '2019-2024 Past Questions',
              size: '4.2MB',
              downloads: 1420,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 41
            },
            {
              type: 'video',
              name: 'Sturm-Liouville Theory',
              size: '72MB',
              downloads: 710,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '52:17'
            },
            {
              type: 'assignment',
              name: 'DE Problem Set 2',
              size: '2.4MB',
              downloads: 790,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 15
            },
          ],
          rating: 4.7,
          color: '#3B82F6',
        },
        {
          id: 'math379',
          code: 'MATH 379',
          name: 'Numerical Analysis II',
          files: [
            {
              type: 'slides',
              name: 'Numerical Integration',
              size: '3.1MB',
              downloads: 820,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 22
            },
            {
              type: 'textbook',
              name: 'Finite Difference Methods',
              size: '26.3MB',
              downloads: 750,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 421
            },
            {
              type: 'past-questions',
              name: '2020-2025 Past Questions',
              size: '4.5MB',
              downloads: 1520,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 45
            },
            {
              type: 'video',
              name: 'Monte Carlo Methods',
              size: '78MB',
              downloads: 810,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '58:33'
            },
            {
              type: 'assignment',
              name: 'Numerical Project',
              size: '2.7MB',
              downloads: 890,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 18
            },
          ],
          rating: 4.8,
          color: '#2563EB',
        },
        {
          id: 'stat361',
          code: 'STAT 361',
          name: 'Statistical Computing and Data Analysis I',
          files: [
            {
              type: 'slides',
              name: 'R Programming',
              size: '3.4MB',
              downloads: 890,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 25
            },
            {
              type: 'textbook',
              name: 'Data Visualization',
              size: '28.7MB',
              downloads: 820,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 456
            },
            {
              type: 'past-questions',
              name: '2018-2023 Past Questions',
              size: '4.8MB',
              downloads: 1620,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 48
            },
            {
              type: 'video',
              name: 'Statistical Modeling',
              size: '82MB',
              downloads: 920,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '64:45'
            },
            {
              type: 'assignment',
              name: 'Data Analysis Project',
              size: '3.1MB',
              downloads: 980,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 21
            },
          ],
          rating: 4.9,
          color: '#3B82F6',
        },
        {
          id: 'stat363',
          code: 'STAT 363',
          name: 'Demographic Statistics',
          files: [
            {
              type: 'slides',
              name: 'Population Dynamics',
              size: '2.9MB',
              downloads: 750,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 20
            },
            {
              type: 'textbook',
              name: 'Vital Statistics',
              size: '25.4MB',
              downloads: 680,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 378
            },
            {
              type: 'past-questions',
              name: '2019-2024 Past Questions',
              size: '4.1MB',
              downloads: 1320,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 39
            },
            {
              type: 'video',
              name: 'Migration Patterns',
              size: '68MB',
              downloads: 710,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '51:22'
            },
            {
              type: 'assignment',
              name: 'Demographic Study',
              size: '2.6MB',
              downloads: 780,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 16
            },
          ],
          rating: 4.6,
          color: '#10B981',
        },
        {
          id: 'stat365',
          code: 'STAT 365',
          name: 'Sample Survey Theory and Methods I',
          files: [
            {
              type: 'slides',
              name: 'Sampling Techniques',
              size: '3.2MB',
              downloads: 810,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 23
            },
            {
              type: 'textbook',
              name: 'Survey Design',
              size: '27.8MB',
              downloads: 740,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 412
            },
            {
              type: 'past-questions',
              name: '2020-2025 Past Questions',
              size: '4.4MB',
              downloads: 1420,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 42
            },
            {
              type: 'video',
              name: 'Questionnaire Design',
              size: '74MB',
              downloads: 850,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '56:33'
            },
            {
              type: 'assignment',
              name: 'Survey Project',
              size: '2.9MB',
              downloads: 910,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 19
            },
          ],
          rating: 4.7,
          color: '#8B5CF6',
        },
        {
          id: 'stat367',
          code: 'STAT 367',
          name: 'Introduction to Regression Analysis',
          files: [
            {
              type: 'slides',
              name: 'Linear Regression',
              size: '3.5MB',
              downloads: 890,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 26
            },
            {
              type: 'textbook',
              name: 'Multiple Regression',
              size: '31.2MB',
              downloads: 820,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 487
            },
            {
              type: 'past-questions',
              name: '2018-2023 Past Questions',
              size: '4.7MB',
              downloads: 1520,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 44
            },
            {
              type: 'video',
              name: 'Model Diagnostics',
              size: '81MB',
              downloads: 920,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '62:18'
            },
            {
              type: 'assignment',
              name: 'Regression Exercises',
              size: '3.2MB',
              downloads: 980,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 22
            },
          ],
          rating: 4.8,
          color: '#F59E0B',
        },
        {
          id: 'stat369',
          code: 'STAT 369',
          name: 'Stochastic Processes I',
          files: [
            {
              type: 'slides',
              name: 'Markov Chains',
              size: '3.8MB',
              downloads: 950,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 29
            },
            {
              type: 'textbook',
              name: 'Poisson Processes',
              size: '34.6MB',
              downloads: 880,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 523
            },
            {
              type: 'past-questions',
              name: '2019-2024 Past Questions',
              size: '5.1MB',
              downloads: 1620,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 47
            },
            {
              type: 'video',
              name: 'Queueing Theory',
              size: '88MB',
              downloads: 980,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '68:45'
            },
            {
              type: 'assignment',
              name: 'Stochastic Exercises',
              size: '3.5MB',
              downloads: 1050,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 25
            },
          ],
          rating: 4.9,
          color: '#EF4444',
        },
      ],
      second: [
        {
          id: 'stat362',
          code: 'STAT 362',
          name: 'Statistical Computing and Data Analysis II',
          files: [
            {
              type: 'slides',
              name: 'Advanced R Programming',
              size: '3.7MB',
              downloads: 920,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 28
            },
            {
              type: 'textbook',
              name: 'Machine Learning Basics',
              size: '32.4MB',
              downloads: 850,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 498
            },
            {
              type: 'past-questions',
              name: '2020-2025 Past Questions',
              size: '5.2MB',
              downloads: 1720,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 51
            },
            {
              type: 'video',
              name: 'Deep Learning Intro',
              size: '92MB',
              downloads: 1020,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '74:33'
            },
            {
              type: 'assignment',
              name: 'ML Project',
              size: '3.8MB',
              downloads: 1080,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 28
            },
          ],
          rating: 4.9,
          color: '#3B82F6',
        },
        {
          id: 'math366',
          code: 'MATH 366',
          name: 'Partial Differential Equations',
          files: [
            {
              type: 'slides',
              name: 'Wave Equation',
              size: '3.4MB',
              downloads: 850,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 25
            },
            {
              type: 'textbook',
              name: 'Heat Equation',
              size: '29.7MB',
              downloads: 780,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 456
            },
            {
              type: 'past-questions',
              name: '2018-2023 Past Questions',
              size: '4.9MB',
              downloads: 1520,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 46
            },
            {
              type: 'video',
              name: 'Laplace Equation',
              size: '85MB',
              downloads: 910,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '66:22'
            },
            {
              type: 'assignment',
              name: 'PDE Problem Set',
              size: '3.3MB',
              downloads: 980,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 23
            },
          ],
          rating: 4.8,
          color: '#2563EB',
        },
        {
          id: 'stat364',
          code: 'STAT 364',
          name: 'Non-Parametric Statistics',
          files: [
            {
              type: 'slides',
              name: 'Rank Tests',
              size: '3.1MB',
              downloads: 780,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 22
            },
            {
              type: 'textbook',
              name: 'Bootstrap Methods',
              size: '26.8MB',
              downloads: 710,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 412
            },
            {
              type: 'past-questions',
              name: '2019-2024 Past Questions',
              size: '4.6MB',
              downloads: 1420,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 43
            },
            {
              type: 'video',
              name: 'Kernel Density Estimation',
              size: '78MB',
              downloads: 810,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '59:45'
            },
            {
              type: 'assignment',
              name: 'Non-parametric Exercises',
              size: '3.0MB',
              downloads: 880,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 20
            },
          ],
          rating: 4.7,
          color: '#3B82F6',
        },
        {
          id: 'stat366',
          code: 'STAT 366',
          name: 'Sample Survey Theory and Methods II',
          files: [
            {
              type: 'slides',
              name: 'Complex Surveys',
              size: '3.9MB',
              downloads: 890,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 31
            },
            {
              type: 'textbook',
              name: 'Variance Estimation',
              size: '33.7MB',
              downloads: 820,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 543
            },
            {
              type: 'past-questions',
              name: '2020-2025 Past Questions',
              size: '5.4MB',
              downloads: 1620,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 52
            },
            {
              type: 'video',
              name: 'Post-stratification',
              size: '91MB',
              downloads: 950,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '72:18'
            },
            {
              type: 'assignment',
              name: 'Advanced Survey Project',
              size: '4.1MB',
              downloads: 1050,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 29
            },
          ],
          rating: 4.8,
          color: '#10B981',
        },
        {
          id: 'stat368',
          code: 'STAT 368',
          name: 'Time Series Analysis I',
          files: [
            {
              type: 'slides',
              name: 'ARIMA Models',
              size: '4.2MB',
              downloads: 950,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 34
            },
            {
              type: 'textbook',
              name: 'Spectral Analysis',
              size: '36.1MB',
              downloads: 880,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 578
            },
            {
              type: 'past-questions',
              name: '2018-2023 Past Questions',
              size: '5.7MB',
              downloads: 1720,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 55
            },
            {
              type: 'video',
              name: 'Forecasting Methods',
              size: '98MB',
              downloads: 1020,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '78:33'
            },
            {
              type: 'assignment',
              name: 'Time Series Project',
              size: '4.5MB',
              downloads: 1150,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 32
            },
          ],
          rating: 4.9,
          color: '#8B5CF6',
        },
        {
          id: 'stat370',
          code: 'STAT 370',
          name: 'Stochastic Processes II',
          files: [
            {
              type: 'slides',
              name: 'Brownian Motion',
              size: '4.5MB',
              downloads: 980,
              previewUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 37
            },
            {
              type: 'textbook',
              name: 'Martingale Theory',
              size: '39.4MB',
              downloads: 910,
              previewUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 612
            },
            {
              type: 'past-questions',
              name: '2019-2024 Past Questions',
              size: '6.1MB',
              downloads: 1820,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 58
            },
            {
              type: 'video',
              name: 'Stochastic Calculus',
              size: '105MB',
              downloads: 1080,
              previewUrl: 'https://images.unsplash.com/photo-1574717024456-4444c0ad7830?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'mp4',
              duration: '84:45'
            },
            {
              type: 'assignment',
              name: 'Advanced Stochastic Exercises',
              size: '4.8MB',
              downloads: 1250,
              previewUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
              fileType: 'pdf',
              pageCount: 35
            },
          ],
          rating: 4.9,
          color: '#F59E0B',
        },
      ],
    },
    '400': {
      first: [],
      second: [],
    },
  };

  // Fallback to static data if Firestore data is not available
  const allLearningData = courseMaterials && courseMaterials.length > 0 ? learningData : staticLearningData;
  
  const getLevelCount = (levelId) => {
    const levelData = allLearningData[levelId];
    if (!levelData) return 0;
    return (levelData.first?.length || 0) + (levelData.second?.length || 0);
  };

  const levels = [
    {id: '100', name: 'Level 100', color: '#3B82F6', count: getLevelCount('100')},
    {id: '200', name: 'Level 200', color: '#10B981', count: getLevelCount('200')},
    {id: '300', name: 'Level 300', color: '#8B5CF6', count: getLevelCount('300')},
    {id: '400', name: 'Level 400', color: '#F59E0B', count: getLevelCount('400')},
  ];

  const semesters = [
    {id: 'first', name: 'First Semester'},
    {id: 'second', name: 'Second Semester'},
  ];

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const handleDownload = async (file) => {
    try {
      const fileUrl = file.url || file.fileUrl || file.previewUrl;
      
      setDownloading(prev => ({...prev, [`${file.id}-${file.name}`]: true}));
      
      if (!fileUrl || typeof fileUrl !== 'string') {
        throw new Error(`Invalid file URL for ${file.name}`);
      }
      
      // Simplified download process - directly open URL
      await Linking.openURL(fileUrl);
      Alert.alert('Download Started', `${file.name} is being downloaded!`);
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', `Failed to download ${file.name}: ${error.message}`);
    } finally {
      setDownloading(prev => ({...prev, [`${file.id}-${file.name}`]: false}));
    }
  };

  // Debug helper function for preview issues
  const debugPreviewInfo = (file) => {
    const fileUrl = file.url || file.fileUrl || file.previewUrl;
    console.log('=== PREVIEW DEBUG INFO ===');
    console.log('File name:', file.name);
    console.log('File type:', file.type);
    console.log('Is PDF:', file.isPdf);
    console.log('Is Image:', file.isImage);
    console.log('Is Text:', file.isText);
    console.log('File URL:', fileUrl);
    console.log('File extension:', file.fileType);
    console.log('Page count:', file.pageCount);
    console.log('Size:', file.size);
    console.log('========================');
  };
  
  // Debug helper function
  const debugFileUrl = (file) => {
    const fileUrl = file.url || file.fileUrl || file.previewUrl;
    console.log('=== FILE URL DEBUG ===');
    console.log('File name:', file.name);
    console.log('Original URL:', fileUrl);
    console.log('Cleaned File type:', getFileExtension(fileUrl));
    console.log('Raw file type from object:', file.type);
    console.log('Is Firebase URL:', fileUrl.includes('firebasestorage.googleapis.com'));
    console.log('Is Google Drive URL:', fileUrl.includes('drive.google.com'));
    
    if (fileUrl.includes('firebasestorage.googleapis.com')) {
      try {
        const urlObj = new URL(fileUrl);
        console.log('URL parameters:', Object.fromEntries(urlObj.searchParams));
      } catch (e) {
        console.log('Cannot parse URL');
      }
    }
    console.log('======================');
  };
  
  // Helper function to open in browser
  const handleOpenInBrowser = async (url) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this URL');
      }
    } catch (error) {
      console.error('Browser open error:', error);
      Alert.alert('Error', 'Failed to open in browser');
    }
  };
  
  const handleOpenFullView = async (file) => {
    try {
      const fileUrl = file.url || file.fileUrl || file.previewUrl;
      
      if (!fileUrl || typeof fileUrl !== 'string') {
        Alert.alert('Error', `Invalid file URL for ${file.name}`);
        return;
      }
      
      // Validate URL format
      try {
        new URL(fileUrl);
      } catch (urlError) {
        Alert.alert('Error', `Invalid URL format for ${file.name}`);
        return;
      }
      
      let processedUrl = fileUrl;
      console.log('Original URL:', fileUrl);
      
      // Prevent processing the same URL multiple times
      if (fileUrl.includes('docs.google.com/gview')) {
        // Already processed for Google Docs Viewer, use as-is
        processedUrl = fileUrl;
        console.log('Using pre-processed Google Docs URL:', processedUrl);
      }
      
      // Special handling for Firebase Storage URLs
      if (fileUrl.includes('firebasestorage.googleapis.com')) {
        try {
          // Always use Google Docs Viewer for Firebase Storage URLs as primary method
          // This avoids the metadata vs file content issue entirely
          const encodedUrl = encodeURIComponent(fileUrl);
          processedUrl = `https://docs.google.com/gview?embedded=true&url=${encodedUrl}`;
          console.log('Using Google Docs Viewer for Firebase Storage URL:', processedUrl);
        } catch (urlError) {
          console.log('URL processing error:', urlError);
          // Fallback to direct URL if Google Docs fails
          processedUrl = fileUrl;
          console.log('Fallback to direct URL due to processing error:', processedUrl);
        }
      } else if (fileUrl.includes('drive.google.com')) {
        // Handle Google Drive URLs
        try {
          const urlObj = new URL(fileUrl);
          const fileId = extractIdFromUrl(fileUrl);
          if (fileId) {
            // Use Google Drive viewer for better display
            processedUrl = `https://drive.google.com/file/d/${fileId}/view?usp=drivesdk`;
          }
        } catch (error) {
          console.log('Google Drive URL processing error:', error);
        }
      }
      
      setWebViewUrl(processedUrl);
      setCurrentWebViewUrl(processedUrl); // Track current URL
      console.log('Setting WebView URL to:', processedUrl);
      setRetryCount(0); // Reset retry count for new file
      
      // Validate URL before opening
      try {
        new URL(processedUrl);
        // Prevent loading the same URL if already loaded
        if (webViewUrl === processedUrl && webViewModalVisible) {
          console.log('Same URL already loaded, skipping');
          return;
        }
        setWebViewModalVisible(true);
      } catch (urlError) {
        console.error('Invalid URL:', processedUrl, urlError);
        Alert.alert('Error', `Invalid URL format for ${file.name}`);
      }
    } catch (error) {
      console.error('Open error:', error);
      Alert.alert('Error', `Failed to open ${file.name}: ${error.message}`);
    }
  };

  
  const getFileNameFromUrl = (url) => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      return pathname.split('/').pop() || 'Unknown File';
    } catch {
      return 'Unknown File';
    }
  };

  const getFileIcon = (type) => {
    const icons = {
      'slides': '📊',
      'textbook': '📚',
      'past-questions': '📝',
      'video': '🎥',
      'assignment': '📋',
    };
    return icons[type] || '📄';
  };

  const getFileTypeName = (type) => {
    const names = {
      'slides': 'SLIDES',
      'textbook': 'TEXTBOOK',
      'past-questions': 'PAST QUESTIONS',
      'video': 'VIDEO',
      'assignment': 'ASSIGNMENT',
    };
    return names[type] || 'FILE';
  };

  const Header = ({title, showBackButton = false}) => (
    <View style={styles.header}>
      {showBackButton && (
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={onBackPress}
          activeOpacity={0.7}
        >
          <Text style={[styles.backButtonText, {color: colors.text}]}>◄</Text>
        </TouchableOpacity>
      )}
      <Text style={[styles.headerTitle, {color: colors.text, flex: 1, marginLeft: showBackButton ? 10 : 0}]} numberOfLines={1}>{title}</Text>
      <View style={styles.headerRight}>
        <TouchableOpacity 
          style={styles.themeToggle} 
          onPress={toggleTheme}
          activeOpacity={0.7}
        >
          <Text style={[styles.themeIcon, {color: colors.text}]}>{isDarkMode ? '🌙' : '☀️'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLevelButton = (level) => (
    <TouchableOpacity
      key={level.id}
      style={[
        styles.levelButton,
        {backgroundColor: isDarkMode ? colors.surface : '#EBF8FF', borderColor: colors.borderLight},
        selectedLevel === level.id && [styles.activeLevelButton, {backgroundColor: level.color}],
      ]}
      onPress={() => setSelectedLevel(level.id)}
    >
      <Text style={[
        styles.levelButtonText,
        {color: colors.textSecondary},
        selectedLevel === level.id && styles.activeLevelButtonText,
      ]}>
        {level.name}
      </Text>
      <Text style={[styles.levelCount, {color: colors.textMuted}]}>{level.count} courses</Text>
    </TouchableOpacity>
  );

  const renderSemesterTab = (semester) => (
    <TouchableOpacity
      key={semester.id}
      style={[
        styles.semesterTab,
        {backgroundColor: isDarkMode ? colors.surface : '#EBF8FF', borderColor: colors.borderLight},
        activeSemester === semester.id && [styles.activeSemesterTab, {backgroundColor: colors.primary}],
      ]}
      onPress={() => setActiveSemester(semester.id)}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.semesterTabText,
        {color: colors.textSecondary},
        activeSemester === semester.id && styles.activeSemesterTabText,
      ]}>
        {semester.name}
      </Text>
    </TouchableOpacity>
  );

  // Function to render file preview using native React Native components
  const renderFilePreview = (file) => {
    const fileId = file.id || file.name;
    const isLoading = previewLoading[fileId];
    
    // Debug information
    debugPreviewInfo(file);
    
    // For PDF files, show a decorated card with file information
    if (file.isPdf) {
      return (
        <View style={[styles.nativeFileCard, {backgroundColor: isDarkMode ? colors.surface : '#FFFFFF', borderColor: colors.border}]}>
          {/* File Type Badge */}
          <View style={[styles.fileTypeBadge, {backgroundColor: colors.primary}]}>
            <Text style={styles.fileTypeBadgeText}>PDF DOCUMENT</Text>
          </View>
          
          {/* Decorated PDF Preview Card */}
          <View style={[styles.decoratedPreviewCard, {backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC'}]}>
            {/* PDF Icon Header */}
            <View style={[styles.previewHeader, {backgroundColor: colors.primary + '15'}]}>
              <Text style={[styles.pdfIcon, {color: colors.primary}]}>📄</Text>
              <View style={styles.previewHeaderText}>
                <Text style={[styles.previewTitle, {color: colors.text}]} numberOfLines={1}>
                  {file.name}
                </Text>
                <Text style={[styles.previewSubtitle, {color: colors.textSecondary}]}>
                  {file.fileType?.toUpperCase() || 'PDF'} • {file.size || 'Unknown Size'}
                </Text>
              </View>
            </View>
            
            {/* Preview Content Area */}
            <View style={styles.previewContent}>
              <View style={[styles.pagePreview, {backgroundColor: 'white', borderColor: colors.borderLight}]}>
                <Text style={[styles.pageText, {color: colors.textSecondary}]}>First Page Preview</Text>
              </View>
              
              <View style={styles.previewDetails}>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Pages:</Text>
                  <Text style={[styles.detailValue, {color: colors.text}]}>{file.pageCount || 'N/A'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Type:</Text>
                  <Text style={[styles.detailValue, {color: colors.text}]}>{file.type || 'Document'}</Text>
                </View>
                {file.duration && (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Duration:</Text>
                    <Text style={[styles.detailValue, {color: colors.text}]}>{file.duration}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          
          {/* Preview Info Footer */}
          <View style={[styles.previewFooter, {borderTopColor: colors.borderLight}]}>
            <Text style={[styles.previewFooterText, {color: colors.textSecondary}]}>
              Document preview available • Tap "Open Full" to view complete file
            </Text>
          </View>
        </View>
      );
    }
    
    // For image files, show a decorated card with image information
    if (file.isImage) {
      return (
        <View style={[styles.nativeFileCard, {backgroundColor: isDarkMode ? colors.surface : '#FFFFFF', borderColor: colors.border}]}>
          {/* File Type Badge */}
          <View style={[styles.fileTypeBadge, {backgroundColor: '#10B981'}]}>
            <Text style={styles.fileTypeBadgeText}>IMAGE FILE</Text>
          </View>
          
          {/* Decorated Image Preview Card */}
          <View style={[styles.decoratedPreviewCard, {backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC'}]}>
            {/* Image Icon Header */}
            <View style={[styles.previewHeader, {backgroundColor: '#10B981' + '15'}]}>
              <Text style={[styles.pdfIcon, {color: '#10B981'}]}>🖼️</Text>
              <View style={styles.previewHeaderText}>
                <Text style={[styles.previewTitle, {color: colors.text}]} numberOfLines={1}>
                  {file.name}
                </Text>
                <Text style={[styles.previewSubtitle, {color: colors.textSecondary}]}>
                  {file.fileType?.toUpperCase() || 'IMAGE'} • {file.size || 'Unknown Size'}
                </Text>
              </View>
            </View>
            
            {/* Preview Content Area */}
            <View style={styles.previewContent}>
              <View style={[styles.imagePlaceholder, {backgroundColor: 'white', borderColor: colors.borderLight}]}>
                <Text style={[styles.imageIcon, {color: '#10B981'}]}>📷</Text>
                <Text style={[styles.imageText, {color: colors.textSecondary}]}>Image Preview</Text>
                <Text style={[styles.imageHint, {color: colors.textSecondary}]}>Tap "Open Full" to view</Text>
              </View>
              
              <View style={styles.previewDetails}>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Format:</Text>
                  <Text style={[styles.detailValue, {color: colors.text}]}>{file.fileType?.toUpperCase() || 'N/A'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Type:</Text>
                  <Text style={[styles.detailValue, {color: colors.text}]}>{file.type || 'Image'}</Text>
                </View>
              </View>
            </View>
          </View>
          
          {/* Preview Info Footer */}
          <View style={[styles.previewFooter, {borderTopColor: colors.borderLight}]}>
            <Text style={[styles.previewFooterText, {color: colors.textSecondary}]}>
              Image preview available • Tap "Open Full" to view original size
            </Text>
          </View>
        </View>
      );
    }
      
    // For text files, show a decorated card with text information
    if (file.isText) {
      return (
        <View style={[styles.nativeFileCard, {backgroundColor: isDarkMode ? colors.surface : '#FFFFFF', borderColor: colors.border}]}>
          {/* File Type Badge */}
          <View style={[styles.fileTypeBadge, {backgroundColor: '#8B5CF6'}]}>
            <Text style={styles.fileTypeBadgeText}>TEXT DOCUMENT</Text>
          </View>
          
          {/* Decorated Text Preview Card */}
          <View style={[styles.decoratedPreviewCard, {backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC'}]}>
            {/* Text Icon Header */}
            <View style={[styles.previewHeader, {backgroundColor: '#8B5CF6' + '15'}]}>
              <Text style={[styles.pdfIcon, {color: '#8B5CF6'}]}>📝</Text>
              <View style={styles.previewHeaderText}>
                <Text style={[styles.previewTitle, {color: colors.text}]} numberOfLines={1}>
                  {file.name}
                </Text>
                <Text style={[styles.previewSubtitle, {color: colors.textSecondary}]}>
                  {file.fileType?.toUpperCase() || 'TEXT'} • {file.size || 'Unknown Size'}
                </Text>
              </View>
            </View>
            
            {/* Preview Content Area */}
            <View style={styles.previewContent}>
              <View style={[styles.textPlaceholder, {backgroundColor: 'white', borderColor: colors.borderLight}]}>
                <Text style={[styles.textIcon, {color: '#8B5CF6'}]}>📄</Text>
                <Text style={[styles.textText, {color: colors.textSecondary}]}>Text Document</Text>
                <Text style={[styles.textHint, {color: colors.textSecondary}]}>Tap "Open Full" to read content</Text>
              </View>
              
              <View style={styles.previewDetails}>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Format:</Text>
                  <Text style={[styles.detailValue, {color: colors.text}]}>{file.fileType?.toUpperCase() || 'N/A'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Type:</Text>
                  <Text style={[styles.detailValue, {color: colors.text}]}>{file.type || 'Text'}</Text>
                </View>
              </View>
            </View>
          </View>
          
          {/* Preview Info Footer */}
          <View style={[styles.previewFooter, {borderTopColor: colors.borderLight}]}>
            <Text style={[styles.previewFooterText, {color: colors.textSecondary}]}>
              Text preview available • Tap "Open Full" to view complete content
            </Text>
          </View>
        </View>
      );
    }
      
    // For other file types, show a decorated card with file information
    return (
      <View style={[styles.nativeFileCard, {backgroundColor: isDarkMode ? colors.surface : '#FFFFFF', borderColor: colors.border}]}>
        {/* File Type Badge */}
        <View style={[styles.fileTypeBadge, {backgroundColor: '#64748B'}]}>
          <Text style={styles.fileTypeBadgeText}>FILE DOCUMENT</Text>
        </View>
        
        {/* Decorated Generic Preview Card */}
        <View style={[styles.decoratedPreviewCard, {backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC'}]}>
          {/* Generic Icon Header */}
          <View style={[styles.previewHeader, {backgroundColor: '#64748B' + '15'}]}>
            <Text style={[styles.pdfIcon, {color: '#64748B'}]}>{getFileIcon(file.type)}</Text>
            <View style={styles.previewHeaderText}>
              <Text style={[styles.previewTitle, {color: colors.text}]} numberOfLines={1}>
                {file.name}
              </Text>
              <Text style={[styles.previewSubtitle, {color: colors.textSecondary}]}>
                {file.fileType?.toUpperCase() || 'DOCUMENT'} • {file.size || 'Unknown Size'}
              </Text>
            </View>
          </View>
          
          {/* Preview Content Area */}
          <View style={styles.previewContent}>
            <View style={[styles.genericPlaceholder, {backgroundColor: 'white', borderColor: colors.borderLight}]}>
              <Text style={[styles.genericIcon, {color: '#64748B'}]}>{getFileIcon(file.type)}</Text>
              <Text style={[styles.genericText, {color: colors.textSecondary}]}>
                {file.fileType?.toUpperCase() || 'DOCUMENT'}
              </Text>
              <Text style={[styles.genericHint, {color: colors.textSecondary}]}>File Document</Text>
            </View>
            
            <View style={styles.previewDetails}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Format:</Text>
                <Text style={[styles.detailValue, {color: colors.text}]}>{file.fileType?.toUpperCase() || 'N/A'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Type:</Text>
                <Text style={[styles.detailValue, {color: colors.text}]}>{file.type || 'Document'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Size:</Text>
                <Text style={[styles.detailValue, {color: colors.text}]}>{file.size || 'Unknown'}</Text>
              </View>
              {file.pageCount && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Pages:</Text>
                  <Text style={[styles.detailValue, {color: colors.text}]}>{file.pageCount}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        
        {/* Preview Info Footer */}
        <View style={[styles.previewFooter, {borderTopColor: colors.borderLight}]}>
          <Text style={[styles.previewFooterText, {color: colors.textSecondary}]}>
            File information available • Use "Open Full" or "Download" for access
          </Text>
        </View>
      </View>
    );
  };
    
  const renderFileCard = (file) => (
    <View key={file.name} style={[styles.fileCard, {backgroundColor: isDarkMode ? colors.surface : '#EBF8FF', borderColor: colors.borderLight}]}>      
      {/* FILE HEADER - Ultra-minimal header with only download count */}
      <View style={styles.fileHeader}>
        <View style={styles.fileInfo}>
          {/* All file information moved to preview area */}
        </View>
        <Text style={[styles.downloadCount, {color: colors.primary}]}>{file.downloads} 📥</Text>
      </View>
  
      {/* AUTO-PREVIEW AREA - NO BUTTON, ALWAYS SHOWS */}
      <View style={styles.autoPreview}>
        {renderFilePreview(file)}
        {/* GRADIENT FADE (indicates more content below) */}
        <View style={[styles.autoFadeOverlay, {backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.7)' : 'rgba(255, 255, 255, 0.7)'}]} />
      </View>
  
      {/* ACTION BUTTONS (Only open/download) */}
      <View style={styles.fileActions}>
        <TouchableOpacity 
          style={[styles.openBtn, {backgroundColor: colors.primary}]} 
          onPress={() => {
            const fileUrl = file.url || file.fileUrl || file.previewUrl;
            console.log('Open Full button pressed for file:', file.name);
            console.log('File URL:', fileUrl);
            console.log('Cleaned File type:', file.type);
            
            // Debug the file URL
            debugFileUrl(file);
            
            if (fileUrl && typeof fileUrl === 'string' && fileUrl.startsWith('http')) {
              handleOpenFullView(file);
            } else {
              Alert.alert('Error', 'This file is not available for viewing');
            }
          }}
        >
          <Text style={styles.actionButtonText}>📖 Read</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.downloadBtn, {backgroundColor: colors.surface}]} 
          onPress={() => {
            const fileUrl = file.url || file.fileUrl || file.previewUrl;
            if (fileUrl && typeof fileUrl === 'string' && fileUrl.startsWith('http')) {
              handleDownload(file);
            } else {
              Alert.alert('Error', 'This file is not available for download');
            }
          }}
          disabled={downloading[`${file.id}-${file.name}`]}
        >
          <Text style={[styles.actionButtonText, {color: colors.text}]}>            
            {downloading[`${file.id}-${file.name}`] ? '⏳' : '⬇️'} Download
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCourseCard = (course) => {
    const isExpanded = expandedCourse === course.id;
    
    return (
      <View key={course.id} style={[styles.courseCard, {backgroundColor: isDarkMode ? colors.surface : '#EBF8FF', borderColor: colors.borderLight}]}>
        {/* Course Header - Always visible, clickable to expand/collapse */}
        <TouchableOpacity 
          style={styles.courseHeader}
          onPress={() => setExpandedCourse(isExpanded ? null : course.id)}
        >
          <View style={styles.courseCodeContainer}>
            <Text style={[styles.courseCode, {color: colors.text}]}>{course.code}</Text>
            <Text style={[styles.courseName, {color: colors.textSecondary}]}>{course.name}</Text>
          </View>
          <View style={[styles.ratingContainer, {backgroundColor: isDarkMode ? '#FEF3C7' : '#FEF3C7'}]}>
            <Text style={styles.rating}>⭐ {course.rating}</Text>
          </View>
          <Text style={styles.expandIndicator}>{isExpanded ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {/* Expanded Content - Files section */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.filesSection}>
              <Text style={[styles.filesTitle, {color: colors.text}]}>Available Materials:</Text>
              {course.files.map(renderFileCard)}
            </View>

            <View style={[styles.courseStats, {backgroundColor: isDarkMode ? colors.surface : '#EBF8FF', borderColor: colors.borderLight}]}>
              <View style={styles.stat}>
                <Text style={[styles.statNumber, {color: colors.primary}]}>{course.files.length}</Text>
                <Text style={[styles.statLabel, {color: colors.textSecondary}]}>Files</Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statNumber, {color: colors.primary}]}>
                  {course.files.reduce((sum, file) => sum + file.downloads, 0).toLocaleString()}
                </Text>
                <Text style={[styles.statLabel, {color: colors.textSecondary}]}>Downloads</Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statNumber, {color: colors.primary}]}>{course.rating}</Text>
                <Text style={[styles.statLabel, {color: colors.textSecondary}]}>Rating</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  // Generic level selection screen
  const renderLevelSelection = () => (
    <View style={[styles.container, {backgroundColor: '#1E3A8A'}]}>
      <StatusBar barStyle="light-content" backgroundColor="#4A5FC1" />
      
      {/* White background with curved top edges */}
      <View style={styles.whiteBackground} />
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.levelSelectionContent}
        showsVerticalScrollIndicator={false}
      >
        <Header title="Course Materials" showBackButton={true} />
        <Text style={[styles.welcomeTitle, {color: colors.text}]}>
          Select Your Level
        </Text>
        <Text style={[styles.welcomeSubtitle, {color: colors.textSecondary}]}>
          Choose your academic level to access course materials
        </Text>

        <View style={styles.levelCardsGrid}>
          {levels.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={styles.levelCard}
              onPress={() => setSelectedLevel(level.id)}
            >
              <ImageBackground 
                source={slideImage} 
                style={styles.levelCardBackground}
                imageStyle={styles.levelCardImageStyle}
              >
                <View style={styles.levelCardContent}>
                  <Text style={[styles.levelCardTitle, {color: '#FFFFFF'}]}>
                    {level.name}
                  </Text>
                  <Text style={[styles.levelCardSubtitle, {color: '#FFFFFF'}]}>
                    {level.count} Courses
                  </Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </View>

        {/* AI Search Button with Xtra Image */}
        <Animated.View
          style={[styles.aiSearchButton, { transform: [{ scale: aiButtonScale }, { rotate: '0deg' }] }]}
        >
          <TouchableOpacity 
            style={{ width: '100%' }}
            onPress={animateAiButton}
            onPressIn={() => Animated.spring(aiButtonScale, {
              toValue: 0.95,
              useNativeDriver: true,
            }).start()}
            onPressOut={() => Animated.spring(aiButtonScale, {
              toValue: 1,
              useNativeDriver: true,
            }).start()}
          >
          <View style={styles.aiButtonGradient}>
            <Image 
              source={require('../../assets/images/xtra.jpg')} 
              style={styles.xtraImageButton}
              resizeMode="cover"
            />
          </View>
        </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );

  // Main render function for ALL levels (100, 200, 300, 400)
  const renderLevelDetail = (levelId) => {
    const currentCourses = allLearningData[levelId]?.[activeSemester] || [];
    
    // Filter courses based on search query
    const filteredCourses = currentCourses.filter(course => {
      const matchesCode = course.code?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesName = course.name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCode || matchesName;
    });
    
    return (
      <View style={[styles.container, {backgroundColor: colors.background}]}>
        {/* Blue Header Bar for Battery/Time */}
        <View style={styles.levelHeaderBar}>
          <StatusBar barStyle="light-content" backgroundColor="#4A5FC1" />
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => setSelectedLevel(null)}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonTextWhite}>◄</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitleWhite} numberOfLines={1}>Level {selectedLevel}</Text>
            <View style={styles.headerRight}>
              <TouchableOpacity 
                style={styles.themeToggle} 
                onPress={toggleTheme}
                activeOpacity={0.7}
              >
                <Text style={styles.themeIconWhite}>{isDarkMode ? '🌙' : '☀️'}</Text>
              </TouchableOpacity>
            </View>
          </View>
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
          {/* WhatsApp-style Search Bar */}
          <View style={[styles.searchContainer, { backgroundColor: isDarkMode ? '#333333' : '#f0f0f0' }]}>  
            <View style={styles.searchInputContainer}>
              <Text style={[styles.searchIcon, { color: isDarkMode ? '#888888' : '#666666' }]}>🔍</Text>
              <TextInput
                style={[
                  styles.searchInput,
                  {
                    color: colors.text,
                    flex: 1
                  }
                ]}
                placeholder="Search courses, materials..."
                placeholderTextColor={isDarkMode ? '#888888' : '#999999'}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={() => setSearchQuery('')}
                >
                  <Text style={[styles.clearButtonText, { color: isDarkMode ? '#888888' : '#666666' }]}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Semester Tabs */}
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Semesters</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.semestersContainer}
          >
            {semesters.map(renderSemesterTab)}
          </ScrollView>

          {/* Courses Count */}
          <View style={[styles.coursesCount, {backgroundColor: isDarkMode ? colors.surface : '#EBF8FF', borderColor: colors.borderLight}]}>
            <Text style={[styles.coursesCountText, {color: colors.primary}]}>
              {filteredCourses.length} courses available
            </Text>
            <Text style={[styles.coursesSubtitle, {color: colors.textSecondary}]}>
              Level {selectedLevel} • {activeSemester === 'first' ? 'First' : 'Second'} Semester
            </Text>
          </View>

          {/* Courses Grid with Collapse Effect */}
          {filteredCourses.length > 0 ? (
            <View style={styles.coursesGrid}>
              {filteredCourses.map(renderCourseCard)}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyScreenText, {color: colors.text, textAlign: 'center', fontSize: 18, marginBottom: 10}]}>
                {selectedLevel === '400' ? 'Coming Soon - Level 400 materials will be added soon!' : 'No courses found for this semester'}
              </Text>
              <Text style={[styles.emptyScreenText, {color: colors.textSecondary, textAlign: 'center'}]}>
                Try a different search or semester
              </Text>
            </View>
          )}

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <Text style={[styles.statsTitle, {color: colors.text}]}>Learning Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, {backgroundColor: colors.primary}]}>
                <Text style={styles.statCardNumber}>
                  {currentCourses.length}
                </Text>
                <Text style={styles.statCardLabel}>Total Courses</Text>
              </View>
              <View style={[styles.statCard, {backgroundColor: colors.primary}]}>
                <Text style={styles.statCardNumber}>
                  {currentCourses.reduce((sum, course) => sum + course.files.length, 0)}
                </Text>
                <Text style={styles.statCardLabel}>Materials</Text>
              </View>
              <View style={[styles.statCard, {backgroundColor: colors.primary}]}>
                <Text style={styles.statCardNumber}>
                  {currentCourses.reduce((sum, course) => 
                    sum + course.files.reduce((fileSum, file) => fileSum + file.downloads, 0), 0
                  ).toLocaleString()}
                </Text>
                <Text style={styles.statCardLabel}>Downloads</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  // Main conditional rendering
  const mainScreen = !selectedLevel ? renderLevelSelection() : renderLevelDetail(selectedLevel);
  
  return (
    <>
      {mainScreen}
      {/* AI Search Modal - available on both screens */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showAISearch}
        onRequestClose={() => setShowAISearch(false)}
      >
        <AISearchScreen onClose={() => setShowAISearch(false)} />
      </Modal>
      
      {/* WebView Modal for opening files */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={webViewModalVisible}
        onRequestClose={() => {
          setWebViewModalVisible(false);
          setWebViewUrl('');
          setWebViewLoading(false);
          setRetryCount(0); // Reset retry count
          setCurrentWebViewUrl(''); // Reset current URL
        }}
      >
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, paddingTop: 40, backgroundColor: colors.background }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity 
                style={{ 
                  backgroundColor: 'white',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 8,
                  elevation: 3,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  minWidth: 100,
                  alignItems: 'center',
                  marginRight: 10
                }}
                onPress={() => {
                  // Open ChatGPT in browser
                  handleOpenInBrowser('https://chatgpt.com');
                }}
              >
                <Text style={[styles.headerTitle, { color: '#000000', fontSize: 18, fontWeight: '700', margin: 0 }]}>ChatGPT</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={{ 
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: '#FFFFFF',
                  justifyContent: 'center',
                  alignItems: 'center',
                  elevation: 3,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  borderWidth: 1,
                  borderColor: '#E5E7EB'
                }}
                onPress={async () => {
                  try {
                    const shareOptions = {
                      message: `Check out this document: ${currentViewingFile?.name || 'Document'}\n${webViewUrl}`,
                      url: webViewUrl,
                      title: currentViewingFile?.name || 'Document'
                    };
                    
                    if (Platform.OS === 'android') {
                      delete shareOptions.title; // Android doesn't support title
                    }
                    
                    await Share.share(shareOptions);
                  } catch (error) {
                    console.error('Error sharing:', error);
                    Alert.alert('Error', 'Unable to share this document');
                  }
                }}
              >
                <Text style={{ color: '#000000', fontSize: 18, fontWeight: 'bold' }}>🔗</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity 
                style={{ padding: 8 }}
                onPress={() => {
                  setWebViewModalVisible(false);
                  setWebViewUrl('');
                  setWebViewLoading(false);
                  setRetryCount(0); // Reset retry count
                  setCurrentWebViewUrl(''); // Reset current URL
                }}
              >
                <Text style={[styles.backButtonText, { color: colors.text, fontSize: 18 }]}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={{ flex: 1 }}>
            {webViewLoading && (
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000
              }}>
                <ActivityIndicator size="large" color="#1E40AF" />
                <Text style={{ marginTop: 10, fontSize: 16, color: '#64748B' }}>Loading document...</Text>
              </View>
            )}
            
            {webViewUrl && webViewUrl.length > 0 ? (
              <WebView
                key={webViewUrl} // Force re-render when URL changes
                source={{ 
                  uri: webViewUrl,
                  headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
                    'Cache-Control': 'no-cache'
                  }
                }}
                style={{ flex: 1 }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                allowsFullscreenVideo={true}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                scalesPageToFit={true}
                startInLoadingState={true}
                onLoadStart={() => {
                  // Prevent duplicate loading of the same URL
                  if (webViewLoading) {
                    console.log('WebView already loading, skipping duplicate load');
                    return;
                  }
                  setWebViewLoading(true);
                  // Set timeout to prevent indefinite loading
                  setTimeout(() => {
                    if (webViewLoading) {
                      setWebViewLoading(false);
                      console.log('WebView loading timeout');
                    }
                  }, 15000); // 15 second timeout
                }}
                onLoadEnd={() => setWebViewLoading(false)}
                onLoad={() => {
                  console.log('WebView content loaded successfully');
                  setWebViewLoading(false);
                }}
                onError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.warn('WebView error:', nativeEvent);
                  setWebViewLoading(false);
                  
                  // Check if this looks like JSON metadata being returned
                  if (nativeEvent.description && nativeEvent.description.includes('JSON')) {
                    console.log('Detected JSON metadata response, switching to Google Docs Viewer');
                    const encodedUrl = encodeURIComponent(webViewUrl);
                    setWebViewUrl(`https://docs.google.com/gview?embedded=true&url=${encodedUrl}`);
                    return;
                  }
                  
                  // Fallback to Google Docs Viewer for PDFs if direct loading fails
                  if (webViewUrl.includes('.pdf') && !webViewUrl.includes('docs.google.com') && retryCount < 2) {
                    const encodedUrl = encodeURIComponent(webViewUrl);
                    console.log('Retrying with Google Docs Viewer (attempt', retryCount + 1, ')');
                    setRetryCount(prev => prev + 1);
                    // Add a small delay to prevent rapid retries
                    setTimeout(() => {
                      setWebViewUrl(`https://docs.google.com/gview?embedded=true&url=${encodedUrl}`);
                    }, 1000);
                  }
                }}
                renderError={(errorDomain, errorCode, errorDesc) => (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: 'red' }}>Failed to load: {errorDesc}</Text>
                    <Text style={{ color: 'gray', marginTop: 10, fontSize: 12 }}>
                      Attempts: {retryCount}/2
                    </Text>
                    {/* Specific check for Firebase metadata issue */}
                    {(webViewUrl.includes('firebasestorage.googleapis.com') || errorDesc.includes('JSON') || errorDesc.includes('metadata')) && (
                      <Text style={{ color: 'orange', marginTop: 10, fontSize: 12, textAlign: 'center', paddingHorizontal: 20 }}>
                        Detected Firebase metadata issue. Trying alternative viewer...
                      </Text>
                    )}
                    <TouchableOpacity
                      style={{ marginTop: 20, padding: 10, backgroundColor: '#3B82F6', borderRadius: 5 }}
                      onPress={() => {
                        // Try opening in browser as fallback
                        Linking.openURL(webViewUrl).catch(() => {
                          Alert.alert('Error', 'Cannot open this file');
                        });
                      }}
                    >
                      <Text style={{ color: 'white' }}>Open in Browser Instead</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            ) : (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9' }}>
                <Text style={{ fontSize: 16, color: '#64748B' }}>No content to display</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative', // Required for z-index positioning
  },
  levelHeaderBar: {
    backgroundColor: '#4A5FC1',
    paddingTop: 35, // Push down for status bar
    paddingBottom: 10,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  backButtonTextWhite: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerTitleWhite: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    marginLeft: 10,
  },
  themeIconWhite: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 15, // Reduced from 20 for better fit on small screens
    paddingTop: 40, // Increased from 30 to push content down
    paddingBottom: 15,
    zIndex: 4, // Ensure header appears on top
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto', // Push to the right side
    gap: 8, // Add consistent spacing between elements
  },
  themeToggle: {
    padding: 8,
    marginRight: 0, // Removed since we're using gap
  },
  themeIcon: {
    fontSize: 20,
  },
  backButton: {
    padding: 8,
    marginLeft: 5, // Reduced margin for better spacing
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18, // Slightly reduced font size for better fit
    fontWeight: 'bold',
    flexShrink: 1, // Allow title to shrink if needed
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4, // Add shadow for better visibility on Android
  },
  profileEmojiContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileEmoji: {
    fontSize: 20, // Increased slightly for better visibility
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    zIndex: 3, // Ensure content appears above white background
    position: 'relative', // Required for z-index to work
  },
  searchContainer: {
    flexDirection: 'row',
    marginTop: 15,
    marginBottom: 20,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    fontSize: 16,
    paddingVertical: 8,
    minHeight: 40,
  },
  clearButton: {
    padding: 5,
    marginLeft: 10,
  },
  clearButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  levelsContainer: {
    marginBottom: 25,
  },
  levelButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
    marginRight: 12,
    alignItems: 'center',
    borderWidth: 2,
    minWidth: 120,
  },
  activeLevelButton: {
    borderColor: '#1E40AF',
  },
  levelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  activeLevelButtonText: {
    color: '#FFFFFF',
  },
  levelCount: {
    fontSize: 12,
    marginTop: 4,
  },
  semestersContainer: {
    marginBottom: 20,
  },
  semesterTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activeSemesterTab: {
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  semesterTabText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  activeSemesterTabText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  coursesCount: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 15,
    borderRadius: 15,
    borderWidth: 2,
  },
  coursesCountText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  coursesSubtitle: {
    fontSize: 14,
  },
  coursesGrid: {
    marginBottom: 30,
  },
  emptyState: {
    paddingVertical: 50,
    alignItems: 'center',
    marginBottom: 30,
  },
  courseCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 2,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  courseCodeContainer: {
    flex: 1,
  },
  courseCode: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  courseName: {
    fontSize: 14,
    lineHeight: 18,
  },
  ratingContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rating: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#92400E',
  },
  expandIndicator: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  expandedContent: {
    marginTop: 15,
  },
  filesSection: {
    marginBottom: 16,
  },
  filesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  // File Card Styles for Automatic Preview
  fileCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  fileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  fileIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  fileInfo: {
    flex: 1,
  },
  fileTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  fileMetadata: {
    fontSize: 12,
  },
  downloadCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  autoPreview: {
    position: 'relative',
    height: 200,
    marginVertical: 12,
    overflow: 'hidden',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  autoFadeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  fileActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  openBtn: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  downloadBtn: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  courseStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
  },
  quickStats: {
    marginBottom: 30,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  statCardNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statCardLabel: {
    fontSize: 12,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  // Level Selection Styles
  levelSelectionContent: {
    padding: 15, // Reduced from 20 for better fit on small screens
    paddingTop: 20, // Adjusted for better spacing
  },
  welcomeTitle: {
    fontSize: 28, // Slightly reduced for better proportion
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    marginTop: 20, // Adjusted margin
    paddingHorizontal: 10, // Add horizontal padding for text
  },
  welcomeSubtitle: {
    fontSize: 14, // Slightly reduced font size
    textAlign: 'center',
    marginBottom: 30, // Reduced margin
    paddingHorizontal: 20, // Add horizontal padding for text
    lineHeight: 20, // Better line height for readability
  },
  levelCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  levelCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  levelCardBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelCardImageStyle: {
    borderRadius: 20,
  },
  levelCardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
  },
  levelCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  levelCardSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  // Empty screen style
  emptyScreenText: {
    fontSize: 18,
    textAlign: 'center',
  },
  // Enhanced Header Styles to match dashboard
  enhancedHeaderWrapper: {
    position: 'relative',
    overflow: 'hidden',
  },
  curvedHeaderContainer: {
    height: 80,
    overflow: 'hidden',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    zIndex: 0,
    marginTop: 30,
  },
  curvedHeaderImage: {
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  headerTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start', // Align to top
    paddingTop: 20, // Move to top
    paddingHorizontal: 20,
    zIndex: 1,
  },
  headerTitleText: {
    fontSize: 24, // Made smaller
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  gradientBlueTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    zIndex: 1,
  },
  gradientLayer1: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: '#1E40AF',
  },
  gradientLayer2: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: '#1E40AF',
    borderRadius: 0,
  },
  enhancedHeaderControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Align to top
    paddingHorizontal: 20,
    paddingTop: 20, // Move to top
    zIndex: 2,
  },
  // White background with curved top edges
  whiteBackground: {
    position: 'absolute',
    top: 60, // Position lower to show header details
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30, // Curve the top left edge
    borderTopRightRadius: 30, // Curve the top right edge
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 15,
    zIndex: 1, // Lower z-index so content appears on top
  },
  // AI Search Styles
  aiSearchButton: {
    borderRadius: 50,
    paddingVertical: 5,
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    minWidth: 250,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 12,
  },
  aiButtonGradient: {
    borderRadius: 50,
    backgroundColor: 'transparent',
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderWidth: 0,
    textAlign: 'center',
  },
  xtraImageButton: {
    width: 250,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  aiSearchButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
  },
  aiSearchButtonTextShadow: {
    fontSize: 18,
    color: 'rgba(0, 0, 0, 0.3)',
    fontWeight: '700',
    position: 'absolute',
    zIndex: 1,
    top: 2,
    left: 2,
    textAlign: 'center',
  },
  previewContainer: {
    flex: 1,
    position: 'relative',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  // Native File Card Styles
  nativeFileCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    marginVertical: 8,
  },
  
  fileTypeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  
  fileTypeBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  
  previewContentArea: {
    position: 'relative',
  },
  
  nativeLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 10,
  },
  
  nativeLoadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  
  nativePdfPreview: {
    height: 200,
    backgroundColor: '#FFFFFF',
  },
  
  nativeWebView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  
  nativePreviewFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  fallbackIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  
  fallbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  
  fallbackSubtitle: {
    fontSize: 14,
  },
  
  previewFooter: {
    borderTopWidth: 1,
    padding: 12,
  },
  
  previewFooterText: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  nativeImagePreview: {
    height: 200,
    position: 'relative',
  },
  
  nativePreviewImage: {
    width: '100%',
    height: '100%',
  },
  
  nativeTextPreview: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  textPreviewIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  
  textPreviewName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  
  textPreviewHint: {
    fontSize: 14,
    textAlign: 'center',
  },
  
  nativeGenericPreview: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  genericFileIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  
  genericFileType: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  
  genericPreviewText: {
    fontSize: 12,
  },

  // Decorated Preview Card Styles
  decoratedPreviewCard: {
    borderRadius: 12,
    overflow: 'hidden',
    margin: 8,
  },
  
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  
  pdfIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  
  previewHeaderText: {
    flex: 1,
  },
  
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  
  previewSubtitle: {
    fontSize: 12,
  },
  
  previewContent: {
    padding: 16,
  },
  
  pagePreview: {
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  pageNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  
  pageText: {
    fontSize: 14,
  },
  
  imagePlaceholder: {
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  imageIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  
  imageText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  
  imageHint: {
    fontSize: 12,
  },
  
  textPlaceholder: {
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  textIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  
  textText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  
  textHint: {
    fontSize: 12,
  },
  
  genericPlaceholder: {
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  genericIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  
  genericText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  
  genericHint: {
    fontSize: 12,
  },
  
  previewDetails: {
    gap: 8,
  },
  
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },

  textPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    padding: 10,
  },
  
  // Auto Preview Styles
  autoPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 12,
  },
  
  previewBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    overflow: 'hidden',
  },
  
  pdfPreviewContainer: {
    position: 'relative',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 250,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  
  pdfPreviewFrame: {
    width: '100%',
    height: 250,
    borderWidth: 0,
  },
  
  previewInfo: {
    marginTop: 12,
    alignItems: 'center',
  },
  
  previewInfoText: {
    fontSize: 13,
    textAlign: 'center',
  },
  
  genericPreview: {
    borderRadius: 12,
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
  },

});

export default LearningScreen;