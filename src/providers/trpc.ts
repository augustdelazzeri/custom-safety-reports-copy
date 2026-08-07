const createMockQuery = (data: any) => ({
  data,
  isLoading: false,
  isPending: false,
  isSuccess: true,
  isError: false,
  error: null,
});

const createMockMutation = () => ({
  mutateAsync: async (_args?: any) => ({}),
  isPending: false,
  isLoading: false,
  isSuccess: true,
  isError: false,
  error: null,
});

export const trpc: any = {
  dashboard: {
    getKpiSummary: {
      useQuery: () => createMockQuery({ openIncidents: 5, overdueCapas: 2, oshaReportable: 1, totalPendingReview: 10 }),
    },
    getEventStats: {
      useQuery: () => createMockQuery({ 
        daysSinceLastIncidentByLocation: [{ locationId: '1', locationName: 'Main Site', daysSince: 45 }],
        trend: [
          { date: '2026-07-21', count: 2 },
          { date: '2026-07-22', count: 5 },
          { date: '2026-07-23', count: 3 },
          { date: '2026-07-24', count: 8 },
          { date: '2026-07-25', count: 4 },
          { date: '2026-07-26', count: 6 },
          { date: '2026-07-27', count: 1 }
        ],
        byType: [{ label: 'incident', count: 5 }, { label: 'near_miss', count: 3 }],
        bySeverity: [{ label: 'low', count: 10 }, { label: 'high', count: 2 }],
        byLocation: [{ locationName: 'Main Site', count: 12 }]
      }),
    },
    getCapaStats: {
      useQuery: () => createMockQuery({ 
        total: 20, 
        open: 8, 
        overdue: 2, 
        avgDaysToClose: 15,
        byPriority: [{ label: 'High', count: 5 }, { label: 'Medium', count: 15 }]
      }),
    },
    getDocumentStats: {
      useQuery: () => createMockQuery({ 
        total: 100, 
        pendingReview: 10,
        byStatus: [{ label: 'Approved', count: 80 }, { label: 'Pending', count: 20 }]
      }),
    },
  },
  capa: {
    export: {
      useMutation: () => createMockMutation()
    },
    getById: {
      useQuery: (config: any) => createMockQuery({
        id: config.id,
        title: 'Repair damaged walkway in Warehouse A',
        type: 'Corrective Action',
        status: 'open',
        priority: 'high',
        dueDate: '2026-08-15',
        createdAt: '2026-07-27',
        ownerId: 'u1',
        owner: { fullName: 'John Doe' },
        rcaFindings: 'The walkway surface has deteriorated due to heavy forklift traffic and moisture exposure.',
        actionsToAddress: '1. Resurface the affected area with anti-slip coating.\n2. Install protective bollards to guide forklift traffic.',
        eventId: 'ev_123',
        eventSlug: 'damaged-walkway-warehouse-a',
        locationId: 'loc_1',
        location: { name: 'Chicago Plant > Warehouse A' }
      })
    },
    update: {
      useMutation: () => createMockMutation()
    }
  },
  event: {
    getById: {
      useQuery: (config: any) => createMockQuery({
        id: config.id,
        title: 'Slip and fall in Production Line 3',
        description: 'A technician slipped on a wet floor near the entrance of Line 3. The area was marked with caution tape but the floor was still slippery.',
        type: 'Incident',
        status: 'open',
        severity: 'medium',
        reportedAt: '2026-07-27',
        locationId: 'loc_1',
        reportedBy: 'user_1',
        slug: 'slip-and-fall-line-3',
        immediateActions: 'Cleaned the spill and added more absorbent material.',
        oshaReportable: false,
        location: 'Chicago Plant > Production > Line 3'
      })
    },
    update: {
      useMutation: () => createMockMutation()
    },
    getByIdForEdit: {
      useQuery: (config: any) => createMockQuery({
        id: config.id,
        title: 'Slip and fall in Production Line 3',
        description: 'A technician slipped on a wet floor near the entrance of Line 3. The area was marked with caution tape but the floor was still slippery.',
        type: 'Incident',
        status: 'open',
        severity: 'medium',
        reportedAt: '2026-07-27',
        locationId: 'loc_1',
        reportedBy: 'user_1',
        slug: 'slip-and-fall-line-3',
        immediateActions: 'Cleaned the spill and added more absorbent material.',
        oshaReportable: false,
        location: 'Chicago Plant > Production > Line 3'
      })
    }
  },
  eventFormTemplate: {
    list: {
      useQuery: () => createMockQuery([
        { id: 't1', name: 'Template 2', fieldsCount: 3, conditionsCount: 0, createdBy: 'August Delazzeri', createdAt: 'Aug 6, 2026 at 10:27 AM' },
        { id: 't2', name: 'Safety for Ed', fieldsCount: 3, conditionsCount: 1, createdBy: 'August Delazzeri', createdAt: 'Jul 2, 2026 at 3:39 PM' },
        { id: 't3', name: 'Logic test', fieldsCount: 6, conditionsCount: 3, createdBy: 'August Delazzeri', createdAt: 'May 20, 2026 at 2:20 PM' },
        { id: 't4', name: 'GPS template', fieldsCount: 5, conditionsCount: 0, createdBy: 'August Admin', createdAt: 'May 4, 2026 at 2:50 PM' },
        { id: 't5', name: 'Contractor Management', fieldsCount: 3, conditionsCount: 0, createdBy: 'August Delazzeri', createdAt: 'Apr 27, 2026 at 1:15 PM' },
      ])
    },
    getById: {
      useQuery: (config: any) => createMockQuery({
        id: config.id,
        name: config.id === 't1' ? 'Template 2' : 'Safety for Ed',
        fields: [
          { id: 'f1', label: 'Title', type: 'Text', required: true, description: 'A short description of the event', section: 'core' },
          { id: 'f2', label: 'Time of Event', type: 'Date/Time', required: true, description: 'When did the event occur?', section: 'core' },
          { id: 'f3', label: 'Description', type: 'Text Area', required: true, description: 'Provide a detailed account of what happened', section: 'core' },
          { id: 'f4', label: 'GPS Location', type: 'GPS Location', required: false, description: 'Automatically captures your current GPS coordinates', section: 'additional' },
          { id: 'f5', label: 'Body Part Affected', type: 'Multi-select', required: false, description: 'Select all body parts affected by the injury', section: 'additional' },
          { id: 'f6', label: 'New Dropdown', type: 'Dropdown', required: false, section: 'additional' }
        ],
        logic: config.id === 't1' ? [] : [
          { id: 'l1', whenField: 'Title', operator: 'Is empty', thenAction: 'Show', targetField: 'Body Part Affected' }
        ]
      })
    },
    update: {
      useMutation: () => createMockMutation()
    },
    checkNameExists: { fetch: async () => ({ exists: false }) },
    create: {
      useMutation: () => createMockMutation()
    }
  },
  audit: {
    list: {
      useQuery: () => createMockQuery([
        { id: 'a8', title: 'Forklift Inspection', slug: 'AUD-0008-1.0', status: 'Approved/Active', ownerName: 'Amanda Santos', auditDate: '2026-08-07', locationName: 'No location', version: '1.0', referenceId: 'AUD-0008-1.0', assetName: 'No asset' },
        { id: 'a1', title: 'Behavior-Based Safety Observation Audit 2', slug: 'AUD-0007-3.0', status: 'Draft', ownerName: 'Amanda Santos', auditDate: '2026-07-20', locationName: 'No location', version: '3.0', referenceId: 'AUD-0007-3.0', assetName: 'No asset' },
        { id: 'a2', title: 'Audit Test Permission', slug: 'AUD-0006-1.0', status: 'Draft', ownerName: 'August Delazzeri', auditDate: '2026-08-05', locationName: 'No location', version: '1.0', referenceId: 'AUD-0006-1.0', assetName: 'No asset' },
        { id: 'a3', title: 'Audit Reteste - Fora de Miami', slug: 'AUD-0005-1.0', status: 'Draft', ownerName: 'August Delazzeri', auditDate: '2026-08-10', locationName: 'No location', version: '1.0', referenceId: 'AUD-0005-1.0', assetName: 'No asset' },
        { id: 'a4', title: 'Audit Reteste - Miami', slug: 'AUD-0004-1.0', status: 'Draft', ownerName: 'August Delazzeri', auditDate: '2026-08-12', locationName: 'Miami', version: '1.0', referenceId: 'AUD-0004-1.0', assetName: 'No asset' },
        { id: 'a5', title: 'kly Zone 3 Safety Audit - Copy', slug: 'AUD-0003-1.0', status: 'Approved/Active', ownerName: 'August Delazzeri', auditDate: '2026-08-15', locationName: 'UpKeep HQ > Building 1', version: '1.0', referenceId: 'AUD-0003-1.0', assetName: 'No asset' },
        { id: 'a6', title: 'kly Zone 3 Safety Audit', slug: 'AUD-0002-1.0', status: 'Under Review', ownerName: 'August Delazzeri', auditDate: '2026-08-18', locationName: 'Miami > Miami - Production Line A', version: '1.0', referenceId: 'AUD-0002-1.0', assetName: 'No asset' },
        { id: 'a7', title: 'Weekly Zone 3 Safety Audit', slug: 'AUD-0001-1.0', status: 'Approved/Active', ownerName: 'August Delazzeri', auditDate: '2026-08-20', locationName: 'No location', version: '1.0', referenceId: 'AUD-0001-1.0', assetName: 'No asset' }
      ])
    },
    export: {
      useMutation: () => createMockMutation()
    },
    getByInstanceId: {
      useQuery: (config: any) => createMockQuery({
        id: config.id,
        instanceId: config.id,
        title: config.id === 'a8' ? 'Forklift Inspection' : config.id === 'a5' ? 'kly Zone 3 Safety Audit - Copy' : 'Behavior-Based Safety Observation Audit 2',
        slug: config.id === 'a8' ? 'AUD-0008-1.0' : config.id === 'a5' ? 'AUD-0003-1.0' : 'AUD-0007-3.0',
        status: (config.id === 'a8' || config.id === 'a5') ? 'Approved/Active' : 'Draft',
        version: config.id === 'a8' ? '1.0' : config.id === 'a5' ? '1.0' : '3.0',
        description: config.id === 'a8' ? 'Inspection of a forklift to assess its operational safety, mechanical condition, and compliance with applicable safety standards. The audit scope typically includes checking brakes, steering, tires, forks, hydraulic systems, warning devices, load capacity markings, and overall maintenance condition to ensure safe operation and prevent workplace incidents.' : 'This audit focuses on conducting a Behavior-Based Safety (BBS) observation program in accordance with applicable Canadian occupational health and safety regulations. The objective is to systematically observe employee work practices to identify safe and at-risk behaviors, reinforce positive safety actions, and reduce the likelihood of incidents or injuries.',
        type: config.id === 'a8' ? 'Equipment Inspection' : 'Safety Audit',
        owner: { id: 'u1', fullName: (config.id === 'a8' || config.id === 'a1') ? 'Amanda Santos' : 'August Delazzeri' },
        location: { id: 'loc1', name: config.id === 'a5' ? 'UpKeep HQ > Building 1' : 'No location' },
        createdAt: '2026-07-20',
        updatedAt: '2026-08-07',
        lastReviewed: 'Aug 7, 2026',
        reviewDate: 'Feb 20, 2026',
        approvers: [
          { approverId: 'u2', approverName: 'August Delazzeri', role: 'August Delazzeri', status: (config.id === 'a8' || config.id === 'a5') ? 'approved' : 'pending', approvedAt: (config.id === 'a8' || config.id === 'a5') ? '2026-08-07' : null }
        ],
        approverFlow: 'Sequential',
        checklists: [
          { id: 'c1', name: config.id === 'a8' ? 'Forklift Pre-Operation Safety Inspection Checklist' : config.id === 'a5' ? 'Zone 3 Safety Audit Checklist' : 'Behavior-Based Safety Observation Audit 2 Checklist', description: config.id === 'a8' ? 'Comprehensive pre-use safety inspection checklist for forklifts to verify safe operating condition and regulatory compliance before operation.' : 'Actionable Behavior-Based Safety (BBS) observation checklist to evaluate safe and at-risk work behaviors, PPE compliance, hazard control adherence, and safety culture in accordance with Canadian occupational health and safety regulations.' }
        ],
        workOrders: config.id === 'a1' ? [
          { id: 'wo1', workOrderNumber: '060', description: 'Inspect safety shower station, verify water flow, and ensure access is unobstructed.', priority: 'Medium', dueDate: 'Jul 31, 2026' }
        ] : [],
        pms: [],
        media: [],
        customFields: [],
        activity: [
          { type: 'Approved', date: 'Aug 7, 2026 5:35 PM', user: 'August Delazzeri' },
          { type: 'In Review', date: 'Aug 7, 2026 5:35 PM', user: 'August Delazzeri' },
          { type: 'Drafted', date: 'Aug 7, 2026 5:35 PM', user: 'August Delazzeri' }
        ]
      })
    }
  },
  jha: {
    list: {
      infiniteOptions: Object.assign(
        (config?: any) => ({
          queryKey: ['jhas', config],
          queryFn: () => ({
            result: [
              { id: 'j1', title: 'High Height Maintenance', slug: 'JHA-001', status: 'COMPLETED', ownerName: 'Alice Johnson', highestResidualRiskScore: 4, stepCount: 5, createdAt: '2026-07-20', locationName: 'Main Site' },
              { id: 'j2', title: 'Chemical Handling', slug: 'JHA-002', status: 'IN_PROGRESS', ownerName: 'Bob Smith', highestResidualRiskScore: 8, stepCount: 3, createdAt: '2026-07-25', locationName: 'Warehouse B' }
            ],
            nextCursor: null
          })
        }),
        {
          useInfiniteQuery: () => ({
            data: { pages: [{ result: [
              { id: 'j1', title: 'High Height Maintenance', slug: 'JHA-001', status: 'COMPLETED', ownerName: 'Alice Johnson', highestResidualRiskScore: 4, stepCount: 5, createdAt: '2026-07-20', locationName: 'Main Site' },
              { id: 'j2', title: 'Chemical Handling', slug: 'JHA-002', status: 'IN_PROGRESS', ownerName: 'Bob Smith', highestResidualRiskScore: 8, stepCount: 3, createdAt: '2026-07-25', locationName: 'Warehouse B' }
            ] }] },
            isLoading: false,
            hasNextPage: false,
            fetchNextPage: () => {},
            isFetchingNextPage: false,
            isFetchedAfterMount: true
          })
        }
      )
    },
    getByInstanceId: {
      useQuery: (config: any) => createMockQuery({
        id: config.id,
        instanceId: config.id,
        title: 'High Height Maintenance',
        slug: 'JHA-001',
        status: 'COMPLETED',
        version: '1.0',
        description: 'Risk assessment for roof maintenance and HV AC repair.',
        type: 'Routine',
        owner: { id: 'u1', fullName: 'Alice Johnson' },
        location: { id: 'loc1', name: 'Main Site > Roof' },
        createdAt: '2026-07-20',
        updatedAt: '2026-07-22',
        nextReviewDate: '2026-10-20',
        highestInitialRiskScore: 12,
        highestResidualRiskScore: 4,
        approvers: [
          { approverId: 'u1', approverName: 'Alice Johnson', role: 'Safety Manager', approvedAt: '2026-07-22' }
        ],
        steps: [
          { id: 's1', serial: 1, title: 'Access roof', description: 'Using fixed ladder to access the main roof area.', severity: 3, likelihood: 4, likelihoodAfterControl: 1, hazards: [{ id: 'h1', name: 'Fall from height', type: 'FALL' }], controlMeasures: [{ id: 'c1', name: 'Fixed ladder with cage', type: 'ENGINEERING' }] }
        ],
        checklists: [],
        workOrders: [],
        pms: [],
        media: [],
        customFields: [],
        notes: 'Ensure all weather conditions are checked before starting.'
      })
    },
    getByInstanceIdForEdit: {
      useQuery: (config: any) => createMockQuery({
        id: config.id,
        instanceId: config.id,
        title: 'High Height Maintenance',
        slug: 'JHA-001',
        status: 'COMPLETED',
        version: '1.0',
        description: 'Risk assessment for roof maintenance and HVAC repair.',
        ownerId: 'u1',
        locationId: 'loc1',
        assetIds: [],
        approverFlow: 'parallel',
        reviewDate: '2026-10-20',
        notes: 'Ensure all weather conditions are checked before starting.',
        isPublic: true,
        media: [],
        steps: [
          { id: 's1', serial: 1, title: 'Access roof', description: 'Using fixed ladder to access the main roof area.', severity: 3, likelihood: 4, likelihoodAfterControl: 1, hazardIds: ['h1'], controlMeasureIds: ['c1'], media: [] }
        ],
        approvers: [{ approverId: 'u1', serial: 1, role: 'Safety Manager', isSignatureRequired: true }]
      })
    },
    create: { useMutation: () => createMockMutation() },
    update: { useMutation: () => createMockMutation() },
    export: { useMutation: () => createMockMutation() }
  },
  loto: {
    list: {
      infiniteOptions: Object.assign(
        (config?: any) => ({
          queryKey: ['lotos', config],
          queryFn: () => ({
            result: [
              { id: 'l1', title: 'Main Power Isolation', slug: 'LOTO-001', status: 'COMPLETED', ownerName: 'Alice Johnson', createdAt: '2026-07-20', locationName: 'Main Site', assetName: 'Main Transformer' },
              { id: 'l2', title: 'Gas Line Lockout', slug: 'LOTO-002', status: 'IN_PROGRESS', ownerName: 'Bob Smith', createdAt: '2026-07-25', locationName: 'Warehouse B', assetName: 'Gas Valve 4' }
            ],
            nextCursor: null
          })
        }),
        {
          useInfiniteQuery: () => ({
            data: { pages: [{ result: [
              { id: 'l1', title: 'Main Power Isolation', slug: 'LOTO-001', status: 'COMPLETED', ownerName: 'Alice Johnson', createdAt: '2026-07-20', locationName: 'Main Site', assetName: 'Main Transformer' },
              { id: 'l2', title: 'Gas Line Lockout', slug: 'LOTO-002', status: 'IN_PROGRESS', ownerName: 'Bob Smith', createdAt: '2026-07-25', locationName: 'Warehouse B', assetName: 'Gas Valve 4' }
            ] }] },
            isLoading: false,
            hasNextPage: false,
            fetchNextPage: () => {},
            isFetchingNextPage: false,
            isFetchedAfterMount: true
          })
        }
      )
    },
    getByInstanceId: {
      useQuery: (config: any) => createMockQuery({
        id: config.id,
        instanceId: config.id,
        title: 'Main Power Isolation',
        slug: 'LOTO-001',
        status: 'COMPLETED',
        version: '1.0',
        department: 'Electrical',
        owner: { id: 'u1', fullName: 'Alice Johnson' },
        issuer: { id: 'u2', fullName: 'Bob Smith' },
        location: { id: 'loc1', name: 'Main Site > Substation' },
        asset: { id: 'a1', name: 'Main Transformer' },
        createdAt: '2026-07-20',
        updatedAt: '2026-07-22',
        reviewDate: '2026-10-20',
        energySources: [
          { id: 'es1', name: '480V Electrical', type: 'ELECTRICAL', isolationPoint: 'Main Breaker', isolationMethod: 'Switch Off & Padlock', lockoutDevice: 'Standard Padlock', verificationMethod: 'Check voltage meter' }
        ],
        procedureGroups: {
          general: ['Ensure area is cleared', 'Wear PPE'],
          pre_procedure: ['Notify production', 'Verify tools'],
          procedure: ['Switch off breaker', 'Apply padlock', 'Attach tag'],
          post_procedure: ['Verify power is off', 'Return tools']
        },
        procedures: [
          { id: 'p1', serial: 1, label: 'Switch off breaker', type: 'procedure' }
        ],
        approvers: [
          { approverId: 'u1', approverName: 'Alice Johnson', role: 'Safety Manager', approvedAt: '2026-07-22' }
        ],
        checklists: [],
        workOrders: [],
        pms: [],
        media: [],
        notes: 'Follow standard lockout procedure.'
      })
    },
    getByInstanceIdForEdit: {
      useQuery: (config: any) => createMockQuery({
        id: config.id,
        instanceId: config.id,
        title: 'Main Power Isolation',
        slug: 'LOTO-001',
        status: 'COMPLETED',
        version: '1.0',
        ownerId: 'u1',
        issuerId: 'u2',
        locationId: 'loc1',
        assetId: 'a1',
        department: 'Electrical',
        reviewDate: '2026-10-20',
        approverFlow: 'parallel',
        isPublic: true,
        procedures: [
          { serial: 1, label: 'Switch off breaker', type: 'procedure' }
        ],
        energySources: [
          { name: '480V Electrical', type: 'ELECTRICAL', isolationPoint: 'Main Breaker' }
        ],
        approvers: [{ approverId: 'u1', serial: 1, role: 'Safety Manager', isSignatureRequired: true }]
      })
    },
    create: { useMutation: () => createMockMutation() },
    update: { useMutation: () => createMockMutation() },
    export: { useMutation: () => createMockMutation() }
  },
  ptw: {
    list: {
      infiniteOptions: Object.assign(
        (config?: any) => ({
          queryKey: ['ptws', config],
          queryFn: () => ({
            result: [
              { id: 'p1', title: 'Hot Work in Boiler Room', slug: 'PTW-001', status: 'COMPLETED', ownerName: 'Alice Johnson', createdAt: '2026-07-20', locationName: 'Main Site' },
              { id: 'p2', title: 'Confined Space Entry', slug: 'PTW-002', status: 'IN_PROGRESS', ownerName: 'Bob Smith', createdAt: '2026-07-25', locationName: 'Warehouse B' }
            ],
            nextCursor: null
          })
        }),
        {
          useInfiniteQuery: () => ({
            data: { pages: [{ result: [
              { id: 'p1', title: 'Hot Work in Boiler Room', slug: 'PTW-001', status: 'COMPLETED', ownerName: 'Alice Johnson', createdAt: '2026-07-20', locationName: 'Main Site' },
              { id: 'p2', title: 'Confined Space Entry', slug: 'PTW-002', status: 'IN_PROGRESS', ownerName: 'Bob Smith', createdAt: '2026-07-25', locationName: 'Warehouse B' }
            ] }] },
            isLoading: false,
            hasNextPage: false,
            fetchNextPage: () => {},
            isFetchingNextPage: false,
            isFetchedAfterMount: true
          })
        }
      )
    },
    getByInstanceId: {
      useQuery: (config: any) => createMockQuery({
        id: config.id,
        instanceId: config.id,
        title: 'Hot Work in Boiler Room',
        slug: 'PTW-001',
        status: 'COMPLETED',
        version: '1.0',
        type: 'Hot Work',
        owner: { id: 'u1', fullName: 'Alice Johnson' },
        issuer: { id: 'u2', fullName: 'Bob Smith' },
        location: { id: 'loc1', name: 'Main Site > Boiler Room' },
        createdAt: '2026-07-20',
        updatedAt: '2026-07-22',
        reviewDate: '2026-10-20',
        startDate: '2026-07-21',
        endDate: '2026-07-21',
        scope: 'Welding and cutting on steam line pipe.',
        emergencyContact: 'John Emergency (555-0199)',
        sectionGroups: {
          general: [{ label: 'Work Area Inspected', value: 'Yes' }],
          step: [{ label: 'Fire Watch Posted', value: 'Yes' }],
          checklist: [{ label: 'Fire Extinguisher Present', value: 'Yes' }]
        },
        approvers: [
          { approverId: 'u1', approverName: 'Alice Johnson', role: 'Safety Manager', approvedAt: '2026-07-22' }
        ],
        checklists: [],
        workOrders: [],
        pms: [],
        media: [],
        notes: 'Strict adherence to fire safety protocols.'
      })
    },
    getByInstanceIdForEdit: {
      useQuery: (config: any) => createMockQuery({
        id: config.id,
        instanceId: config.id,
        title: 'Hot Work in Boiler Room',
        slug: 'PTW-001',
        status: 'COMPLETED',
        version: '1.0',
        ownerId: 'u1',
        issuerId: 'u2',
        locationId: 'loc1',
        type: 'Hot Work',
        scope: 'Welding and cutting on steam line pipe.',
        reviewDate: '2026-10-20',
        startDate: '2026-07-21',
        endDate: '2026-07-21',
        emergencyContact: 'John Emergency (555-0199)',
        approverFlow: 'parallel',
        sections: [
          { serial: 1, label: 'Work Area Inspected', type: 'general' }
        ],
        approvers: [{ approverId: 'u1', serial: 1, role: 'Safety Manager', isSignatureRequired: true }]
      })
    },
    create: { useMutation: () => createMockMutation() },
    update: { useMutation: () => createMockMutation() },
    export: { useMutation: () => createMockMutation() }
  },
  sop: {
    list: {
      infiniteOptions: Object.assign(
        (config?: any) => ({
          queryKey: ['sops', config],
          queryFn: () => ({
            result: [
              { id: 's1', title: 'Boiler Operation Standard', slug: 'SOP-001', status: 'COMPLETED', ownerName: 'Alice Johnson', createdAt: '2026-07-20', locationName: 'Main Site' },
              { id: 's2', title: 'Forklift Safety Guide', slug: 'SOP-002', status: 'IN_PROGRESS', ownerName: 'Bob Smith', createdAt: '2026-07-25', locationName: 'Warehouse B' }
            ],
            nextCursor: null
          })
        }),
        {
          useInfiniteQuery: () => ({
            data: { pages: [{ result: [
              { id: 's1', title: 'Boiler Operation Standard', slug: 'SOP-001', status: 'COMPLETED', ownerName: 'Alice Johnson', createdAt: '2026-07-20', locationName: 'Main Site' },
              { id: 's2', title: 'Forklift Safety Guide', slug: 'SOP-002', status: 'IN_PROGRESS', ownerName: 'Bob Smith', createdAt: '2026-07-25', locationName: 'Warehouse B' }
            ] }] },
            isLoading: false,
            hasNextPage: false,
            fetchNextPage: () => {},
            isFetchingNextPage: false,
            isFetchedAfterMount: true
          })
        }
      )
    },
    getByInstanceId: {
      useQuery: (config: any) => createMockQuery({
        id: config.id,
        instanceId: config.id,
        title: 'Boiler Operation Standard',
        slug: 'SOP-001',
        status: 'COMPLETED',
        version: '1.0',
        purpose: 'Standard procedure for safe boiler startup and operation.',
        responsibilities: 'Operators must follow all steps. Supervisors verify compliance.',
        owner: { id: 'u1', fullName: 'Alice Johnson' },
        location: { id: 'loc1', name: 'Main Site > Boiler Room' },
        createdAt: '2026-07-20',
        updatedAt: '2026-07-22',
        reviewDate: '2026-10-20',
        sectionGroups: {
          general: [{ label: 'References', value: 'Manufacturer Manual V2' }],
          pre_procedure: [{ label: 'Check pressure', value: 'Must be below 5 bar' }],
          procedure: [{ label: 'Ignite burner', value: 'Hold button for 5s' }],
          post_procedure: [{ label: 'Log activity', value: 'Record in daily log' }],
          step: [{ label: 'High Heat', value: 'Hazardous step' }],
          emergency: [{ label: 'Emergency Shutdown', value: 'Pull red lever' }]
        },
        approvers: [
          { approverId: 'u1', approverName: 'Alice Johnson', role: 'Safety Manager', approvedAt: '2026-07-22' }
        ],
        checklists: [],
        workOrders: [],
        pms: [],
        media: [],
        notes: 'Review monthly.'
      })
    },
    getByInstanceIdForEdit: {
      useQuery: (config: any) => createMockQuery({
        id: config.id,
        instanceId: config.id,
        title: 'Boiler Operation Standard',
        slug: 'SOP-001',
        status: 'COMPLETED',
        version: '1.0',
        ownerId: 'u1',
        locationId: 'loc1',
        notes: 'Review monthly.',
        approverFlow: 'parallel',
        sections: [
          { serial: 1, label: 'Ignite burner', type: 'procedure' }
        ],
        approvers: [{ approverId: 'u1', serial: 1, role: 'Safety Manager', isSignatureRequired: true }],
        linkedEntities: { jha: [] }
      })
    },
    create: { useMutation: () => createMockMutation() },
    update: { useMutation: () => createMockMutation() },
    export: { useMutation: () => createMockMutation() }
  },
  oshaReport: {
    list: {
      infiniteOptions: Object.assign(
        (config?: any) => ({
          queryKey: ['oshaReports', config],
          queryFn: () => ({
            result: [
              { id: 'o1', slug: 'OSHA-2026-001', employeeName: 'Alice Johnson', status: 'COMPLETED', createdAt: '2026-07-20', oshaLocationName: 'Main Site', daysAway: 5 },
              { id: 'o2', slug: 'OSHA-2026-002', employeeName: 'Bob Smith', status: 'IN_PROGRESS', createdAt: '2026-07-25', oshaLocationName: 'Warehouse B', daysAway: 0 }
            ],
            nextCursor: null
          })
        }),
        {
          useInfiniteQuery: () => ({
            data: { pages: [{ result: [
              { id: 'o1', slug: 'OSHA-2026-001', employeeName: 'Alice Johnson', status: 'COMPLETED', createdAt: '2026-07-20', oshaLocationName: 'Main Site', daysAway: 5 },
              { id: 'o2', slug: 'OSHA-2026-002', employeeName: 'Bob Smith', status: 'IN_PROGRESS', createdAt: '2026-07-25', oshaLocationName: 'Warehouse B', daysAway: 0 }
            ] }] },
            isLoading: false,
            hasNextPage: false,
            fetchNextPage: () => {},
            isFetchingNextPage: false,
            isFetchedAfterMount: true
          })
        }
      )
    },
    getByIdForEdit: {
      useQuery: (config: any) => createMockQuery({
        id: config.id,
        slug: 'OSHA-2026-001',
        employeeName: 'Alice Johnson',
        employeeJobTitle: 'Operator',
        employeeWorkLocation: 'Boiler Room',
        employeeDepartment: 'Maintenance',
        employeeDateOfHire: '2020-01-01',
        employeeShift: 'day_shift',
        oshaLocationId: 'loc1',
        privacyCase: false,
        bodyPartInjured: 'Lower Back',
        typeOfInjury: 'Strain',
        treatmentLocation: 'City Hospital',
        typeOfMedicalCare: 'emergency_room',
        wasHospitalized: true,
        wasDeceased: false,
        daysAwayFromWork: 5,
        daysRestrictedFromWork: 2,
        type: 'injury',
        eventId: 'e1'
      })
    },
    create: { useMutation: () => createMockMutation() },
    update: { useMutation: () => createMockMutation() },
    export: { useMutation: () => createMockMutation() }
  },
  oshaSummary: {
    getEstablishmentInformation: {
      useQuery: (config: any) => createMockQuery({
        id: 'est1',
        establishmentName: 'Main Factory',
        companyName: 'SafetyFirst Corp',
        address: '123 Industrial Way',
        city: 'Safety City',
        state: 'CA',
        zip: '90210',
        industryDescription: 'Manufacturing',
        naicsCode: '333333',
        ein: '12-3456789',
        archivedAt: null
      })
    },
    getOshaCasesSummary: {
      useQuery: (config: any) => createMockQuery({
        totalDeaths: 0,
        totalCasesWithDaysAway: 12,
        totalCasesWithJobTransfer: 5,
        totalOtherRecordableCases: 8,
        totalDaysAway: 145,
        totalDaysJobTransfer: 60,
        totalInjuries: 20,
        totalSkinDisorders: 1,
        totalRespiratoryConditions: 2,
        totalPoisonings: 0,
        totalHearingLoss: 1,
        totalOtherIllnesses: 1
      })
    }
  },
  oshaAuditTrail: {
    create: { useMutation: () => createMockMutation() }
  },
  workOrder: {
    getByCapa: {
      useQuery: (config?: any) => createMockQuery([])
    },
    getWorkOrderById: {
      useQuery: (config: any) => createMockQuery({
        id: config.workOrderId,
        workOrderNumber: 'WO-5001',
        mainDescription: 'Repair broken safety railing',
        currentStatus: 'open',
        priorityNumber: 1,
        dueDate: '2026-08-01',
        createdAt: '2026-07-20',
        duration: 120,
        categoryType: 'Safety Repair',
        note: 'The railing on the second floor walkway is loose and poses a fall risk.',
        userAssignedTo: { id: 'u1', firstName: 'John', lastName: 'Technician', username: 'john_tech' },
        objectLocationForWorkOrder: { objectId: 'loc1', stringName: 'Main Factory > Second Floor' },
        objectAsset: { objectId: 'a1', Name: 'Walkway Railing', Description: 'Standard safety railing' },
        analysis: { analysis: { summary: 'This work order is critical for fall prevention.' } },
        linkedEntities: [{ entityType: 'audit', entityInstanceId: 'audit1', isLatest: true }]
      })
    },
    enqueueAnalysis: { useMutation: () => createMockMutation() }
  },
  linkedEntities: {
    getWorkOrderLinkedEntities: {
      useQuery: (config: any) => createMockQuery([
        { id: 'wo1', workOrderNumber: 'WO-5001', mainDescription: 'Repair safety railing', currentStatus: 'open', priorityNumber: 1, dueDate: '2026-08-01' },
        { id: 'wo2', workOrderNumber: 'WO-5002', mainDescription: 'Replace fire extinguisher', currentStatus: 'in_progress', priorityNumber: 2, dueDate: '2026-07-30' }
      ])
    }
  },
  sds: {
    list: {
      infiniteOptions: Object.assign(
        (config?: any) => ({
          queryKey: ['sds', config],
          queryFn: () => ({
            result: [
              { id: 'sd1', product: 'Acetone', manufacturer: 'ChemCo', slug: 'SDS-001', status: 'COMPLETED', createdAt: '2026-07-20' },
              { id: 'sd2', product: 'Sulfuric Acid', manufacturer: 'Global Chem', slug: 'SDS-002', status: 'COMPLETED', createdAt: '2026-07-25' }
            ],
            nextCursor: null
          })
        }),
        {
          useInfiniteQuery: () => ({
            data: { pages: [{ result: [
              { id: 'sd1', product: 'Acetone', manufacturer: 'ChemCo', slug: 'SDS-001', status: 'COMPLETED', createdAt: '2026-07-20' },
              { id: 'sd2', product: 'Sulfuric Acid', manufacturer: 'Global Chem', slug: 'SDS-002', status: 'COMPLETED', createdAt: '2026-07-25' }
            ] }] },
            isLoading: false,
            hasNextPage: false,
            fetchNextPage: () => {},
            isFetchingNextPage: false,
            isFetchedAfterMount: true
          })
        }
      )
    },
    getById: {
      useQuery: (config: any) => createMockQuery({
        id: config.id,
        product: 'Acetone',
        manufacturer: 'ChemCo',
        slug: 'SDS-001',
        status: 'COMPLETED',
        signalWord: 'danger',
        pictograms: ['flammable', 'irritant'],
        revisionDate: '2025-05-15',
        firstAid: { eyes: 'Flush with water for 15 mins.', skin: 'Wash with soap.', inhalation: 'Move to fresh air.', ingestion: 'Do not induce vomiting.' },
        ppe: ['Safety glasses', 'Gloves', 'Ventilation'],
        storageHandling: { storage: ['Keep in cool area.'], handling: ['Avoid static spark.'] },
        appearance: 'Clear liquid',
        flashPoint: '-20°C',
        phValue: '7.0',
        tags: ['Solvent', 'Lab'],
        internalNotes: 'Highly flammable.',
        fullSdsData: { 'section1': { 'productName': 'Acetone' } }
      })
    },
    getTags: { useQuery: () => createMockQuery(['Solvent', 'Acid', 'Base']) },
    updateUserFields: { useMutation: () => createMockMutation() }
  },
  auditTrail: {
    get: { invalidate: () => {} }
  },
  subscription: {
    getCurrentUsage: {
      useQuery: () => createMockQuery({
        paidSeatCount: 8,
        freeSeatCount: 2,
        paidSeatLimit: 10,
        availablePaidSeats: 2,
        contracted: 10,
        overage: 0,
        lastRequest: null
      })
    },
    getUserManagementSeatSummary: { invalidate: () => {} },
    requestSeatExpansion: {
      useMutation: () => createMockMutation()
    }
  },
  ehsRole: {
    list: {
      useQuery: () => createMockQuery([
        { id: 'r1', name: 'Global Admin', systemRoleKey: 'global_admin', permissions: [{ key: 'admin.manage_users' }], activeUserCount: 2 },
        { id: 'r2', name: 'Technician', systemRoleKey: 'technician', permissions: [], activeUserCount: 6 }
      ])
    }
  },
  accessPoint: {
    list: {
      infiniteOptions: Object.assign(
        (config?: any) => ({
          queryKey: ['accessPoints', config],
          queryFn: () => ({
            result: [
              { id: 'ap1', name: 'Main Entrance QR', status: 'active', createdAt: '2026-07-20', location: { name: 'Main Site' }, upkeepCompanyId: 'c1', type: 'both' },
              { id: 'ap2', name: 'Warehouse B Hazard Report', status: 'active', createdAt: '2026-07-25', location: { name: 'Warehouse B' }, upkeepCompanyId: 'c1', type: 'event' }
            ],
            nextCursor: null
          })
        }),
        {
          useInfiniteQuery: () => ({
            data: { pages: [{ result: [
              { id: 'ap1', name: 'Main Entrance QR', status: 'active', createdAt: '2026-07-20', location: { name: 'Main Site' }, upkeepCompanyId: 'c1', type: 'both' },
              { id: 'ap2', name: 'Warehouse B Hazard Report', status: 'active', createdAt: '2026-07-25', location: { name: 'Warehouse B' }, upkeepCompanyId: 'c1', type: 'event' }
            ] }] },
            isLoading: false,
            hasNextPage: false,
            fetchNextPage: () => {},
            isFetchingNextPage: false,
            isFetchedAfterMount: true
          })
        }
      )
    },
    getById: {
      useQuery: (config: any) => createMockQuery({
        id: config.id,
        name: 'Main Entrance QR',
        status: 'active',
        createdAt: '2026-07-20',
        locationId: 'loc1',
        location: { id: 'loc1', name: 'Main Site' },
        upkeepCompanyId: 'c1',
        type: 'both',
        eventFormTemplateIds: ['eft1'],
        teamMembersToNotify: ['u1']
      })
    },
    getByIdPublic: {
      useQuery: (config: any) => createMockQuery({
        id: config.id,
        name: 'Main Entrance QR',
        description: 'Scan to report safety events or view site documents.',
        status: 'active',
        createdAt: '2026-07-20',
        locationId: 'loc1',
        location: { id: 'loc1', name: 'Main Site' },
        upkeepCompanyId: 'c1',
        type: 'both',
        eventFormTemplates: [
          { id: 'eft1', name: 'General Incident Report', description: 'Standard form for all safety incidents.' }
        ],
        documents: {
          jha: [{ id: 'j1', title: 'High Height Maintenance', slug: 'JHA-001' }],
          sop: [{ id: 's1', title: 'Boiler Operation Standard', slug: 'SOP-001' }],
          loto: [{ id: 'l1', title: 'Main Power Isolation', slug: 'LOTO-001' }],
          ptw: [{ id: 'p1', title: 'Hot Work in Boiler Room', slug: 'PTW-001' }],
          sds: [{ id: 'sd1', product: 'Acetone', manufacturer: 'ChemCo', slug: 'SDS-001' }]
        }
      })
    },
    recordDocumentationScan: { useMutation: () => createMockMutation() },
    create: { useMutation: () => createMockMutation() },
    update: { useMutation: () => createMockMutation() },
    delete: { useMutation: () => createMockMutation() },
    toggleArchive: { useMutation: () => createMockMutation() },
    export: { useMutation: () => createMockMutation() }
  },
  useUtils: () => ({
    eventFormTemplate: {
      getById: { invalidate: () => {} },
      list: { invalidate: () => {} },
      checkNameExists: { fetch: async () => ({ exists: false }) }
    },
    jha: { invalidate: () => {} },
    loto: { invalidate: () => {} },
    disclaimer: { isAccepted: { invalidate: () => {} } },
    asset: { search: { invalidate: () => {} } }
  }),
  file: {
    removeFiles: { useMutation: () => createMockMutation() }
  },
  disclaimer: {
    isAccepted: { useQuery: () => createMockQuery(true) },
    accept: { useMutation: () => createMockMutation() }
  },
  companyMetadata: {
    get: { useQuery: () => createMockQuery({ name: 'UpKeep Manufacturing' }) }
  }
};
