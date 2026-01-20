/**
 * EHS People Management Page
 * 
 * Manage EHS users with role and location assignments.
 * Features:
 * - User table with name, email, role badge, location breadcrumb, and status
 * - Search and filter by role/status
 * - Add User modal
 * - Edit/Deactivate actions
 * - Tabbed interface with Custom Roles management
 */

"use client";

import React, { useState } from "react";
import Sidebar from "../../../src/components/Sidebar";
import CreateUserModal from "../../../src/components/CreateUserModal";
import CreateRoleModal from "../../../src/components/CreateRoleModal";
import RoleBuilderMatrix from "../../../src/components/RoleBuilderMatrix";
import { RoleProvider, useRole } from "../../../src/contexts/RoleContext";
import { UserProvider, useUser } from "../../../src/contexts/UserContext";
import { mockLocationHierarchy } from "../../../src/samples/locationHierarchy";
import { buildLocationPath } from "../../../src/schemas/locations";
import { countEnabledPermissions, createDefaultPermissions } from "../../../src/schemas/roles";
import type { CreateUserFormData } from "../../../src/schemas/users";
import type { RolePermissions } from "../../../src/schemas/roles";

type TabType = 'users' | 'roles';
type RoleViewMode = 'list' | 'create' | 'edit';
type RoleCreationMode = 'modal' | 'fullscreen';

