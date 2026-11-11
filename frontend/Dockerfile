FROM node:20

# Create a non-root user (Hugging Face requirement)
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /home/user/app

# Copy package files and install
COPY --chown=user package*.json ./
RUN npm install

# Copy the rest of the code
COPY --chown=user . .

# Force Vite/React to listen on Port 7860 and 0.0.0.0
ENV PORT=7860
ENV HOST=0.0.0.0
EXPOSE 7860

# Run dev mode
# Note: We use --host to allow external access to the dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "7860"]