# Design: Pause Subscription Action

## Overview
A "Pause Subscription" action button on the TOB Subscription record detail page. Opens a right drawer with a guided form, shows a preview of the impact, then updates the record on confirm.

## User Flow
1. User opens a subscription record
2. Clicks "Pause Subscription" in the action menu
3. Right drawer opens with form: Pause Start Date, Duration (weeks), Reason (dropdown), Evidence (checkbox)
4. Preview section shows: current end date, new end date, access impact
5. User clicks "Confirm Pause"
6. System updates: end date shifted, access status → "Paused", timeline event created
7. Drawer closes, record refreshes

## Validation
- Can't pause if status is "Ended"
- Can't pause if access is "Withdrawn"
- Duration: 1-12 weeks
- Start date can't be in the past

## Technical Approach
- Custom ActionConfig for tobSubscription in getActionConfig.ts
- PauseSubscriptionAction component opens right drawer
- GraphQL mutation updates subscription fields
- Timeline event via TimelineActivity system

## Files
- NEW: TobSubscriptionActionsConfig.tsx
- NEW: PauseSubscriptionAction.tsx
- MODIFY: getActionConfig.ts