function PeopleContent() {
  const { getUsersList, createUser, updateUser, toggleUserStatus, checkDuplicateEmail } = useUser();
  const { getRolesList, getRoleById, createRole, updateRole, duplicateRole, deleteRole, checkDuplicateName } = useRole();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('users');
  
  // Role creation mode (persisted in localStorage)
  const [roleCreationMode, setRoleCreationMode] = useState<RoleCreationMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ehs_role_creation_mode');
      return (saved as RoleCreationMode) || 'modal';
    }
    return 'modal';
  });

  // Toggle role creation mode and save to localStorage
  const toggleRoleCreationMode = () => {
    const newMode: RoleCreationMode = roleCreationMode === 'modal' ? 'fullscreen' : 'modal';
    setRoleCreationMode(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ehs_role_creation_mode', newMode);
    }
  };
  
  // Users tab state
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Roles tab state
  const [roleSearchQuery, setRoleSearchQuery] = useState("");
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [openRoleMenuId, setOpenRoleMenuId] = useState<string | null>(null);
  
  // Fullscreen role creation state
  const [roleViewMode, setRoleViewMode] = useState<RoleViewMode>('list');
  const [fullscreenRoleName, setFullscreenRoleName] = useState("");
  const [fullscreenPermissions, setFullscreenPermissions] = useState<RolePermissions>(createDefaultPermissions());
  const [fullscreenErrors, setFullscreenErrors] = useState<{name?: string; permissions?: string}>({});
  const [baseRoleId, setBaseRoleId] = useState<string>("");

  const users = getUsersList();
  const roles = getRolesList();

  // Get unique locations for filter (filter out empty/null values)
  const uniqueLocations = Array.from(new Set(users.map(u => u.locationPath).filter(Boolean))).sort();

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.roleId === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    const matchesLocation = locationFilter === "all" || user.locationPath === locationFilter;
    
    return matchesSearch && matchesRole && matchesStatus && matchesLocation;
  });

  // Filter roles
  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(roleSearchQuery.toLowerCase())
  );

  // Users tab handlers
  const handleAddUser = () => {
    setEditingUserId(null);
    setShowCreateModal(true);
  };

  const handleEditUser = (userId: string) => {
    setEditingUserId(userId);
    setShowCreateModal(true);
    setOpenMenuId(null);
  };

  const handleSubmitUser = (formData: CreateUserFormData, locationPath: string) => {
    if (editingUserId) {
      updateUser(editingUserId, formData);
    } else {
      const userId = createUser(formData);
      // Update with location path
      const user = users.find(u => u.id === userId);
      if (user) {
        updateUser(userId, { ...formData });
      }
    }
    setShowCreateModal(false);
    setEditingUserId(null);
  };

  const handleToggleStatus = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const action = user.status === "active" ? "deactivate" : "activate";
    if (confirm(`Are you sure you want to ${action} this user?`)) {
      toggleUserStatus(userId);
      setOpenMenuId(null);
    }
  };

  // Roles tab handlers
  const handleCreateRole = () => {
    if (roleCreationMode === 'fullscreen') {
      // Fullscreen mode: switch view and reset form
      setFullscreenRoleName("");
      setFullscreenPermissions(createDefaultPermissions());
      setFullscreenErrors({});
      setEditingRoleId(null);
      setBaseRoleId("");
      setRoleViewMode('create');
    } else {
      // Modal mode: open modal
      setEditingRoleId(null);
      setBaseRoleId("");
      setShowCreateRoleModal(true);
    }
  };
  
  const handleBaseRoleChange = (roleId: string) => {
    setBaseRoleId(roleId);
    
    if (roleId) {
      const baseRole = roles.find(r => r.id === roleId);
      if (baseRole) {
        setFullscreenPermissions({...baseRole.permissions});
      }
    } else {
      // Reset to default if no base role selected
      setFullscreenPermissions(createDefaultPermissions());
    }
  };

  const handleEditRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;

    if (roleCreationMode === 'fullscreen') {
      // Fullscreen mode: populate form and switch view
      setFullscreenRoleName(role.name);
      setFullscreenPermissions(role.permissions);
      setFullscreenErrors({});
      setEditingRoleId(roleId);
      setRoleViewMode('edit');
    } else {
      // Modal mode: open modal
      setEditingRoleId(roleId);
      setShowCreateRoleModal(true);
    }
    setOpenRoleMenuId(null);
  };

  const handleSubmitRole = (name: string, permissions: typeof roles[0]['permissions']) => {
    if (editingRoleId) {
      updateRole(editingRoleId, name, permissions);
    } else {
      createRole(name, permissions);
    }
    setShowCreateRoleModal(false);
    setEditingRoleId(null);
  };
  
  const handleFullscreenSaveRole = () => {
    // Validate
    const errors: {name?: string; permissions?: string} = {};
    
    if (!fullscreenRoleName.trim()) {
      errors.name = "Role name is required";
    } else if (fullscreenRoleName.trim().length < 3) {
      errors.name = "Role name must be at least 3 characters";
    } else if (checkDuplicateName(fullscreenRoleName.trim(), editingRoleId || undefined)) {
      errors.name = `A role named "${fullscreenRoleName.trim()}" already exists`;
    }
    
    const enabledCount = countEnabledPermissions(fullscreenPermissions);
    if (enabledCount === 0) {
      errors.permissions = "At least one permission must be enabled";
    }
    
    if (Object.keys(errors).length > 0) {
      setFullscreenErrors(errors);
      return;
    }
    
    // Save
    if (editingRoleId) {
      updateRole(editingRoleId, fullscreenRoleName.trim(), fullscreenPermissions);
    } else {
      createRole(fullscreenRoleName.trim(), fullscreenPermissions);
    }
    
    // Reset and return to list
    setRoleViewMode('list');
    setFullscreenRoleName("");
    setFullscreenPermissions(createDefaultPermissions());
    setEditingRoleId(null);
    setFullscreenErrors({});
  };
  
  const handleFullscreenCancelRole = () => {
    // Confirm if there are unsaved changes
    const hasChanges = fullscreenRoleName.trim() !== "" || countEnabledPermissions(fullscreenPermissions) > 0;
    
    if (hasChanges) {
      if (!confirm("You have unsaved changes. Are you sure you want to cancel?")) {
        return;
      }
    }
    
    // Reset and return to list
    setRoleViewMode('list');
    setFullscreenRoleName("");
    setFullscreenPermissions(createDefaultPermissions());
    setEditingRoleId(null);
    setFullscreenErrors({});
  };

  const handleDuplicateRole = (roleId: string) => {
    duplicateRole(roleId);
    setOpenRoleMenuId(null);
  };

  const handleDeleteRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;

    if (role.isSystemRole) {
      alert("System roles cannot be deleted. You can duplicate them to create customizable versions.");
      return;
    }

    if (confirm(`Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`)) {
      deleteRole(roleId);
      setOpenRoleMenuId(null);
    }
  };

  // Utility functions

  // Utility functions
  const getStatusBadgeColor = (status: string) => {
    return status === "active"
      ? "bg-green-50 text-green-700 border-green-200"
      : "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getRoleBadgeColor = (roleId: string) => {
    const role = getRoleById(roleId);
    if (!role) return "bg-gray-100 text-gray-700 border-gray-200";
    
    if (role.isSystemRole) {
      return "bg-blue-100 text-blue-700 border-blue-200";
    }
    return "bg-purple-100 text-purple-700 border-purple-200";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 fixed top-0 right-0 left-64 z-10">
        <div className="px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">U</span>
            </div>
            <span className="text-lg font-semibold">UpKeep EHS</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">A</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-64 p-8 pt-20">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage EHS users, roles, and permissions
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-4 px-1 text-sm font-medium transition-colors relative ${
                activeTab === 'users'
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Users
              {activeTab === 'users' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`pb-4 px-1 text-sm font-medium transition-colors relative ${
                activeTab === 'roles'
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Custom Roles
              {activeTab === 'roles' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          </nav>
        </div>

        {/* Users Tab Content */}
        {activeTab === 'users' && (
          <>
            {/* Filters Bar */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Search */}
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64 pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                {/* Role Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700 font-medium">Role:</span>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="all">All Roles</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700 font-medium">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Location Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700 font-medium">Location:</span>
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer max-w-xs"
                  >
                    <option value="all">All Locations</option>
                    {uniqueLocations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleAddUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add User
              </button>
              </div>
                </div>

        {/* Users Table */}
        {filteredUsers.length > 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  const locationPath = user.locationPath || buildLocationPath(user.locationNodeId, mockLocationHierarchy);
                  const breadcrumbParts = locationPath.split(' > ');

                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{user.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${getRoleBadgeColor(user.roleId)}`}>
                          {user.roleName || "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700 flex items-center gap-1 flex-wrap">
                          {breadcrumbParts.map((part, idx) => (
                            <React.Fragment key={idx}>
                              <span className="whitespace-nowrap">{part}</span>
                              {idx < breadcrumbParts.length - 1 && (
                                <span className="text-gray-400">/</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${
                          user.status === "active"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-gray-100 text-gray-700 border-gray-200"
                        }`}>
                          {user.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>

                          {openMenuId === user.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenMenuId(null)}
                              />
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                                <button
                                  onClick={() => handleEditUser(user.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(user.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-200"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                  </svg>
                                  {user.status === "active" ? "Deactivate" : "Activate"}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery || roleFilter !== "all" || statusFilter !== "all" || locationFilter !== "all" ? "No users found" : "No users yet"}
              </h3>
              <p className="text-sm text-gray-600 mb-6 max-w-md">
                {searchQuery || roleFilter !== "all" || statusFilter !== "all" || locationFilter !== "all"
                  ? "Try adjusting your filters or search query"
                  : "Add your first EHS user to get started"
                }
              </p>
              {!searchQuery && roleFilter === "all" && statusFilter === "all" && locationFilter === "all" && (
                <button
                  onClick={handleAddUser}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Add First User
                </button>
              )}
            </div>
          </div>
        )}
          </>
        )}

        {/* Custom Roles Tab Content */}
        {activeTab === 'roles' && (
          <>
            {/* List View - Show when roleViewMode === 'list' OR modal mode */}
            {(roleViewMode === 'list' || roleCreationMode === 'modal') && (
              <>
                {/* Search & Actions */}
                <div className="flex items-center justify-between mb-6">
                  <div className="relative flex-1 max-w-md">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search roles..."
                      value={roleSearchQuery}
                      onChange={(e) => setRoleSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* Mode Toggle Switch */}
                    <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-md border border-gray-200">
                      <span className="text-xs font-medium text-gray-700">Modal</span>
                      <button
                        type="button"
                        onClick={toggleRoleCreationMode}
                        className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${
                          roleCreationMode === 'fullscreen'
                            ? "bg-blue-600" 
                            : "bg-gray-300"
                        }`}
                        title={`Switch to ${roleCreationMode === 'modal' ? 'fullscreen' : 'modal'} mode`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            roleCreationMode === 'fullscreen' ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </button>
                      <span className="text-xs font-medium text-gray-700">Fullscreen</span>
                    </div>

                    {/* Create Role Button */}
                    <button
                      onClick={handleCreateRole}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Role
                    </button>
                  </div>
                </div>

                {/* Roles Table */}
                {filteredRoles.length > 0 ? (
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Permissions
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredRoles.map((role) => {
                          const permissionCount = countEnabledPermissions(role.permissions);
                          return (
                            <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-900">{role.name}</span>
                                  {role.isSystemRole && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">
                                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                      </svg>
                                      System
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                                  {permissionCount} permission{permissionCount !== 1 ? 's' : ''}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {role.isSystemRole ? 'Template' : 'Custom'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {formatDate(role.createdAt)}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  data-role-id={role.id}
                                  onClick={() => setOpenRoleMenuId(openRoleMenuId === role.id ? null : role.id)}
                                  className="text-gray-400 hover:text-gray-600 inline-flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100"
                                >
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                  </svg>
                                </button>

                                {openRoleMenuId === role.id && (
                                  <>
                                    <div
                                      className="fixed inset-0 z-40"
                                      onClick={() => setOpenRoleMenuId(null)}
                                    />
                                    <div className="fixed z-50 w-48 bg-white rounded-md shadow-xl border border-gray-200"
                                         style={{
                                           top: `${(document.querySelector(`[data-role-id="${role.id}"]`) as HTMLElement)?.getBoundingClientRect().bottom + 4}px`,
                                           right: `${window.innerWidth - (document.querySelector(`[data-role-id="${role.id}"]`) as HTMLElement)?.getBoundingClientRect().right}px`
                                         }}>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenRoleMenuId(null);
                                          handleEditRole(role.id);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-t-md"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        {role.isSystemRole ? 'View' : 'Edit'}
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenRoleMenuId(null);
                                          handleDuplicateRole(role.id);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        Duplicate
                                      </button>
                                      {!role.isSystemRole && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenRoleMenuId(null);
                                            handleDeleteRole(role.id);
                                          }}
                                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-200 rounded-b-md"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                          Delete
                                        </button>
                                      )}
                                    </div>
                                  </>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 p-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {roleSearchQuery ? "No roles found" : "No custom roles yet"}
                      </h3>
                      <p className="text-sm text-gray-600 mb-6 max-w-md">
                        {roleSearchQuery 
                          ? "Try adjusting your search query"
                          : "Create your first custom role to define specific permissions for your team"
                        }
                      </p>
                      {!roleSearchQuery && (
                        <button
                          onClick={handleCreateRole}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          Create First Role
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Fullscreen Create/Edit View - Show only in fullscreen mode */}
            {roleCreationMode === 'fullscreen' && (roleViewMode === 'create' || roleViewMode === 'edit') && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                {/* Header */}
                <div className="mb-6 pb-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {roleViewMode === 'create' ? 'Create Custom Role' : 'Edit Role'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Configure permissions for this role
                  </p>
                </div>

                {/* Role Name Input */}
                <div className="mb-6">
                  <label htmlFor="roleName" className="block text-sm font-medium text-gray-900 mb-2">
                    Role Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="roleName"
                    type="text"
                    value={fullscreenRoleName}
                    onChange={(e) => {
                      setFullscreenRoleName(e.target.value);
                      if (fullscreenErrors.name) {
                        setFullscreenErrors({...fullscreenErrors, name: undefined});
                      }
                    }}
                    placeholder="e.g., Safety Inspector"
                    className={`w-full max-w-md px-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      fullscreenErrors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                    }`}
                  />
                  {fullscreenErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{fullscreenErrors.name}</p>
                  )}
                </div>

                {/* Base Role Selector - Only show when creating new role */}
                {roleViewMode === 'create' && (
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <label htmlFor="baseRole" className="block text-sm font-medium text-gray-900 mb-2">
                      Start from existing role <span className="text-gray-400 text-xs">(optional)</span>
                    </label>
                    <select
                      id="baseRole"
                      value={baseRoleId}
                      onChange={(e) => handleBaseRoleChange(e.target.value)}
                      className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Create from scratch</option>
                      <optgroup label="System Roles">
                        {roles.filter(r => r.isSystemRole).map(role => (
                          <option key={role.id} value={role.id}>
                            {role.name} ({countEnabledPermissions(role.permissions)} permissions)
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Custom Roles">
                        {roles.filter(r => !r.isSystemRole).map(role => (
                          <option key={role.id} value={role.id}>
                            {role.name} ({countEnabledPermissions(role.permissions)} permissions)
                          </option>
                        ))}
                      </optgroup>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {baseRoleId ? (
                        <>
                          <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          Permissions pre-filled from selected role. You can customize them below.
                        </>
                      ) : (
                        'Select a role to use as a template, or create from scratch'
                      )}
                    </p>
                  </div>
                )}

                {/* Permissions Matrix */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Permissions <span className="text-red-500">*</span>
                  </h3>
                  {fullscreenErrors.permissions && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{fullscreenErrors.permissions}</p>
                    </div>
                  )}
                  <RoleBuilderMatrix
                    permissions={fullscreenPermissions}
                    onChange={(newPermissions) => {
                      setFullscreenPermissions(newPermissions);
                      if (fullscreenErrors.permissions) {
                        setFullscreenErrors({...fullscreenErrors, permissions: undefined});
                      }
                    }}
                    disabled={editingRoleId ? roles.find(r => r.id === editingRoleId)?.isSystemRole : false}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleFullscreenCancelRole}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFullscreenSaveRole}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    {roleViewMode === 'create' ? 'Create Role' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Create/Edit User Modal */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingUserId(null);
        }}
        onSubmit={handleSubmitUser}
        existingUser={editingUserId ? users.find(u => u.id === editingUserId) : undefined}
        checkDuplicateEmail={checkDuplicateEmail}
        locationNodes={mockLocationHierarchy}
      />

      {/* Create/Edit Role Modal */}
      <CreateRoleModal
        isOpen={showCreateRoleModal}
        onClose={() => {
          setShowCreateRoleModal(false);
          setEditingRoleId(null);
        }}
        onSubmit={handleSubmitRole}
        existingRole={editingRoleId ? roles.find(r => r.id === editingRoleId) : undefined}
        checkDuplicateName={checkDuplicateName}
      />
    </div>
  );
}

export default function PeoplePage() {
  return (
    <RoleProvider>
      <UserProvider>
        <PeopleContent />
      </UserProvider>
    </RoleProvider>
  );
}
