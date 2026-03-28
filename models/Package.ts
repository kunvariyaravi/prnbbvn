import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPackage extends Document {
    packageName: string;
    works: {
        workId: mongoose.Schema.Types.ObjectId;
        workName: string;
        amount: number; // Snapshot of amount
    }[];
    dtpAmount?: number;
    dtpSubmissionDate?: Date;
    dtpApprovalLetterNo?: string;
    dtpApprovalDate?: Date;
    approvalAuthority?: string;
    createdAt: Date;
    updatedAt: Date;
}

const PackageSchema: Schema = new Schema({
    packageName: { type: String, required: true },
    works: [{
        workId: { type: mongoose.Schema.Types.ObjectId, ref: 'TechnicalSanction', required: true },
        workName: { type: String, required: true },
        amount: { type: Number },
    }],
    dtpAmount: { type: Number },
    dtpSubmissionDate: { type: Date },
    dtpApprovalLetterNo: { type: String },
    dtpApprovalDate: { type: Date },
    approvalAuthority: { type: String },
}, {
    timestamps: true,
});

// Avoid recompiling model in watch mode
const Package: Model<IPackage> = mongoose.models.Package || mongoose.model<IPackage>('Package', PackageSchema);

export default Package;
