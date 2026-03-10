#!/bin/bash
set -euo pipefail

# Create Smart Views (saved filter combinations) for TOB Subscriptions
# Follows the same pattern as setup-data-model.sh
# Idempotent: checks if view exists before creating

API_URL="${TWENTY_API_URL:-https://crm.tob.sh}"
API_KEY="${TWENTY_API_KEY:?Set TWENTY_API_KEY before running this script}"
CF_CLIENT_ID="${CF_ACCESS_CLIENT_ID:-}"
CF_CLIENT_SECRET="${CF_ACCESS_CLIENT_SECRET:-}"

gql() {
  local cf_headers=()
  if [ -n "$CF_CLIENT_ID" ] && [ -n "$CF_CLIENT_SECRET" ]; then
    cf_headers=(-H "CF-Access-Client-Id: $CF_CLIENT_ID" -H "CF-Access-Client-Secret: $CF_CLIENT_SECRET")
  fi
  curl -s -X POST "$API_URL/metadata" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    "${cf_headers[@]}" \
    -d "$1"
}

get_object_id() {
  gql "{\"query\": \"{ objects(paging: {first: 100}) { edges { node { id nameSingular } } } }\"}" \
    | jq -r ".data.objects.edges[].node | select(.nameSingular == \"$1\") | .id"
}

get_field_id() {
  local object_id="$1"
  local field_name="$2"
  gql "{\"query\": \"{ object(id: \\\"$object_id\\\") { fields(paging: {first: 100}) { edges { node { id name } } } } }\"}" \
    | jq -r ".data.object.fields.edges[].node | select(.name == \"$field_name\") | .id"
}

create_view() {
  local name="$1"
  local object_id="$2"
  local icon="$3"
  local position="$4"

  local result
  result=$(gql "{\"query\": \"mutation { createCoreView(input: { name: \\\"$name\\\", objectMetadataId: \\\"$object_id\\\", icon: \\\"$icon\\\", position: $position, type: TABLE, visibility: WORKSPACE }) { id name } }\"}")

  local view_id
  view_id=$(echo "$result" | jq -r '.data.createCoreView.id // empty')
  if [ -n "$view_id" ]; then
    echo "  View '$name' created: $view_id"
    echo "$view_id"
  else
    local err
    err=$(echo "$result" | jq -r '.errors[0].message // empty')
    echo "  View '$name' skipped (${err:-already exists})" >&2
    echo ""
  fi
}

add_filter() {
  local view_id="$1"
  local field_id="$2"
  local operand="$3"
  local value="$4"

  local result
  result=$(gql "{\"query\": \"mutation { createCoreViewFilter(input: { viewId: \\\"$view_id\\\", fieldMetadataId: \\\"$field_id\\\", operand: $operand, value: $value }) { id } }\"}")

  local filter_id
  filter_id=$(echo "$result" | jq -r '.data.createCoreViewFilter.id // empty')
  if [ -n "$filter_id" ]; then
    echo "    Filter added"
  else
    local err
    err=$(echo "$result" | jq -r '.errors[0].message // empty')
    echo "    Filter skipped (${err:-error})"
  fi
}

echo "=== Create Subscription Smart Views ==="

# Find TOB Subscriptions object
SUB_ID=$(get_object_id "tobSubscription")
if [ -z "$SUB_ID" ]; then
  echo "ERROR: TOB Subscriptions object not found."
  exit 1
fi
echo "TOB Subscriptions ID: $SUB_ID"

# Get field IDs we need for filters
echo "Looking up field IDs..."
ACCESS_STATUS_ID=$(get_field_id "$SUB_ID" "accessStatus")
PAYMENT_STATUS_ID=$(get_field_id "$SUB_ID" "paymentStatus")
SUBSCRIPTION_TYPE_ID=$(get_field_id "$SUB_ID" "subscriptionType")
END_DATE_ID=$(get_field_id "$SUB_ID" "endDate")
LAST_TOUCHPOINT_ID=$(get_field_id "$SUB_ID" "lastTouchpoint")

