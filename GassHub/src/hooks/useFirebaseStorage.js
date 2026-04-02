import { useState } from 'react';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { storage } from '../services/FirebaseConfig';

export const useFirebaseStorage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCourseMaterialsFromStorage = async (material) => {
    setLoading(true);
    setError(null);
    
    try {
      // Extract folder path from storagePath (remove filename)
      // storagePath format: "100/First Semester/STAT 101/timestamp_filename.pdf"
      let folderPath;
      
      if (material.storagePath) {
        // Remove the last part (filename) to get folder path
        const pathParts = material.storagePath.split('/');
        // Remove filename (last element)
        folderPath = pathParts.slice(0, -1).join('/');
      } else {
        // Fallback to constructing from level/semester/courseCode
        folderPath = `${material.level}/${material.semester}/${material.courseCode}`;
      }
      
      console.log('Accessing Storage folder:', `courseMaterials/${folderPath}`);
      const courseRef = ref(storage, `courseMaterials/${folderPath}`);
      const fileList = await listAll(courseRef);
      
      console.log('Found files in storage:', fileList.items.length);
      
      const files = await Promise.all(
        fileList.items.map(async (item) => {
          const url = await getDownloadURL(item);
          return {
            name: item.name,
            url: url,
            fullPath: item.fullPath,
            type: item.name.split('.').pop()?.toLowerCase() || 'unknown'
          };
        })
      );
      
      setLoading(false);
      return files;
    } catch (err) {
      console.error('Error fetching course materials from storage:', err);
      console.error('Failed material:', material);
      setError(err);
      setLoading(false);
      return [];
    }
  };

  const getAllCourseMaterials = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const rootRef = ref(storage, 'courseMaterials');
      const courseFolders = await listAll(rootRef);
      
      const allMaterials = {};
      
      for (const folder of courseFolders.prefixes) {
        const courseId = folder.name;
        const files = await getCourseMaterialsFromStorage(courseId);
        if (files.length > 0) {
          allMaterials[courseId] = files;
        }
      }
      
      setLoading(false);
      return allMaterials;
    } catch (err) {
      console.error('Error fetching all course materials:', err);
      setError(err);
      setLoading(false);
      return {};
    }
  };

  return {
    getCourseMaterialsFromStorage,
    getAllCourseMaterials,
    loading,
    error
  };
};