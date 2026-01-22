/**
 * Create User Modal Component
 * 
 * User provisioning modal with:
 * - Name and email inputs
 * - Role dropdown (from RoleContext)
 * - Location selector (using LocationNodeSelector)
 * - Mandatory location validation with warning
 */

import React, { useState, useEffect } from "react";
import LocationNodeSelector from "./LocationNodeSelector";
import { useRole } from "../contexts/RoleContext";
import { useUser } from "../contexts/UserContext";
import type { CreateUserFormData, EHSUser } from "../schemas/users";
import { isValidEmail } from "../schemas/users";
import type { LocationNode } from "../schemas/locations";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: CreateUserFormData, locationPath: string) => void;
  existingUser?: EHSUser; // For edit mode
  checkDuplicateEmail: (email: string, excludeId?: string) => boolean;
  locationNodes: LocationNode[];
}

export default function CreateUserModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  existingUser,
  checkDuplicateEmail,
  locationNodes 
}: CreateUserModalProps) {
  const { getRolesList } = useRole();
  const { getUsersList } = useUser();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [locationNodeId, setLocationNodeId] = useState("");
  const [locationPath, setLocationPath] = useState("");
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [error, setError] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [copyFromUserId, setCopyFromUserId] = useState("");

  const isEditMode = !!existingUser;
  const roles = getRolesList();
  const allUsers = getUsersList();
  const users = allUsers.filter(u => u.status === 'active'); // Show only active users

  // Handle copying from another user
  const handleCopyFromUser = (userId: string) => {
    setCopyFromUserId(userId);
    if (userId) {
      const selectedUser = users.find(u => u.id === userId);
      if (selectedUser) {
        setRoleId(selectedUser.roleId);
        setLocationNodeId(selectedUser.locationNodeId);
        setLocationPath(selectedUser.locationPath || "");
        setError("");
      }
    } else {
      // Reset when "Create from scratch" is selected
      if (!isEditMode) {
        setRoleId("");
        setLocationNodeId("");
        setLocationPath("");
      }
    }
  };

  // Reset form when modal opens/closes or when existingUser changes
  useEffect(() => {
    if (isOpen) {
      if (existingUser) {
        setFirstName(existingUser.firstName);
        setLastName(existingUser.lastName);
        setEmail(existingUser.email);
        setRoleId(existingUser.roleId);
        setLocationNodeId(existingUser.locationNodeId);
        setLocationPath(existingUser.locationPath || "");
      } else {
        setFirstName("");
        setLastName("");
        setEmail("");
        setRoleId("");
        setLocationNodeId("");
        setLocationPath("");
        setCopyFromUserId("");
      }
      setError("");
      setAttemptedSubmit(false);
    }
  }, [isOpen, existingUser]);

  const validateForm = (): boolean => {
    // First name required
    if (!firstName.trim()) {
      setError("First name is required");
      return false;
    }

    // Last name required
    if (!lastName.trim()) {
      setError("Last name is required");
      return false;
    }

    // Email required and valid
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Check for duplicate email
    const isDuplicate = checkDuplicateEmail(email, existingUser?.id);
    if (isDuplicate) {
      setError(`A user with email "${email}" already exists`);
      return false;
    }

    // Role required
    if (!roleId) {
      setError("Please select a role");
      return false;
    }

    // Location required (mandatory scoping rule)
    if (!locationNodeId) {
      setError("Location assignment is mandatory. Please select a location node.");
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);
    
    if (!validateForm()) {
      return;
    }

    const formData: CreateUserFormData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      roleId,
      locationNodeId,
    };

    onSubmit(formData, locationPath);
  };

  const handleLocationSelect = (nodeId: string, path: string) => {
    setLocationNodeId(nodeId);
    setLocationPath(path);
    setShowLocationSelector(false);
    setError(""); // Clear error when location is selected
  };

  const handleCancel = () => {
    setError("");
    setAttemptedSubmit(false);
    onClose();
  };

  if (!isOpen) return null;

  const showLocationWarning = attemptedSubmit && !locationNodeId;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-gray-900 bg-opacity-50" 
          onClick={handleCancel}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[85vh] flex flex-col">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {isEditMode ? "Edit User" : "Add New User"}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isEditMode ? "Update user information and assignments" : "Provision a new EHS user with role and location"}
                </p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content - Scrollable */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
              
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      setError("");
                    }}
                    placeholder="John"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      setError("");
                    }}
                    placeholder="Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="john.doe@company.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Copy from User - Only in create mode */}
              {!isEditMode && (
                <div className="border-t border-gray-200 pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Copy Role & Location from Existing User (Optional)
                  </label>
                  <select
                    value={copyFromUserId}
                    onChange={(e) => handleCopyFromUser(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="">Create from scratch</option>
                    {users.map(user => {
                      const userRole = roles.find(r => r.id === user.roleId);
                      return (
                        <option key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} ({userRole?.name || "No role"} - {user.locationPath || "No location"})
                        </option>
                      );
                    })}
                  </select>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Pre-fill role and location from an existing user (you can still edit them)
                  </p>
                </div>
              )}

              {/* Role Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={roleId}
                  onChange={(e) => {
                    setRoleId(e.target.value);
                    setError("");
                  }}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="">Select a role...</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name} {role.isSystemRole ? "(Template)" : ""}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Defines what permissions this user will have
                </p>
              </div>

              {/* Location Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Location <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowLocationSelector(true)}
                  className={`w-full px-3 py-2 border rounded-md text-sm text-left flex items-center justify-between transition-colors ${
                    showLocationWarning
                      ? "border-amber-300 bg-amber-50"
                      : "border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  }`}
                >
                  {locationPath ? (
                    <span className="text-gray-900 flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {locationPath}
                    </span>
                  ) : (
                    <span className="text-gray-500">Select location...</span>
                  )}
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  User will have access to this location and all child locations
                </p>
              </div>

              {/* Location Warning Banner */}
              {showLocationWarning && (
                <div className="bg-amber-50 border border-amber-300 rounded-md px-4 py-3">
                  <p className="text-sm text-amber-800 flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>
                      <strong>Location assignment is mandatory.</strong> Please select a location node to define this user's data access scope.
                    </span>
                  </p>
                </div>
              )}

              {/* General Error Message */}
              {error && !showLocationWarning && (
                <div className="bg-red-50 border border-red-200 rounded-md px-4 py-3">
                  <p className="text-sm text-red-800 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </p>
                </div>
              )}
            </div>

            {/* Footer - Fixed at bottom */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0 bg-gray-50">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                {isEditMode ? "Save Changes" : "Add User"}
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* Location Selector Modal */}
      <LocationNodeSelector
        isOpen={showLocationSelector}
        onClose={() => setShowLocationSelector(false)}
        onSelect={handleLocationSelect}
        currentSelection={locationNodeId}
        nodes={locationNodes}
      />
    </>
  );
}
