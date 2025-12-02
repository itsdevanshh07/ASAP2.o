import mongoose from 'mongoose';

const credentialSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    issuer: { type: String, default: 'ASAP Job Portal' },
    issueDate: { type: Date, default: Date.now },
    expiryDate: { type: Date },
    verificationId: { type: String, unique: true, required: true }, // UUID or unique hash
    skills: [{ type: String }],
    metadata: { type: Object } // Any additional data
});

const Credential = mongoose.model('Credential', credentialSchema);

export default Credential;
