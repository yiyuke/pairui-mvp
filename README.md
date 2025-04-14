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