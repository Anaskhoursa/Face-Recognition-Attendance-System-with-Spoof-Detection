FROM node:20

# Install basic tools
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm install --production

# Copy the rest of your code
COPY . .

# Hugging Face runs on port 7860
ENV PORT=7860
EXPOSE 7860

CMD ["npm", "run", "dev"]