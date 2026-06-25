"use client";

import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  Check,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Landmark,
  Loader2,
  Mail,
  MapPin,
  Paperclip,
  Save,
  School,
  Settings,
  ShieldCheck,
  Upload,
  Users,
  Wallet,
  Wifi,
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import {
  useConfirmUpload,
  useOnboardingOverview,
  usePresignUpload,
  useSaveStep1,
  useSaveStep2,
  useSaveStep3,
  useSaveStep4,
  useSaveStep5,
  useSaveStep6,
  useSubmitOnboarding,
} from "../api/use-onboarding";
import type {
  BoardAffiliation,
  DocumentType,
  LegalEntityType,
  MediumOfInstruction,
  OnboardingStep,
  SchoolDocumentItem,
  SchoolGenderType,
  SchoolLevel,
  Step1SchoolRequest,
  Step2LegalEntityRequest,
  Step3BoardRequest,
  Step5InfrastructureRequest,
  Step6ConfigurationRequest,
} from "../api/onboarding.types";

const STEPS: Array<{
  key: OnboardingStep;
  title: string;
  short: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    key: "SCHOOL_TYPE",
    title: "School profile",
    short: "Profile",
    description: "Classification, address and primary contact",
    icon: School,
  },
  {
    key: "LEGAL_ENTITY",
    title: "Legal entity",
    short: "Legal",
    description: "Trust, society, Section 8 and signatory details",
    icon: Landmark,
  },
  {
    key: "BOARD_IDENTITY",
    title: "Board identity",
    short: "Board",
    description: "Affiliation, UDISE+ and board portal details",
    icon: Award,
  },
  {
    key: "DOCUMENTS",
    title: "Documents",
    short: "Docs",
    description: "Compliance uploads and document slots",
    icon: Paperclip,
  },
  {
    key: "INFRASTRUCTURE",
    title: "Infrastructure",
    short: "Infra",
    description: "Campus, facilities, safety and capacity",
    icon: Building2,
  },
  {
    key: "CONFIGURATION",
    title: "Configuration",
    short: "Config",
    description: "Academic defaults, notifications and features",
    icon: Settings,
  },
];

const STEP_INDEX: Record<OnboardingStep, number> = {
  SCHOOL_TYPE: 0,
  LEGAL_ENTITY: 1,
  BOARD_IDENTITY: 2,
  DOCUMENTS: 3,
  INFRASTRUCTURE: 4,
  CONFIGURATION: 5,
  COMPLETED: 5,
};

const DOCUMENTS: Array<{
  type: DocumentType;
  label: string;
  description: string;
  required: boolean;
}> = [
  {
    type: "TRUST_SOCIETY_REGISTRATION",
    label: "Trust / Society registration",
    description: "Original registration certificate from the registering authority.",
    required: true,
  },
  {
    type: "MEMORANDUM_OF_ASSOCIATION",
    label: "Trust deed / MoA",
    description: "Governing document for the managing entity.",
    required: true,
  },
  {
    type: "ENTITY_PAN_CARD",
    label: "PAN card of entity",
    description: "Permanent Account Number of Trust, Society or Company.",
    required: true,
  },
  {
    type: "STATE_RECOGNITION_CERTIFICATE",
    label: "State recognition certificate",
    description: "RTE Section 18 recognition from State / UT authority.",
    required: true,
  },
  {
    type: "BOARD_AFFILIATION_CERTIFICATE",
    label: "Board affiliation certificate",
    description: "CBSE, CISCE or state board affiliation letter.",
    required: true,
  },
  {
    type: "NOC_FROM_STATE_GOVT",
    label: "State Government NOC",
    description: "Required by CBSE and CISCE for national affiliation.",
    required: false,
  },
  {
    type: "FIRE_SAFETY_NOC",
    label: "Fire safety NOC",
    description: "Current fire department clearance.",
    required: true,
  },
  {
    type: "CHILD_PROTECTION_POLICY",
    label: "Child protection policy",
    description: "Safeguarding, POCSO and ICC details.",
    required: true,
  },
  {
    type: "SCHOOL_LOGO",
    label: "School logo",
    description: "PNG or JPG used on reports and receipts.",
    required: true,
  },
];

const initialStep1: Step1SchoolRequest = {
  officialName: "Northfield Academy",
  displayName: "Northfield",
  managementType: "PRIVATE_UNAIDED",
  level: "K12",
  genderType: "CO_EDUCATION",
  mediumOfInstruction: "ENGLISH",
  primaryBoard: "CBSE",
  yearEstablished: 1998,
  addressLine1: "24 Residency Road",
  city: "Bengaluru",
  district: "Bengaluru Urban",
  state: "Karnataka",
  pincode: "560001",
  officialEmail: "principal@northfield.edu",
  website: "https://northfield.edu",
};

const initialStep2: Step2LegalEntityRequest = {
  entityType: "REGISTERED_TRUST",
  registeredName: "Northfield Education Trust",
  registrationNumber: "TR/KA/1998/142",
  registrationDate: "1998-06-15",
  registeringAuthority: "Sub-Registrar, Bengaluru",
  registrationState: "Karnataka",
  registrationCity: "Bengaluru",
  panNumber: "AAACT1234A",
  twelveARegistered: true,
  eightyGRegistered: false,
  bankName: "HDFC Bank",
  bankAccountNumber: "50100123456789",
  bankIfscCode: "HDFC0001234",
  bankAccountType: "Current",
  chairpersonName: "Priya Anand",
  secretaryName: "Dr. Ravi Menon",
  isMinorityInstitution: false,
  signatoryName: "Priya Anand",
  signatoryDesignation: "Principal",
  signatoryMobile: "+919876543210",
  signatoryEmail: "principal@northfield.edu",
  signatoryAadhaarLast4: "1234",
};

