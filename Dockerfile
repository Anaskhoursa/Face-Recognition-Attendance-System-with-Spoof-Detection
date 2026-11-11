FROM node:20

# Set the working directory
WORKDIR /app

# Copy the root package files first
COPY package*.json ./
RUN npm install

# Copy the backend folder and install its dependencies
COPY backend/ ./backend/
RUN npm install --prefix backend

# Copy the frontend folder and install its dependencies
COPY frontend/ ./frontend/
RUN npm install --prefix frontend

# Fix permissions for the 'node' user so Vite can write temp files
RUN chown -R node:node /app
USER node

# Hugging Face Public Port
EXPOSE 7860

# Port 5000 for backend (internal), 7860 for frontend (public)
ENV BACKEND_PORT=5000
ENV FRONTEND_PORT=7860

# Run the root dev script which starts both
CMD ["npm", "run", "dev"]