import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import { LucideIcon } from '../../components/common/LucideIcon.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { ConfirmModal } from '../../components/common/ConfirmModal.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export const AdminHistoryPage = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline', 'versions', 'changes'

  // Activity Log
  const [activityLogs, setActivityLogs] = useState([]);
  const [activityPage, setActivityPage] = useState(1);
  const [totalActivityPages, setTotalActivityPages] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [loadingActivity, setLoadingActivity] = useState(false);

  // Versions / Snapshots
  const [snapshots, setSnapshots] = useState([]);
  const [loadingSnapshots, setLoadingSnapshots] = useState(false);
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);
  const [snapshotModalOpen, setSnapshotModalOpen] = useState(false);
  const [snapshotToRestore, setSnapshotToRestore] = useState(null);
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);

  // Book Detail Revisions
  const [bookRevisions, setBookRevisions] = useState([]);
  const [loadingRevisions, setLoadingRevisions] = useState(false);

  const toast = useToast();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await api.get(`/books/${id}`);
        if (res.data?.success) {
          setBook(res.data.data.book);
        }
      } catch (err) {
        toast.error('पुस्तकाची माहिती मिळवता आली नाही.');
      }
    };
    fetchBook();
  }, [id]);

  // Fetch Activity
  const fetchActivity = async (page = 1, append = false) => {
    try {
      setLoadingActivity(true);
      const query = new URLSearchParams({ page, limit: 15 });
      if (actionFilter) query.append('action', actionFilter);

      const res = await api.get(`/books/${id}/activity?${query.toString()}`);
      if (res.data?.success) {
        setTotalActivityPages(res.data.data.pages);
        setActivityPage(page);
        if (append) {
          setActivityLogs((prev) => [...prev, ...res.data.data.logs]);
        } else {
          setActivityLogs(res.data.data.logs);
        }
      }
    } catch (err) {
      toast.error('टाइमलाइन लोड करता आली नाही.');
    } finally {
      setLoadingActivity(false);
    }
  };

  // Fetch Snapshots
  const fetchSnapshots = async () => {
    try {
      setLoadingSnapshots(true);
      const res = await api.get(`/books/${id}/snapshots`);
      if (res.data?.success) {
        setSnapshots(res.data.data);
      }
    } catch (err) {
      toast.error('स्नॅपशॉट आवृत्त्या लोड करता आल्या नाहीत.');
    } finally {
      setLoadingSnapshots(false);
    }
  };

  // Fetch Book Revisions
  const fetchBookRevisions = async () => {
    try {
      setLoadingRevisions(true);
      const res = await api.get(`/books/${id}/revisions`);
      if (res.data?.success) {
        setBookRevisions(res.data.data);
      }
    } catch (err) {
      toast.error('पुस्तकाचे बदल लोड करता आले नाहीत.');
    } finally {
      setLoadingRevisions(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'timeline') {
      fetchActivity(1, false);
    } else if (activeTab === 'versions') {
      fetchSnapshots();
    } else if (activeTab === 'changes') {
      fetchBookRevisions();
    }
  }, [activeTab, actionFilter]);

  const viewSnapshotDetail = async (snapId) => {
    try {
      const res = await api.get(`/books/${id}/snapshots/${snapId}`);
      if (res.data?.success) {
        setSelectedSnapshot(res.data.data);
        setSnapshotModalOpen(true);
      }
    } catch (err) {
      toast.error('स्नॅपशॉट तपशील पाहता आला नाही.');
    }
  };

  const handleExportSnapshot = (snapId, format) => {
    const url = `${api.defaults.baseURL}/books/${id}/snapshots/${snapId}/export?format=${format}`;
    window.open(url, '_blank');
  };

  const confirmRestoreSnapshot = async () => {
    if (!snapshotToRestore) return;
    try {
      await api.post(`/books/${id}/snapshots/${snapshotToRestore._id}/restore`);
      toast.success('स्नॅपशॉट यशस्वीरीत्या पूर्ववत (Restore) करण्यात आला!');
      fetchSnapshots();
    } catch (err) {
      toast.error('स्नॅपशॉट रिस्टोअर करता आला नाही.');
    }
  };

  // Helper for action type icon
  const getActionIcon = (action) => {
    switch (action) {
      case 'book_created':
      case 'chapter_created':
        return 'Plus';
      case 'book_updated':
      case 'chapter_updated':
        return 'Pencil';
      case 'book_published':
        return 'Eye';
      case 'book_unpublished':
        return 'EyeOff';
      case 'book_trashed':
      case 'chapter_trashed':
        return 'Trash2';
      case 'book_restored':
      case 'chapter_restored':
        return 'ArchiveRestore';
      case 'chapters_reordered':
        return 'GripVertical';
      case 'chapters_imported':
        return 'Upload';
      case 'snapshot_created':
        return 'Save';
      case 'snapshot_restored':
      case 'revision_restored':
        return 'RotateCcw';
      default:
        return 'History';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Breadcrumb */}
      <div className="mb-6">
        <Link
          to={`/admin/books/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-theme-muted hover:text-theme-text transition-colors"
        >
          <LucideIcon name="ArrowLeft" size={14} />
          <span>{book?.title || 'पुस्तकाकडे परत जा'}</span>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-text flex items-center gap-2.5">
          <LucideIcon name="History" size={28} className="text-theme-accent" />
          <span>इतिहास व आवृत्ती नियंत्रण (Book History)</span>
        </h1>
        <p className="text-xs sm:text-sm text-theme-muted mt-1">
          {book?.title} साठी संपूर्ण टाइमलाइन, स्नॅपशॉट आवृत्त्या आणि बदलांची नोंद.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-theme-border mb-6">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-5 py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'timeline'
              ? 'border-theme-accent text-theme-accent font-bold'
              : 'border-transparent text-theme-muted hover:text-theme-text'
          }`}
        >
          <LucideIcon name="FileText" size={16} />
          <span>टाइमलाइन (Timeline)</span>
        </button>

        <button
          onClick={() => setActiveTab('versions')}
          className={`px-5 py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'versions'
              ? 'border-theme-accent text-theme-accent font-bold'
              : 'border-transparent text-theme-muted hover:text-theme-text'
          }`}
        >
          <LucideIcon name="Save" size={16} />
          <span>आवृत्त्या (Versions / Snapshots)</span>
        </button>

        <button
          onClick={() => setActiveTab('changes')}
          className={`px-5 py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'changes'
              ? 'border-theme-accent text-theme-accent font-bold'
              : 'border-transparent text-theme-muted hover:text-theme-text'
          }`}
        >
          <LucideIcon name="GitCompare" size={16} />
          <span>माहिती बदल (Changes)</span>
        </button>
      </div>

      {/* TAB 1: TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          {/* Action Filter */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-theme-muted">
              फिल्टर:
            </span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-theme-border bg-theme-card text-theme-text text-xs focus:outline-none focus:ring-2 focus:ring-theme-accent"
            >
              <option value="">सर्व कृती (All Actions)</option>
              <option value="book_created">पुस्तक तयार केले</option>
              <option value="book_updated">पुस्तक अपडेट</option>
              <option value="chapter_created">नवीन अध्याय</option>
              <option value="chapter_updated">अध्याय अपडेट</option>
              <option value="snapshot_created">स्नॅपशॉट साठवला</option>
              <option value="snapshot_restored">स्नॅपशॉट रिस्टोअर</option>
              <option value="chapters_imported">आयात केले</option>
            </select>
          </div>

          {loadingActivity && activityLogs.length === 0 ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" count={4} />
            </div>
          ) : activityLogs.length === 0 ? (
            <EmptyState
              icon="History"
              title="कोणतीही नोंद आढळली नाही"
              description="निवडलेल्या फिल्टरनुसार कोणताही क्रियाकलाप सापडला नाही."
            />
          ) : (
            <div className="relative pl-6 border-l-2 border-theme-border space-y-6 my-4">
              {activityLogs.map((log) => {
                const iconName = getActionIcon(log.action);
                return (
                  <div key={log._id} className="relative group">
                    {/* Circle Node Icon */}
                    <div className="absolute -left-[35px] top-1.5 w-6 h-6 rounded-full bg-theme-card border-2 border-theme-accent flex items-center justify-center text-theme-accent shadow-sm">
                      <LucideIcon name={iconName} size={12} />
                    </div>

                    <div className="p-4 rounded-xl border border-theme-border bg-theme-card hover:border-theme-accent/40 shadow-sm transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <span className="font-semibold text-sm text-theme-text">{log.summary}</span>
                        <span className="text-[11px] font-mono text-theme-muted">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-theme-bg text-theme-muted">
                        {log.action}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Load More Button */}
          {activityPage < totalActivityPages && (
            <div className="text-center pt-4">
              <button
                onClick={() => fetchActivity(activityPage + 1, true)}
                disabled={loadingActivity}
                className="px-5 py-2.5 rounded-xl border border-theme-border bg-theme-card hover:bg-theme-bg text-xs font-semibold text-theme-text transition-colors"
              >
                {loadingActivity ? 'अधिक लोड होत आहे...' : 'आणखी कृती दाखवा (Load More)'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: VERSIONS / SNAPSHOTS */}
      {activeTab === 'versions' && (
        <div className="space-y-4">
          <p className="text-xs text-theme-muted leading-relaxed">
            प्रत्येक स्नॅपशॉटमध्ये त्यावेळची पुस्तकाची संपूर्ण रचना, माहिती आणि सर्व अध्याय सुरक्षित साठवले जातात.
          </p>

          {loadingSnapshots ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" count={3} />
            </div>
          ) : snapshots.length === 0 ? (
            <EmptyState
              icon="Save"
              title="कोणताही स्नॅपशॉट साठवलेला नाही"
              description="पुस्तकाचे रूप जतन करण्यासाठी वर 'आवृत्ती साठवा' बटनाचा वापर करा."
            />
          ) : (
            <div className="space-y-3">
              {snapshots.map((snap) => (
                <div
                  key={snap._id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-theme-border bg-theme-card shadow-sm gap-4"
                >
                  <div>
                    <h3 className="font-bold text-sm text-theme-text flex items-center gap-2">
                      <LucideIcon name="Save" size={16} className="text-theme-accent" />
                      <span>{snap.label || 'Snapshot'}</span>
                    </h3>
                    <p className="text-xs text-theme-muted mt-1">
                      {new Date(snap.savedAt).toLocaleString()} • {snap.chapterCount} अध्याय
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => viewSnapshotDetail(snap._id)}
                      className="px-3 py-1.5 rounded-lg border border-theme-border bg-theme-bg hover:bg-theme-card text-xs font-semibold text-theme-text transition-colors flex items-center gap-1"
                    >
                      <LucideIcon name="Eye" size={13} />
                      <span>पहा</span>
                    </button>

                    <button
                      onClick={() => handleExportSnapshot(snap._id, 'json')}
                      className="p-1.5 rounded-lg border border-theme-border text-theme-muted hover:text-theme-text"
                      title="JSON डाऊनलोड करा"
                      aria-label="Export Snapshot JSON"
                    >
                      <LucideIcon name="Download" size={14} />
                    </button>

                    <button
                      onClick={() => handleExportSnapshot(snap._id, 'md')}
                      className="p-1.5 rounded-lg border border-theme-border text-theme-muted hover:text-theme-text"
                      title="Markdown डाऊनलोड करा"
                      aria-label="Export Snapshot Markdown"
                    >
                      <LucideIcon name="FileText" size={14} />
                    </button>

                    <button
                      onClick={() => {
                        setSnapshotToRestore(snap);
                        setRestoreConfirmOpen(true);
                      }}
                      className="px-3 py-1.5 bg-theme-accent hover:bg-theme-accentHover text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm"
                    >
                      <LucideIcon name="RotateCcw" size={13} />
                      <span>पुनर्संचयित (Restore)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BOOK REVISIONS (CHANGES) */}
      {activeTab === 'changes' && (
        <div className="space-y-4">
          <p className="text-xs text-theme-muted leading-relaxed">
            पुस्तकाचे शीर्षक, कव्हर रंग, आयकॉन किंवा स्थिती बदलल्यावर जतन झालेल्या ऐतिहासिक नोंदी:
          </p>

          {loadingRevisions ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" count={3} />
            </div>
          ) : bookRevisions.length === 0 ? (
            <EmptyState
              icon="GitCompare"
              title="कोणतेही बदल नोंदवलेले नाहीत"
              description="पुस्तकाच्या माहितीमध्ये बदल केल्यानंतर येथे इतिहास दिसेल."
            />
          ) : (
            <div className="space-y-3">
              {bookRevisions.map((rev, index) => (
                <div
                  key={rev._id}
                  className="p-4 rounded-xl border border-theme-border bg-theme-card shadow-sm text-xs"
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-theme-border">
                    <span className="font-bold text-sm text-theme-text">{rev.title}</span>
                    <span className="font-mono text-theme-muted">
                      {new Date(rev.savedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-theme-muted">
                    <div>
                      <span className="block font-semibold">लेखक:</span>
                      <span>{rev.author || '—'}</span>
                    </div>
                    <div>
                      <span className="block font-semibold">स्थिती:</span>
                      <span>{rev.status}</span>
                    </div>
                    <div>
                      <span className="block font-semibold">आयकॉन:</span>
                      <span>{rev.coverIcon}</span>
                    </div>
                    <div>
                      <span className="block font-semibold">रंग:</span>
                      <span
                        className="inline-block w-4 h-4 rounded-full align-middle ml-1 border"
                        style={{ backgroundColor: rev.coverColor }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Snapshot Detail View Modal */}
      <Modal
        isOpen={snapshotModalOpen}
        onClose={() => setSnapshotModalOpen(false)}
        title={selectedSnapshot ? `स्नॅपशॉट: ${selectedSnapshot.label}` : 'स्नॅपशॉट तपशील'}
        maxWidth="max-w-2xl"
      >
        {selectedSnapshot && (
          <div className="space-y-4 text-xs">
            <div>
              <span className="font-semibold block text-theme-muted uppercase">तारीख:</span>
              <span className="text-sm font-medium">{new Date(selectedSnapshot.savedAt).toLocaleString()}</span>
            </div>
            <div>
              <span className="font-semibold block text-theme-muted uppercase">पुस्तकाचे नाव:</span>
              <span className="text-sm font-bold">{selectedSnapshot.bookData?.title}</span>
            </div>
            <div>
              <span className="font-semibold block text-theme-muted uppercase mb-1">
                समाविष्ट अध्याय ({selectedSnapshot.chapters?.length || 0}):
              </span>
              <div className="divide-y divide-theme-border border rounded-lg max-h-48 overflow-y-auto">
                {selectedSnapshot.chapters?.map((ch, idx) => (
                  <div key={idx} className="p-2 flex justify-between">
                    <span>
                      {idx + 1}. {ch.title}
                    </span>
                    <span className="font-mono text-theme-muted">{ch.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Restore Snapshot Confirm Modal */}
      <ConfirmModal
        isOpen={restoreConfirmOpen}
        onClose={() => setRestoreConfirmOpen(false)}
        onConfirm={confirmRestoreSnapshot}
        title="पुस्तकाचा स्नॅपशॉट पूर्ववत (Restore) करायचा?"
        message={`तुम्हाला खात्री आहे की "${snapshotToRestore?.label}" ही आवृत्ती रिस्टोअर करायची आहे? सुरक्षेसाठी सध्याच्या पुस्तकाचा स्वयंचलित स्नॅपशॉट प्रथम घेतला जाईल आणि त्यानंतर ही आवृत्ती सक्रिय होईल.`}
        confirmText="होय, रिस्टोअर करा"
      />
    </div>
  );
};
