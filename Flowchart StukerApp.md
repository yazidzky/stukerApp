# Flowchart StukerApp

## 1. User Registration & Authentication Flow

```
┌─────────────────────┐
│   START: Landing    │
│       Page          │
└──────────┬──────────┘
           │
           ▼
    ┌──────────────┐
    │ Choose Role  │
    │ Stuker/User  │
    └──────┬───────┘
           │
           ▼
    ┌──────────────────┐
    │  Registration    │
    │  Form            │
    │  - Name          │
    │  - Email         │
    │  - Password      │
    │  - Phone         │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │  Validate Input  │
    └──────┬───────────┘
           │
           ├─── Invalid ───┐
           │               │
           │ Valid         │
           ▼               │
    ┌──────────────────┐  │
    │  Hash Password   │  │
    └──────┬───────────┘  │
           │               │
           ▼               │
    ┌──────────────────┐  │
    │ Save to Database │  │
    │ (Users)          │  │
    └──────┬───────────┘  │
           │               │
           ▼               │
    ┌──────────────────┐  │
    │ Generate JWT     │  │
    │ Token            │  │
    └──────┬───────────┘  │
           │               │
           ▼               │
    ┌──────────────────┐  │
    │ Send Welcome     │  │
    │ Email            │  │
    └──────┬───────────┘  │
           │               │
           ▼               ▼
    ┌──────────────────────┐
    │  Redirect to         │
    │  Dashboard/Profile   │
    └──────────────────────┘
```

---

## 2. Login Flow

```
┌─────────────────┐
│  START: Login   │
│      Page       │
└────────┬────────┘
         │
         ▼
  ┌──────────────┐
  │ Enter Email  │
  │ & Password   │
  └──────┬───────┘
         │
         ▼
  ┌──────────────────┐
  │ Validate Format  │
  └──────┬───────────┘
         │
         ├─── Invalid ───┐
         │               │
         │ Valid         │
         ▼               │
  ┌──────────────────┐  │
  │ Query Database   │  │
  │ Find User        │  │
  └──────┬───────────┘  │
         │               │
         ├─── Not Found ─┤
         │               │
         │ Found         │
         ▼               │
  ┌──────────────────┐  │
  │ Compare Password │  │
  │ (bcrypt)         │  │
  └──────┬───────────┘  │
         │               │
         ├─── Mismatch ──┤
         │               │
         │ Match         │
         ▼               │
  ┌──────────────────┐  │
  │ Generate JWT     │  │
  │ Token            │  │
  └──────┬───────────┘  │
         │               │
         ▼               ▼
  ┌──────────────────────┐
  │ Show Error Message   │
  │ "Invalid Credentials"│
  └──────────────────────┘
         │
         ▼
  ┌──────────────────┐
  │ Redirect to      │
  │ Dashboard        │
  └──────────────────┘
```

---

## 3. Order Creation Flow (User Side)

```
┌─────────────────────┐
│  START: Dashboard   │
│  (User)             │
└──────────┬──────────┘
           │
           ▼
    ┌──────────────────┐
    │ Click "Create    │
    │ New Order"       │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────────┐
    │ Fill Order Form      │
    │ - Title              │
    │ - Description        │
    │ - Category           │
    │ - Budget             │
    │ - Deadline           │
    │ - Location           │
    │ - Attachments        │
    └──────┬───────────────┘
           │
           ▼
    ┌──────────────────┐
    │ Upload Files to  │
    │ Cloudinary       │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Validate Input   │
    └──────┬───────────┘
           │
           ├─── Invalid ───┐
           │               │
           │ Valid         │
           ▼               │
    ┌──────────────────┐  │
    │ Save Order to DB │  │
    │ status: "pending"│  │
    └──────┬───────────┘  │
           │               │
           ▼               │
    ┌──────────────────┐  │
    │ Create Order     │  │
    │ History Entry    │  │
    └──────┬───────────┘  │
           │               │
           ▼               │
    ┌──────────────────┐  │
    │ Notify Available │  │
    │ Stukers          │  │
    └──────┬───────────┘  │
           │               │
           ▼               ▼
    ┌──────────────────────┐
    │ Show Success Message │
    │ & Order Details      │
    └──────────────────────┘
           │
           ▼
    ┌──────────────────┐
    │ Redirect to      │
    │ Order List       │
    └──────────────────┘
```

