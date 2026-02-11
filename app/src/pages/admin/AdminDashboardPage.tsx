import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  School as SchoolIcon,
  Users,
  Building2,
  ScrollText,
  LogOut,
  Plus,
  Trash2,
  Edit,
  X,
  ChevronLeft,
} from 'lucide-react';
import {
  fetchSchools,
  createSchool,
  deleteSchool,
  fetchOrganizations,
  createOrganization,
  updateOrganizationCredentials,
  deleteOrganization,
  logActivity,
  fetchActivityLogs,
  type School,
  type Organization,
  type ActivityLog,
} from '@/lib/admin-api';

const ADMIN_SESSION_KEY = 'clubspace_admin_session';

interface AdminSession {
  id: string;
  email: string;
  organizationName: string;
  isAdmin: boolean;
}

type Tab = 'schools' | 'organizations' | 'users' | 'logs';

// Helper to generate slug from school name
function generateSlug(name: string): string {
  const skipWords = ['of', 'the', 'and', 'a', 'an', 'in', 'on', 'at', 'to', 'for'];
  return name
    .split(/\s+/)
    .filter(word => !skipWords.includes(word.toLowerCase()))
    .map(word => word.charAt(0).toLowerCase())
    .join('');
}

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<AdminSession | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('schools');

  // Data states
  const [schools, setSchools] = useState<School[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [logsOffset, setLogsOffset] = useState(0);
  const [hasMoreLogs, setHasMoreLogs] = useState(true);

  // Modal states
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [showEditOrgModal, setShowEditOrgModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

  // Form states
  const [schoolForm, setSchoolForm] = useState({ name: '', location: '', slug: '', color: '#FF6B35' });
  const [orgForm, setOrgForm] = useState({ username: '', password: '', confirmPassword: '', orgName: '', schoolId: '' });
  const [editOrgForm, setEditOrgForm] = useState({ username: '', password: '', confirmPassword: '' });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check auth on mount
  useEffect(() => {
    const session = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!session) {
      navigate('/admin');
      return;
    }
    try {
      const parsed = JSON.parse(session) as AdminSession;
      if (!parsed.isAdmin) {
        navigate('/admin');
        return;
      }
      setAdmin(parsed);
    } catch {
      navigate('/admin');
    }
  }, [navigate]);

  // Load data
  const loadSchools = useCallback(async () => {
    const result = await fetchSchools();
    if (result.data) setSchools(result.data);
  }, []);

  const loadOrganizations = useCallback(async () => {
    const result = await fetchOrganizations();
    if (result.data) setOrganizations(result.data);
  }, []);

  const loadLogs = useCallback(async (reset = false) => {
    const offset = reset ? 0 : logsOffset;
    const result = await fetchActivityLogs(50, offset);
    if (result.data) {
      if (reset) {
        setLogs(result.data);
        setLogsOffset(50);
      } else {
        setLogs(prev => [...prev, ...result.data!]);
        setLogsOffset(prev => prev + 50);
      }
      setHasMoreLogs(result.data.length === 50);
    }
  }, [logsOffset]);

  useEffect(() => {
    if (admin) {
      loadSchools();
      loadOrganizations();
      loadLogs(true);
    }
  }, [admin, loadSchools, loadOrganizations]);

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    navigate('/admin');
  };

  // School handlers
  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await createSchool(
      schoolForm.name,
      schoolForm.location,
      schoolForm.slug || undefined,
      schoolForm.color
    );

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // Log activity
    if (admin && result.data) {
      await logActivity(
        'school_created',
        admin.id,
        admin.organizationName,
        'school',
        result.data.id,
        result.data.name,
        { location: result.data.location, slug: result.data.slug }
      );
    }

    setLoading(false);
    setShowSchoolModal(false);
    setSchoolForm({ name: '', location: '', slug: '', color: '#FF6B35' });
    loadSchools();
    loadLogs(true);
  };

  const handleDeleteSchool = async (school: School) => {
    if (!confirm(`Delete "${school.name}"? This cannot be undone.`)) return;

    const result = await deleteSchool(school.id);
    if (result.error) {
      alert(result.error);
      return;
    }

    if (admin) {
      await logActivity(
        'school_deleted',
        admin.id,
        admin.organizationName,
        'school',
        school.id,
        school.name
      );
    }

    loadSchools();
    loadLogs(true);
  };

  // Organization handlers
  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (orgForm.password !== orgForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (orgForm.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!orgForm.schoolId) {
      setError('Please select a school');
      return;
    }

    setLoading(true);

    const result = await createOrganization(
      orgForm.username,
      orgForm.password,
      orgForm.orgName,
      orgForm.schoolId
    );

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (admin && result.data) {
      const school = schools.find(s => s.id === orgForm.schoolId);
      await logActivity(
        'org_created',
        admin.id,
        admin.organizationName,
        'organization',
        result.data.id,
        result.data.organization_name,
        { username: orgForm.username, school: school?.name }
      );
    }

    setLoading(false);
    setShowOrgModal(false);
    setOrgForm({ username: '', password: '', confirmPassword: '', orgName: '', schoolId: '' });
    loadOrganizations();
    loadLogs(true);
  };

  const handleEditOrg = (org: Organization) => {
    setEditingOrg(org);
    setEditOrgForm({ username: org.email, password: '', confirmPassword: '' });
    setShowEditOrgModal(true);
  };

  const handleUpdateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrg) return;
    setError('');

    if (editOrgForm.password && editOrgForm.password !== editOrgForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (editOrgForm.password && editOrgForm.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await updateOrganizationCredentials(
      editingOrg.id,
      editOrgForm.username !== editingOrg.email ? editOrgForm.username : undefined,
      editOrgForm.password || undefined
    );

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (admin) {
      await logActivity(
        'org_credentials_updated',
        admin.id,
        admin.organizationName,
        'organization',
        editingOrg.id,
        editingOrg.organization_name,
        { 
          usernameChanged: editOrgForm.username !== editingOrg.email,
          passwordChanged: !!editOrgForm.password 
        }
      );
    }

    setLoading(false);
    setShowEditOrgModal(false);
    setEditingOrg(null);
    loadOrganizations();
    loadLogs(true);
  };

  const handleDeleteOrg = async (org: Organization) => {
    if (!confirm(`Delete "${org.organization_name}"? This cannot be undone.`)) return;

    const result = await deleteOrganization(org.id);
    if (result.error) {
      alert(result.error);
      return;
    }

    if (admin) {
      await logActivity(
        'org_deleted',
        admin.id,
        admin.organizationName,
        'organization',
        org.id,
        org.organization_name
      );
    }

    loadOrganizations();
    loadLogs(true);
  };

  // Format action for display
  const formatAction = (action: string): string => {
    const actions: Record<string, string> = {
      school_created: 'Created school',
      school_deleted: 'Deleted school',
      org_created: 'Created organization',
      org_deleted: 'Deleted organization',
      org_credentials_updated: 'Updated credentials',
      password_changed: 'Changed password',
      logo_updated: 'Updated logo',
      event_created: 'Created event',
      event_deleted: 'Deleted event',
    };
    return actions[action] || action;
  };

  const getActionColor = (action: string): string => {
    if (action.includes('created')) return 'bg-green-100 text-green-700';
    if (action.includes('deleted')) return 'bg-red-100 text-red-700';
    if (action.includes('updated') || action.includes('changed')) return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  if (!admin) {
    return null;
  }

  const tabs: { id: Tab; label: string; icon: typeof SchoolIcon }[] = [
    { id: 'schools', label: 'Schools', icon: SchoolIcon },
    { id: 'organizations', label: 'Organizations', icon: Building2 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'logs', label: 'Logs', icon: ScrollText },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="w-9 h-9 rounded-xl bg-[#FF6B35] flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-[#111]">ClubSpace Admin</h1>
              <p className="text-xs text-gray-500">Logged in as {admin.organizationName}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#FF6B35] text-[#FF6B35]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Schools Tab */}
        {activeTab === 'schools' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Schools</h2>
              <button
                onClick={() => setShowSchoolModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#e55a2b] transition-colors"
              >
                <Plus size={16} />
                Add School
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">School</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Slug</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Location</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {schools.map(school => (
                    <tr key={school.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                            style={{ backgroundColor: school.color || '#FF6B35' }}
                          >
                            {school.slug.toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{school.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">/{school.slug}</td>
                      <td className="px-4 py-3 text-gray-600">{school.location}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteSchool(school)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {schools.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                        No schools yet. Add your first school to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Organizations Tab */}
        {activeTab === 'organizations' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Organizations</h2>
              <button
                onClick={() => setShowOrgModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#e55a2b] transition-colors"
              >
                <Plus size={16} />
                Create Organization
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Organization</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Username</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">School</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {organizations.map(org => (
                    <tr key={org.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {org.logo_url ? (
                            <img src={org.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                              <Building2 size={18} className="text-gray-400" />
                            </div>
                          )}
                          <span className="font-medium text-gray-900">{org.organization_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{org.email}</td>
                      <td className="px-4 py-3 text-gray-600">{org.school?.name || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleEditOrg(org)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors mr-1"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteOrg(org)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {organizations.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                        No organizations yet. Create one to let student orgs post events.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Registered Organizations</h2>
            <p className="text-gray-600 mb-4">Total: {organizations.length} organization(s)</p>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Organization</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">School</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {organizations.map(org => (
                    <tr key={org.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {org.logo_url ? (
                            <img src={org.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                              <Building2 size={18} className="text-gray-400" />
                            </div>
                          )}
                          <span className="font-medium text-gray-900">{org.organization_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{org.school?.name || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-sm">
                        {new Date(org.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity Logs</h2>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Time</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Action</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Actor</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getActionColor(log.action)}`}>
                          {formatAction(log.action)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{log.actor_name}</td>
                      <td className="px-4 py-3 text-gray-600">{log.target_name}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                        No activity logs yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {hasMoreLogs && logs.length > 0 && (
                <div className="p-4 border-t border-gray-100 text-center">
                  <button
                    onClick={() => loadLogs(false)}
                    className="text-[#FF6B35] font-medium hover:underline"
                  >
                    Load More
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Add School Modal */}
      {showSchoolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowSchoolModal(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowSchoolModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
            >
              <X size={16} />
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-4">Add School</h2>

            <form onSubmit={handleCreateSchool} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School Name *</label>
                <input
                  type="text"
                  value={schoolForm.name}
                  onChange={e => {
                    setSchoolForm(prev => ({
                      ...prev,
                      name: e.target.value,
                      slug: generateSlug(e.target.value),
                    }));
                  }}
                  placeholder="e.g. University of Houston"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                <input
                  type="text"
                  value={schoolForm.location}
                  onChange={e => setSchoolForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g. Houston, TX"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (auto-generated)</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">clubspace.me/</span>
                  <input
                    type="text"
                    value={schoolForm.slug}
                    onChange={e => setSchoolForm(prev => ({ ...prev, slug: e.target.value.toLowerCase() }))}
                    placeholder="uh"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={schoolForm.color}
                    onChange={e => setSchoolForm(prev => ({ ...prev, color: e.target.value }))}
                    className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer"
                  />
                  <span className="text-gray-600">{schoolForm.color}</span>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#FF6B35] text-white font-semibold hover:bg-[#e55a2b] disabled:opacity-50 transition-colors"
              >
                {loading ? 'Creating...' : 'Create School'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Organization Modal */}
      {showOrgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowOrgModal(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowOrgModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
            >
              <X size={16} />
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-4">Create Organization</h2>

            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name *</label>
                <input
                  type="text"
                  value={orgForm.orgName}
                  onChange={e => setOrgForm(prev => ({ ...prev, orgName: e.target.value }))}
                  placeholder="e.g. Computer Science Club"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                <input
                  type="text"
                  value={orgForm.username}
                  onChange={e => setOrgForm(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="e.g. csclub"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  value={orgForm.password}
                  onChange={e => setOrgForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                <input
                  type="password"
                  value={orgForm.confirmPassword}
                  onChange={e => setOrgForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm password"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School *</label>
                <select
                  value={orgForm.schoolId}
                  onChange={e => setOrgForm(prev => ({ ...prev, schoolId: e.target.value }))}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 outline-none"
                >
                  <option value="">Select a school</option>
                  {schools.map(school => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
                </select>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#FF6B35] text-white font-semibold hover:bg-[#e55a2b] disabled:opacity-50 transition-colors"
              >
                {loading ? 'Creating...' : 'Create Organization'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Organization Modal */}
      {showEditOrgModal && editingOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowEditOrgModal(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowEditOrgModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
            >
              <X size={16} />
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-1">Edit Credentials</h2>
            <p className="text-sm text-gray-500 mb-4">{editingOrg.organization_name}</p>

            <form onSubmit={handleUpdateOrg} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={editOrgForm.username}
                  onChange={e => setEditOrgForm(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password (leave blank to keep current)</label>
                <input
                  type="password"
                  value={editOrgForm.password}
                  onChange={e => setEditOrgForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter new password"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={editOrgForm.confirmPassword}
                  onChange={e => setEditOrgForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 outline-none"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#FF6B35] text-white font-semibold hover:bg-[#e55a2b] disabled:opacity-50 transition-colors"
              >
                {loading ? 'Updating...' : 'Update Credentials'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
