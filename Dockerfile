# Use an official Node.js runtime as the base image
FROM ghcr.io/puppeteer/puppeteer:latest

# Set the working directory in the Docker container to /app
WORKDIR /home/pptruser/app

# Copy package.json and package-lock.json into the Docker container
COPY package*.json ./

# Install the Node.js dependencies in the Docker container
RUN npm install

# If you are building your code for production
# RUN npm ci --only=production

# Copy the rest of your app's source code into the Docker container
COPY . .