---

## 4. Order Acceptance Flow (Stuker Side)

```
┌─────────────────────┐
│  START: Dashboard   │
│  (Stuker)           │
└──────────┬──────────┘
           │
           ▼
    ┌──────────────────┐
    │ View Available   │
    │ Orders           │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Filter/Search    │
    │ Orders           │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Click Order      │
    │ Details          │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Review Order     │
    │ Information      │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Decision:        │
    │ Accept/Decline?  │
    └──────┬───────────┘
           │
           ├─── Decline ───┐
           │               │
           │ Accept        │
           ▼               │
    ┌──────────────────┐  │
    │ Check if Order   │  │
    │ Still Available  │  │
    └──────┬───────────┘  │
           │               │
           ├─── Taken ─────┤
           │               │
           │ Available     │
           ▼               │
    ┌──────────────────┐  │
    │ Update Order     │  │
    │ status:          │  │
    │ "accepted"       │  │
    │ stukerId: [ID]   │  │
    └──────┬───────────┘  │
           │               │
           ▼               │
    ┌──────────────────┐  │
    │ Create History   │  │
    │ Entry            │  │
    └──────┬───────────┘  │
           │               │
           ▼               │
    ┌──────────────────┐  │
    │ Notify User      │  │
    │ (Email/Push)     │  │
    └──────┬───────────┘  │
           │               │
           ▼               │
    ┌──────────────────┐  │
    │ Initialize Chat  │  │
    │ Room             │  │
    └──────┬───────────┘  │
           │               │
           ▼               ▼
    ┌──────────────────────┐
    │ Show Success/Error   │
    │ Message              │
    └──────────────────────┘
           │
           ▼
    ┌──────────────────┐
    │ Redirect to      │
    │ Active Orders    │
    └──────────────────┘
```

---

## 5. Order Completion & Rating Flow

```
┌─────────────────────┐
│  START: Active      │
│  Order Page         │
└──────────┬──────────┘
           │
           ▼
    ┌──────────────────┐
    │ Stuker Marks     │
    │ Order Complete   │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Update Order     │
    │ status:          │
    │ "completed"      │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Notify User      │
    │ Order Completed  │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ User Reviews     │
    │ Completed Work   │
    └──────┬───────────┘
           │
           ├─── Dispute ───┐
           │               │
           │ Approve       │
           ▼               │
    ┌──────────────────┐  │
    │ Confirm Payment  │  │
    │ Release          │  │
    └──────┬───────────┘  │
           │               │
           ▼               │
    ┌──────────────────┐  │
    │ Update Payment   │  │
    │ Status: "paid"   │  │
    └──────┬───────────┘  │
           │               │
           ▼               │
    ┌──────────────────┐  │
    │ Show Rating      │  │
    │ Form             │  │
    └──────┬───────────┘  │
           │               │
           ▼               │
    ┌──────────────────┐  │
    │ User Submits     │  │
    │ Rating (1-5)     │  │
    │ & Review         │  │
    └──────┬───────────┘  │
           │               │
           ▼               │
    ┌──────────────────┐  │
    │ Save Rating to   │  │
    │ Database         │  │
    └──────┬───────────┘  │
           │               │
           ▼               │
    ┌──────────────────┐  │
    │ Update Stuker    │  │
    │ Average Rating   │  │
    └──────┬───────────┘  │
           │               │
           ▼               │
    ┌──────────────────┐  │
    │ Update Order     │  │
    │ History          │  │
    └──────┬───────────┘  │
           │               │
           ▼               ▼
    ┌──────────────────────┐
    │ Open Dispute         │
    │ Resolution Process   │
    └──────────────────────┘
           │
           ▼
    ┌──────────────────┐
    │ Notify Both      │
    │ Parties          │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Show Success     │
    │ Message          │
    └──────────────────┘
```

---

## 6. Real-time Chat Flow

