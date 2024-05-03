# Use an official Node.js runtime as the base image
FROM node:20-alpine AS development

# Set the working directory in the container to /app
WORKDIR /server

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .
COPY .env .
# Expose ports 7545, 6379, and 27017 for the application
EXPOSE 7545 6379 27017 8000

# Define the command to run the application
CMD [ "npm", "start" ]