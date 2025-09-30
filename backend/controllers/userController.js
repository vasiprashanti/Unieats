import User from '../models/User.js';

//  Get User Profile 
const getUserProfile = async (req, res) => {
    try {
        // req.user is attached by the authMiddleware
        const user = await User.findById(req.user._id).select('-__v -firebaseUid');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

//  Update User Profile 
const updateUserProfile = async (req, res) => {
    try {
        // Only allow updates to specific, non-critical fields
        const { name, phone, yearOfStudy, notificationPreferences } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Update fields if they are provided in the request
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (yearOfStudy) user.yearOfStudy = yearOfStudy;
        if (notificationPreferences) user.notificationPreferences = notificationPreferences;

        const updatedUser = await user.save();
        res.status(200).json({ success: true, message: 'Profile updated successfully!', data: updatedUser });

    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

export { getUserProfile, updateUserProfile };