const initialStep3: Step3BoardRequest = {
  udisePlusCode: "29200112345",
  affiliations: [
    {
      board: "CBSE",
      affiliationNumber: "830142",
      affiliationStatus: "PROVISIONAL",
      affiliationType: "Senior Secondary",
      classFrom: 1,
      classTo: 12,
      affiliationValidFrom: "2024-04-01",
      affiliationValidTo: "2027-03-31",
      renewalDueDate: "2026-12-31",
      boardPortalSchoolCode: "NA-BLR-142",
      isPrimary: true,
    },
  ],
};

const initialStep5: Step5InfrastructureRequest = {
  totalLandAcres: 2.5,
  builtUpAreaSqFt: 45000,
  landOwnershipType: "OWNED",
  numberOfClassrooms: 40,
  avgClassroomSqFt: 500,
  smartClassrooms: 18,
  hasPhysicsLab: true,
  hasChemistryLab: true,
  hasBiologyLab: true,
  hasComputerLab: true,
  computerLabCount: 2,
  computersInLab: 64,
  hasLibrary: true,
  libraryAreaSqFt: 1800,
  totalBooks: 12400,
  hasDigitalLibrary: true,
  hasReadingRoom: true,
  hasPlayground: true,
  playgroundAreaSqFt: 28000,
  sportsAvailable: ["Football", "Basketball", "Athletics"],
  hasDrinkingWater: true,
  waterSourceType: "RO",
  boysToiletsCount: 18,
  girlsToiletsCount: 18,
  staffToiletsCount: 6,
  hasRampAccess: true,
  hasCctv: true,
  cctvCameraCount: 48,
  hasFireExtinguishers: true,
  hasSecurityGuard: true,
  hasBoundaryWall: true,
  hasPowerBackup: true,
  powerBackupType: "DG_SET",
  hasInternetConnection: true,
  internetType: "FIBER",
  internetSpeedMbps: 300,
  hasBusService: true,
  totalBusCount: 12,
  busRoutesCount: 9,
  totalStudentCapacity: 1400,
  currentEnrollment: 1284,
  totalTeachingStaff: 87,
  totalNonTeachingStaff: 32,
  annualFeeMin: 40000,
  annualFeeMax: 120000,
};

const initialStep6: Step6ConfigurationRequest = {
  academicYearStart: "APRIL",
  currentAcademicYear: "2026-2027",
  schoolStartTime: "08:00",
  schoolEndTime: "14:30",
  workingDaysPerWeek: 6,
  numberOfTerms: 2,
  periodsPerDay: 8,
  periodDurationMinutes: 45,
  gradingSystem: "CBSE_10_POINT_GPA",
  passingPercentage: 33,
  attendanceThresholdPct: 75,
  lowAttendanceAlertPct: 85,
  ewsSeatsPercentage: 25,
  isRteCompliant: true,
  smsEnabled: true,
  emailEnabled: true,
  whatsappEnabled: false,
  pushNotificationsEnabled: true,
  parentAbsenceAlertDelayMins: 30,
  feeReminderDaysBefore: 7,
  documentExpiryReminderDays: 30,
  portalPrimaryColor: "#059669",
  portalSecondaryColor: "#d1fae5",
  paymentGateway: "RAZORPAY",
  timezone: "Asia/Kolkata",
  locale: "en-IN",
  currencyCode: "INR",
  currencySymbol: "₹",
  dateFormat: "DD/MM/YYYY",
  featureAttendance: true,
  featureExams: true,
  featureLibrary: true,
  featureTransport: true,
  featureFeeOnline: true,
  featureHomework: true,
  featureGps: false,
};

