#!/bin/bash
set -e

FHIR_SERVER_URL="${FHIR_SERVER_URL:-http://hapi-fhir:8080/fhir}"
ZIP_FILE="${ZIP_FILE:-/data/synthea_sample_data_fhir_r4_nov2021.zip}"
DATA_DIR="/data/synthea"
MARKER_FILE="/data/.data-loaded"

echo "=========================================="
echo "Synthea Data Loader for HAPI FHIR"
echo "=========================================="
echo "FHIR Server: $FHIR_SERVER_URL"
echo "ZIP File: $ZIP_FILE"

# Check if data has already been loaded
if [ -f "$MARKER_FILE" ]; then
    echo "Data has already been loaded. Skipping..."
    echo "To reload, delete the marker file: $MARKER_FILE"
    exit 0
fi

# Wait for HAPI FHIR server to be ready
echo "Waiting for HAPI FHIR server to be ready..."
MAX_RETRIES=60
RETRY_COUNT=0

until curl -sf "${FHIR_SERVER_URL}/metadata" > /dev/null 2>&1; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; then
        echo "Error: HAPI FHIR server did not become ready in time"
        exit 1
    fi
    echo "Waiting for FHIR server... (attempt $RETRY_COUNT/$MAX_RETRIES)"
    sleep 5
done

echo "HAPI FHIR server is ready!"

# Unzip the data if not already extracted
if [ ! -d "$DATA_DIR/fhir" ]; then
    echo "Extracting Synthea data..."
    mkdir -p "$DATA_DIR"
    unzip -q "$ZIP_FILE" -d "$DATA_DIR"
    echo "Extraction complete."
fi

# Function to load a bundle file
load_bundle() {
    local file="$1"
    local filename
    filename=$(basename "$file")

    local http_code

    # Make the request with timeout and capture http code
    http_code=$(curl -s -o /dev/null -w "%{http_code}" \
        --max-time 120 \
        -X POST \
        -H "Content-Type: application/fhir+json" \
        --data-binary "@$file" \
        "$FHIR_SERVER_URL" 2>/dev/null)

    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        return 0
    else
        echo "HTTP $http_code for $filename"
        return 1
    fi
}

LOADED=0
FAILED=0

# Step 1: Load hospital information (Organizations, Locations)
echo ""
echo "Step 1: Loading hospital information..."
for file in "$DATA_DIR"/fhir/hospitalInformation*.json; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        echo "Loading: $filename"
        if load_bundle "$file"; then
            LOADED=$((LOADED + 1))
            echo "  Success: $filename"
        else
            FAILED=$((FAILED + 1))
            echo "  Failed: $filename"
        fi
    fi
done

# Step 2: Load practitioner information (Practitioners, PractitionerRoles)
echo ""
echo "Step 2: Loading practitioner information..."
for file in "$DATA_DIR"/fhir/practitionerInformation*.json; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        echo "Loading: $filename"
        if load_bundle "$file"; then
            LOADED=$((LOADED + 1))
            echo "  Success: $filename"
        else
            FAILED=$((FAILED + 1))
            echo "  Failed: $filename"
        fi
    fi
done

# Step 3: Load patient bundles
echo ""
echo "Step 3: Loading patient bundles..."
PATIENT_COUNT=0
PATIENT_TOTAL=$(find "$DATA_DIR/fhir" -name "*.json" -type f ! -name "hospitalInformation*" ! -name "practitionerInformation*" | wc -l | tr -d ' ')
echo "Found $PATIENT_TOTAL patient bundles to load"

for file in "$DATA_DIR"/fhir/*.json; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")

        # Skip info files (already loaded)
        case "$filename" in
            hospitalInformation*|practitionerInformation*)
                continue
                ;;
        esac

        PATIENT_COUNT=$((PATIENT_COUNT + 1))

        if load_bundle "$file"; then
            LOADED=$((LOADED + 1))
        else
            FAILED=$((FAILED + 1))
            echo "  Failed: $filename"
        fi

        # Progress indicator every 25 patients
        if [ $((PATIENT_COUNT % 25)) -eq 0 ]; then
            echo "  Progress: $PATIENT_COUNT / $PATIENT_TOTAL patients processed (loaded: $LOADED, failed: $FAILED)"
        fi

        # Delay to prevent overwhelming the server
        sleep 0.5
    fi
done

echo ""
echo "=========================================="
echo "Data loading complete!"
echo "=========================================="
echo "Total bundles loaded: $LOADED"
echo "Total bundles failed: $FAILED"

# Verify by counting patients
echo ""
echo "Verifying data..."
PATIENT_RESULT=$(curl -s "${FHIR_SERVER_URL}/Patient?_summary=count")
PATIENT_TOTAL_LOADED=$(echo "$PATIENT_RESULT" | jq -r '.total // 0')
echo "Patients in FHIR server: $PATIENT_TOTAL_LOADED"

if [ "$PATIENT_TOTAL_LOADED" -gt 0 ]; then
    echo "SUCCESS: Data loaded successfully!"
    # Create marker file
    touch "$MARKER_FILE"
else
    echo "WARNING: No patients found after loading. Check for errors above."
    exit 1
fi

echo "Done!"
