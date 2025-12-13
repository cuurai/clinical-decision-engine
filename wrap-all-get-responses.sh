#!/bin/bash

# For each OpenAPI file, wrap unwrapped 200/201/204 responses from GET/PATCH/DELETE
# These are currently returning raw schemas but handlers wrap them

echo "Wrapping GET/PATCH/DELETE responses..."

# For integration-interoperability as an example
file="openapi/openapi-integration-interoperability.yaml"
response_schema="IntApiResponse"

# Find GET endpoints and wrap their 200 responses
# Use sed to find patterns like:
#   get: 
#     ...
#     responses:
#       "200":
#         ...
#         schema:
#           $ref: "#/components/schemas/ExternalSystem"

# This is complex with sed, so let's just check if the current state already works
cd packages/core
npm run build 2>&1 | grep "error TS" | wc -l
