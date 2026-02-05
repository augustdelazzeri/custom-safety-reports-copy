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
import LocationFilterDropdown from "./LocationFilterDropdown";
import { useRole } from "../contexts/RoleContext";
import { useUser } from "../contexts/UserContext";
import type { CreateUserFormData, EHSUser } from "../schemas/users";
import { isValidEmail } from "../schemas/users";
import type { LocationNode, LocationSelection } from "../schemas/locations";
import { getLicenseStatusSummary, getRoleLicenseTypeDisplay, LICENSE_PRICE_MONTHLY, isViewOnlyRoleName, isTechnicianSystemRoleName } from "../schemas/roles";

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
  const [locationSelection, setLocationSelection] = useState<LocationSelection | null>(null);
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
                <LocationFilterDropdown
                  initialSelection={locationSelection}
                  locationTree={locationNodes}
                  onChange={(selection) => {
                    setLocationSelection(selection);
                    if (selection) {
                      setLocationNodeId(selection.locationId);
                      setLocationPath(selection.fullPath);
                    } else {
                      setLocationNodeId("");
                      setLocationPath("");
                    }
                    setError("");
                  }}
                  alwaysIncludeChildren={true}
                />
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  User will have access to this location and all child locations automatically
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

              {/* License cost: always show when a role is selected (add or edit, paid or free) */}
              {roleId && (() => {
                const role = roles.find(r => r.id === roleId);
                if (!role) return null;
                const licenseType = getRoleLicenseTypeDisplay(role);
                const licenseStatus = getLicenseStatusSummary(role.permissions ?? {});
                const isPaid = licenseType === 'paid';
                if (isPaid) {
                  return (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-amber-900">Paid license</div>
                            <div className="text-xs text-amber-700">
                              {isEditMode
                                ? `This user's role is charged at $${LICENSE_PRICE_MONTHLY.toLocaleString()} per user per month.`
                                : `This role will be charged at $${LICENSE_PRICE_MONTHLY.toLocaleString()} per user per month.`}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-amber-900">
                            ${licenseStatus.priceMonthly.toLocaleString()}<span className="text-sm font-normal">/month</span>
                          </div>
                          <div className="text-xs text-amber-600">per user seat</div>
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-green-900">Free license</div>
                          <div className="text-xs text-green-700">
                            {isEditMode ? "This user's role has no per-user license cost." : "This role has no per-user license cost."}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-900">
                          $0<span className="text-sm font-normal">/month</span>
                        </div>
                        <div className="text-xs text-green-600">per user seat</div>
                      </div>
                    </div>
                  </div>
                );
              })()}

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
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  (() => {
                    const role = roleId ? roles.find(r => r.id === roleId) : null;
                    const isFreeRole = role && (isViewOnlyRoleName(role.name) || isTechnicianSystemRoleName(role.name));
                    const isPaid = role && !isFreeRole && getLicenseStatusSummary(role.permissions ?? {}).type === 'paid';
                    return isPaid ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-blue-600 text-white hover:bg-blue-700';
                  })()
                }`}
              >
                {(() => {
                    const role = roleId ? roles.find(r => r.id === roleId) : null;
                    const licenseType = role ? getRoleLicenseTypeDisplay(role) : null;
                    const isPaid = licenseType === 'paid';
                    const valueText = !role ? '' : isPaid ? ` — $${LICENSE_PRICE_MONTHLY.toLocaleString()}/month` : ' — $0/month';
                    return isEditMode ? `Save Changes${valueText}` : (!role ? 'Add User' : `Add User${valueText}`);
                  })()}
              </button>
            </div>
          </form>

        </div>
      </div>
    </>
  );
}
