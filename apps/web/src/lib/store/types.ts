import type {
  ComparisonResult,
  CreateScanInput,
  DesignSpec,
  Framework,
  GeneratedProject,
  ProjectRecord,
  RefineIteration,
  ScanRecord,
  ScanStatus,
} from "@nn/shared";

export interface ScanPatch {
  status?: ScanStatus;
  projectId?: string;
  error?: string;
  report?: ScanRecord["report"];
  designSpec?: DesignSpec;
  prompt?: string;
  project?: GeneratedProject;
  comparison?: ComparisonResult;
  refinements?: RefineIteration[];
  progress?: ScanRecord["progress"];
}

export interface ProjectPatch {
  name?: string;
  status?: ScanStatus;
  similarity?: number;
  thumbnail?: string;
}

export interface Store {
  createProjectWithScan(input: CreateScanInput): Promise<{ projectId: string; scanId: string }>;
  getScan(id: string): Promise<ScanRecord | null>;
  updateScan(id: string, patch: ScanPatch): Promise<ScanRecord>;
  patchProgress(id: string, patch: ScanPatch["progress"]): Promise<ScanRecord>;
  listScans(): Promise<ScanRecord[]>;
  listProjects(): Promise<ProjectRecord[]>;
  getProject(id: string): Promise<ProjectRecord | null>;
  updateProject(id: string, patch: ProjectPatch): Promise<ProjectRecord | null>;
  deleteProject(id: string): Promise<boolean>;
}