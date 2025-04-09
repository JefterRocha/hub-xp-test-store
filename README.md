# README - Hub XP Test Store

Welcome to the **Hub XP Test Store** project. This application is composed of a backend (NestJS), frontend (React with Material-UI), and Lambda functions (Serverless Framework) for managing products, orders, and reports. This guide explains how to set up and run the project locally using Docker and Docker Compose.

## Requirements

Before starting, ensure you have the following requirements installed:

1. **Node.js** (version 20.x or higher):
   - Download and install from [nodejs.org](https://nodejs.org/).
   - Verify the installation:
     ```bash
     node -v
     npm -v
     ```

2. **Docker**:
   - Install Docker Desktop (Windows/Mac) or Docker Engine (Linux) from [docker.com](https://www.docker.com/get-started).
   - Verify:
     ```bash
     docker --version
     ```

3. **Docker Compose**:
   - Usually included with Docker Desktop. Otherwise, install separately (see [docs.docker.com/compose/install/](https://docs.docker.com/compose/install/)).
   - Verify:
     ```bash
     docker compose --version
     ```

4. **Serverless Framework** (optional, for local development and deployment):
   - Install globally:
     ```bash
     npm install -g serverless
     ```
   - Verify:
     ```bash
     serverless --version
     ```

---

## Project Structure

```
hub-xp-test-store/
├── backend/           # NestJS API for products and orders
├── frontend/          # React interface with Material-UI
├── lambda/            # Serverless functions (e.g., provideReport)
├── docker compose.yml # Docker services configuration
├── README.md
└── .gitignore         # Git ignore file
```

---

## Initial Setup

### 1. Clone the Repository
```bash
git clone https://github.com/JefterRocha/hub-xp-test-store.git
cd hub-xp-test-store
```

### 2. Install Dependencies
Navigate to each directory and install Node.js dependencies:

- **Backend**:
  ```bash
  cd backend
  npm install
  cd ..
  ```

- **Frontend**:
  ```bash
  cd frontend
  npm install
  cd ..
  ```

- **Lambda**:
  ```bash
  cd lambda
  npm install
  cd ..
  ```

### 3. Configure Serverless Framework
The `lambda` service uses the Serverless Framework. To run locally or deploy, after the V4, you need to configure credentials.

#### a) Log in to the Serverless Dashboard
1. Run:
   ```bash
   serverless login
   ```
2. Log in to the Serverless Framework dashboard in the browser that opens.
3. After logging in, a configuration file (`~/.serverlessrc`) will be generated in your home directory with your credentials.

#### b) Copy Credentials to Docker
The `docker compose.yml` maps the `~/.serverlessrc` file to the `lambda` container (`- ~/.serverlessrc:/root/.serverlessrc`). Ensure it exists:
```bash
ls ~/.serverlessrc  # Linux/Mac
dir %USERPROFILE%\.serverlessrc  # Windows
```
- If the file doesn’t exist, repeat the login step.

---

## LocalStack Configuration

The file `init-aws.sh` initialize the S3 bucket and SNS topic in LocalStack:

**`init-aws.sh`:**
```bash
#!/bin/bash
#!/bin/bash
awslocal s3 mb s3://prod-img-bkt
awslocal sns create-topic --name NewOrderTopic
```

Make it executable (if necessary):
```bash
chmod +x init-aws.sh
```

---

## How to Run the Project

### 1. Start the Containers
In the project’s root directory:
```bash
docker compose up --build
```
- The `--build` flag forces rebuilding of Docker images if there are changes.

### 2. Verify Services
Confirm that all services are running:
```bash
docker compose ps
```
- You should see `backend`, `frontend`, `mongo`, `localstack`, and `lambda` in the `Up` state.

### 3. Access the Applications
- **Frontend**: Open your browser at `http://localhost:3001`.
  - Product list: `/`.
  - Dashboard: `/dashboard`.
- **Backend**: API available at `http://localhost:3000`.
  - Example: `curl http://localhost:3000/products`.
- **Lambda/provideReport**: This lambda function is set to run once a day but you can use Local Serverless functions at `http://localhost:3000` (via `serverless offline`).
  - Test `provideReport`:
    ```bash
    docker compose exec lambda npx serverless invoke local -f provideReport
    ```
- **Lambda/notifyNewOrder**: This function trigger each time when an Order is created. You can see it log from backend or just run it locally to test.
  - Test `notifyNewOrder`:
    ```bash
    docker compose exec lambda npx serverless invoke local -f notifyNewOrder -d '{"Records":[{"Sns":{"Message":"{\"orderId\":\"123\",\"total\":999,\"productIds\":[\"456\"]}"}}]}'
    ```
  - **scripts/seed.ts**: In first time runing this server you should popupate the database with `scripts/seed.ts`.
    ```bash
    docker compose exec backend npm run seed 
    ```
    

### 4. Logs
View logs for each service for debugging:
```bash
docker compose logs <service>  # E.g., docker compose logs frontend
```

---

## Features

### Frontend
- **Product List**: Displays products with options to edit, delete, and view total sales.
- **Dashboard**: Shows KPIs such as total orders, total revenue, average order value, and orders by period (daily, weekly, monthly).

### Backend
- **Endpoints**:
  - `GET /products`: Lists all products.
  - `DELETE /products/:id`: Deletes a product.
  - `GET /dashboard/metrics`: Returns general or period-based metrics.
  - `GET /dashboard/product-sales/:productId`: Total sales for a product.

### Lambda
- **provideReport**: Generates order reports (total orders and sum of totals).
- **notifyNewOrder**: dispatch notify from new Order using AWS SNS.

---

## Stopping the Project
To stop the containers:
```bash
docker compose down
```
- To remove volumes (e.g., MongoDB data):
  ```bash
  docker compose down -v
  ```

---

## Deployment (Optional)
If you want to deploy the Lambda functions to AWS:
1. Configure AWS credentials in Serverless:
   ```bash
   serverless config credentials --provider aws --key YOUR_ACCESS_KEY --secret YOUR_SECRET_KEY
   ```
2. Adjust the `MONGODB_URI` in `lambda/serverless.yml` to an external MongoDB (e.g., Atlas).
3. Deploy:
   ```bash
   cd lambda
   serverless deploy
   ```

---

## Troubleshooting

- **MongoDB Not Connecting**:
  - Check the `MONGODB_URI` in `docker compose.yml`.
  - Test: `docker compose exec mongo mongo mongodb://localhost:27017/hub-xp-test-store`.

- **Frontend Not Loading**:
  - Check logs: `docker compose logs frontend`.
  - Ensure `npm run dev --host 0.0.0.0 --port 3000` is in the `command`.

- **Lambda Fails**:
  - Ensure `~/.serverlessrc` exists and is mapped.
  - Test locally: `docker compose exec lambda bash`.


---

## License
This project is for free to use and does not have a defined public license.