```
┌─────────────────────┐
│  START: Order       │
│  Detail Page        │
└──────────┬──────────┘
           │
           ▼
    ┌──────────────────┐
    │ Click "Chat"     │
    │ Button           │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Check if Chat    │
    │ Room Exists      │
    └──────┬───────────┘
           │
           ├─── No ────────┐
           │               │
           │ Yes           │
           ▼               │
    ┌──────────────────┐  │
    │ Load Chat Room   │  │
    └──────┬───────────┘  │
           │               │
           ▼               ▼
    ┌──────────────────────┐
    │ Create New Chat Room │
    │ Initialize Socket.io │
    └──────┬───────────────┘
           │
           ▼
    ┌──────────────────┐
    │ Join Socket Room │
    │ room_[orderId]   │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Load Message     │
    │ History          │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Display Chat UI  │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ User Types       │
    │ Message          │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Click Send or    │
    │ Press Enter      │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Emit Socket      │
    │ Event:           │
    │ "send_message"   │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Server Receives  │
    │ Message          │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Validate Message │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Save to Database │
    │ (Chats)          │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Broadcast to     │
    │ Room Participants│
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Update UI        │
    │ Both Sides       │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Update Unread    │
    │ Count            │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Send Push        │
    │ Notification     │
    │ (if offline)     │
    └──────────────────┘
```

---

## 7. Search & Filter Stukers Flow

```
┌─────────────────────┐
│  START: Browse      │
│  Stukers Page       │
└──────────┬──────────┘
           │
           ▼
    ┌──────────────────┐
    │ Load All Stukers │
    │ (Paginated)      │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Display Stuker   │
    │ Cards            │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ User Applies     │
    │ Filters:         │
    │ - Category       │
    │ - Rating         │
    │ - Location       │
    │ - Price Range    │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Build Query      │
    │ Parameters       │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Send API Request │
    │ GET /api/stukers │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Server Queries   │
    │ Database with    │
    │ Filters          │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Sort Results by  │
    │ - Rating         │
    │ - Total Orders   │
    │ - Recent         │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Return Filtered  │
    │ Results          │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Update UI with   │
    │ Results          │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ User Clicks      │
    │ Stuker Profile   │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Show Detailed    │
    │ Profile:         │
    │ - Bio            │
    │ - Skills         │
    │ - Portfolio      │
    │ - Reviews        │
    │ - Stats          │
    └──────────────────┘
```

---

## 8. Payment Processing Flow

```
┌─────────────────────┐
│  START: Order       │
│  Completed          │
└──────────┬──────────┘
           │
           ▼
    ┌──────────────────┐
    │ User Confirms    │
    │ Completion       │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Select Payment   │
    │ Method:          │
    │ - Bank Transfer  │
    │ - E-Wallet       │
    │ - Credit Card    │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Enter Payment    │
    │ Details          │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Validate Payment │
    │ Information      │
    └──────┬───────────┘
           │
           ├─── Invalid ───┐
           │               │
           │ Valid         │
           ▼               │
    ┌──────────────────┐  │
    │ Process Payment  │  │
    │ via Gateway      │  │
    └──────┬───────────┘  │
           │               │
           ├─── Failed ────┤
           │               │
           │ Success       │
           ▼               │
    ┌──────────────────┐  │
    │ Update Order     │  │
    │ paymentStatus:   │  │
    │ "paid"           │  │
    └──────┬───────────┘  │
           │               │
           ▼               │
    ┌──────────────────┐  │
    │ Calculate        │  │
    │ Platform Fee     │  │
    │ (10-15%)         │  │
    └──────┬───────────┘  │
           │               │
           ▼               │
    ┌──────────────────┐  │
    │ Transfer to      │  │
    │ Stuker Account   │  │
    └──────┬───────────┘  │
           │               │
           ▼               │
    ┌──────────────────┐  │
    │ Generate Invoice │  │
    │ & Receipt        │  │
    └──────┬───────────┘  │
           │               │
           ▼               │
    ┌──────────────────┐  │
    │ Send Email       │  │
    │ Confirmation     │  │
    └──────┬───────────┘  │
           │               │
           ▼               │
    ┌──────────────────┐  │
    │ Update User &    │  │
    │ Stuker Stats     │  │
    └──────┬───────────┘  │
           │               │
           ▼               ▼
    ┌──────────────────────┐
    │ Show Error Message   │
    │ & Retry Option       │
    └──────────────────────┘
           │
           ▼
    ┌──────────────────┐
    │ Show Success     │
    │ Confirmation     │
    └──────────────────┘
```

---

## 9. Profile Management Flow

