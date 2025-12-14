# GCP Firewall Setup

## Quick Setup

To allow external access to the Clinical Decision Engine, you need to add a GCP firewall rule.

### Option 1: Using the Script (Recommended)

```bash
# First, authenticate with gcloud
gcloud auth login

# Then run the script
./deploy/vm/add-firewall-rule.sh
```

### Option 2: Manual gcloud Command

```bash
gcloud compute firewall-rules create allow-clinical-decision-engine \
  --allow tcp:8081,tcp:3100,tcp:3101,tcp:3102,tcp:3104 \
  --source-ranges 0.0.0.0/0 \
  --description "Allow Clinical Decision Engine ports"
```

### Option 3: GCP Console

1. Go to [GCP Console](https://console.cloud.google.com/compute/firewalls)
2. Click "Create Firewall Rule"
3. Set the following:
   - **Name**: `allow-clinical-decision-engine`
   - **Direction**: Ingress
   - **Action**: Allow
   - **Targets**: All instances in the network
   - **Source IP ranges**: `0.0.0.0/0`
   - **Protocols and ports**:
     - TCP: `8081,3100,3101,3102,3104`
4. Click "Create"

## Verify Firewall Rule

```bash
gcloud compute firewall-rules list --filter="name:allow-clinical-decision-engine"
```

## Test External Access

After adding the firewall rule, test access:

```bash
curl http://34.136.153.216:8081/
```

You should see the HTML response from the dashboard.

## Ports

- **8081**: Dashboard (React frontend)
- **3100**: Decision Intelligence service
- **3101**: Patient Clinical Data service
- **3102**: Knowledge Evidence service
- **3104**: Integration Interoperability service
