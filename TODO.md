# TODO: Fix Mail/Email Expiry on Admin Portal - COMPLETED

## Changes Made:
1. ✅ Added Email Expiry Date input field to Settings form in `admin.html`
2. ✅ Updated `loadSettings()` in `admin.js` to load and display email expiry days on dashboard
3. ✅ Updated `handleSettingsSubmit()` in `admin.js` to save email expiry date to Firestore

## Summary:
- The admin portal now properly handles email expiry dates separately from domain expiry dates
- Both Domain Expiry and Email Expiry can be configured in the Settings page
- Both dates are displayed on the Dashboard with color-coded warnings (red for expired, orange for < 60 days)

