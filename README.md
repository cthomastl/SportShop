# SportShop

A full-stack e-commerce application for sports equipment. Built with Spring Boot (Java 17), Nginx, and PostgreSQL.

## Architecture

```
Browser → Nginx (port 80) → Spring Boot API (port 8080) → PostgreSQL
```

Nginx serves the static frontend and reverse-proxies `/api/*` requests to the Spring Boot backend. In local dev, PostgreSQL runs as a Docker container. In production, it connects to an external database (e.g. AWS RDS).

---

## Running Locally

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/SportShop.git
cd SportShop
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

The defaults in `.env.example` work out of the box for local development — no edits needed. A local PostgreSQL container is created automatically with those credentials.

### 3. Start the app

```bash
docker compose up --build
```

| Service  | URL                         |
|----------|-----------------------------|
| Frontend | http://localhost            |
| API      | http://localhost:8080/api   |
| API health | http://localhost:8080/actuator/health |

### 4. Stop the app

```bash
docker compose down          # stop containers (data preserved)
docker compose down -v       # stop containers and delete the database volume
```

---

## Environment Variables

| Variable    | Description                              | Default (local)                              |
|-------------|------------------------------------------|----------------------------------------------|
| `DB_URL`    | JDBC connection string                   | `jdbc:postgresql://db:5432/sportshop`        |
| `DB_USER`   | Database username                        | `sportshop`                                  |
| `DB_PASSWORD` | Database password                      | `sportshop`                                  |
| `REGISTRY`  | Container registry (prod/CI only)        | —                                            |
| `IMAGE_TAG` | Docker image tag (prod/CI only)          | `latest`                                     |

Real values go in `.env` (gitignored). Never commit credentials.

---

## Project Structure

```
SportShop/
├── api/                    # Spring Boot REST API (Java 17)
│   ├── src/main/java/com/sportshop/
│   │   ├── controller/     # REST endpoints (/api/products, /api/orders)
│   │   ├── service/        # Business logic
│   │   ├── repository/     # Spring Data JPA
│   │   ├── model/          # JPA entities
│   │   └── dto/            # Request/response objects
│   └── src/main/resources/
│       └── application.properties
├── web/                    # Static frontend (HTML/CSS/JS + Nginx)
│   ├── html/               # Frontend pages
│   │   └── js/             # api.js, products.js, cart.js, checkout.js
│   └── nginx.conf          # Reverse proxy config
├── db/
│   └── init.sql            # Schema + seed data
├── k8s/                    # Kubernetes manifests
├── .github/workflows/      # CI/CD pipelines
├── docker-compose.yml      # Local development
├── docker-compose.prod.yml # Production (uses pre-built images)
└── .env.example            # Environment variable template
```

---

## Deploying to Kubernetes

### Prerequisites

- A Kubernetes cluster (EKS, GKE, AKS, or local with [kind](https://kind.sigs.k8s.io/))
- `kubectl` configured to point at your cluster
- An nginx ingress controller installed:

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.1/deploy/static/provider/cloud/deploy.yaml
```

### 1. Fill in your database credentials

Edit `k8s/api-secret.yaml` with your production database values, then apply it:

```bash
kubectl apply -f k8s/api-secret.yaml
```

> Tip: keep `k8s/api-secret.yaml` in `.gitignore` if you store real values there locally.

### 2. Update image references

In `k8s/api-deployment.yaml` and `k8s/web-deployment.yaml`, replace `YOUR_GITHUB_USERNAME` with your actual GitHub username.

### 3. Update your domain

In `k8s/ingress.yaml`, replace `sportshop.example.com` with your actual domain.

### 4. Apply all manifests

```bash
kubectl apply -f k8s/
```

### 5. Check the rollout

```bash
kubectl get pods -n sportshop
kubectl get ingress -n sportshop
```

---

## CI/CD (GitHub Actions)

Two workflows are included in `.github/workflows/`:

### `ci.yml` — Continuous Integration

Runs on every push and pull request:
- Builds and tests the Spring Boot API (`mvn verify`)
- Builds both Docker images to catch build errors early

### `deploy.yml` — Continuous Deployment

Runs automatically on push to `main` (or manually via workflow dispatch):
1. Builds and pushes Docker images to [GitHub Container Registry](https://ghcr.io) tagged with the short commit SHA
2. Applies the Kubernetes manifests
3. Rolls out the new images and waits for the deployments to become healthy

### Required GitHub secrets

Add these in **Settings → Secrets and variables → Actions**:

| Secret       | Description                                                                 |
|--------------|-----------------------------------------------------------------------------|
| `KUBE_CONFIG` | Your kubeconfig file, base64-encoded: `cat ~/.kube/config \| base64`       |

The `GITHUB_TOKEN` secret is provided automatically by GitHub Actions for pushing images to the container registry.

### Required GitHub environment

The deploy workflow uses a `production` environment for an approval gate. Create it in **Settings → Environments → New environment** and name it `production`. You can add required reviewers here for manual approval before each production deploy.

---

## Hosting the Frontend on S3 (Optional)

The frontend is plain static files and can be hosted on S3 + CloudFront instead of the Nginx container:

1. Upload the contents of `web/html/` to an S3 bucket with static website hosting enabled
2. In `web/html/js/api.js`, change `const API_BASE = '/api'` to the full URL of your API (e.g. `https://api.sportshop.com/api`)
3. In `api/src/main/java/com/sportshop/config/CorsConfig.java`, replace `allowedOrigins("*")` with your CloudFront domain
4. The Nginx web container is no longer needed for production