export function OnboardingJourney() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const overviewQuery = useOnboardingOverview();
  const [activeStep, setActiveStep] = useState(0);
  const [step1, setStep1] = useState<Step1SchoolRequest>(initialStep1);
  const [step2, setStep2] = useState<Step2LegalEntityRequest>(initialStep2);
  const [step3, setStep3] = useState<Step3BoardRequest>(initialStep3);
  const [docs, setDocs] = useState<SchoolDocumentItem[]>([]);
  const [uploadingType, setUploadingType] = useState<DocumentType | null>(null);
  const [step5, setStep5] = useState<Step5InfrastructureRequest>(initialStep5);
  const [step6, setStep6] = useState<Step6ConfigurationRequest>(initialStep6);

  const saveStep1 = useSaveStep1();
  const saveStep2 = useSaveStep2();
  const saveStep3 = useSaveStep3();
  const saveStep4 = useSaveStep4();
  const saveStep5 = useSaveStep5();
  const saveStep6 = useSaveStep6();
  const submit = useSubmitOnboarding();
  const presign = usePresignUpload();
  const confirm = useConfirmUpload();

  const overview = overviewQuery.data?.data;
  const currentServerStep = overview?.currentStep ?? "SCHOOL_TYPE";
  const progressMap = useMemo(
    () => new Map(overview?.progress.map((p) => [p.step, p]) ?? []),
    [overview],
  );
  const completedCount = STEPS.filter((s) => progressMap.get(s.key)?.isCompleted).length;
  const visualStep = Math.max(activeStep, STEP_INDEX[currentServerStep] ?? 0);
  const schoolId = overview?.schoolId ?? user?.schoolId ?? undefined;
  const isLocked = overview?.status === "PENDING_REVIEW" || overview?.status === "APPROVED";

  const goNext = () => setActiveStep((s) => Math.min(s + 1, STEPS.length - 1));
  const goBack = () => setActiveStep((s) => Math.max(s - 1, 0));

  const saveCurrentStep = async () => {
    if (activeStep === 0) {
      const result = await saveStep1.mutateAsync(cleanPayload(step1));
      const school = result.data as { id?: string } | undefined;
      if (school?.id && user) setUser({ ...user, schoolId: school.id });
      goNext();
      return;
    }
    if (activeStep === 1) {
      await saveStep2.mutateAsync(cleanPayload(step2));
      goNext();
      return;
    }
    if (activeStep === 2) {
      await saveStep3.mutateAsync(cleanPayload(step3));
      goNext();
      return;
    }
    if (activeStep === 3) {
      await saveStep4.mutateAsync({ documents: docs });
      goNext();
      return;
    }
    if (activeStep === 4) {
      await saveStep5.mutateAsync(cleanPayload(step5));
      goNext();
      return;
    }
    await saveStep6.mutateAsync(cleanPayload(step6));
  };

  const handleSubmit = async () => {
    await saveStep6.mutateAsync(cleanPayload(step6));
    await submit.mutateAsync();
  };

  const uploadDocument = async (documentType: DocumentType, file: File) => {
    setUploadingType(documentType);
    try {
      const prepared = await presign.mutateAsync({
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        scope: "school_document",
        schoolId,
      });

      const uploadResponse = await fetch(prepared.data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Storage upload failed");
      }

      await confirm.mutateAsync({ uploadedFileId: prepared.data.uploadedFileId });
      setDocs((existing) => [
        ...existing.filter((d) => d.documentType !== documentType),
        {
          documentType,
          uploadedFileId: prepared.data.uploadedFileId,
          isConditional: !DOCUMENTS.find((d) => d.type === documentType)?.required,
        },
      ]);
    } finally {
      setUploadingType(null);
    }
  };

  const isSaving =
    saveStep1.isPending ||
    saveStep2.isPending ||
    saveStep3.isPending ||
    saveStep4.isPending ||
    saveStep5.isPending ||
    saveStep6.isPending ||
    submit.isPending;

  if (overviewQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-[280px] shrink-0 border-r bg-card px-4 py-5 lg:flex lg:flex-col">
        <BrandMark />
        <div className="mt-6 rounded-xl border bg-muted/50 p-4">
          <div className="text-xs font-medium text-muted-foreground">Onboarding progress</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-[-0.02em]">{completedCount}/6</span>
            <span className="text-xs font-semibold text-[var(--color-brand-700)]">
              {Math.round((completedCount / 6) * 100)}%
            </span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-teal-500)]"
              style={{ width: `${(completedCount / 6) * 100}%` }}
            />
          </div>
        </div>

        <nav className="mt-6 space-y-1" aria-label="Onboarding steps">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const completed = progressMap.get(step.key)?.isCompleted;
            const active = activeStep === index;
            return (
              <button
                key={step.key}
                type="button"
                onClick={() => setActiveStep(index)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                  active
                    ? "bg-[var(--color-brand-50)] text-[var(--color-brand-700)]"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{step.short}</span>
                  <span className="block truncate text-[11px] opacity-75">
                    {step.description}
                  </span>
                </span>
                {completed ? <Check className="size-4" /> : <span className="text-xs">{index + 1}</span>}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto rounded-xl border border-[var(--color-brand-200)] bg-[var(--color-brand-50)] p-4 text-[var(--color-brand-800)]">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-xs font-semibold">
            <ShieldCheck className="size-3.5" />
            India-ready setup
          </div>
          <p className="mt-3 text-xs leading-5">
            Covers UDISE+, RTE, affiliation, infrastructure and communication defaults.
          </p>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex min-h-[72px] items-center justify-between border-b bg-card px-5 py-4 lg:px-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Step {activeStep + 1} of 6
              {isLocked && <StatusPill tone="amber">Under review</StatusPill>}
            </div>
            <h1 className="mt-1 text-xl font-bold tracking-[-0.02em]">
              {STEPS[activeStep].title}
            </h1>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <Button variant="outline" onClick={() => void overviewQuery.refetch()}>
              Refresh
            </Button>
            <Button disabled={isSaving || isLocked} onClick={() => void saveCurrentStep()}>
              {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
              Save
            </Button>
          </div>
        </header>

        <div className="px-5 py-6 lg:px-8">
          <StatsStrip status={overview?.status ?? "NOT_STARTED"} activeStep={visualStep} />

          <div className="mt-6">
            {activeStep === 0 && <Step1 value={step1} onChange={setStep1} />}
            {activeStep === 1 && <Step2 value={step2} onChange={setStep2} />}
            {activeStep === 2 && <Step3 value={step3} onChange={setStep3} />}
            {activeStep === 3 && (
              <Step4
                docs={docs}
                uploadingType={uploadingType}
                onUpload={(type, file) => void uploadDocument(type, file)}
                schoolReady={Boolean(schoolId)}
              />
            )}
            {activeStep === 4 && <Step5 value={step5} onChange={setStep5} />}
            {activeStep === 5 && <Step6 value={step6} onChange={setStep6} />}
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="outline" onClick={goBack} disabled={activeStep === 0}>
              <ArrowLeft />
              Back
            </Button>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => void saveCurrentStep()}
                disabled={isSaving || isLocked}
              >
                {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
                Save step
              </Button>
              {activeStep < 5 ? (
                <Button onClick={() => void saveCurrentStep()} disabled={isSaving || isLocked}>
                  Continue
                  <ArrowRight />
                </Button>
              ) : (
                <Button onClick={() => void handleSubmit()} disabled={isSaving || isLocked}>
                  Submit for review
                  <CheckCircle2 />
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-10 place-items-center rounded-lg bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-teal-500)] text-sm font-extrabold text-white shadow-[0_4px_10px_rgba(16,185,129,0.25)]">
        NA
      </div>
      <div>
        <div className="text-sm font-bold">Northfield Academy</div>
        <div className="text-xs text-muted-foreground">School setup</div>
      </div>
    </div>
  );
}

function StatsStrip({ status, activeStep }: { status: string; activeStep: number }) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      <MiniMetric value="14.7L" label="Recognized schools in India" />
      <MiniMetric value="6" label="Setup stages" tone="green" />
      <MiniMetric value={`${activeStep + 1}/6`} label="Current stage" tone="amber" />
      <MiniMetric value={humanize(status)} label="Application status" tone="violet" />
    </div>
  );
}

