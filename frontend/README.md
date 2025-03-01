# Record Collection Frontend

This is the frontend for the Record Collection application, built with React, TypeScript, and Tailwind CSS.

## Features

- View your record collection with filtering and sorting
- Add, edit, and delete records
- View detailed information about each record
- Responsive design for mobile and desktop

## Tech Stack

- React 18
- TypeScript
- React Router for navigation
- React Query for data fetching and caching
- Tailwind CSS for styling
- Vite for fast development and building

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```
   cd record_collection/frontend
   ```
3. Install dependencies:
   ```
   npm install
   # or
   yarn
   ```

### Development

Start the development server:

```
npm run dev
# or
yarn dev
```

This will start the development server at http://localhost:3000.

### Building for Production

Build the application for production:

```
npm run build
# or
yarn build
```

The built files will be in the `dist` directory.

### Preview Production Build

Preview the production build:

```
npm run preview
# or
yarn preview
```

## Project Structure

- `src/` - Source code
  - `api/` - API service functions
  - `assets/` - Static assets like images
  - `components/` - Reusable React components
  - `pages/` - Page components
  - `App.tsx` - Main application component
  - `index.tsx` - Application entry point
  - `index.css` - Global styles

## Backend Connection

The frontend connects to the Django backend API. The API base URL is configured in `src/api/recordApi.ts`. By default, it uses a proxy configuration in `vite.config.ts` to forward API requests to the backend server during development.

## License

This project is licensed under the MIT License. 