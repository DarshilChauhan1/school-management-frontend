import type { ApiResponse } from "@/types/api";

export type SchoolManagementType =
  | "GOVERNMENT"
  | "GOVERNMENT_AIDED"
  | "PRIVATE_UNAIDED"
  | "KENDRIYA_VIDYALAYA"
  | "NAVODAYA_VIDYALAYA"
  | "SAINIK_SCHOOL"
  | "INTERNATIONAL"
  | "SPECIAL_NEEDS";

export type SchoolLevel =
  | "PRE_PRIMARY"
  | "PRIMARY"
  | "UPPER_PRIMARY"
  | "SECONDARY"
  | "SENIOR_SECONDARY"
  | "ELEMENTARY"
  | "HIGH_SCHOOL"
  | "K12"
  | "K12_WITH_PRE_PRIMARY";

export type SchoolGenderType = "CO_EDUCATION" | "BOYS_ONLY" | "GIRLS_ONLY";

export type MediumOfInstruction =
  | "ENGLISH"
  | "HINDI"
  | "GUJARATI"
  | "MARATHI"
  | "TAMIL"
  | "TELUGU"
  | "KANNADA"
  | "MALAYALAM"
  | "BENGALI"
  | "PUNJABI"
  | "ODIA"
  | "ASSAMESE"
  | "URDU"
  | "SANSKRIT"
  | "BILINGUAL_ENGLISH_HINDI"
  | "BILINGUAL_ENGLISH_REGIONAL"
  | "TRILINGUAL"
  | "OTHER";

export type BoardAffiliation =
  | "CBSE"
  | "CISCE_ICSE"
  | "IB"
  | "CAMBRIDGE_IGCSE"
  | "STATE_BOARD"
  | "NIOS"
  | "UNAFFILIATED";

export type LegalEntityType =
  | "REGISTERED_TRUST"
  | "REGISTERED_SOCIETY"
  | "SECTION_8_COMPANY"
  | "GOVERNMENT_BODY";

export type AffiliationStatus =
  | "PROVISIONAL"
  | "PERMANENT"
  | "APPLIED_PENDING"
  | "RENEWAL_PENDING"
  | "EXPIRED"
  | "STATE_ONLY"
  | "NOT_APPLICABLE";

export type OnboardingStep =
  | "SCHOOL_TYPE"
  | "LEGAL_ENTITY"
  | "BOARD_IDENTITY"
  | "DOCUMENTS"
  | "INFRASTRUCTURE"
  | "CONFIGURATION"
  | "COMPLETED";

export type OnboardingStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "PENDING_REVIEW"
  | "CHANGES_REQUESTED"
  | "APPROVED"
  | "REJECTED"
  | "SUSPENDED";

export type DocumentType =
  | "TRUST_SOCIETY_REGISTRATION"
  | "MEMORANDUM_OF_ASSOCIATION"
  | "ENTITY_PAN_CARD"
  | "STATE_RECOGNITION_CERTIFICATE"
  | "BOARD_AFFILIATION_CERTIFICATE"
  | "NOC_FROM_STATE_GOVT"
  | "LAND_OWNERSHIP_DEED"
  | "BUILDING_PLAN_APPROVAL"
  | "FIRE_SAFETY_NOC"
  | "STRUCTURAL_SAFETY_CERTIFICATE"
  | "RTE_SECTION_12_DECLARATION"
  | "CHILD_PROTECTION_POLICY"
  | "STAFF_EPF_CHALLAN"
  | "SCHOOL_LOGO"
  | "INFRASTRUCTURE_PHOTOS";

export type AcademicYearStart = "APRIL" | "JUNE" | "JANUARY";
export type GradingSystem =
  | "CBSE_10_POINT_GPA"
  | "PERCENTAGE_100"
  | "LETTER_GRADES"
  | "IB_GRADING"
  | "IGCSE_GRADING"
  | "CUSTOM";

export interface OnboardingProgressItem {
  step: OnboardingStep;
  isCompleted: boolean;
  isSkipped: boolean;
  validationPassed: boolean | null;
  completedAt: string | null;
}

export interface OnboardingOverview {
  schoolId: string | null;
  status: OnboardingStatus;
  currentStep: OnboardingStep;
  startedAt: string | null;
  submittedAt: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  progress: OnboardingProgressItem[];
}

export interface Step1SchoolRequest {
  officialName: string;
  displayName?: string;
  managementType: SchoolManagementType;
  level: SchoolLevel;
  genderType?: SchoolGenderType;
  mediumOfInstruction?: MediumOfInstruction;
  primaryBoard?: BoardAffiliation;
  stateBoardName?: string;
  yearEstablished?: number;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  officialEmail: string;
  landlineNumber?: string;
  website?: string;
}

