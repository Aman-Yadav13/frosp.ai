# Use the official Node.js 20 as a parent image
FROM node:20

# Set a non-root user for enhanced security
USER node

# Set the working directory in the container
WORKDIR /code

# Copy package.json and package-lock.json (if available) to the working directory
COPY --chown=node:node package*.json ./

# Install dependencies (optimized for production)
RUN npm install

# Copy the rest of your application's code to the working directory with correct permissions
COPY --chown=node:node . .

# Copy the restricted shell script to a directory not affected by volume mounts (e.g., /usr/local/bin)
COPY --chown=node:node restricted_shell.sh /usr/local/bin/restricted_shell.sh

# Make sure the script is executable
RUN chmod +x /usr/local/bin/restricted_shell.sh

# Build your app (TypeScript compile)
RUN npm run build

# Verify the contents of the dist folder for debugging purposes
RUN ls -l /code/dist

# Expose the port your app will use
EXPOSE 3001

# Define the command to run your app using the compiled JavaScript file
CMD ["node", "dist/index.js"]
