// backend/middleware/devAuth.js
import User from "../models/User.model.js";
import Vendor from "../models/Vendor.model.js";
import MenuItem, { MenuCategory } from "../models/MenuItem.model.js";

//This is a development middleware to bypass auth in dev environment
//To use this, set SKIP_AUTH=true in your .env file and remove verifyFirebaseToken from routes you want to test and restart the server
//This currently supports testing user and vendor roles.
const devAuth = async (req, res, next) => {
  // Only run if SKIP_AUTH=true
  if (process.env.SKIP_AUTH !== "true") return next();

  // Create a sample user for testing user endpoints
  const userUid = "dev-user-1";
  let user = await User.findOne({ firebaseUid: userUid });
  if (!user) {
    user = await User.create({
      firebaseUid: userUid,
      email: "devuser@local.test",
      name: "Dev User",
      role: "user",
      addresses: [
        {
          street: "456 User St",
          city: "User City",
          state: "User State",
          zipCode: "654321",
          isDefault: true,
        },
        {
          street: "789 Second St",
          city: "User City",
          state: "User State",
          zipCode: "654322",
          isDefault: false,
        },
      ],
      paymentMethods: [
        {
          type: "upi",
          upiId: "devuser@upi",
          isDefault: true,
        },
        {
          type: "cashonDelivery",
          isDefault: false,
        },
      ],
      favorites: [], // You can add vendor ObjectIds here if needed
    });
  }
  req.user = user;

  // Create a sample vendor for vendor endpoints
  const vendorUid = "dev-uid-1";
  let vendorOwner = await User.findOne({ firebaseUid: vendorUid });
  if (!vendorOwner) {
    vendorOwner = await User.create({
      firebaseUid: vendorUid,
      email: "dev@local.test",
      name: "Dev Vendor",
      role: "vendor",
      addresses: [
        {
          street: "123 Main St",
          city: "Test City",
          state: "Test State",
          zipCode: "123456",
          isDefault: true,
        },
      ],
    });
  }
  let vendor = await Vendor.findOne({ owner: vendorOwner._id });
  if (!vendor) {
    vendor = await Vendor.create({
      owner: vendorOwner._id,
      businessName: "Dev Vendor Restaurant",
      phone: "9876543210",
      cuisineType: ["Indian", "Chinese"],
      businessAddress: {
        street: "123 Main St",
        city: "Test City",
        state: "Test State",
        zipCode: "123456",
      },
      approvalStatus: "approved",
      operatingHours: [
        { day: "Monday", open: "09:00", close: "22:00" },
        { day: "Tuesday", open: "09:00", close: "22:00" },
      ],
      documents: {
        businessLicense: {
          url: "https://dummyurl.com/license.pdf",
          public_id: "sample_license_id",
        },
        foodSafetyCertificate: {
          url: "https://dummyurl.com/certificate.pdf",
          public_id: "sample_certificate_id",
        },
      },
    });
    // Seed menu items for dev vendor
    const sampleMenuItems = [
      {
        name: "Paneer Butter Masala",
        price: 180,
        category: "Indian",
        isAvailable: true,
        description: "Creamy paneer curry.",
        vendor: vendor._id,
        vegOrNonVeg: "veg",
        tags: ["spicy", "creamy", "paneer"],
        ratings: [
          { user: user._id, order: "dev-order-1", value: 5 },
          { user: user._id, order: "dev-order-2", value: 4 },
        ],
        averageRating: 4.5,
      },
      {
        name: "Veg Hakka Noodles",
        price: 120,
        category: "Chinese",
        isAvailable: true,
        description: "Stir-fried noodles with veggies.",
        vendor: vendor._id,
        vegOrNonVeg: "veg",
        tags: ["noodles", "stir-fry", "vegetables"],
        ratings: [{ user: user._id, order: "dev-order-1", value: 5 }],
        averageRating: 5,
      },
      {
        name: "Dal Tadka",
        price: 100,
        category: "Indian",
        isAvailable: true,
        description: "Yellow dal with tempering.",
        vendor: vendor._id,
        vegOrNonVeg: "veg",
        tags: ["dal", "lentils", "comfort-food"],
        ratings: [],
        averageRating: 0,
      },
      {
        name: "Spring Rolls",
        price: 80,
        category: "Chinese",
        isAvailable: true,
        description: "Crispy vegetable rolls.",
        vendor: vendor._id,
        vegOrNonVeg: "veg",
        tags: ["crispy", "rolls", "appetizer"],
        ratings: [],
        averageRating: 0,
      },
    ];

    // Create categories first
    const categoryNames = [
      ...new Set(sampleMenuItems.map((item) => item.category)),
    ];
    const categoryMap = {};

    for (const categoryName of categoryNames) {
      let category = await MenuCategory.findOne({
        name: categoryName,
        vendor: vendor._id,
      });
      if (!category) {
        category = await MenuCategory.create({
          name: categoryName,
          vendor: vendor._id,
          isActive: true,
        });
      }
      categoryMap[categoryName] = category._id;
    }

    // Create menu items with proper category ObjectIds
    for (const item of sampleMenuItems) {
      let menuItem = await MenuItem.findOne({
        name: item.name,
        vendor: vendor._id,
      });
      if (!menuItem) {
        await MenuItem.create({
          ...item,
          category: categoryMap[item.category], // Use ObjectId instead of string
        });
      }
    }
  }

  // Create multiple sample vendors for search testing
  const vendorSamples = [
    {
      businessName: "Pizza Palace",
      cuisineType: ["Italian", "Pizza"],
      businessAddress: {
        street: "1 Pizza St",
        city: "Foodville",
        state: "CA",
        zipCode: "90001",
      },
      phone: "9000000001",
      menu: [
        {
          name: "Margherita Pizza",
          price: 250,
          category: "Pizza",
          isAvailable: true,
          description: "Classic cheese pizza with fresh basil.",
          vegOrNonVeg: "veg",
          tags: ["classic", "cheese", "basil"],
        },
        {
          name: "Pepperoni Pizza",
          price: 300,
          category: "Pizza",
          isAvailable: true,
          description: "Pepperoni and mozzarella cheese.",
          vegOrNonVeg: "nonveg",
          tags: ["pepperoni", "meat", "classic"],
        },
        {
          name: "Garlic Bread",
          price: 80,
          category: "Sides",
          isAvailable: true,
          description: "Crispy bread with garlic butter.",
          vegOrNonVeg: "veg",
          tags: ["garlic", "bread", "appetizer"],
        },
      ],
    },
    {
      businessName: "Sushi Central",
      cuisineType: ["Japanese", "Sushi"],
      businessAddress: {
        street: "2 Sushi Ave",
        city: "Foodville",
        state: "CA",
        zipCode: "90002",
      },
      phone: "9000000002",
      menu: [
        {
          name: "California Roll",
          price: 180,
          category: "Sushi",
          isAvailable: true,
          description: "Crab and avocado roll with cucumber.",
          vegOrNonVeg: "nonveg",
          tags: ["crab", "avocado", "roll"],
        },
        {
          name: "Salmon Nigiri",
          price: 220,
          category: "Sushi",
          isAvailable: true,
          description: "Fresh salmon over seasoned rice.",
          vegOrNonVeg: "nonveg",
          tags: ["salmon", "nigiri", "fresh"],
        },
        {
          name: "Miso Soup",
          price: 60,
          category: "Soup",
          isAvailable: true,
          description: "Traditional Japanese soup.",
          vegOrNonVeg: "veg",
          tags: ["miso", "soup", "traditional"],
        },
      ],
    },
    {
      businessName: "Taco Town",
      cuisineType: ["Mexican", "Tacos"],
      businessAddress: {
        street: "3 Taco Blvd",
        city: "Foodville",
        state: "CA",
        zipCode: "90003",
      },
      phone: "9000000003",
      menu: [
        {
          name: "Chicken Taco",
          price: 90,
          category: "Tacos",
          isAvailable: true,
          description: "Grilled chicken with salsa and lettuce.",
          vegOrNonVeg: "nonveg",
          tags: ["chicken", "grilled", "mexican"],
        },
        {
          name: "Veggie Taco",
          price: 80,
          category: "Tacos",
          isAvailable: true,
          description: "Black beans, corn, and fresh vegetables.",
          vegOrNonVeg: "veg",
          tags: ["beans", "vegetables", "healthy"],
        },
        {
          name: "Guacamole",
          price: 40,
          category: "Sides",
          isAvailable: true,
          description: "Fresh avocado dip with chips.",
          vegOrNonVeg: "veg",
          tags: ["avocado", "dip", "fresh"],
        },
      ],
    },
    {
      businessName: "Burger Barn",
      cuisineType: ["American", "Burgers"],
      businessAddress: {
        street: "4 Burger Rd",
        city: "Foodville",
        state: "CA",
        zipCode: "90004",
      },
      phone: "9000000004",
      menu: [
        {
          name: "Classic Cheeseburger",
          price: 150,
          category: "Burgers",
          isAvailable: true,
          description: "Beef patty with cheese, lettuce, and tomato.",
          vegOrNonVeg: "nonveg",
          tags: ["beef", "cheese", "classic"],
        },
        {
          name: "Veggie Burger",
          price: 130,
          category: "Burgers",
          isAvailable: true,
          description: "Plant-based patty with fresh vegetables.",
          vegOrNonVeg: "veg",
          tags: ["plant-based", "healthy", "vegetables"],
        },
        {
          name: "French Fries",
          price: 70,
          category: "Sides",
          isAvailable: true,
          description: "Crispy golden potato fries.",
          vegOrNonVeg: "veg",
          tags: ["potato", "crispy", "classic"],
        },
      ],
    },
    {
      businessName: "Curry House",
      cuisineType: ["Indian", "Curry"],
      businessAddress: {
        street: "5 Curry Ln",
        city: "Foodville",
        state: "CA",
        zipCode: "90005",
      },
      phone: "9000000005",
      menu: [
        {
          name: "Chicken Tikka Masala",
          price: 200,
          category: "Curry",
          isAvailable: true,
          description: "Creamy tomato-based chicken curry.",
          vegOrNonVeg: "nonveg",
          tags: ["chicken", "creamy", "tomato"],
        },
        {
          name: "Paneer Makhani",
          price: 180,
          category: "Curry",
          isAvailable: true,
          description: "Rich and creamy paneer curry.",
          vegOrNonVeg: "veg",
          tags: ["paneer", "creamy", "rich"],
        },
        {
          name: "Naan Bread",
          price: 40,
          category: "Bread",
          isAvailable: true,
          description: "Soft Indian flatbread.",
          vegOrNonVeg: "veg",
          tags: ["bread", "soft", "indian"],
        },
      ],
    },
    {
      businessName: "Mediterranean Delights",
      cuisineType: ["Mediterranean", "Healthy"],
      businessAddress: {
        street: "6 Med Ave",
        city: "Foodville",
        state: "CA",
        zipCode: "90006",
      },
      phone: "9000000006",
      menu: [
        {
          name: "Greek Gyros",
          price: 140,
          category: "Wraps",
          isAvailable: true,
          description: "Grilled meat with tzatziki sauce.",
          vegOrNonVeg: "nonveg",
          tags: ["greek", "grilled", "tzatziki"],
        },
        {
          name: "Hummus Bowl",
          price: 90,
          category: "Healthy",
          isAvailable: true,
          description: "Chickpea hummus with pita and vegetables.",
          vegOrNonVeg: "veg",
          tags: ["hummus", "chickpea", "healthy"],
        },
        {
          name: "Falafel Plate",
          price: 120,
          category: "Healthy",
          isAvailable: true,
          description: "Crispy chickpea balls with tahini.",
          vegOrNonVeg: "veg",
          tags: ["falafel", "chickpea", "tahini"],
        },
      ],
    },
  ];

  for (const sample of vendorSamples) {
    let sampleVendor = await Vendor.findOne({
      businessName: sample.businessName,
    });
    if (!sampleVendor) {
      sampleVendor = await Vendor.create({
        owner: vendorOwner._id,
        businessName: sample.businessName,
        phone: sample.phone,
        cuisineType: sample.cuisineType,
        businessAddress: sample.businessAddress,
        approvalStatus: "approved",
        operatingHours: [
          { day: "Monday", open: "09:00", close: "22:00" },
          { day: "Tuesday", open: "09:00", close: "22:00" },
          { day: "Wednesday", open: "09:00", close: "22:00" },
          { day: "Thursday", open: "09:00", close: "22:00" },
          { day: "Friday", open: "09:00", close: "23:00" },
          { day: "Saturday", open: "10:00", close: "23:00" },
          { day: "Sunday", open: "10:00", close: "22:00" },
        ],
        documents: {
          businessLicense: {
            url: "https://dummyurl.com/license.pdf",
            public_id: "sample_license_id",
          },
          foodSafetyCertificate: {
            url: "https://dummyurl.com/certificate.pdf",
            public_id: "sample_certificate_id",
          },
        },
      });
    }

    // Add menu items for each vendor
    for (const item of sample.menu) {
      // Create category if it doesn't exist for this vendor
      let category = await MenuCategory.findOne({
        name: item.category,
        vendor: sampleVendor._id,
      });
      if (!category) {
        category = await MenuCategory.create({
          name: item.category,
          vendor: sampleVendor._id,
          isActive: true,
        });
      }

      let menuItem = await MenuItem.findOne({
        name: item.name,
        vendor: sampleVendor._id,
      });
      if (!menuItem) {
        await MenuItem.create({
          ...item,
          vendor: sampleVendor._id,
          category: category._id, // Use ObjectId instead of string
          ratings: [
            {
              user: user._id,
              order: "dev-order-sample-1",
              value: Math.floor(Math.random() * 2) + 4,
            }, // Random rating 4-5
          ],
          averageRating: Math.floor(Math.random() * 2) + 4, // Random rating 4-5
        });
      }
    }
  }

  next();
};

export default devAuth;
