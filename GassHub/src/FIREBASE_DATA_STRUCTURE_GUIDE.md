# 📊 Firebase Data Structure Guide for GASSHUB

## Overview
This guide provides the exact data structures needed for your Firebase Firestore collections to work perfectly with your GASSHUB application.

## 🔧 Required Collections Structure

### 1. Announcements Collection (`announcements`)

**Collection Path:** `announcements`

**Document Structure:**
```javascript
{
  "title": "String - Announcement title",
  "content": "String - Detailed announcement content",
  "category": "String - academic|general|urgent|event",
  "priority": "String - low|medium|high|emergency",
  "author_name": "String - Name of the author",
  "author_role": "String - department_head|admin|lecturer",
  "target_audience": ["Array of strings - students|lecturers|all"],
  "is_published": "Boolean - true|false",
  "is_pinned": "Boolean - true|false",
  "publish_date": "Timestamp or ISO string",
  "expiry_date": "Timestamp or ISO string",
  "attachments": [
    {
      "name": "String - File name",
      "url": "String - File URL",
      "type": "String - pdf|doc|image"
    }
  ],
  "timestamp": "Timestamp - For sorting (required by app)"
}
```

**Sample Document:**
```javascript
{
  "title": "Mid-Term Examination Schedule",
  "content": "The mid-term examinations for all courses will be held from March 10-20, 2025. Please check the timetable on the department notice board. All students must bring their ID cards.",
  "category": "academic",
  "priority": "high",
  "author_name": "Prof. Sarah Williams",
  "author_role": "department_head",
  "target_audience": ["students"],
  "is_published": true,
  "is_pinned": true,
  "publish_date": "2025-01-15T09:00:00Z",
  "expiry_date": "2025-03-20T23:59:59Z",
  "attachments": [
    {
      "name": "exam_schedule.pdf",
      "url": "https://firebasestorage.googleapis.com/v0/b/your-app.appspot.com/o/exam_schedule.pdf?alt=media",
      "type": "pdf"
    }
  ],
  "timestamp": {
    "seconds": 1705309200,
    "nanoseconds": 0
  }
}
```

### 2. Career Center Collection (`career-center`)

**Collection Path:** `career-center`

**Document Structure:**
```javascript
{
  "title": "String - Career center item title",
  "description": "String - Detailed description",
  "date": "String - YYYY-MM-DD or ISO date",
  "location": "String - Location of event",
  "category": "String - Workshop|Seminar|Job Fair|Internship|Training",
  "contact_person": "String - Contact person name",
  "contact_email": "String - Contact email",
  "registration_link": "String - URL for registration",
  "is_active": "Boolean - true|false",
  "is_featured": "Boolean - true|false",
  "requirements": ["Array of strings - Requirements if any"],
  "benefits": ["Array of strings - Benefits if any"],
  "duration": "String - Duration of event/training",
  "capacity": "Number - Maximum participants"
}
```

**Sample Documents:**

**Workshop Example:**
```javascript
{
  "title": "Career Workshop: Resume Writing for Statisticians",
  "description": "Learn how to craft the perfect CV that highlights your statistical skills and projects effectively. This workshop will cover ATS optimization, technical skill presentation, and industry-specific formatting.",
  "date": "2025-02-15",
  "location": "Main Auditorium, Department of Statistics",
  "category": "Workshop",
  "contact_person": "Dr. Jane Smith",
  "contact_email": "careers@university.edu",
  "registration_link": "https://university.edu/career-workshop-register",
  "is_active": true,
  "is_featured": true,
  "requirements": ["Bring laptop", "Basic statistics knowledge"],
  "benefits": ["Certificate of completion", "One-on-one CV review", "Industry connections"],
  "duration": "3 hours",
  "capacity": 50
}
```

**Job Fair Example:**
```javascript
{
  "title": "Annual Statistics & Data Science Job Fair",
  "description": "Connect with top employers in statistics, data science, and analytics. Meet recruiters from government agencies, tech companies, and research institutions.",
  "date": "2025-03-10",
  "location": "University Conference Center",
  "category": "Job Fair",
  "contact_person": "Career Services Office",
  "contact_email": "jobs@university.edu",
  "registration_link": "https://university.edu/job-fair-register",
  "is_active": true,
  "is_featured": true,
  "requirements": ["Updated resume", "Professional attire", "Student ID"],
  "benefits": ["Direct interviews", "Networking opportunities", "Career guidance"],
  "duration": "Full day (9 AM - 4 PM)",
  "capacity": 200
}
```

### 3. Job Opportunities Collection (`jobOpportunities`)

**Collection Path:** `jobOpportunities`