function MiniMetric({
  value,
  label,
  tone = "sky",
}: {
  value: string;
  label: string;
  tone?: "sky" | "green" | "amber" | "violet";
}) {
  const tones = {
    sky: "bg-sky-50 text-sky-700 ring-sky-100",
    green: "bg-[var(--color-brand-50)] text-[var(--color-brand-700)] ring-[var(--color-brand-100)]",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    violet: "bg-violet-50 text-violet-700 ring-violet-100",
  };
  return (
    <div className={cn("rounded-xl p-4 ring-1", tones[tone])}>
      <div className="text-2xl font-bold tracking-[-0.02em]">{value}</div>
      <div className="mt-1 text-xs font-medium opacity-80">{label}</div>
    </div>
  );
}

function Step1({
  value,
  onChange,
}: {
  value: Step1SchoolRequest;
  onChange: (value: Step1SchoolRequest) => void;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <SectionCard
        title="School type"
        description="These choices drive defaults for compliance, reports and required documents."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <ChoiceCard
            selected={value.managementType === "PRIVATE_UNAIDED"}
            icon={<School className="size-5" />}
            title="Private unaided"
            description="Independently funded CBSE, ICSE, IB or state-board schools."
            onClick={() => onChange({ ...value, managementType: "PRIVATE_UNAIDED" })}
          />
          <ChoiceCard
            selected={value.managementType === "GOVERNMENT"}
            icon={<Building2 className="size-5" />}
            title="Government"
            description="Central, state, municipal, KV or Navodaya style institutions."
            onClick={() => onChange({ ...value, managementType: "GOVERNMENT" })}
          />
          <ChoiceCard
            selected={value.managementType === "GOVERNMENT_AIDED"}
            icon={<Users className="size-5" />}
            title="Government aided"
            description="Privately managed but supported by grants."
            onClick={() => onChange({ ...value, managementType: "GOVERNMENT_AIDED" })}
          />
          <ChoiceCard
            selected={value.managementType === "INTERNATIONAL"}
            icon={<GraduationCap className="size-5" />}
            title="International"
            description="IB, Cambridge IGCSE or international curriculum schools."
            onClick={() => onChange({ ...value, managementType: "INTERNATIONAL" })}
          />
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <SelectField
            label="School level"
            value={value.level}
            onChange={(level) => onChange({ ...value, level: level as SchoolLevel })}
            options={[
              ["PRIMARY", "Primary"],
              ["UPPER_PRIMARY", "Upper primary"],
              ["SECONDARY", "Secondary"],
              ["SENIOR_SECONDARY", "Senior secondary"],
              ["K12", "Full K-12"],
              ["K12_WITH_PRE_PRIMARY", "Pre-primary + K-12"],
            ]}
          />
          <SelectField
            label="Gender type"
            value={value.genderType ?? "CO_EDUCATION"}
            onChange={(genderType) =>
              onChange({ ...value, genderType: genderType as SchoolGenderType })
            }
            options={[
              ["CO_EDUCATION", "Co-education"],
              ["BOYS_ONLY", "Boys only"],
              ["GIRLS_ONLY", "Girls only"],
            ]}
          />
          <SelectField
            label="Medium"
            value={value.mediumOfInstruction ?? "ENGLISH"}
            onChange={(mediumOfInstruction) =>
              onChange({
                ...value,
                mediumOfInstruction: mediumOfInstruction as MediumOfInstruction,
              })
            }
            options={[
              ["ENGLISH", "English"],
              ["HINDI", "Hindi"],
              ["KANNADA", "Kannada"],
              ["BILINGUAL_ENGLISH_REGIONAL", "Bilingual"],
              ["OTHER", "Other"],
            ]}
          />
        </div>
      </SectionCard>

      <SectionCard title="Identity & contact" description="Used on official exports and receipts.">
        <div className="grid gap-3">
          <TextField label="Official school name" value={value.officialName} onChange={(officialName) => onChange({ ...value, officialName })} />
          <TextField label="Display name" value={value.displayName ?? ""} onChange={(displayName) => onChange({ ...value, displayName })} />
          <div className="grid gap-3 md:grid-cols-2">
            <SelectField
              label="Primary board"
              value={value.primaryBoard ?? "CBSE"}
              onChange={(primaryBoard) =>
                onChange({ ...value, primaryBoard: primaryBoard as BoardAffiliation })
              }
              options={[
                ["CBSE", "CBSE"],
                ["CISCE_ICSE", "ICSE / ISC"],
                ["STATE_BOARD", "State board"],
                ["IB", "IB"],
                ["CAMBRIDGE_IGCSE", "Cambridge"],
              ]}
            />
            <TextField
              label="Year established"
              type="number"
              value={value.yearEstablished?.toString() ?? ""}
              onChange={(yearEstablished) =>
                onChange({ ...value, yearEstablished: toNumber(yearEstablished) })
              }
            />
          </div>
          <TextField label="Official email" type="email" value={value.officialEmail} onChange={(officialEmail) => onChange({ ...value, officialEmail })} />
        </div>
      </SectionCard>

      <SectionCard className="xl:col-span-2" title="Address" description="Required for school identity and compliance reports.">
        <div className="grid gap-3 md:grid-cols-3">
          <TextField className="md:col-span-2" label="Address line 1" value={value.addressLine1} onChange={(addressLine1) => onChange({ ...value, addressLine1 })} />
          <TextField label="Address line 2" value={value.addressLine2 ?? ""} onChange={(addressLine2) => onChange({ ...value, addressLine2 })} />
          <TextField label="City" value={value.city} onChange={(city) => onChange({ ...value, city })} />
          <TextField label="District" value={value.district} onChange={(district) => onChange({ ...value, district })} />
          <TextField label="State" value={value.state} onChange={(state) => onChange({ ...value, state })} />
          <TextField label="Pincode" value={value.pincode} onChange={(pincode) => onChange({ ...value, pincode })} />
          <TextField label="Website" value={value.website ?? ""} onChange={(website) => onChange({ ...value, website })} />
        </div>
      </SectionCard>
    </div>
  );
}

