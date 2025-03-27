# PairUI Platform MVP

A platform connecting designers and developers for collaborative projects.

## Features

- User authentication (signup, login)
- Role selection (designer or developer)
- Mission creation by developers
- Designers can apply for missions
- Developers can accept/reject applications
- Designers can submit Figma designs
- Developers can provide feedback and ratings

## Tech Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT

## Getting Started

### Prerequisites

- Node.js
- MongoDB

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/pairui-mvp.git
   cd pairui-mvp
   ```

2. Install server dependencies
   ```
   cd server
   npm install
   ```

3. Install client dependencies
   ```
   cd ../client
   npm install
   ```

4. Create a `.env` file in the config directory with the following variables:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5001
   ```

### Running the Application

1. Start the server
   ```
   cd server
   npm run dev
   ```

2. Start the client
   ```
   cd client
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Project Structure

/pairui-mvp
├── /client (React front-end)
│   ├── /public
│   ├── /src
│   └── package.json
├── /server (Node.js back-end)
│   ├── /controllers
│   ├── /models
│   ├── /routes
│   ├── /middleware
│   ├── app.js
│   └── package.json
├── /config
└── .gitignore
