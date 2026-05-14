# deploy/

Kubernetes deployment configs for Track Promises.

## Structure

```text
deploy/
├── k8s/                          # Plain kubectl manifests (apply in order)
│   ├── 00-namespace.yaml         # track-promises-prod namespace
│   ├── 01-secrets.template.yaml  # Secret template — copy, fill, never commit
│   ├── 02-postgres.yaml          # PostgreSQL StatefulSet + headless Service
│   ├── 03-migrate-job.yaml       # One-shot DB migration + foundation seed Job
│   ├── 04-web.yaml               # Next.js web Deployment + Service
│   └── 05-api.yaml               # Hono API Deployment + Service
└── helm/
    └── track-promises/           # Helm chart (wraps all of the above)
        ├── Chart.yaml
        ├── values.yaml           # Defaults
        ├── values-prod.yaml      # Production overrides (m1s docker-desktop)
        └── templates/
            ├── _helpers.tpl
            ├── web-deployment.yaml
            ├── web-service.yaml
            ├── web-ingress.yaml
            ├── api-deployment.yaml
            ├── api-service.yaml
            ├── api-ingress.yaml
            ├── postgres.yaml     # StatefulSet + headless Service
            └── migrate-job.yaml  # Helm hook migration + foundation seed Job
```

## Environment

| Machine  | Role        | Notes                                        |
| -------- | ----------- | -------------------------------------------- |
| m4studio | Development | Local docker compose, Helm install from here |
| m1studio | K8s cluster | Docker Desktop k8s, receives traffic via CF  |

Traffic path: **Cloudflare DNS → Cloudflare Tunnel → m1studio → docker-desktop k8s → nginx-ingress**

Namespace: `track-promises-prod`

## Prerequisites on m1studio

- Docker Desktop with Kubernetes enabled
- `nginx-ingress` controller installed
- `cert-manager` installed with `letsencrypt-prod` ClusterIssuer
- `regcred` imagePullSecret in `track-promises-prod` namespace (for `ghcr.io/eduluma/*`)
- Cloudflare Tunnel routing `*.eduluma.org` to the cluster ingress
- All subdomains are 1-level deep (`trackpromises.eduluma.org`, `trackpromises-api.eduluma.org`) — covered by `*.eduluma.org` Universal SSL; no cert-manager needed for TLS termination at CF edge

## Quick Start (Helm — recommended)

```bash
# 1. Create namespace
kubectl apply -f deploy/k8s/00-namespace.yaml

# 2. Create secrets (from m4studio, kubectl context pointed at m1s)
cp deploy/k8s/01-secrets.template.yaml /tmp/tp-secrets.yaml
# Edit /tmp/tp-secrets.yaml with real values, including BREVO_API_KEY for email delivery
kubectl apply -f /tmp/tp-secrets.yaml

# 3. Create regcred for ghcr.io (if not already present)
kubectl create secret docker-registry regcred \
  --docker-server=ghcr.io \
  --docker-username=<github-user> \
  --docker-password=<ghcr-token> \
  -n track-promises-prod

# 4. Install / upgrade
helm upgrade --install track-promises deploy/helm/track-promises \
  -n track-promises-prod --create-namespace \
  -f deploy/helm/track-promises/values-prod.yaml

# The Helm migrate hook applies schema migrations and then runs the safe
# foundation seed so tenant/timeline/promise rows exist for voting and audit.
# Production keeps TRACK_PROMISES_INCLUDE_SAMPLE_SEED_DATA=false so demo users,
# sample votes, and sample moderation rows are not created.
# Production disables the login-page demo account list via
# TRACK_PROMISES_SHOW_DEMO_ACCOUNTS=false in the web env values.
```

## Quick Start (Plain kubectl — for debugging)

```bash
kubectl apply -f deploy/k8s/00-namespace.yaml
kubectl apply -f /tmp/tp-secrets.yaml          # your filled-in secrets copy
kubectl apply -f deploy/k8s/02-postgres.yaml
kubectl apply -f deploy/k8s/03-migrate-job.yaml
kubectl apply -f deploy/k8s/04-web.yaml
kubectl apply -f deploy/k8s/05-api.yaml
```

## Useful Commands

```bash
# Tail all pod logs in namespace
kubectl logs -n track-promises-prod -l app.kubernetes.io/name=track-promises -f --max-log-requests 5

# Check migration job
kubectl get job -n track-promises-prod track-promises-migrate

# Re-run migration (delete job so the Helm hook can recreate it)
kubectl delete job -n track-promises-prod track-promises-migrate

# Port-forward web locally (bypass ingress)
kubectl port-forward -n track-promises-prod svc/track-promises-web 3000:3000
```