function Step2({
  value,
  onChange,
}: {
  value: Step2LegalEntityRequest;
  onChange: (value: Step2LegalEntityRequest) => void;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <SectionCard title="Legal entity" description="Private schools must be operated by a non-profit entity.">
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ["REGISTERED_TRUST", "Registered Trust"],
            ["REGISTERED_SOCIETY", "Registered Society"],
            ["SECTION_8_COMPANY", "Section 8 Company"],
          ].map(([entityType, label]) => (
            <ChoiceCard
              key={entityType}
              selected={value.entityType === entityType}
              compact
              icon={<FileText className="size-5" />}
              title={label}
              description="Accepted non-profit operating model."
              onClick={() => onChange({ ...value, entityType: entityType as LegalEntityType })}
            />
          ))}
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <TextField label="Registered name" value={value.registeredName} onChange={(registeredName) => onChange({ ...value, registeredName })} />
          <TextField label="Registration number" value={value.registrationNumber} onChange={(registrationNumber) => onChange({ ...value, registrationNumber })} />
          <TextField label="Registration date" type="date" value={value.registrationDate ?? ""} onChange={(registrationDate) => onChange({ ...value, registrationDate })} />
          <TextField label="Registering authority" value={value.registeringAuthority ?? ""} onChange={(registeringAuthority) => onChange({ ...value, registeringAuthority })} />
          <TextField label="PAN number" value={value.panNumber ?? ""} onChange={(panNumber) => onChange({ ...value, panNumber: panNumber.toUpperCase() })} />
          <TextField label="IFSC code" value={value.bankIfscCode ?? ""} onChange={(bankIfscCode) => onChange({ ...value, bankIfscCode: bankIfscCode.toUpperCase() })} />
        </div>
      </SectionCard>

      <SectionCard title="Authorised signatory" description="Mandatory signer for onboarding and compliance submissions.">
        <div className="grid gap-3 md:grid-cols-2">
          <TextField label="Full name" value={value.signatoryName} onChange={(signatoryName) => onChange({ ...value, signatoryName })} />
          <TextField label="Designation" value={value.signatoryDesignation} onChange={(signatoryDesignation) => onChange({ ...value, signatoryDesignation })} />
          <TextField label="Mobile" value={value.signatoryMobile} onChange={(signatoryMobile) => onChange({ ...value, signatoryMobile })} />
          <TextField label="Email" type="email" value={value.signatoryEmail} onChange={(signatoryEmail) => onChange({ ...value, signatoryEmail })} />
          <TextField label="Aadhaar last 4" value={value.signatoryAadhaarLast4 ?? ""} onChange={(signatoryAadhaarLast4) => onChange({ ...value, signatoryAadhaarLast4 })} />
          <TextField label="Chairperson" value={value.chairpersonName ?? ""} onChange={(chairpersonName) => onChange({ ...value, chairpersonName })} />
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <ToggleCard title="12A registered" checked={Boolean(value.twelveARegistered)} onChange={(twelveARegistered) => onChange({ ...value, twelveARegistered })} />
          <ToggleCard title="80G registered" checked={Boolean(value.eightyGRegistered)} onChange={(eightyGRegistered) => onChange({ ...value, eightyGRegistered })} />
          <ToggleCard title="Minority institution" checked={Boolean(value.isMinorityInstitution)} onChange={(isMinorityInstitution) => onChange({ ...value, isMinorityInstitution })} />
        </div>
      </SectionCard>
    </div>
  );
}

