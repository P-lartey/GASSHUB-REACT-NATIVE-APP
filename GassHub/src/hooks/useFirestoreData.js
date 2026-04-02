import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../services/FirebaseConfig';

// Hook for announcements data
export const useAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, 'announcements'),
      orderBy('timestamp', 'desc')
      // Note: Removed where('is_published', '==', true) to avoid composite index requirement
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const announcementsData = [];
        snapshot.forEach((doc) => {
          announcementsData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setAnnouncements(announcementsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching announcements:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { announcements, loading, error };
};

// Hook for career center data
export const useCareerCenterData = () => {
  const [careerItems, setCareerItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, 'career-center'),
      orderBy('date', 'desc')
      // Note: Removed where('is_active', '==', true) to avoid composite index requirement
    );

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const careerData = [];
        snapshot.forEach((doc) => {
          careerData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setCareerItems(careerData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching career center data:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { careerItems, loading, error };
};

// Hook for job opportunities
export const useJobOpportunities = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, 'jobOpportunities'),
      orderBy('posted_date', 'desc')
      // Note: Removed where('is_active', '==', true) to avoid composite index requirement
    );

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const jobsData = [];
        snapshot.forEach((doc) => {
          jobsData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setJobs(jobsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching job opportunities:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { jobs, loading, error };
};

// Hook for internship board
export const useInternships = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, 'internshipBoard'),
      orderBy('posted_date', 'desc')
      // Note: Removed where('is_active', '==', true) to avoid composite index requirement
    );

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const internshipsData = [];
        snapshot.forEach((doc) => {
          internshipsData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setInternships(internshipsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching internships:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { internships, loading, error };
};

// Hook for skill development resources
export const useSkillDevelopment = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, 'skillDevelopment'),
      orderBy('added_date', 'desc')
      // Note: Removed where('is_active', '==', true) to avoid composite index requirement
    );

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const skillsData = [];
        snapshot.forEach((doc) => {
          skillsData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setSkills(skillsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching skill development resources:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { skills, loading, error };
};

// Hook for resume building resources
export const useResumeBuilding = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, 'resumeBuilding')
      // Note: Removed where('is_active', '==', true) to avoid composite index requirement
    );

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const resourcesData = [];
        snapshot.forEach((doc) => {
          resourcesData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setResources(resourcesData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching resume building resources:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { resources, loading, error };
};

// Hook for career tips
export const useCareerTips = () => {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, 'careerTips')
      // Note: Removed where('is_active', '==', true) to avoid composite index requirement
    );

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const tipsData = [];
        snapshot.forEach((doc) => {
          tipsData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setTips(tipsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching career tips:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { tips, loading, error };
};

// Hook for course materials
export const useCourseMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Read from courseMaterials collection (matching admin site)
    const q = query(
      collection(db, 'courseMaterials')
      // Removed orderBy('added_date', 'desc') since your documents don't have this field
      // Note: Removed where('is_active', '==', true) to avoid composite index requirement
      // You can add this back after creating the composite index in Firebase Console
    );

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        console.log('Firestore course materials snapshot:', snapshot.size);
        const materialsData = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          materialsData.push({
            id: doc.id,
            ...data,
            // Ensure storage path is available for Firebase Storage access
            storagePath: data.storagePath || `${data.level}/${data.semester}/${data.courseCode}`
          });
        });
        console.log('Processed course materials:', materialsData);
        setMaterials(materialsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching course materials:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { materials, loading, error };
};