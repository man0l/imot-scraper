# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory in the Docker container to /app
WORKDIR /app

# Add Google Chrome’s official PPA
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'

# Install Puppeteer dependencies and Google Chrome
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
   xdg-utils \
   google-chrome-stable

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