function Step3({
  value,
  onChange,
}: {
  value: Step3BoardRequest;
  onChange: (value: Step3BoardRequest) => void;
}) {
  const primary = value.affiliations[0];
  const updatePrimary = (patch: Partial<typeof primary>) =>
    onChange({ ...value, affiliations: [{ ...primary, ...patch, isPrimary: true }] });

  return (
    <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <SectionCard title="Primary board" description="Exactly one primary affiliation is sent to the API.">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["CBSE", "CBSE", "SARAS portal · Pan-India"],
            ["CISCE_ICSE", "ICSE / ISC", "CISCE e-affiliation"],
            ["STATE_BOARD", "State board", "State recognition first"],
            ["IB", "IB", "International curriculum"],
          ].map(([board, title, description]) => (
            <ChoiceCard
              key={board}
              selected={primary.board === board}
              compact
              icon={<Award className="size-5" />}
              title={title}
              description={description}
              onClick={() => updatePrimary({ board: board as BoardAffiliation })}
            />
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Affiliation details" description="UDISE+ is needed for TC, PEN, RTE and exam workflows.">
        <div className="grid gap-3 md:grid-cols-2">
          <TextField label="UDISE+ code" value={value.udisePlusCode ?? ""} onChange={(udisePlusCode) => onChange({ ...value, udisePlusCode })} />
          <TextField label="DIS code" value={value.disCode ?? ""} onChange={(disCode) => onChange({ ...value, disCode })} />
          <TextField label="Affiliation number" value={primary.affiliationNumber ?? ""} onChange={(affiliationNumber) => updatePrimary({ affiliationNumber })} />
          <SelectField
            label="Affiliation status"
            value={primary.affiliationStatus}
            onChange={(affiliationStatus) =>
              updatePrimary({ affiliationStatus: affiliationStatus as typeof primary.affiliationStatus })
            }
            options={[
              ["PROVISIONAL", "Provisional"],
              ["PERMANENT", "Permanent"],
              ["APPLIED_PENDING", "Applied - pending"],
              ["STATE_ONLY", "State only"],
            ]}
          />
          <TextField label="Class from" type="number" value={primary.classFrom?.toString() ?? ""} onChange={(classFrom) => updatePrimary({ classFrom: toNumber(classFrom) })} />
          <TextField label="Class to" type="number" value={primary.classTo?.toString() ?? ""} onChange={(classTo) => updatePrimary({ classTo: toNumber(classTo) })} />
          <TextField label="Valid from" type="date" value={primary.affiliationValidFrom ?? ""} onChange={(affiliationValidFrom) => updatePrimary({ affiliationValidFrom })} />
          <TextField label="Valid to" type="date" value={primary.affiliationValidTo ?? ""} onChange={(affiliationValidTo) => updatePrimary({ affiliationValidTo })} />
        </div>
      </SectionCard>
    </div>
  );
}

function Step4({
  docs,
  uploadingType,
  onUpload,
  schoolReady,
}: {
  docs: SchoolDocumentItem[];
  uploadingType: DocumentType | null;
  onUpload: (type: DocumentType, file: File) => void;
  schoolReady: boolean;
}) {
  const uploaded = new Set(docs.map((d) => d.documentType));
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
      <SectionCard title="Compliance documents" description="Upload files, then save this step to attach them to document slots.">
        <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
          PDF/JPG/PNG files up to 50MB are uploaded directly to S3 through the backend presign flow.
        </div>
        <div className="mt-4 divide-y rounded-xl border">
          {DOCUMENTS.map((doc) => (
            <div key={doc.type} className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="flex gap-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--color-brand-50)] text-[var(--color-brand-700)]">
                  <FileText className="size-4" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    {doc.label}
                    <StatusPill tone={doc.required ? "rose" : "amber"}>
                      {doc.required ? "Required" : "Conditional"}
                    </StatusPill>
                    {uploaded.has(doc.type) && <StatusPill tone="green">Uploaded</StatusPill>}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{doc.description}</p>
                </div>
              </div>
              <label className={cn("inline-flex", !schoolReady && "pointer-events-none opacity-50")}>
                <input
                  type="file"
                  className="sr-only"
                  accept=".pdf,.jpg,.jpeg,.png"
                  disabled={!schoolReady || uploadingType === doc.type}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onUpload(doc.type, file);
                    e.currentTarget.value = "";
                  }}
                />
                <span className="inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-3 text-sm font-medium hover:bg-muted">
                  {uploadingType === doc.type ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Upload className="size-4" />
                  )}
                  Upload
                </span>
              </label>
            </div>
          ))}
        </div>
      </SectionCard>
      <Card className="h-fit p-5">
        <div className="text-base font-semibold">Checklist status</div>
        <p className="mt-1 text-sm text-muted-foreground">
          {docs.length} of {DOCUMENTS.length} uploaded
        </p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-teal-500)]"
            style={{ width: `${(docs.length / DOCUMENTS.length) * 100}%` }}
          />
        </div>
        {!schoolReady && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
            Save Step 1 first so document uploads can be linked to a school ID.
          </div>
        )}
      </Card>
    </div>
  );
}

