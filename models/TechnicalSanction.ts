import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITechnicalSanction extends Document {
    workName: string;
    civilWorkCost: number; // Rs. In Lacks
    gstAmount: number; // Rs. In Lacks
    qcAmount: number; // Rs. In Lacks
    lsAmount: number; // Rs. In Lacks
    miscellaneousAmount: number; // Rs. In Lacks
    tsAmount: number; // Rs. In Lacks
    tsNumber: string;
    tsDate: Date;
    amountNotPutToTender: number; // Moved from Package
    amountPutToTender: number;
    villageName: string;
    villagePopulation: number;
    existingSurface: string;
    createdAt: Date;
    updatedAt: Date;
}

const TechnicalSanctionSchema: Schema = new Schema({
    workName: { type: String, required: true },
    civilWorkCost: { type: Number },
    gstAmount: { type: Number },
    qcAmount: { type: Number },
    lsAmount: { type: Number },
    miscellaneousAmount: { type: Number },
    tsAmount: { type: Number },
    tsNumber: { type: String },
    tsDate: { type: Date },
    amountNotPutToTender: { type: Number },
    amountPutToTender: { type: Number },
    villageName: { type: String },
    villagePopulation: { type: Number },
    existingSurface: { type: String },
}, {
    timestamps: true,
});

// Avoid recompiling model in watch mode
const TechnicalSanction: Model<ITechnicalSanction> = mongoose.models.TechnicalSanction || mongoose.model<ITechnicalSanction>('TechnicalSanction', TechnicalSanctionSchema);

export default TechnicalSanction;