**Document Structure:**
```javascript
{
  "title": "String - Job title",
  "company": "String - Company name",
  "location": "String - City, Country",
  "job_type": "String - full-time|part-time|contract|internship",
  "experience_level": "String - entry|mid|senior|executive",
  "salary_range": "String - $50,000 - $70,000",
  "description": "String - Job description",
  "requirements": ["Array of strings - Required skills"],
  "benefits": ["Array of strings - Job benefits"],
  "apply_link": "String - Application URL",
  "posted_date": "String - YYYY-MM-DD or ISO date",
  "deadline": "String - YYYY-MM-DD or ISO date",
  "is_active": "Boolean - true|false",
  "is_urgent": "Boolean - true|false",
  "department_preference": ["Array of strings - Preferred departments"],
  "contact_person": "String - Contact person name",
  "contact_email": "String - Contact email"
}
```

**Sample Document:**
```javascript
{
  "title": "Junior Data Scientist",
  "company": "Ghana Statistical Service",
  "location": "Accra, Ghana",
  "job_type": "full-time",
  "experience_level": "entry",
  "salary_range": "$2,500 - $3,500/month",
  "description": "Join our team in conducting national surveys and analyzing complex datasets for government planning. Work with cutting-edge statistical software and contribute to national development through data-driven insights.",
  "requirements": ["Bachelor's degree in Statistics or related field", "Proficiency in R or Python", "Knowledge of survey methodology", "Strong analytical skills"],
  "benefits": ["Health insurance", "Professional development opportunities", "Government pension scheme", "Flexible working hours"],
  "apply_link": "https://ghanastats.gov.gh/careers",
  "posted_date": "2025-01-14",
  "deadline": "2025-02-15",
  "is_active": true,
  "is_urgent": false,
  "department_preference": ["Statistics", "Data Science", "Mathematics", "Computer Science"],
  "contact_person": "HR Manager",
  "contact_email": "careers@ghanastats.gov.gh"
}
```

### 4. Career Tips Collection (`careerTips`)

**Collection Path:** `careerTips`

**Document Structure:**
```javascript
{
  "title": "String - Tip title",
  "description": "String - Detailed tip description",
  "videoUrl": "String - YouTube embed URL (optional)",
  "cvLink": "String - CV building tool link (optional)",
  "category": "String - Interview|CV|Networking|Job Search|Skills",
  "is_active": "Boolean - true|false"
}
```

**Sample Document:**
```javascript
{
  "title": "Crafting the Perfect CV for Statistics Graduates",
  "description": "Learn how to highlight your statistical skills and projects effectively. This comprehensive guide covers ATS optimization, technical skill presentation, and industry-specific formatting that will make your CV stand out to employers in the statistics and data science field.",
  "videoUrl": "https://www.youtube.com/embed/oAckpNuJDds?si=B10L358eJ_qfXOZg",
  "cvLink": "https://app.flowcv.com/resumes",
  "category": "CV",
  "is_active": true
}
```

### 5. Internship Board Collection (`internshipBoard`)

**Collection Path:** `internshipBoard`

**Document Structure:**
```javascript
{
  "title": "String - Internship title",
  "company": "String - Company name",
  "location": "String - City, Country or Remote",
  "description": "String - Internship description",
  "requirements": ["Array of strings - Required skills"],
  "duration": "String - 3 months|6 months|1 year",
  "stipend": "String - $500/month|Unpaid|Competitive",
  "apply_link": "String - Application URL",
  "deadline": "String - YYYY-MM-DD or ISO date",
  "posted_date": "String - YYYY-MM-DD or ISO date",
  "contact_email": "String - Contact email",
  "is_active": "Boolean - true|false",
  "is_featured": "Boolean - true|false",
  "category": "String - Data Science|Research|Analytics|Government"
}
```

**Sample Document:**
```javascript
{
  "title": "Data Analysis Intern",
  "company": "Ghana Health Service",
  "location": "Accra, Ghana",
  "description": "Work on real healthcare data projects, analyze patient outcomes, and contribute to public health research. Gain hands-on experience with statistical software and database management.",
  "requirements": ["Currently pursuing Statistics, Mathematics, or related degree", "Basic knowledge of statistical analysis", "Proficiency in Excel", "Good communication skills"],
  "duration": "6 months",
  "stipend": "$800/month",
  "apply_link": "https://ghanahealth.gov.gh/internships",
  "deadline": "2025-02-28",
  "posted_date": "2025-01-10",
  "contact_email": "internships@ghanahealth.gov.gh",
  "is_active": true,
  "is_featured": true,
  "category": "Data Science"
}
```

### 6. Skill Development Resources Collection (`skillDevelopment`)

**Collection Path:** `skillDevelopment`

