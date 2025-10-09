

import User from '../models/User.js';

// --- GET All Users ---
const getAllUsers = async (req, res) => {
    try {
        const { accommodation, page = 1, limit = 10 } = req.query;

        // Base query to only get regular users
        const query = { role: 'user' };

        // Optional filter for accommodation type
        if (accommodation) {
            query.accommodation = accommodation;
        }

        const users = await User.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('-firebaseUid') // Exclude sensitive info from the list view
            .sort({ createdAt: -1 });

        const count = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            count: users.length,
            data: users
        });

    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


export { getAllUsers, updateUserStatus };