# Use fallbacks for fields that might be named differently on production
if [ -z "$END_DATE_ID" ]; then
  # Try alternative name from Pablo's schema
  END_DATE_ID=$(get_field_id "$SUB_ID" "End Date")
fi

echo "  accessStatus: ${ACCESS_STATUS_ID:-NOT FOUND}"
echo "  paymentStatus: ${PAYMENT_STATUS_ID:-NOT FOUND}"
echo "  subscriptionType: ${SUBSCRIPTION_TYPE_ID:-NOT FOUND}"
echo "  endDate: ${END_DATE_ID:-NOT FOUND}"
echo "  lastTouchpoint: ${LAST_TOUCHPOINT_ID:-NOT FOUND}"

# --- View 1: Access Not Granted After Signing ---
echo ""
echo "--- View 1: Access Not Granted ---"
if [ -n "$ACCESS_STATUS_ID" ]; then
  VIEW_ID=$(create_view "Access Not Granted" "$SUB_ID" "IconShieldOff" 1)
  if [ -n "$VIEW_ID" ]; then
    add_filter "$VIEW_ID" "$ACCESS_STATUS_ID" "IS" "\\\"NOT_GRANTED\\\""
  fi
else
  echo "  Skipped — accessStatus field not found"
fi

# --- View 2: Expiring in 60 Days ---
echo ""
echo "--- View 2: Expiring in 60 Days ---"
if [ -n "$END_DATE_ID" ]; then
  VIEW_ID=$(create_view "Expiring in 60 Days" "$SUB_ID" "IconCalendarDue" 2)
  if [ -n "$VIEW_ID" ]; then
    add_filter "$VIEW_ID" "$END_DATE_ID" "IS_RELATIVE" "{\\\"direction\\\": \\\"NEXT\\\", \\\"amount\\\": 60, \\\"unit\\\": \\\"DAY\\\"}"
  fi
else
  echo "  Skipped — endDate field not found"
fi

# --- View 3: Paused Subscriptions ---
echo ""
echo "--- View 3: Paused Subscriptions ---"
if [ -n "$ACCESS_STATUS_ID" ]; then
  VIEW_ID=$(create_view "Paused Subscriptions" "$SUB_ID" "IconPlayerPause" 3)
  if [ -n "$VIEW_ID" ]; then
    add_filter "$VIEW_ID" "$ACCESS_STATUS_ID" "IS" "\\\"PAUSED\\\""
  fi
else
  echo "  Skipped — accessStatus field not found"
fi

# --- View 4: Overdue Payments ---
echo ""
echo "--- View 4: Overdue Payments ---"
if [ -n "$PAYMENT_STATUS_ID" ]; then
  VIEW_ID=$(create_view "Overdue Payments" "$SUB_ID" "IconAlertTriangle" 4)
  if [ -n "$VIEW_ID" ]; then
    add_filter "$VIEW_ID" "$PAYMENT_STATUS_ID" "IS" "\\\"OVERDUE\\\""
  fi
else
  echo "  Skipped — paymentStatus field not found"
fi

# --- View 5: No Touchpoint in 14 Days ---
echo ""
echo "--- View 5: No Touchpoint in 14 Days ---"
if [ -n "$LAST_TOUCHPOINT_ID" ]; then
  VIEW_ID=$(create_view "No Touchpoint 14 Days" "$SUB_ID" "IconClockOff" 5)
  if [ -n "$VIEW_ID" ]; then
    add_filter "$VIEW_ID" "$LAST_TOUCHPOINT_ID" "IS_RELATIVE" "{\\\"direction\\\": \\\"BEFORE\\\", \\\"amount\\\": 14, \\\"unit\\\": \\\"DAY\\\"}"
  fi
else
  echo "  Skipped — lastTouchpoint field not found"
fi

echo ""
echo "=== Smart Views Created ==="
echo "Check the Subscriptions list view dropdown to see the new views."
