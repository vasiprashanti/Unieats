# Unieats Monorepo Structure

This repository is organized as a monorepo to support a scalable, modular, and maintainable food delivery platform. Below is an overview of the folder structure and the purpose of each major directory:

## apps/
- **admin-web/**: Admin dashboard frontend (React, Vite)
- **vendor-web/**: Vendor/restaurant dashboard frontend
- **user-web/**: User-facing web app

## backend/
- **config/**: Configuration files (DB, Firebase, Cloudinary, etc.)
- **controllers/**: Express controllers for business logic
- **middleware/**: Express middleware (auth, validation, error handling, etc.)
- **models/**: Mongoose models for MongoDB
- **routes/**: Express route definitions
- **utils/**: Utility functions (notifications, email, logging, etc.)
- **tests/**: Backend tests (unit, integration)

## packages/
- **ui/**: Shared UI components (React)
- **utils/**: Shared utility functions/constants
- **hooks/**: Shared React hooks

---

## Getting Started
- Each app and package is self-contained. Install dependencies and run apps from their respective folders.
- Use the root `package.json` for workspace management (Yarn workspaces).
- Backend and frontend apps can be run independently for development.

---

## Contributing
- Follow the structure for adding new features or modules.
- Keep shared code in `packages/` for reusability.
- Use PRs and code reviews for all changes.

---

## License
MIT