**Document Structure:**
```javascript
{
  "title": "String - Course title",
  "platform": "String - Platform name (Coursera, Udemy, etc.)",
  "category": ["Array of strings - Data Science|Python|ML|AI|Web Dev"],
  "description": "String - Course description",
  "link": "String - Course URL",
  "duration": "String - 4 weeks|8 months|15 hours",
  "level": "String - Beginner|Intermediate|Advanced",
  "is_free": "Boolean - true|false",
  "cost": "String - Free|$49/month|$84.99",
  "added_date": "String - YYYY-MM-DD or ISO date",
  "is_active": "Boolean - true|false",
  "featured": "Boolean - true|false"
}
```

**Sample Documents:**

**Featured Course Example:**
```javascript
{
  "title": "Data Science Specialization",
  "platform": "Coursera",
  "category": ["Data Science", "Python", "Machine Learning"],
  "description": "9-course series by Johns Hopkins University covering data science fundamentals, statistical inference, and machine learning techniques.",
  "link": "https://www.coursera.org/specializations/jhu-data-science",
  "duration": "8 months",
  "level": "Intermediate",
  "is_free": false,
  "cost": "$49/month",
  "added_date": "2025-01-10",
  "is_active": true,
  "featured": true
}
```

**Free Course Example:**
```javascript
{
  "title": "Machine Learning Crash Course",
  "platform": "Google",
  "category": ["Machine Learning", "AI", "TensorFlow"],
  "description": "Free course with TensorFlow covering machine learning fundamentals and practical applications.",
  "link": "https://developers.google.com/machine-learning/crash-course",
  "duration": "15 hours",
  "level": "Beginner",
  "is_free": true,
  "cost": "Free",
  "added_date": "2025-01-12",
  "is_active": true,
  "featured": false
}
```

### 7. Resume Building Resources Collection (`resumeBuilding`)

**Collection Path:** `resumeBuilding`

**Document Structure:**
```javascript
{
  "type": "String - video|tool|template",
  "title": "String - Resource title",
  "description": "String - Resource description",
  "url": "String - External URL",
  "category": "String - Guides|Templates|Tools|Videos",
  "duration": "String - Video duration (for videos)",
  "author": "String - Author/Creator name",
  "language": "String - English|Multiple",
  "file_url": "String - Direct file URL (optional)",
  "is_active": "Boolean - true|false"
}
```

**Sample Documents:**

**Video Resource:**
```javascript
{
  "type": "video",
  "title": "Resume Writing for Tech Jobs",
  "description": "Learn what tech recruiters look for in resumes and how to highlight your technical skills effectively.",
  "url": "https://youtube.com/watch?v=abc123",
  "category": "Videos",
  "duration": "15:22",
  "author": "Tech Recruiter Pro",
  "language": "English",
  "file_url": "",
  "is_active": true
}
```

**Template Resource:**
```javascript
{
  "type": "template",
  "title": "ATS-Friendly Resume Template",
  "description": "Professional Word template optimized for Applicant Tracking Systems",
  "url": "",
  "category": "Templates",
  "duration": "",
  "author": "Career Services",
  "language": "English",
  "file_url": "https://firebasestorage.googleapis.com/v0/b/your-app.appspot.com/o/ats-resume-template.docx?alt=media",
  "is_active": true
}
```

## 📋 Implementation Steps

### 1. Create Collections in Firebase Console
1. Go to Firebase Console → Firestore Database
2. Create the following collections:
   - `announcements`
   - `career-center`
   - `jobOpportunities`
   - `careerTips`
   - `internshipBoard`
   - `skillDevelopment`
   - `resumeBuilding`

### 2. Add Sample Data
Use the sample documents provided above as templates for your first entries.

### 3. Test the Integration
1. Restart your React Native app
2. Navigate to Career Center and Announcements screens
3. Verify that data loads from Firestore instead of fallback data

## ⚠️ Important Notes

- **Timestamp Format**: For announcements, use Firestore timestamp objects or ISO date strings
- **Boolean Values**: Use `true`/`false` (not strings)
- **Arrays**: Use proper array format `["item1", "item2"]`
- **Required Fields**: 
  - Announcements: `title`, `content`, `timestamp`
  - Career Center: `title`, `description`, `category`
  - Job Opportunities: `title`, `company`, `description`

## 🔄 Data Management Tips

1. **Regular Updates**: Keep job postings and announcements current
2. **Archive Old Data**: Set `is_active: false` for expired items
3. **Featured Content**: Use `is_featured: true` for important items
4. **Consistent Categories**: Maintain consistent category naming across collections

This structure ensures perfect compatibility with your GASSHUB application's current implementation.