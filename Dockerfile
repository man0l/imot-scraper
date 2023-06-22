# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory in the Docker container to /app
WORKDIR /app

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chrome that Puppeteer
# installs, work.
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
    && sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-khmeros fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd -r pptruser && useradd -rm -g pptruser -G audio,video pptruser

USER pptruser

WORKDIR /home/pptruser

COPY puppeteer-browsers-latest.tgz puppeteer-latest.tgz puppeteer-core-latest.tgz ./

# Install @puppeteer/browsers, puppeteer and puppeteer-core into /home/pptruser/node_modules.
RUN npm i ./puppeteer-browsers-latest.tgz ./puppeteer-core-latest.tgz ./puppeteer-latest.tgz \
    && rm ./puppeteer-browsers-latest.tgz ./puppeteer-core-latest.tgz ./puppeteer-latest.tgz \
    && (node -e "require('child_process').execSync(require('puppeteer').executablePath() + ' --credits', {stdio: 'inherit'})" > THIRD_PARTY_NOTICES)

USER root

# Copy package.json and package-lock.json into the Docker container
COPY package*.json ./

# Install the Node.js dependencies in the Docker container
RUN npm install

# Copy the rest of your app's source code into the Docker container
COPY . .
