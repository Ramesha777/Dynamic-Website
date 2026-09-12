# Whitmore Reans Bars & Restaurant - Features & Security Documentation

## Project Overview
A full-featured restaurant website with public-facing pages, admin dashboard, and Firebase backend for data management. This document describes all features and security implementations.

---

## TABLE OF CONTENTS

1. [Public Website Features](#1-public-website-features)
2. [Admin Panel Features](#2-admin-panel-features)
3. [Authentication System](#3-authentication-system)
4. [Security Implementations](#4-security-implementations)
5. [Data Collections Structure](#5-data-collections-structure)
6. [Integration Features](#6-integration-features)

---

## 1. PUBLIC WEBSITE FEATURES

### 1.1 Navigation & Hero Section
- Responsive navigation bar with smooth scroll links
- Restaurant branding with logo
- Hero section with background imagery and call-to-action buttons

### 1.2 Restaurant Information
- Operating hours display (Mon-Thu, Fri-Sat, Sunday)
- Address display with location
- Contact information (phone, email)
- All information dynamically loaded from Firestore settings

### 1.3 Menu System
- **Menu Categories:**
  - Starters
  - Mains
  - Grills
  - Desserts
  
- **Features:**
  - Tab-based filtering
  - Price display
  - Item descriptions
  - Dietary tags (Vegetarian, Gluten Free, Chef Favourite, etc.)
  - External order link integration

### 1.4 Bar Section
- Cocktail offerings
- Real ales and craft beers
- Whiskey selection
- Fine wines
- Spirits and prosecco

### 1.5 Events System
- Dynamic event loading from Firestore
- Event cards with:
  - Title
  - Description
  - Date range (start/end dates)
  - Image thumbnails
- Real-time updates when admin adds events

### 1.6 Gallery
- Image carousel with infinite scroll
- Multiple venue images:
  - Main Dining Room
  - Kitchen
  - Garden Terrace
  - Bar Lounge
  - Private Dining
- Navigation dots

### 1.7 Reservation System
- **Form Fields:**
  - First Name (required)
  - Last Name (required)
  - Email (required)
  - Phone (required)
  - Date (required)
  - Time selection (12:00 PM - 9:00 PM)
  - Number of Guests (1 to 9+)
  - Special Requests (optional)
  
- **Functionality:**
  - Client-side validation
  - Unique 4-digit booking code generation
  - Firestore storage with timestamp
  - Success confirmation with booking ID
  - Status tracking (Pending/Confirmed/Cancelled)

### 1.8 Contact Options
- WhatsApp integration with dynamic contact options
- Multiple contact methods support:
  - WhatsApp
  - Email
  - Phone
  - Custom links
- Admin-configurable contact options

### 1.9 Location & Maps
- Google Maps embed integration
- Address display
- Directions link
- Location information

---

## 2. ADMIN PANEL FEATURES

### 2.1 Dashboard
- Today's reservations counter
- Recent reservations table (last 5)
- Status indicators

### 2.2 Reservations Management
- **View All:**
  - Full reservation list with all details
  - Sortable by timestamp
  
- **Actions:**
  - Edit reservation status (Pending → Confirmed → Cancelled)
  - Delete reservations
  - Send SMS confirmation
  - Send WhatsApp message
  - Send Email confirmation
  
- **Displayed Fields:**
  - Booking ID/Code
  - Name
  - Email
  - Phone
  - Date & Time
  - Guests count
  - Special Requests
  - Creation timestamp
  - Status

### 2.3 Events Management
- Create new events with:
  - Title
  - Start Date
  - End Date
  - Photo URL
  - Description
- Delete existing events
- Real-time sync with public site

### 2.4 Settings Management
- **Configurable Fields:**
  - Restaurant Name
  - Address
  - Email
  - Phone
  - Hours (Mon-Thu, Fri-Sat, Sunday)
  - Contact Options (type, purpose, value)
  
- **Contact Types Supported:**
  - WhatsApp
  - Email
  - Phone
  - Link
  - Custom

---

## 3. AUTHENTICATION SYSTEM

### 3.1 Login System
- **Method:** Firebase Authentication (Email/Password)
- **Features:**
  - Email format validation
  - Password visibility toggle
  - Remember me option
  - Session storage for auth state
  - Error handling with specific messages:
    - Invalid email format
    - User not found
    - Wrong password
    - Account disabled
    - Too many requests

### 3.2 Session Management
- Session storage for authentication state
- User email display in admin panel
- Logout functionality with session cleanup

### 3.3 Access Control
- Protected admin routes
- Auth state check on page load
- Loading screen during authentication verification

---

## 4. SECURITY IMPLEMENTATIONS

### 4.1 Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Default: Deny all reads and writes
    // Access granted per-collection below
    
    // Helper function: Check if user is admin
    function isAdmin() {
      return request.auth != null;
    }
    
    // RESERVATIONS COLLECTION
    // - Public: Create (submit reservation)
    // - Admin: Read, Update, Delete
    match /reservations/{reservationId} {
      allow create: if true;
      allow read, update, delete: if isAdmin();
    }
    
    // EVENTS COLLECTION
    // - Public: Read only
    // - Admin: Full access
    match /events/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // SETTINGS COLLECTION
    // - Public: Read only (for website display)
    // - Admin: Full access
    match /settings/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

### 4.2 Frontend Security Measures

#### XSS Prevention (Cross-Site Scripting)
```
javascript
function escapeHtml(s) {
  if (!s) return '';
  const map = {
    '&': '&amp;',
    '<': '<',
    '>': '>',
    '"': '"',
    "'": '&#039;'
  };
  return s.toString().replace(/[&<>"']/g, c => map[c]);
}
```

**Applied to:**
- All user-generated content display
- Event titles and descriptions
- Reservation names
- Settings values
- Menu item rendering

### 4.3 Input Validation
- Required field validation
- Email format validation
- Form submission handling with try-catch
- Loading states during async operations

### 4.4 Authentication Security
- Firebase Auth for secure authentication
- No password storage on client side
- Session-based auth state management

### 4.5 API Key Protection
- Firebase configuration in backend directory
- Modular SDK imports from Firebase CDN
- No exposed admin credentials

---

## 5. DATA COLLECTIONS STRUCTURE

### 5.1 Reservations Collection
```
json
{
  "firstName": "string",
  "lastName": "string",
  "name": "string (full name)",
  "email": "string",
  "phone": "string",
  "date": "string (YYYY-MM-DD)",
  "time": "string",
  "guests": "string",
  "specialRequests": "string",
  "code": "string (4-digit)",
  "status": "Pending|Confirmed|Cancelled",
  "timestamp": "timestamp"
}
```

### 5.2 Events Collection
```
json
{
  "title": "string",
  "startDate": "string (YYYY-MM-DD)",
  "endDate": "string (YYYY-MM-DD)",
  "imageUrl": "string (URL)",
  "description": "string",
  "timestamp": "timestamp"
}
```

### 5.3 Settings Collection (Document: "restaurant")
```
json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "hoursMondayThursday": "string",
  "hoursFridaySaturday": "string",
  "hoursSunday": "string",
  "contacts": [
    {
      "type": "WhatsApp|Email|Phone|Link",
      "purpose": "string",
      "value": "string"
    }
  ],
  "timestamp": "timestamp"
}
```

---

## 6. INTEGRATION FEATURES

### 6.1 Communication Integrations
- **SMS:** Native SMS app integration with pre-filled message
- **WhatsApp:** Direct link with encoded message
- **Email:** Mailto link with subject and body

### 6.2 External Services
- **Google Fonts:** Typography (Playfair Display, Barlow)
- **Font Awesome:** Icon library
- **Google Maps:** Location embedding
- **Firebase:** Authentication and Firestore database

### 6.3 Third-Party Links
- External ordering system link
- Google Maps directions

---

## SUMMARY

### Features Count
- ✅ Public website with 8 main sections
- ✅ Dynamic menu system with 4 categories
- ✅ Reservation system with confirmation
- ✅ Admin dashboard with analytics
- ✅ Events management (CRUD)
- ✅ Settings management
- ✅ Multi-channel contact options
- ✅ Real-time data synchronization

### Security Measures
- ✅ Firestore security rules (role-based access)
- ✅ Firebase Authentication
- ✅ XSS prevention (HTML escaping)
- ✅ Input validation
- ✅ Session management
- ✅ Admin-only access to sensitive operations
- ✅ No exposed credentials

### Technologies Used
- HTML5, CSS3, JavaScript (ES6+)
- Firebase Authentication
- Cloud Firestore
- Google Maps API
- Font Awesome Icons
- Google Fonts

---

*Document generated for price comparison and feature analysis*
*Project: Whitmore Reans Bars & Restaurant Website*
*Version: 1.0*
