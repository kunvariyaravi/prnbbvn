import mongoose, { Schema, Document } from 'mongoose';

export interface ILOA extends Document {
    tenderId: mongoose.Schema.Types.ObjectId;
    workDurationMonths: number;
    securityDepositAmount: number;
    securityDepositDate: Date;
    stampDuty: number;
    additionalSecurityDepositAmount: number;
    additionalSecurityDepositDate: Date;
    defectLiabilityPeriod: string;
    acceptanceLetterWorksheetNo: string;
    acceptanceLetterDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

const LOASchema: Schema = new Schema({
    tenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tender', required: true },
    workDurationMonths: { type: Number },
    securityDepositAmount: { type: Number },
    securityDepositDate: { type: Date },
    stampDuty: { type: Number },
    additionalSecurityDepositAmount: { type: Number },
    additionalSecurityDepositDate: { type: Date },
    defectLiabilityPeriod: { type: String },
    acceptanceLetterWorksheetNo: { type: String },
    acceptanceLetterDate: { type: Date },
}, {
    timestamps: true,
});

// Delete existing model to prevent overwrite error in development hot reload
if (process.env.NODE_ENV !== 'production') {
    if (mongoose.models.LOA) {
        delete mongoose.models.LOA;
    }
}

const LOA = mongoose.models.LOA || mongoose.model<ILOA>('LOA', LOASchema);

export default LOA;
