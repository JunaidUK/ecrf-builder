#!/bin/sh
set -e

SNOWSTORM_URL="${SNOWSTORM_URL:-http://snowstorm:8080}"
SNOMED_ZIP="${SNOMED_ZIP:-/data/snomed.zip}"

echo "============================================"
echo "SNOMED CT Data Loader"
echo "============================================"
echo "Snowstorm URL: $SNOWSTORM_URL"
echo "SNOMED ZIP: $SNOMED_ZIP"

# Wait for Snowstorm to be ready
echo ""
echo "Waiting for Snowstorm to be ready..."
MAX_RETRIES=60
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if curl -s "$SNOWSTORM_URL/version" > /dev/null 2>&1; then
    echo "Snowstorm is ready!"
    break
  fi
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "Waiting for Snowstorm... (attempt $RETRY_COUNT/$MAX_RETRIES)"
  sleep 10
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "ERROR: Snowstorm did not become ready in time"
  exit 1
fi

# Check if data is already loaded
echo ""
echo "Checking if SNOMED CT data is already loaded..."
CONCEPT_COUNT=$(curl -s "$SNOWSTORM_URL/MAIN/concepts?limit=1" | jq -r '.total // 0')

if [ "$CONCEPT_COUNT" -gt 0 ]; then
  echo "SNOMED CT data already loaded ($CONCEPT_COUNT concepts found). Skipping import."
  exit 0
fi

# Check if zip file exists
if [ ! -f "$SNOMED_ZIP" ]; then
  echo "ERROR: SNOMED CT zip file not found at $SNOMED_ZIP"
  exit 1
fi

echo ""
echo "Starting SNOMED CT import..."

# Create import job (extract ID from Location header)
echo "Creating import job..."
IMPORT_LOCATION=$(curl -s -i -X POST "$SNOWSTORM_URL/imports" \
  -H "Content-Type: application/json" \
  -d '{
    "branchPath": "MAIN",
    "createCodeSystemVersion": true,
    "type": "SNAPSHOT"
  }' | grep -i "^Location:" | tr -d '\r' | sed 's/Location: //')

if [ -z "$IMPORT_LOCATION" ]; then
  echo "ERROR: Failed to create import job (no Location header)"
  exit 1
fi

# Extract import ID from location URL
IMPORT_ID=$(echo "$IMPORT_LOCATION" | sed 's|.*/imports/||')

if [ -z "$IMPORT_ID" ]; then
  echo "ERROR: Failed to extract import ID from location: $IMPORT_LOCATION"
  exit 1
fi

echo "Import job created with ID: $IMPORT_ID"

# Upload the RF2 archive
echo ""
echo "Uploading SNOMED CT RF2 archive (this may take a while)..."
echo "File size: $(du -h "$SNOMED_ZIP" | cut -f1)"

curl -X POST "$SNOWSTORM_URL/imports/$IMPORT_ID/archive" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@$SNOMED_ZIP" \
  --progress-bar

echo ""
echo "Upload complete. Monitoring import progress..."

# Monitor import progress
echo ""
while true; do
  STATUS_RESPONSE=$(curl -s "$SNOWSTORM_URL/imports/$IMPORT_ID")
  STATUS=$(echo "$STATUS_RESPONSE" | jq -r '.status // "UNKNOWN"')

  case "$STATUS" in
    "COMPLETED")
      echo ""
      echo "============================================"
      echo "SNOMED CT import completed successfully!"
      echo "============================================"

      # Verify the import
      FINAL_COUNT=$(curl -s "$SNOWSTORM_URL/MAIN/concepts?limit=1" | jq -r '.total // 0')
      echo "Total concepts loaded: $FINAL_COUNT"
      exit 0
      ;;
    "FAILED")
      echo ""
      echo "ERROR: Import failed!"
      echo "Response: $STATUS_RESPONSE"
      exit 1
      ;;
    "RUNNING"|"WAITING")
      echo "Import status: $STATUS - waiting..."
      sleep 30
      ;;
    *)
      echo "Import status: $STATUS"
      sleep 30
      ;;
  esac
done
