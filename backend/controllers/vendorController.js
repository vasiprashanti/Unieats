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

const getVendorProfile = async (req, res) => {
    // The user must be logged in to register as a vendor
    const ownerId = req.user._id;
    

    try {
        const vendor = await Vendor.findOne({owner: ownerId});
        
        if(!vendor){
            res.status(404).json({message: 'Vendor profile not found'});
        }
        res.status(200).json({
            message: 'Vendor profile retrieved successfully!',
            vendor: vendor // Send the actual vendor data back
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching vendor profile.' });
    }
};

const updateVendorProfile = async (req, res) => {
    try {
        const vendorProfile = await Vendor.findOne({ owner: req.user._id });
        if (!vendorProfile) {
            return res.status(404).json({ message: 'Vendor profile not found.' });
        }

        const { operatingHours, ...otherUpdates } = req.body;

        // Handle simple field updates
        Object.assign(vendorProfile, otherUpdates);

        
        if (operatingHours && Array.isArray(operatingHours)) {
            vendorProfile.operatingHours = operatingHours;
        }

        // Note: Document upload/update would be a separate, more complex endpoint
        // e.g., POST /vendors/documents, DELETE /vendors/documents/:docId

        const updatedVendor = await vendorProfile.save();
        res.status(200).json({ message: 'Profile updated!', vendor: updatedVendor });

    } catch (error) {
        console.error("Error updating vendor profile:", error);
        res.status(500).json({ message: "Server error while updating profile." });
    }
};

export { registerVendor, updateVendorProfile, getVendorProfile };