function Step5({
  value,
  onChange,
}: {
  value: Step5InfrastructureRequest;
  onChange: (value: Step5InfrastructureRequest) => void;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <SectionCard title="Land, classrooms & capacity" description="Campus facts used in inspections and UDISE+ reporting.">
        <div className="grid gap-3 md:grid-cols-2">
          <NumberField label="Total land acres" value={value.totalLandAcres} onChange={(totalLandAcres) => onChange({ ...value, totalLandAcres })} />
          <NumberField label="Built-up area sq. ft." value={value.builtUpAreaSqFt} onChange={(builtUpAreaSqFt) => onChange({ ...value, builtUpAreaSqFt })} />
          <NumberField label="Classrooms" value={value.numberOfClassrooms} onChange={(numberOfClassrooms) => onChange({ ...value, numberOfClassrooms })} />
          <NumberField label="Avg. classroom sq. ft." value={value.avgClassroomSqFt} onChange={(avgClassroomSqFt) => onChange({ ...value, avgClassroomSqFt })} />
          <NumberField label="Student capacity" value={value.totalStudentCapacity} onChange={(totalStudentCapacity) => onChange({ ...value, totalStudentCapacity })} />
          <NumberField label="Current enrollment" value={value.currentEnrollment} onChange={(currentEnrollment) => onChange({ ...value, currentEnrollment })} />
          <NumberField label="Teaching staff" value={value.totalTeachingStaff} onChange={(totalTeachingStaff) => onChange({ ...value, totalTeachingStaff })} />
          <NumberField label="Non-teaching staff" value={value.totalNonTeachingStaff} onChange={(totalNonTeachingStaff) => onChange({ ...value, totalNonTeachingStaff })} />
        </div>
      </SectionCard>
      <SectionCard title="Facilities checklist" description="Operational, safety and accessibility readiness.">
        <div className="grid gap-3 md:grid-cols-2">
          <ToggleCard title="Physics lab" checked={Boolean(value.hasPhysicsLab)} onChange={(hasPhysicsLab) => onChange({ ...value, hasPhysicsLab })} />
          <ToggleCard title="Chemistry lab" checked={Boolean(value.hasChemistryLab)} onChange={(hasChemistryLab) => onChange({ ...value, hasChemistryLab })} />
          <ToggleCard title="Biology lab" checked={Boolean(value.hasBiologyLab)} onChange={(hasBiologyLab) => onChange({ ...value, hasBiologyLab })} />
          <ToggleCard title="Computer lab" checked={Boolean(value.hasComputerLab)} onChange={(hasComputerLab) => onChange({ ...value, hasComputerLab })} />
          <ToggleCard title="Library" checked={Boolean(value.hasLibrary)} onChange={(hasLibrary) => onChange({ ...value, hasLibrary })} />
          <ToggleCard title="Playground" checked={Boolean(value.hasPlayground)} onChange={(hasPlayground) => onChange({ ...value, hasPlayground })} />
          <ToggleCard title="Drinking water" checked={Boolean(value.hasDrinkingWater)} onChange={(hasDrinkingWater) => onChange({ ...value, hasDrinkingWater })} />
          <ToggleCard title="Ramp access" checked={Boolean(value.hasRampAccess)} onChange={(hasRampAccess) => onChange({ ...value, hasRampAccess })} />
          <ToggleCard title="CCTV" checked={Boolean(value.hasCctv)} onChange={(hasCctv) => onChange({ ...value, hasCctv })} />
          <ToggleCard title="Fire extinguishers" checked={Boolean(value.hasFireExtinguishers)} onChange={(hasFireExtinguishers) => onChange({ ...value, hasFireExtinguishers })} />
        </div>
      </SectionCard>
      <SectionCard className="xl:col-span-2" title="Power, connectivity, transport & fees" description="Defaults for operations, transport and finance modules.">
        <div className="grid gap-3 md:grid-cols-4">
          <ToggleCard title="Power backup" checked={Boolean(value.hasPowerBackup)} onChange={(hasPowerBackup) => onChange({ ...value, hasPowerBackup })} icon={<Wifi className="size-4" />} />
          <ToggleCard title="Internet" checked={Boolean(value.hasInternetConnection)} onChange={(hasInternetConnection) => onChange({ ...value, hasInternetConnection })} icon={<Wifi className="size-4" />} />
          <ToggleCard title="Bus service" checked={Boolean(value.hasBusService)} onChange={(hasBusService) => onChange({ ...value, hasBusService })} icon={<MapPin className="size-4" />} />
          <ToggleCard title="Boundary wall" checked={Boolean(value.hasBoundaryWall)} onChange={(hasBoundaryWall) => onChange({ ...value, hasBoundaryWall })} icon={<ShieldCheck className="size-4" />} />
          <NumberField label="Bus count" value={value.totalBusCount} onChange={(totalBusCount) => onChange({ ...value, totalBusCount })} />
          <NumberField label="Routes" value={value.busRoutesCount} onChange={(busRoutesCount) => onChange({ ...value, busRoutesCount })} />
          <NumberField label="Annual fee min" value={value.annualFeeMin} onChange={(annualFeeMin) => onChange({ ...value, annualFeeMin })} />
          <NumberField label="Annual fee max" value={value.annualFeeMax} onChange={(annualFeeMax) => onChange({ ...value, annualFeeMax })} />
        </div>
      </SectionCard>
    </div>
  );
}

