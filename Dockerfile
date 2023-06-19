# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory in the Docker container to /app
WORKDIR /app

# Copy package.json and package-lock.json into the Docker container
COPY package*.json ./

# Install the Node.js dependencies in the Docker container
RUN npm install

# If you are building your code for production
# RUN npm ci --only=production

# Copy the rest of your app's source code into the Docker container
COPY . .

# Expose port 3000 for the app
EXPOSE 3000

# Start the app when the container is started
CMD [ "npm", "start" ]
