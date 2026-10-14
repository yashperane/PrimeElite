import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/common/Navbar.jsx';
import { Footer } from './components/common/Footer.jsx';
import { ReaderSettingsModal } from './components/reader/ReaderSettingsModal.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';

// Reader Pages
import { HomePage } from './pages/reader/HomePage.jsx';
import { BookDetailPage } from './pages/reader/BookDetailPage.jsx';
import { ChapterReaderPage } from './pages/reader/ChapterReaderPage.jsx';
import { SearchPage } from './pages/reader/SearchPage.jsx';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage.jsx';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.jsx';
import { AdminBookManagerPage } from './pages/admin/AdminBookManagerPage.jsx';
import { AdminChapterEditorPage } from './pages/admin/AdminChapterEditorPage.jsx';
import { AdminHistoryPage } from './pages/admin/AdminHistoryPage.jsx';
import { AdminTrashPage } from './pages/admin/AdminTrashPage.jsx';

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-theme-bg text-theme-text transition-colors">
      <Navbar onOpenSettings={() => setSettingsOpen(true)} />

      <main className="flex-1">
        <Routes>
          {/* Reader Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/book/:slug" element={<BookDetailPage />} />
          <Route path="/book/:bookSlug/chapter/:chapterSlug" element={<ChapterReaderPage />} />
          <Route path="/search" element={<SearchPage />} />

          {/* Admin Auth Route */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/books/:id"
            element={
              <ProtectedRoute>
                <AdminBookManagerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/books/:bookId/chapters/new"
            element={
              <ProtectedRoute>
                <AdminChapterEditorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/chapters/:id/edit"
            element={
              <ProtectedRoute>
                <AdminChapterEditorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/books/:id/history"
            element={
              <ProtectedRoute>
                <AdminHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/trash"
            element={
              <ProtectedRoute>
                <AdminTrashPage />
              </ProtectedRoute>
            }
          />

          {/* 404 Fallback */}
          <Route
            path="*"
            element={
              <div className="max-w-md mx-auto py-24 text-center px-4">
                <h1 className="text-4xl font-extrabold mb-3">४०४</h1>
                <p className="text-theme-muted mb-6">मागणी केलेले पृष्ठ अस्तित्वात नाही.</p>
                <a
                  href="/"
                  className="px-5 py-2.5 bg-theme-accent text-white rounded-xl text-sm font-semibold"
                >
                  मुख्यपृष्ठावर परत जा
                </a>
              </div>
            }
          />
        </Routes>
      </main>

      <Footer />

      {/* Global Reader Settings Modal */}
      <ReaderSettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
