import Vendor from '../models/Vendor.model.js';
import { cloudinary } from '../config/cloudinary.js';

const registerVendor = async (req, res) => {
    // The user must be logged in to register as a vendor
    

    try {
        
        // Handle file uploads to Cloudinary
        if (!req.files || !req.files.businessLicense || !req.files.foodSafetyCertificate) {
            return res.status(400).json({ message: 'Both business license and food safety certificate are required.' });
        }

        const uploadToCloudinary = (file) => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { resource_type: 'auto', folder: 'unieats_documents' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve({ url: result.secure_url, public_id: result.public_id });
                    }
                );
                uploadStream.end(file.buffer);
            });
        };

        const [licenseResult, certificateResult] = await Promise.all([
            uploadToCloudinary(req.files.businessLicense[0]),
            uploadToCloudinary(req.files.foodSafetyCertificate[0]),
        ]);

        const newVendor = new Vendor({
            ...req.body,
            documents: {
                businessLicense: licenseResult,
                foodSafetyCertificate: certificateResult,
            },
        });

        await newVendor.save();

        res.status(201).json({
            success: true,
            message: 'Vendor registration successful! Your application is pending approval.',
            data: newVendor,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during vendor registration.' });
    }
};

export { registerVendor };
