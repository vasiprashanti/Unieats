import Settings from '../models/Settings.model.js';
import AuditLog from '../models/AuditLog.model.js';
import { validationResult } from 'express-validator';

// --- GET SETTINGS ---
const getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne({ name: 'platform-settings' });
        if (!settings) {
            // If no settings exist, create with defaults
            settings = await Settings.create({});
        }
        // Return decrypted values for admin
        res.status(200).json({ success: true, data: settings.getDecrypted() });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// --- UPDATE SETTINGS ---
const updateSettings = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        let settings = await Settings.findOne({ name: 'platform-settings' });
        if (!settings) {
            settings = new Settings({ name: 'platform-settings' });
        }

        const oldSettings = settings.getDecrypted();
        const updates = req.body;

        // Update fields
        if (updates.deliveryFee) settings.deliveryFee = updates.deliveryFee;
        if (updates.commissionRate) settings.commissionRate = updates.commissionRate;
        if (updates.razorpayKeyId) settings.razorpayKeyId = updates.razorpayKeyId;
        if (updates.razorpayKeySecret) settings.razorpayKeySecret = updates.razorpayKeySecret;

        const updatedSettings = await settings.save();

        // --- Create Audit Log ---
        await AuditLog.create({
            adminUser: req.user._id,
            action: 'Updated Platform Settings',
            details: {
                before: {
                    deliveryFee: oldSettings.deliveryFee,
                    commissionRate: oldSettings.commissionRate,
                },
                after: {
                    deliveryFee: updatedSettings.deliveryFee,
                    commissionRate: updatedSettings.commissionRate,
                }
                // We intentionally do not log sensitive keys
            }
        });

        res.status(200).json({ success: true, message: 'Settings updated successfully.', data: updatedSettings.getDecrypted() });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

export { getSettings, updateSettings };