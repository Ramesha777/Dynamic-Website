# TODO: Fix Reservation System

## Task
Fix when customer reserve a table it does not show a booking ID for customer to check and allow admin to view all details of booking

## Plan

### 1. Frontend/index.html
- [x] Add reservation form submission handler
- [x] Generate unique booking ID (code)
- [x] Save reservation to Firestore with booking code
- [x] Show success message with booking ID to customer

### 2. Frontend/admin.html
- [x] Add "Special Requests" column to reservations table
- [x] Add "Created At" column to show when reservation was made

### 3. Frontend/admin.js
- [x] Populate "Special Requests" column with data
- [x] Populate "Created" column with timestamp

## Status: Completed ✅
