#!/usr/bin/env python3
"""
Create Smart Views (saved filter combinations) for TOB Subscriptions.
Idempotent: skips views that already exist (by name).

Usage:
  TWENTY_API_URL=http://localhost:3000 TWENTY_API_KEY=<token> python3 deploy/create-subscription-views.py
"""

import json
import os
import sys
import urllib.request

API_URL = os.environ.get("TWENTY_API_URL", "https://crm.tob.sh")
API_KEY = os.environ.get("TWENTY_API_KEY")
CF_CLIENT_ID = os.environ.get("CF_ACCESS_CLIENT_ID", "")
CF_CLIENT_SECRET = os.environ.get("CF_ACCESS_CLIENT_SECRET", "")

if not API_KEY:
    print("ERROR: Set TWENTY_API_KEY before running this script.")
    sys.exit(1)


def gql(query, variables=None):
    body = {"query": query}
    if variables:
        body["variables"] = variables
    data = json.dumps(body).encode()
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}",
    }
    if CF_CLIENT_ID and CF_CLIENT_SECRET:
        headers["CF-Access-Client-Id"] = CF_CLIENT_ID
        headers["CF-Access-Client-Secret"] = CF_CLIENT_SECRET
    req = urllib.request.Request(f"{API_URL}/metadata", data=data, headers=headers)
    resp = urllib.request.urlopen(req)
    return json.loads(resp.read())


def get_object_id(name_singular):
    result = gql("{ objects(paging: {first: 100}) { edges { node { id nameSingular } } } }")
    for edge in result["data"]["objects"]["edges"]:
        if edge["node"]["nameSingular"] == name_singular:
            return edge["node"]["id"]
    return None


def get_field_id(object_id, field_name):
    result = gql(
        '{ object(id: "' + object_id + '") { fields(paging: {first: 100}) { edges { node { id name } } } } }'
    )
    for edge in result["data"]["object"]["fields"]["edges"]:
        if edge["node"]["name"] == field_name:
            return edge["node"]["id"]
    return None


def get_existing_views(object_id):
    result = gql(
        '{ getCoreViews { id name objectMetadataId } }'
    )
    views = {}
    for view in result["data"]["getCoreViews"]:
        if view["objectMetadataId"] == object_id:
            views[view["name"]] = view["id"]
    return views


def delete_view(view_id):
    result = gql(
        """mutation DeleteView($id: String!) {
            deleteCoreView(id: $id) { id }
        }""",
        {"id": view_id},
    )
    if "errors" in result:
        print(f"  Delete ERROR: {result['errors'][0]['message']}")
        return False
    print(f"  Deleted existing view: {view_id}")
    return True


def create_view(name, object_id, icon, position, existing_views):
    if name in existing_views:
        print(f"  View '{name}' exists — deleting to recreate with correct filters")
        delete_view(existing_views[name])
        del existing_views[name]

    result = gql(
        """mutation CreateView($input: CreateViewInput!) {
            createCoreView(input: $input) { id name }
        }""",
        {
            "input": {
                "name": name,
                "objectMetadataId": object_id,
                "icon": icon,
                "position": position,
                "type": "TABLE",
                "visibility": "WORKSPACE",
            }
        },
    )
    if "errors" in result:
        print(f"  View '{name}' ERROR: {result['errors'][0]['message']}")
        return None
    view_id = result["data"]["createCoreView"]["id"]
    print(f"  View '{name}' created: {view_id}")
    return view_id


def add_filter(view_id, field_id, operand, value):
    result = gql(
        """mutation CreateFilter($input: CreateViewFilterInput!) {
            createCoreViewFilter(input: $input) { id }
        }""",
        {
            "input": {
                "viewId": view_id,
                "fieldMetadataId": field_id,
                "operand": operand,
                "value": value,
            }
        },
    )
    if "errors" in result:
        print(f"    Filter ERROR: {result['errors'][0]['message']}")
        return False
    print(f"    Filter added ({operand} {value})")
    return True


def main():
    print("=== Create Subscription Smart Views ===\n")

    # Find TOB Subscriptions object
    sub_id = get_object_id("tobSubscription")
    if not sub_id:
        print("ERROR: TOB Subscriptions object not found.")
        sys.exit(1)
    print(f"TOB Subscriptions ID: {sub_id}")

    # Get field IDs
    fields = {}
    for name in ["accessStatus", "paymentStatus", "subscriptionType", "endDate", "lastTouchpoint"]:
        fid = get_field_id(sub_id, name)
        fields[name] = fid
        status = fid if fid else "NOT FOUND"
        print(f"  {name}: {status}")

    # Get existing views to avoid duplicates
    existing = get_existing_views(sub_id)
    print(f"\nExisting views for this object: {len(existing)}")

    # --- View 1: Access Not Granted ---
    print("\n--- View 1: Access Not Granted ---")
    if fields["accessStatus"]:
        vid = create_view("Access Not Granted", sub_id, "IconShieldOff", 1, existing)
        if vid:
            add_filter(vid, fields["accessStatus"], "IS", json.dumps(["NOT_GRANTED"]))

    # --- View 2: Expiring in 60 Days ---
    print("\n--- View 2: Expiring in 60 Days ---")
    if fields["endDate"]:
        vid = create_view("Expiring in 60 Days", sub_id, "IconCalendarDue", 2, existing)
        if vid:
            add_filter(vid, fields["endDate"], "IS_RELATIVE", "NEXT_60_DAY")
    else:
        print("  Skipped — endDate field not found")

    # --- View 3: Paused Subscriptions ---
    print("\n--- View 3: Paused Subscriptions ---")
    if fields["accessStatus"]:
        vid = create_view("Paused Subscriptions", sub_id, "IconPlayerPause", 3, existing)
        if vid:
            add_filter(vid, fields["accessStatus"], "IS", json.dumps(["PAUSED"]))

    # --- View 4: Overdue Payments ---
    print("\n--- View 4: Overdue Payments ---")
    if fields["paymentStatus"]:
        vid = create_view("Overdue Payments", sub_id, "IconAlertTriangle", 4, existing)
        if vid:
            add_filter(vid, fields["paymentStatus"], "IS", json.dumps(["OVERDUE"]))

    # --- View 5: No Touchpoint in 14 Days ---
    print("\n--- View 5: No Touchpoint in 14 Days ---")
    if fields["lastTouchpoint"]:
        vid = create_view("No Touchpoint 14 Days", sub_id, "IconClockOff", 5, existing)
        if vid:
            add_filter(vid, fields["lastTouchpoint"], "IS_RELATIVE", "PAST_14_DAY")

    print("\n=== Done ===")
    print("Check the Subscriptions list view dropdown to see the new views.")


if __name__ == "__main__":
    main()
