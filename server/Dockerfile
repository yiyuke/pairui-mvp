FROM node:18-alpine

WORKDIR /app/server

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5001

EXPOSE 5001

CMD ["npm", "run", "dev"] 