export interface Step2LegalEntityRequest {
  entityType: LegalEntityType;
  registeredName: string;
  registrationNumber: string;
  registrationDate?: string;
  registeringAuthority?: string;
  registrationState?: string;
  registrationCity?: string;
  panNumber?: string;
  twelveARegistered?: boolean;
  eightyGRegistered?: boolean;
  bankName?: string;
  bankAccountNumber?: string;
  bankIfscCode?: string;
  bankAccountType?: string;
  chairpersonName?: string;
  secretaryName?: string;
  isMinorityInstitution?: boolean;
  minorityCommunity?: string;
  signatoryName: string;
  signatoryDesignation: string;
  signatoryMobile: string;
  signatoryEmail: string;
  signatoryAadhaarLast4?: string;
}

export interface BoardAffiliationItem {
  board: BoardAffiliation;
  stateBoardName?: string;
  affiliationNumber?: string;
  affiliationStatus: AffiliationStatus;
  affiliationType?: string;
  classFrom?: number;
  classTo?: number;
  affiliationValidFrom?: string;
  affiliationValidTo?: string;
  renewalDueDate?: string;
  boardPortalUserId?: string;
  boardPortalSchoolCode?: string;
  isPrimary?: boolean;
}

export interface Step3BoardRequest {
  affiliations: BoardAffiliationItem[];
  udisePlusCode?: string;
  disCode?: string;
}

export interface SchoolDocumentItem {
  documentType: DocumentType;
  uploadedFileId: string;
  isConditional?: boolean;
  conditionalReason?: string;
}

export interface Step4DocumentsRequest {
  documents: SchoolDocumentItem[];
}

export interface Step5InfrastructureRequest {
  totalLandAcres?: number;
  builtUpAreaSqFt?: number;
  landOwnershipType?: string;
  numberOfClassrooms?: number;
  avgClassroomSqFt?: number;
  smartClassrooms?: number;
  hasPhysicsLab?: boolean;
  hasChemistryLab?: boolean;
  hasBiologyLab?: boolean;
  hasComputerLab?: boolean;
  computerLabCount?: number;
  computersInLab?: number;
  hasLibrary?: boolean;
  libraryAreaSqFt?: number;
  totalBooks?: number;
  hasDigitalLibrary?: boolean;
  hasReadingRoom?: boolean;
  hasPlayground?: boolean;
  playgroundAreaSqFt?: number;
  sportsAvailable?: string[];
  hasDrinkingWater?: boolean;
  waterSourceType?: string;
  boysToiletsCount?: number;
  girlsToiletsCount?: number;
  staffToiletsCount?: number;
  hasRampAccess?: boolean;
  hasCctv?: boolean;
  cctvCameraCount?: number;
  hasFireExtinguishers?: boolean;
  hasSecurityGuard?: boolean;
  hasBoundaryWall?: boolean;
  hasPowerBackup?: boolean;
  powerBackupType?: string;
  hasInternetConnection?: boolean;
  internetType?: string;
  internetSpeedMbps?: number;
  hasBusService?: boolean;
  totalBusCount?: number;
  busRoutesCount?: number;
  totalStudentCapacity?: number;
  currentEnrollment?: number;
  totalTeachingStaff?: number;
  totalNonTeachingStaff?: number;
  annualFeeMin?: number;
  annualFeeMax?: number;
}

export interface Step6ConfigurationRequest {
  academicYearStart?: AcademicYearStart;
  currentAcademicYear?: string;
  schoolStartTime?: string;
  schoolEndTime?: string;
  workingDaysPerWeek?: number;
  numberOfTerms?: number;
  periodsPerDay?: number;
  periodDurationMinutes?: number;
  gradingSystem?: GradingSystem;
  passingPercentage?: number;
  attendanceThresholdPct?: number;
  lowAttendanceAlertPct?: number;
  ewsSeatsPercentage?: number;
  isRteCompliant?: boolean;
  smsEnabled?: boolean;
  emailEnabled?: boolean;
  whatsappEnabled?: boolean;
  pushNotificationsEnabled?: boolean;
  parentAbsenceAlertDelayMins?: number;
  feeReminderDaysBefore?: number;
  documentExpiryReminderDays?: number;
  portalPrimaryColor?: string;
  portalSecondaryColor?: string;
  paymentGateway?: string;
  timezone?: string;
  locale?: string;
  currencyCode?: string;
  currencySymbol?: string;
  dateFormat?: string;
  featureAttendance?: boolean;
  featureExams?: boolean;
  featureLibrary?: boolean;
  featureTransport?: boolean;
  featureFeeOnline?: boolean;
  featureHomework?: boolean;
  featureGps?: boolean;
}

export interface PresignUploadRequest {
  filename: string;
  mimeType: string;
  sizeBytes: number;
  scope: "school_document" | "avatar" | "general";
  schoolId?: string;
}

export interface PresignUploadResult {
  uploadedFileId: string;
  uploadUrl: string;
  storageKey: string;
  expiresInSeconds: number;
}

export interface ConfirmUploadRequest {
  uploadedFileId: string;
}

export interface ConfirmUploadResult {
  uploadedFileId: string;
  confirmed: boolean;
  sizeBytes: number;
}

export interface SubmitOnboardingResult {
  schoolId: string;
  status: OnboardingStatus;
  message: string;
}

export type OnboardingOverviewResponse = ApiResponse<OnboardingOverview>;
export type SubmitOnboardingResponse = ApiResponse<SubmitOnboardingResult>;
