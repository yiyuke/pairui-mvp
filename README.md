# PairUI

PairUI is a collaborative platform that connects designers and developers for project work. Designers can apply for missions created by developers, submit their Figma designs, and receive feedback, while developers can create missions, review applications, and provide ratings.

## Features

- User authentication (signup, login)
- Role selection (designer or developer)
- Mission creation by developers
- Designers can apply for missions
- Developers can accept/reject applications
- Designers can submit Figma designs
- Developers can provide feedback and ratings

## Tech Stack

- **Frontend**: React.js, React Router, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcryptjs
- **API Communication**: Axios

## Local Deployment

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

4. Create a `.env` file in the server directory with the following variables:
   ```
   MONGO_URI=mongodb+srv://pairui-user1:pairui-user1@cluster0.ae7mx.mongodb.net/pairui?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=pairui-secret-key
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