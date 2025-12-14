# Traefik Configuration for Clinical Decision Engine

## Overview

The Clinical Decision Engine is configured to use Traefik reverse proxy for routing:

- **Mixpost**: `http://34.136.153.216/mixpost`
- **CDE Dashboard**: `http://34.136.153.216/cde`
- **CDE APIs**: `http://34.136.153.216/api/v1/{service-name}`

## Configuration

The services are configured with Traefik labels in `docker-compose.yml`:

### Dashboard

- **Path**: `/cde`
- **Port**: 8080 (internal)
- **Strip Prefix**: Yes (removes `/cde` before forwarding)

### Services

- **Decision Intelligence**: `/api/v1/decision-intelligence`
- **Patient Clinical Data**: `/api/v1/patient-clinical-data`
- **Knowledge Evidence**: `/api/v1/knowledge-evidence`
- **Integration Interoperability**: `/api/v1/integration-interoperability`

## Network

All services are connected to:

- `clinical-decision-engine-network` (internal communication)
- `mixpost_default` (Traefik network for routing)

## Troubleshooting

### Check if Traefik can reach dashboard:

```bash
docker exec mixpost_traefik_1 wget -qO- http://clinical-decision-engine-dashboard:8080/
```

### Check Traefik logs:

```bash
docker logs mixpost_traefik_1 --tail 50
```

### Restart Traefik to pick up new labels:

```bash
docker restart mixpost_traefik_1
```

### Verify labels:

```bash
docker inspect clinical-decision-engine-dashboard | grep -A 20 'Labels'
```

## Access URLs

- Dashboard: http://34.136.153.216/cde
- API Base: http://34.136.153.216/api/v1
