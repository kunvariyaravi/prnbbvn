import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITender extends Document {
    packageId: mongoose.Schema.Types.ObjectId;
    packageName: string; // Snapshot for easier display
    tenderId: string;
    trialNo: number;
    tenderCreationDate: Date;
    lastDateOfSubmission: Date;
    tenderOpeningDate: Date;
    tenderValidityDate: Date;
    reInvite: boolean;
    contractorName: string;
    contractPrice: number;
    aboveBelowPercentage: number;
    aboveBelowInWord: string; // "Above" or "Below"
    proposalDate: Date;
    tenderApprovalOffice: string;
    tenderApprovalNo: string;
    tenderApprovalDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

const TenderSchema: Schema = new Schema({
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    packageName: { type: String },
    tenderId: { type: String, required: true },
    trialNo: { type: Number, default: 1 },
    tenderCreationDate: { type: Date },
    lastDateOfSubmission: { type: Date },
    tenderOpeningDate: { type: Date },
    tenderValidityDate: { type: Date },
    reInvite: { type: Boolean, default: false },
    contractorName: { type: String },
    contractPrice: { type: Number },
    aboveBelowPercentage: { type: Number },
    aboveBelowInWord: { type: String, enum: ['Above', 'Below', 'At Par'], default: 'Above' },
    proposalDate: { type: Date },
    tenderApprovalOffice: { type: String },
    tenderApprovalNo: { type: String },
    tenderApprovalDate: { type: Date },
}, {
    timestamps: true,
});

// Avoid recompiling model in watch mode
// Avoid recompiling model in watch mode
if (process.env.NODE_ENV !== 'production') delete mongoose.models.Tender;
const Tender: Model<ITender> = mongoose.models.Tender || mongoose.model<ITender>('Tender', TenderSchema);

export default Tender;
