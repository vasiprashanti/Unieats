import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    adminUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    action: {
        type: String,
        required: true, // e.g., "Updated Settings"
    },
    details: {
        type: mongoose.Schema.Types.Mixed, // To store before/after states
    },
}, { timestamps: true });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