```
┌─────────────────────┐
│  START: Profile     │
│  Page               │
└──────────┬──────────┘
           │
           ▼
    ┌──────────────────┐
    │ Load User Data   │
    │ from Database    │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Display Profile  │
    │ Information      │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Click "Edit      │
    │ Profile"         │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Enable Edit Mode │
    │ Show Form Fields │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ User Updates:    │
    │ - Name           │
    │ - Bio            │
    │ - Skills         │
    │ - Location       │
    │ - Profile Image  │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Upload New Image?│
    └──────┬───────────┘
           │
           ├─── Yes ───────┐
           │               │
           │ No            │
           ▼               │
    ┌──────────────────┐  │
    │ Validate Changes │  │
    └──────┬───────────┘  │
           │               │
           │               ▼
           │        ┌──────────────────┐
           │        │ Upload to        │
           │        │ Cloudinary       │
           │        └──────┬───────────┘
           │               │
           │               ▼
           │        ┌──────────────────┐
           │        │ Get Image URL    │
           │        └──────┬───────────┘
           │               │
           ▼               ▼
    ┌──────────────────────────┐
    │ Update Database          │
    │ (Users collection)       │
    └──────┬───────────────────┘
           │
           ▼
    ┌──────────────────┐
    │ Show Success     │
    │ Message          │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Refresh Profile  │
    │ Display          │
    └──────────────────┘
```

---

## 10. Notification System Flow

```
┌─────────────────────┐
│  START: Event       │
│  Triggered          │
└──────────┬──────────┘
           │
           ▼
    ┌──────────────────┐
    │ Event Types:     │
    │ - New Order      │
    │ - Order Accepted │
    │ - Order Complete │
    │ - New Message    │
    │ - Payment        │
    │ - Rating         │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Identify Target  │
    │ User(s)          │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Check User       │
    │ Notification     │
    │ Preferences      │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Prepare          │
    │ Notification     │
    │ Content          │
    └──────┬───────────┘
           │
           ├─── Email ─────┐
           │               │
           ├─── Push ──────┤
           │               │
           ├─── In-App ────┤
           │               │
           ▼               │
    ┌──────────────────┐  │
    │ Send Email       │  │
    │ via SMTP         │  │
    └──────────────────┘  │
           │               │
           ▼               ▼
    ┌──────────────────────┐
    │ Send Push via FCM    │
    └──────────────────────┘
           │
           ▼
    ┌──────────────────┐
    │ Save to In-App   │
    │ Notifications    │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Emit Socket      │
    │ Event for        │
    │ Real-time Update │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Log Notification │
    │ Delivery         │
    └──────────────────┘
```

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Web App    │  │  Mobile App  │  │   Admin      │ │
│  │  (Next.js)   │  │  (Future)    │  │   Panel      │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
└─────────┼──────────────────┼──────────────────┼─────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                    ┌────────▼────────┐
                    │   API Gateway   │
                    │   (Express.js)  │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
    ┌─────▼─────┐     ┌─────▼─────┐     ┌─────▼─────┐
    │   Auth    │     │  Business │     │  Socket   │
    │  Service  │     │   Logic   │     │   Server  │
    │   (JWT)   │     │ Controllers│     │(Socket.io)│
    └─────┬─────┘     └─────┬─────┘     └─────┬─────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                    ┌────────▼────────┐
                    │    MongoDB      │
                    │   (Database)    │
                    └─────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
    ┌─────▼─────┐     ┌─────▼─────┐     ┌─────▼─────┐
    │ Cloudinary│     │   Redis   │     │  Payment  │
    │  (Images) │     │  (Cache)  │     │  Gateway  │
    └───────────┘     └───────────┘     └───────────┘
```

## Data Flow Summary

1. **User Registration → Authentication → Dashboard**
2. **Create Order → Notification → Stuker Acceptance**
3. **Chat Communication → Real-time Updates**
4. **Order Completion → Payment → Rating**
5. **Profile Updates → Image Upload → Database Sync**

## Key Integration Points

- **Socket.io**: Real-time chat and notifications
- **Cloudinary**: Image upload and management
- **JWT**: Secure authentication
- **MongoDB**: Data persistence
- **Redis**: Caching and session management
- **Payment Gateway**: Transaction processing
- **Email Service**: Notifications and confirmations

---

**Note**: Flowchart ini menggambarkan alur kerja utama aplikasi StukerApp. Implementasi aktual mungkin memiliki variasi tergantung pada requirement spesifik dan optimasi yang dilakukan.
