#!/bin/bin/env bash
# Cloudflare KV setup for HarvestMap submission forms.
# Creates the KV namespace and outputs binding instructions.
#
# Prerequisites:
#   - wrangler installed (npm i -g wrangler or brew install wrangler)
#   - wrangler login (run `wrangler login` first)
#
# Usage: bash scripts/setup-kv.sh

set -euo pipefail

echo "=== HarvestMap Cloudflare KV Setup ==="
echo ""

# Create KV namespace for submissions
echo "Creating KV namespace 'harvestmap-submissions'..."
NAMESPACE_OUTPUT=$(wrangler kv namespace create SUBMISSIONS_KV 2>&1) || {
  echo "Error creating namespace: $NAMESPACE_OUTPUT"
  exit 1
}

# Extract namespace ID
NAMESPACE_ID=$(echo "$NAMESPACE_OUTPUT" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$NAMESPACE_ID" ]; then
  echo "Could not extract namespace ID from output."
  echo "Raw output: $NAMESPACE_OUTPUT"
  exit 1
fi

echo ""
echo "KV namespace created successfully."
echo "  Namespace ID: $NAMESPACE_ID"
echo ""

# Generate a random admin token
ADMIN_TOKEN=$(openssl rand -hex 32)
echo "Generated admin token: $ADMIN_TOKEN"
echo ""

echo "=== Next steps (in Cloudflare dashboard) ==="
echo ""
echo "1. Go to your Pages project > Settings > Functions"
echo "2. Add KV namespace binding:"
echo "   Variable name: SUBMISSIONS_KV"
echo "   KV namespace:  harvestmap-submissions"
echo ""
echo "3. Go to Settings > Environment variables"
echo "4. Add secret:"
echo "   Name:  ADMIN_TOKEN"
echo "   Value: $ADMIN_TOKEN"
echo ""
echo "5. Save and redeploy your site."
echo ""
echo "=== Admin access ==="
echo "Visit /admin/review and enter the admin token to review submissions."
echo ""
echo "IMPORTANT: Save your admin token somewhere safe. It won't be shown again."
