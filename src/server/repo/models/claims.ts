import mongoose from 'mongoose';

export interface ClaimMemberData {
  displayName: string;
  userId: string;
}

export interface DocumentData {
  displayName: string;
  reference: string;
  downloadLink: string;
}

export enum StatusType {
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  APPROVED = 'APPROVED',
  UNKNOWN = 'UNKNOWN'
}

export interface Claim {
  caseId: string;
  patientName: string;
  requestor: ClaimMemberData;
  creator: ClaimMemberData;
  approver: ClaimMemberData;
  documents: [DocumentData];
  status: StatusType;
}

const ClaimMemberDataSchema = new mongoose.Schema(
  {
    displayName: String,
    userId: String
  },
  { _id: false }
);

const DocumentDataSchema = new mongoose.Schema(
  {
    displayName: String,
    reference: String,
    downloadLink: String
  },
  { _id: false }
);

const ClaimSchema = new mongoose.Schema({
  caseId: String,
  patientName: String,
  requestor: ClaimMemberDataSchema,
  creator: ClaimMemberDataSchema,
  approver: ClaimMemberDataSchema,
  documents: [DocumentDataSchema],
  status: { type: String, enum: Object.values(StatusType) }
});

export const ClaimModel = mongoose.model<Claim>('claim', ClaimSchema);