function Step6({
  value,
  onChange,
}: {
  value: Step6ConfigurationRequest;
  onChange: (value: Step6ConfigurationRequest) => void;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <SectionCard title="Academic configuration" description="Default calendar, timetable, grading and attendance rules.">
        <div className="grid gap-3 md:grid-cols-2">
          <SelectField label="Academic year start" value={value.academicYearStart ?? "APRIL"} onChange={(academicYearStart) => onChange({ ...value, academicYearStart: academicYearStart as typeof value.academicYearStart })} options={[["APRIL", "April"], ["JUNE", "June"], ["JANUARY", "January"]]} />
          <TextField label="Academic year" value={value.currentAcademicYear ?? ""} onChange={(currentAcademicYear) => onChange({ ...value, currentAcademicYear })} />
          <TextField label="Start time" type="time" value={value.schoolStartTime ?? ""} onChange={(schoolStartTime) => onChange({ ...value, schoolStartTime })} />
          <TextField label="End time" type="time" value={value.schoolEndTime ?? ""} onChange={(schoolEndTime) => onChange({ ...value, schoolEndTime })} />
          <NumberField label="Periods per day" value={value.periodsPerDay} onChange={(periodsPerDay) => onChange({ ...value, periodsPerDay })} />
          <NumberField label="Period duration" value={value.periodDurationMinutes} onChange={(periodDurationMinutes) => onChange({ ...value, periodDurationMinutes })} />
          <SelectField label="Grading system" value={value.gradingSystem ?? "CBSE_10_POINT_GPA"} onChange={(gradingSystem) => onChange({ ...value, gradingSystem: gradingSystem as typeof value.gradingSystem })} options={[["CBSE_10_POINT_GPA", "CBSE 10-point GPA"], ["PERCENTAGE_100", "Percentage"], ["LETTER_GRADES", "Letter grades"], ["CUSTOM", "Custom"]]} />
          <NumberField label="Attendance threshold %" value={value.attendanceThresholdPct} onChange={(attendanceThresholdPct) => onChange({ ...value, attendanceThresholdPct })} />
        </div>
      </SectionCard>
      <SectionCard title="Notifications & modules" description="Choose launch defaults for parent, student and staff portals.">
        <div className="grid gap-3 md:grid-cols-2">
          <ToggleCard title="SMS alerts" checked={Boolean(value.smsEnabled)} onChange={(smsEnabled) => onChange({ ...value, smsEnabled })} icon={<Mail className="size-4" />} />
          <ToggleCard title="Email notifications" checked={Boolean(value.emailEnabled)} onChange={(emailEnabled) => onChange({ ...value, emailEnabled })} icon={<Mail className="size-4" />} />
          <ToggleCard title="WhatsApp" checked={Boolean(value.whatsappEnabled)} onChange={(whatsappEnabled) => onChange({ ...value, whatsappEnabled })} icon={<Mail className="size-4" />} />
          <ToggleCard title="Push notifications" checked={Boolean(value.pushNotificationsEnabled)} onChange={(pushNotificationsEnabled) => onChange({ ...value, pushNotificationsEnabled })} icon={<Mail className="size-4" />} />
          <ToggleCard title="Attendance" checked={Boolean(value.featureAttendance)} onChange={(featureAttendance) => onChange({ ...value, featureAttendance })} icon={<ClipboardCheck className="size-4" />} />
          <ToggleCard title="Exams" checked={Boolean(value.featureExams)} onChange={(featureExams) => onChange({ ...value, featureExams })} icon={<Award className="size-4" />} />
          <ToggleCard title="Library" checked={Boolean(value.featureLibrary)} onChange={(featureLibrary) => onChange({ ...value, featureLibrary })} icon={<BookOpen className="size-4" />} />
          <ToggleCard title="Online fees" checked={Boolean(value.featureFeeOnline)} onChange={(featureFeeOnline) => onChange({ ...value, featureFeeOnline })} icon={<Wallet className="size-4" />} />
        </div>
      </SectionCard>
      <SectionCard className="xl:col-span-2" title="Branding & locale" description="Used across report cards, fee receipts and communication templates.">
        <div className="grid gap-3 md:grid-cols-4">
          <TextField label="Primary color" value={value.portalPrimaryColor ?? ""} onChange={(portalPrimaryColor) => onChange({ ...value, portalPrimaryColor })} />
          <TextField label="Secondary color" value={value.portalSecondaryColor ?? ""} onChange={(portalSecondaryColor) => onChange({ ...value, portalSecondaryColor })} />
          <TextField label="Timezone" value={value.timezone ?? ""} onChange={(timezone) => onChange({ ...value, timezone })} />
          <TextField label="Currency" value={value.currencyCode ?? ""} onChange={(currencyCode) => onChange({ ...value, currencyCode })} />
        </div>
      </SectionCard>
    </div>
  );
}

function SectionCard({
  title,
  description,
  className,
  children,
}: {
  title: string;
  description: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={cn("p-5", className)}>
      <div>
        <h2 className="text-base font-bold tracking-[-0.01em]">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div>{children}</div>
    </Card>
  );
}

function ChoiceCard({
  selected,
  icon,
  title,
  description,
  onClick,
  compact,
}: {
  selected: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border bg-card p-4 text-left transition-all hover:border-[var(--color-brand-300)] hover:bg-[var(--color-brand-50)]",
        selected &&
          "border-[var(--color-brand-500)] bg-[var(--color-brand-50)] shadow-[0_0_0_3px_rgba(16,185,129,0.12)]",
        compact && "min-h-[112px]",
      )}
    >
      <div className="flex gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--color-brand-100)] text-[var(--color-brand-700)]">
          {icon}
        </div>
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
        </div>
      </div>
    </button>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  className?: string;
}) {
  const id = label.toLowerCase().replace(/\W+/g, "-");
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-[12.5px] font-semibold text-foreground/85">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 text-sm"
      />
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: number;
  onChange: (value: number | undefined) => void;
}) {
  return (
    <TextField
      label={label}
      type="number"
      value={value?.toString() ?? ""}
      onChange={(next) => onChange(toNumber(next))}
    />
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<[string, string]>;
}) {
  const id = label.toLowerCase().replace(/\W+/g, "-");
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-[12.5px] font-semibold text-foreground/85">
        {label}
      </Label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </div>
  );
}

function ToggleCard({
  title,
  checked,
  onChange,
  icon = <CheckCircle2 className="size-4" />,
}: {
  title: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/70"
    >
      <span className="flex items-center gap-2 text-sm font-medium">
        <span className="text-[var(--color-brand-600)]">{icon}</span>
        {title}
      </span>
      <span
        className={cn(
          "relative h-5 w-9 rounded-full transition-colors",
          checked ? "bg-[var(--color-brand-500)]" : "bg-border",
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 size-3.5 -translate-y-1/2 rounded-full bg-white transition-transform",
            checked ? "translate-x-[20px]" : "translate-x-1",
          )}
        />
      </span>
    </button>
  );
}

function StatusPill({
  children,
  tone = "green",
}: {
  children: React.ReactNode;
  tone?: "green" | "amber" | "rose";
}) {
  const tones = {
    green: "bg-[var(--color-brand-100)] text-[var(--color-brand-700)]",
    amber: "bg-amber-100 text-amber-700",
    rose: "bg-rose-100 text-rose-700",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold", tones[tone])}>
      {children}
    </span>
  );
}

function cleanPayload<T extends object>(payload: T): T {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== "" && value !== undefined),
  ) as T;
}

function toNumber(value: string) {
  if (value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function humanize(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
