# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory in the Docker container to /app
WORKDIR /app

# Install Puppeteer dependencies
RUN apt-get update && apt-get install -y \
   wget \
   ca-certificates \
   fonts-liberation \
   gconf-service \
   libappindicator1 \
   libasound2 \
   libatk1.0-0 \
   libcairo2 \
   libcups2 \
   libdbus-1-3 \
   libexpat1 \
   libfontconfig1 \
   libgbm-dev \
   libgtk-3-0 \
   libicu-dev \
   libjpeg-dev \
   libnspr4 \
   libnss3 \
   libpango-1.0-0 \
   libpangocairo-1.0-0 \
   libx11-xcb1 \
   libxcomposite1 \
   libxcursor1 \
   libxdamage1 \
   libxext6 \
   libxfixes3 \
   libxi6 \
   libxrandr2 \
   libxrender1 \
   libxss1 \
   libxtst6 \
   xdg-utils

# Copy package.json and package-lock.json into the Docker container
COPY package*.json ./

# Install the Node.js dependencies in the Docker container
RUN npm install

# Copy the rest of your app's source code into the Docker container
COPY . .

# Expose port 3000 for the app
EXPOSE 3000

# Start the app when the container is started
CMD [ "npm", "start" ]
