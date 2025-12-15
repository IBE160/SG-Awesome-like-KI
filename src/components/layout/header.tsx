'use client'; // Ensure it's a client component, which it is via LayoutWrapper

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface HeaderProps {
  pathname: string;
}

export function Header({ pathname }: HeaderProps) {
  const [pageTitle, setPageTitle] = useState('');

  useEffect(() => {
    const getDynamicPageTitle = async () => {
      let title = '';
      const pathSegments = pathname.split('/').filter(segment => segment !== '');

      if (pathname === '/') {
        title = 'DASHBOARD';
      } else if (pathSegments[0] === 'classes' && pathSegments[1]) {
        // This is a class details page
        const classId = pathSegments[1];
        // Fetch class name from API
        try {
          const response = await fetch(`/api/classes/${classId}`);
          if (response.ok) {
            const data = await response.json();
            title = data.name.toUpperCase(); // Assuming API returns { name: "ClassName" }
          } else {
            title = classId.toUpperCase(); // Fallback to ID if fetch fails
          }
        } catch (error) {
          console.error('Failed to fetch class name:', error);
          title = classId.toUpperCase(); // Fallback
        }
      } else if (pathSegments[0] === 'sections' && pathSegments[1]) {
        // This is a section details page
        const sectionId = pathSegments[1];
        // Fetch section name from API
        try {
          const response = await fetch(`/api/sections/${sectionId}`);
          if (response.ok) {
            const data = await response.json();
            title = data.section.name.toUpperCase(); // Assuming API returns { section: { name: "SectionName" } }
          } else {
            title = sectionId.toUpperCase(); // Fallback to ID if fetch fails
          }
        } catch (error) {
          console.error('Failed to fetch section name:', error);
          title = sectionId.toUpperCase(); // Fallback
        }
      } else if (pathSegments[0] === 'summary-view' && pathSegments[1]) { // Corrected summary view route
        const summaryId = pathSegments[1];
        try {
          const summaryResponse = await fetch(`/api/summaries/${summaryId}`);
          if (summaryResponse.ok) {
            const summaryData = await summaryResponse.json();
            const studyMaterialId = summaryData.study_material_id;
            const studyMaterialResponse = await fetch(`/api/study-materials/${studyMaterialId}`);
            if (studyMaterialResponse.ok) {
              const studyMaterialData = await studyMaterialResponse.json();
              title = studyMaterialData.name.toUpperCase();
            } else {
              console.error(`Failed to fetch study material name for ID: ${studyMaterialId}`);
              title = `SUMMARY: ${studyMaterialId.toUpperCase()}`; // Fallback to ID
            }
          } else {
            console.error(`Failed to fetch summary data for ID: ${summaryId}`);
            title = `SUMMARY: ${summaryId.toUpperCase()}`; // Fallback to ID
          }
        } catch (error) {
          console.error('Error fetching summary document name:', error);
          title = `SUMMARY: ${summaryId.toUpperCase()}`; // Fallback
        }
      } else if (pathSegments[0] === 'quiz-take' && pathSegments[1]) {
        const quizId = pathSegments[1];
        try {
          const quizResponse = await fetch(`/api/quizzes/${quizId}`);
          if (quizResponse.ok) {
            const quizData = await quizResponse.json();
            const studyMaterialId = quizData.study_material_id;
            const studyMaterialResponse = await fetch(`/api/study-materials/${studyMaterialId}`);
            if (studyMaterialResponse.ok) {
              const studyMaterialData = await studyMaterialResponse.json();
              title = studyMaterialData.name.toUpperCase();
            } else {
              console.error(`Failed to fetch study material name for ID: ${studyMaterialId}`);
              title = `QUIZ: ${studyMaterialId.toUpperCase()}`; // Fallback to ID
            }
          } else {
            console.error(`Failed to fetch quiz data for ID: ${quizId}`);
            title = `QUIZ: ${quizId.toUpperCase()}`; // Fallback to ID
          }
        } catch (error) {
          console.error('Error fetching quiz document name:', error);
          title = `QUIZ: ${quizId.toUpperCase()}`; // Fallback
        }
      } else if (pathSegments.length > 0) {
        // For other pages, use the last segment as title
        title = pathSegments[pathSegments.length - 1].toUpperCase();
      }


      setPageTitle(title);
    };

    getDynamicPageTitle();
  }, [pathname]); // Re-run effect when pathname changes

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white px-4 py-3 flex items-center shadow-sm h-16">
      <div className="flex-none">
        <Link href="/" className="text-xl font-bold text-gray-800">
          AI Study Buddy
        </Link>
      </div>

      {/* Right section for the page title, centered within its available space */}
      <div className="flex-1 flex justify-center items-center">
        {pageTitle && <h1 className="text-xl font-bold">{pageTitle}</h1>}
      </div>

      <nav className="flex-none">
      </nav>
    </header>
  );
}
