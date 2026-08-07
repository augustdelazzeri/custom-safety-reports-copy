"use client";

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FileText, Paperclip, Save, ChevronDown, Sparkles } from 'lucide-react';
import { 
  CustomFieldsSection, 
  LinkedDocumentsSection, 
  AsyncLocationSelect, 
  AsyncAssetSelect, 
  AsyncUserSelect,
  MediaUploadCollapsible,
  ApproversSelector
} from '@/components/audit/upsert/mocks';
import { WritingAssistant } from '@/components/ui/writing-assistant';
import { DateTimePicker } from '@/components/ui/date-time-picker';

export default function NewAudit() {
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = (key: string) => {
    const translations: Record<string, string> = {
      'audits.new.title': 'New Audit',
      'audits.new.subtitle': 'Create a new safety audit configuration.',
      'audits.new.docAdmin.title': 'Document Administration',
      'audits.new.docAdmin.subtitle': 'General document settings and identification.',
      'audits.new.basicInfo.title': 'Basic Information',
      'audits.new.documentTitle.label': 'Document Title',
      'audits.new.documentTitle.placeholder': 'e.g. Monthly Fire Safety Audit',
      'audits.new.referenceId.label': 'Reference ID',
      'audits.new.referenceId.placeholder': 'e.g. AUD-2026-001',
      'audits.new.referenceId.description': 'Optional internal reference identifier.',
      'audits.new.auditType.label': 'Audit Type',
      'audits.new.auditType.placeholder': 'e.g. Internal, Regulatory',
      'audits.new.auditOwner.label': 'Audit Owner',
      'audits.new.auditOwner.placeholder': 'Select an owner...',
      'audits.new.description.label': 'Description',
      'audits.new.description.placeholder': 'Describe the scope and focus of this audit...',
      'audits.new.media.addImages': 'Add images or files',
      'audits.new.nextReviewDate.label': 'Next Review Date',
      'audits.new.nextReviewDate.placeholder': 'Select date...',
      'audits.new.locationAsset.title': 'Location & Asset Information',
      'audits.new.location.label': 'Location',
      'audits.new.location.placeholder': 'Select location...',
      'audits.new.asset.label': 'Asset',
      'audits.new.asset.placeholderNoLocation': 'Select a location first',
      'audits.new.relatedDocs.title': 'Related Documents',
      'audits.new.relatedDocs.subtitle': 'Link this audit to existing safety events, JHAs, or other documents.',
      'audits.new.approvalWorkflow.title': 'Approval Workflow',
      'audits.new.approvalWorkflow.subtitle': 'Define how this audit will be reviewed and approved.',
      'audits.new.approvalFlow.label': 'Approval Flow Type',
      'audits.new.approvalFlow.sequential.label': 'Sequential',
      'audits.new.approvalFlow.sequential.description': 'Approvers must review in order.',
      'audits.new.approvalFlow.parallel.label': 'Parallel',
      'audits.new.approvalFlow.parallel.description': 'All approvers can review at the same time.',
      'audits.new.approvers.title': 'Required Approvers',
      'audits.new.approvers.description': 'Add the people responsible for approving this audit.',
      'audits.new.saveDraft': 'Save as Draft',
      'audits.new.saveBuildChecklist': 'Save & Build Checklist',
    };
    return translations[key] || key;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={t('audits.new.title')} />
        <main className="flex-1 overflow-y-auto bg-gray-50/30">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-8 lg:px-10">
            <div className="space-y-8">
              {/* Header */}
              <div className="text-center">
                <h2 className="mb-2 text-3xl font-bold text-gray-900">{t('audits.new.title')}</h2>
                <p className="text-gray-600">{t('audits.new.subtitle')}</p>
              </div>

              {/* Document Administration */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-gray-100 bg-gray-50/50 p-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-lg border shadow-sm">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{t('audits.new.docAdmin.title')}</h3>
                      <p className="text-sm text-gray-500">{t('audits.new.docAdmin.subtitle')}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-8 p-6">
                  {/* Basic Information */}
                  <div>
                    <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">{t('audits.new.basicInfo.title')}</h4>
                    <div className="grid gap-6">
                      <div className="space-y-2">
                        <Label>{t('audits.new.documentTitle.label')} <span className="text-red-500">*</span></Label>
                        <Input placeholder={t('audits.new.documentTitle.placeholder')} />
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>{t('audits.new.referenceId.label')}</Label>
                          <Input placeholder={t('audits.new.referenceId.placeholder')} />
                        </div>
                        <div className="space-y-2">
                          <Label>{t('audits.new.auditType.label')}</Label>
                          <Input placeholder={t('audits.new.auditType.placeholder')} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>{t('audits.new.auditOwner.label')} <span className="text-red-500">*</span></Label>
                        <AsyncUserSelect placeholder={t('audits.new.auditOwner.placeholder')} />
                      </div>

                      <div className="space-y-2">
                        <Label>{t('audits.new.description.label')} <span className="text-red-500">*</span></Label>
                        <WritingAssistant 
                          placeholder={t('audits.new.description.placeholder')}
                          className="min-h-[120px]"
                          context="New Audit Description"
                          onChange={() => {}}
                        />
                        <div className="flex w-full justify-between items-center pt-1">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
                            onClick={() => setIsMediaOpen(!isMediaOpen)}
                          >
                            <Paperclip className="h-3 w-3" />
                            {t('audits.new.media.addImages')}
                            <ChevronDown className={`h-3 w-3 transition-transform ${isMediaOpen ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                        <MediaUploadCollapsible isOpen={isMediaOpen} />
                      </div>

                      <div className="space-y-2">
                        <Label>{t('audits.new.nextReviewDate.label')} <span className="text-red-500">*</span></Label>
                        <DateTimePicker placeholder={t('audits.new.nextReviewDate.placeholder')} />
                      </div>
                    </div>
                  </div>

                  {/* Location & Asset Information */}
                  <div className="pt-6 border-t border-gray-100">
                    <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">{t('audits.new.locationAsset.title')}</h4>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>{t('audits.new.location.label')}</Label>
                        <AsyncLocationSelect placeholder={t('audits.new.location.placeholder')} />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('audits.new.asset.label')}</Label>
                        <AsyncAssetSelect placeholder={t('audits.new.asset.placeholderNoLocation')} />
                      </div>
                    </div>
                  </div>

                  <CustomFieldsSection />
                </div>
              </div>

              {/* Related Documents */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-gray-100 bg-gray-50/50 p-6">
                  <h3 className="text-lg font-bold text-gray-900">{t('audits.new.relatedDocs.title')}</h3>
                  <p className="text-sm text-gray-500">{t('audits.new.relatedDocs.subtitle')}</p>
                </div>
                <div className="p-6">
                  <LinkedDocumentsSection />
                </div>
              </div>

              {/* Approval Workflow */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-gray-100 bg-gray-50/50 p-6">
                  <h3 className="text-lg font-bold text-gray-900">{t('audits.new.approvalWorkflow.title')}</h3>
                  <p className="text-sm text-gray-500">{t('audits.new.approvalWorkflow.subtitle')}</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">{t('audits.new.approvalFlow.label')}</Label>
                    <RadioGroup defaultValue="parallel" className="grid gap-4">
                      <div className="flex items-start space-x-3 rounded-xl border border-gray-100 p-4 hover:bg-gray-50 transition-colors">
                        <RadioGroupItem value="sequential" id="sequential" className="mt-1" />
                        <div className="grid gap-1">
                          <Label htmlFor="sequential" className="font-bold cursor-pointer">{t('audits.new.approvalFlow.sequential.label')}</Label>
                          <p className="text-sm text-gray-500">{t('audits.new.approvalFlow.sequential.description')}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 rounded-xl border-2 border-blue-100 bg-blue-50/30 p-4">
                        <RadioGroupItem value="parallel" id="parallel" className="mt-1" />
                        <div className="grid gap-1">
                          <Label htmlFor="parallel" className="font-bold cursor-pointer">{t('audits.new.approvalFlow.parallel.label')}</Label>
                          <p className="text-sm text-gray-500">{t('audits.new.approvalFlow.parallel.description')}</p>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <ApproversSelector 
                      title={t('audits.new.approvers.title')}
                      description={t('audits.new.approvers.description')}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                <Button variant="outline" className="h-11 px-6">
                  <Save className="mr-2 h-4 w-4" />
                  {t('audits.new.saveDraft')}
                </Button>
                <Button className="h-11 px-8 bg-blue-600 hover:bg-blue-700">
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t('audits.new.saveBuildChecklist')}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
