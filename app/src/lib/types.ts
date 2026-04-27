/**
 * EDF Explorer — Domain types matching /public/data/projects.json schema.
 * Source: EC Funding & Tenders Portal — Search API + Org Profile API.
 */

export interface Participant {
  pic: string;
  name: string;
  role: "coordinator" | "participant" | "thirdParty" | string;
  country: string;
  city: string;
}

export interface Project {
  /** Numeric EC project ID, e.g. "101103592". */
  project_id: string;
  acronym: string;
  title: string;
  status: "Ongoing" | "Ended" | string;
  call_identifier: string;
  topic: string;
  type_of_action: string;
  implementing_body: string;
  start_date: string | null;
  end_date: string | null;
  ec_signature_date: string | null;
  eu_contribution: number | null;
  overall_budget: number | null;
  eu_contribution_rate: number | null;
  objective: string;
  keywords: string[];
  coordinator: Participant | null;
  participants: Participant[];
  consortium_size: number;
  pics: string[];
  countries: string[];
}

export interface CompanyParticipation {
  project_id: string;
  acronym: string;
  role: "coordinator" | "participant" | "thirdParty" | string;
  status: string;
  call_identifier: string;
}

export interface Company {
  /** EC PIC number, e.g. "991075967". */
  pic: string;
  legal_name: string;
  display_name: string;
  business_name: string | null;
  country: string;
  city: string;
  classification_type: string | null;
  data_status: string | null;
  participations: CompanyParticipation[];
  project_count: number;
  coordination_count: number;
}

export interface DatasetMeta {
  generated_at: string;
  source: string;
  program_id: string;
  projects_count: number;
  companies_count: number;
  org_profile_failures?: string[];
}
