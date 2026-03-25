FROM node:18 as builder

WORKDIR /app

COPY . .
RUN npm install
RUN cd packages/mpc && npm run build && \
    cd ../biconomy/nextJs && npm run build && \
    cd ../../stackup/nextJs && npm run build && \
    cd ../../pimlico/nextJs && npm run build && \
    cd ../../zerodev/nextJs && npm run build && \
    cd ../../alchemy/nextJs && npm run build

    ENV SERVICE_NAME=biconomy

CMD if [ "$SERVICE_NAME" = "biconomy" ]; then \
      cd packages/biconomy/nextJs && npm start; \
    elif [ "$SERVICE_NAME" = "stackup" ]; then \
      cd packages/stackup/nextJs && npm start; \
    elif [ "$SERVICE_NAME" = "pimlico" ]; then \
      cd packages/pimlico/nextJs && npm start; \
    elif [ "$SERVICE_NAME" = "zerodev" ]; then \
      cd packages/zerodev/nextJs && npm start; \
    elif [ "$SERVICE_NAME" = "alchemy" ]; then \
      cd packages/alchemy/nextJs && npm start; \
    else \
      echo "Unknown service: $SERVICE_NAME"; exit 1; \
    fi