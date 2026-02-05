/**
 * Custom Roles Page
 * 
 * Manage custom EHS roles with granular permissions.
 * Displays roles table with create, edit, duplicate, and delete actions.
 */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../src/components/Sidebar";
import Header from "../../../src/components/Header";
import CreateRoleModal from "../../../src/components/CreateRoleModal";
import { RoleProvider, useRole } from "../../../src/contexts/RoleContext";
import { UserProvider, useUser } from "../../../src/contexts/UserContext";
import { countEnabledPermissions, getRoleLicenseTypeDisplay } from "../../../src/schemas/roles";
import { getVisibleModules } from "../../../src/data/permissionsMock";

function CustomRolesContent() {
  const router = useRouter();
  const { getRolesList, createRole, updateRole, duplicateRole, deleteRole, checkDuplicateName } = useRole();
  const { getUsersList } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState<string | null>(null);

  const roles = getRolesList();
  const users = getUsersList();

  // Count permissions based on simple mode (only visible modules)
  const countVisiblePermissions = (permissions: typeof roles[0]['permissions']) => {
    const visibleModules = getVisibleModules(false); // Always use Simple Mode
    const visibleModuleIds = new Set(visibleModules.map(m => m.moduleId));
    
    let count = 0;
    for (const moduleId in permissions) {
      // Only count if module is visible in current mode
      if (!visibleModuleIds.has(moduleId)) continue;
      
      const modulePerms = permissions[moduleId];
      for (const entityName in modulePerms) {
        const entityPerms = modulePerms[entityName];
        for (const actionKey in entityPerms) {
          if (entityPerms[actionKey] === true) {
            count++;
          }
        }
      }
    }
    return count;
  };

  // Filter roles by search
  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateRole = () => {
    setEditingRole(null);
    setShowCreateModal(true);
  };

  const handleEditRole = (roleId: string) => {
    setEditingRole(roleId);
    setShowCreateModal(true);
    setOpenMenuId(null);
  };

  const handleSubmitRole = (name: string, permissions: typeof roles[0]['permissions'], oshaLocationPermissions?: any, description?: string) => {
    if (editingRole) {
      updateRole(editingRole, name, permissions, oshaLocationPermissions, description);
    } else {
      createRole(name, permissions, oshaLocationPermissions, description);
    }
    setShowCreateModal(false);
    setEditingRole(null);
  };

  const handleDuplicateRole = (roleId: string) => {
    duplicateRole(roleId);
    setOpenMenuId(null);
  };

  const handleDeleteRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;

    if (role.isSystemRole) {
      alert("System roles cannot be deleted. You can duplicate them to create customizable versions.");
      return;
    }

    // Check if role is assigned to any users
    const assignedUsers = users.filter(u => u.roleId === roleId);
    if (assignedUsers.length > 0) {
      alert(`Cannot delete role\n\nThis role is assigned to ${assignedUsers.length} user${assignedUsers.length !== 1 ? 's' : ''}. Please reassign them first.\n\nTip: Go to Settings > People to reassign users to a different role.`);
      return;
    }

    if (confirm(`Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`)) {
      deleteRole(roleId);
      setOpenMenuId(null);
    }
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
      <div className="ml-64">
        <Header />

      {/* Main Content */}
        <main className="p-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Custom Roles</h1>
          <p className="text-sm text-gray-600 mt-1">
            Create and manage custom roles with granular permissions for your EHS team
          </p>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
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
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    License
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
                  const permissionCount = countVisiblePermissions(role.permissions);
                  const licenseType = getRoleLicenseTypeDisplay(role);
                  const isPaid = licenseType === 'paid';
                  return (
                    <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{role.name}</span>
                          {role.isSystemRole && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                              </svg>
                              System
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 max-w-xs truncate block" title={role.description || ''}>
                          {role.description || <span className="text-gray-400 italic">No description</span>}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                          {permissionCount} permission{permissionCount !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                          isPaid ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-green-50 text-green-700 border border-green-200'
                        }`}>
                          {isPaid ? 'Paid' : 'Free'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {role.isSystemRole ? 'Template' : 'Custom'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {formatDate(role.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === role.id ? null : role.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>

                          {openMenuId === role.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenMenuId(null)}
                              />
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                                <button
                                  onClick={() => handleEditRole(role.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  {role.isSystemRole ? 'View' : 'Edit'}
                                </button>
                                <button
                                  onClick={() => handleDuplicateRole(role.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                  Duplicate
                                </button>
                                {!role.isSystemRole && (
                                  <button
                                    onClick={() => handleDeleteRole(role.id)}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-200"
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? "No roles found" : "No custom roles yet"}
              </h3>
              <p className="text-sm text-gray-600 mb-6 max-w-md">
                {searchQuery 
                  ? "Try adjusting your search query"
                  : "Create your first custom role to define specific permissions for your team"
                }
              </p>
              {!searchQuery && (
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
        </main>
      </div>

      {/* Create/Edit Role Modal */}
      <CreateRoleModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingRole(null);
        }}
        onSubmit={handleSubmitRole}
        existingRole={editingRole ? roles.find(r => r.id === editingRole) : undefined}
        checkDuplicateName={checkDuplicateName}
      />
    </div>
  );
}

export default function CustomRolesPage() {
  return (
    <RoleProvider>
      <UserProvider>
        <CustomRolesContent />
      </UserProvider>
    </RoleProvider>
  );
}
