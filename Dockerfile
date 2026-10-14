# Use an official Node runtime as a parent image
FROM node:20-slim

# Set work directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy project
COPY . .

# Expose port (Vite default)
EXPOSE 5173

# Run the app
CMD ["npm", "run", "dev", "--", "--host"]
