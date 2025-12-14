# Alternative Transfer Methods

Since SSH password authentication isn't working, here are alternatives:

## Option 1: Build Images Directly on VM

**On the VM, run:**

```bash
# Clone the repository
cd /tmp
git clone <your-repo-url> clinical-decision-engine
cd clinical-decision-engine
git checkout deploy/docker-container

# Build images
for service in decision-intelligence patient-clinical-data knowledge-evidence workflow-care-pathways integration-interoperability; do
    docker build -f Dockerfile.service --build-arg SERVICE_NAME=$service -t clinical-decision-engine-${service}:latest .
done

docker build -f Dockerfile.dashboard -t clinical-decision-engine-dashboard:latest .
```

## Option 2: Use Docker Registry

**Push images to a registry, then pull on VM:**

```bash
# On local machine - tag and push
docker tag clinical-decision-engine-dashboard:latest your-registry/clinical-decision-engine-dashboard:latest
docker push your-registry/clinical-decision-engine-dashboard:latest

# On VM - pull
docker pull your-registry/clinical-decision-engine-dashboard:latest
```

## Option 3: Use rsync with SSH key

```bash
# Set up SSH key first
ssh-keygen -t ed25519
ssh-copy-id info@34.136.153.216

# Then transfer
rsync -avz /tmp/clinical-decision-engine-images/ info@34.136.153.216:/tmp/clinical-decision-engine-images/
```

## Option 4: Manual File Transfer

1. Compress images directory locally:

   ```bash
   cd /tmp
   tar -czf clinical-decision-engine-images.tar.gz clinical-decision-engine-images/
   ```

2. Upload via web interface or other method to VM

3. On VM, extract and load:
   ```bash
   tar -xzf clinical-decision-engine-images.tar.gz
   cd clinical-decision-engine-images
   for img in *.tar.gz; do gunzip -c $img | docker load; done
   ```

## Option 5: Use SCP with SSH Key

If you have SSH key access from another machine:

```bash
scp -i /path/to/key -r /tmp/clinical-decision-engine-images info@34.136.153.216:/tmp/
```

## Recommended: Build on VM

Since you're already on the VM, **Option 1 (build on VM)** is the simplest. Just clone the repo and build!
