import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IApprovedWork extends Document {
    circle: string;
    district: string;
    taluka: string;
    constituencyName: string; // Name of Consituancy
    budgetItemName: string; // Name of Budget Item
    budgetType: string; // Type of Budget
    wmsItemCode: string;
    approvalYear: string; // Year of Approval
    jobNumberApprovalDate: Date;
    jobNumberAmount: number; // Rs. In Lacks
    workName: string;
    proposedLength: number; // K.M./Meter
    contractProvision: string;
    rpmsCode: string;
    type: string;
    budgetHead: string;
    projectType: string;
    mlaName: string;
    roadCategory: string; // Category of Road
    workType: string; // Type of Work
    parliamentaryConstituency: string;
    mpName: string;
    createdAt: Date;
    updatedAt: Date;
}

const ApprovedWorkSchema: Schema = new Schema({
    circle: { type: String, default: 'Panchayat R&B Circle, Rajkot' }, // Default based on context usually
    district: { type: String, default: 'Bhavnagar' },
    taluka: { type: String },
    constituencyName: { type: String },
    budgetItemName: { type: String },
    budgetType: { type: String },
    wmsItemCode: { type: String },
    approvalYear: { type: String },
    jobNumberApprovalDate: { type: Date },
    jobNumberAmount: { type: Number },
    workName: { type: String, required: true },
    proposedLength: { type: Number },
    contractProvision: { type: String },
    rpmsCode: { type: String },
    type: { type: String },
    budgetHead: { type: String },
    projectType: { type: String },
    mlaName: { type: String },
    roadCategory: { type: String },
    workType: { type: String },
    parliamentaryConstituency: { type: String },
    mpName: { type: String },
}, {
    timestamps: true,
});

// Avoid recompiling model in watch mode
const ApprovedWork: Model<IApprovedWork> = mongoose.models.ApprovedWork || mongoose.model<IApprovedWork>('ApprovedWork', ApprovedWorkSchema);

export default ApprovedWork;
