// Shared compliance/qualification status type
// Mirrors prior `vetting_status` values while using updated terminology.

export type ComplianceStatus = 'ACTIVE' | 'PENDING' | 'REJECTED';

export type CarrierCompliance = {
  complianceStatus: ComplianceStatus;
};
