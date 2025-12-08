# Arsitektur Database StukerApp

## Overview

StukerApp menggunakan MongoDB sebagai database NoSQL untuk menyimpan data aplikasi. Database ini dirancang untuk mendukung sistem marketplace jasa mahasiswa dengan fitur order, rating, chat, dan history transaksi.

## Database Schema

### 1. Collection: Users

**Deskripsi**: Menyimpan informasi pengguna (mahasiswa yang menawarkan jasa dan pengguna yang membutuhkan jasa)

```javascript
{
  _id: ObjectId,
  name: String,              // Nama lengkap pengguna
  email: String,             // Email (unique)
  password: String,          // Password (hashed)
  phone: String,             // Nomor telepon
  role: String,              // "stuker" atau "user"
  profileImage: String,      // URL foto profil (Cloudinary)
  bio: String,               // Deskripsi diri
  skills: [String],          // Array keahlian (untuk stuker)
  location: String,          // Lokasi
  university: String,        // Universitas
  rating: Number,            // Rating rata-rata (0-5)
  totalOrders: Number,       // Total order yang diselesaikan
  isVerified: Boolean,       // Status verifikasi akun
  createdAt: Date,           // Tanggal registrasi
  updatedAt: Date            // Tanggal update terakhir
}
```

**Indexes**:
- `email` (unique)
- `role`
- `rating` (descending)

---

### 2. Collection: Orders

**Deskripsi**: Menyimpan data pesanan/order jasa

```javascript
{
  _id: ObjectId,
  userId: ObjectId,          // Ref: Users (pembuat order)
  stukerId: ObjectId,        // Ref: Users (penerima order)
  title: String,             // Judul order
  description: String,       // Deskripsi detail pekerjaan
  category: String,          // Kategori jasa
  budget: Number,            // Budget yang ditawarkan
  deadline: Date,            // Deadline pengerjaan
  status: String,            // "pending", "accepted", "in_progress", "completed", "cancelled"
  attachments: [String],     // Array URL file lampiran
  location: String,          // Lokasi pengerjaan
  paymentStatus: String,     // "unpaid", "paid", "refunded"
  paymentMethod: String,     // Metode pembayaran
  notes: String,             // Catatan tambahan
  createdAt: Date,
  updatedAt: Date,
  completedAt: Date          // Tanggal selesai
}
```

**Indexes**:
- `userId`
- `stukerId`
- `status`
- `createdAt` (descending)

---

### 3. Collection: Ratings

**Deskripsi**: Menyimpan rating dan review untuk order yang telah selesai

```javascript
{
  _id: ObjectId,
  orderId: ObjectId,         // Ref: Orders
  fromUserId: ObjectId,      // Ref: Users (pemberi rating)
  toUserId: ObjectId,        // Ref: Users (penerima rating)
  rating: Number,            // Rating 1-5
  review: String,            // Teks review
  type: String,              // "stuker_rating" atau "user_rating"
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `orderId` (unique)
- `toUserId`
- `rating`

---

### 4. Collection: Chats

**Deskripsi**: Menyimpan percakapan antara user dan stuker

```javascript
{
  _id: ObjectId,
  orderId: ObjectId,         // Ref: Orders (opsional)
  participants: [ObjectId],  // Array of User IDs (2 participants)
  messages: [
    {
      senderId: ObjectId,    // Ref: Users
      message: String,       // Isi pesan
      timestamp: Date,       // Waktu kirim
      isRead: Boolean,       // Status baca
      attachments: [String]  // URL file lampiran
    }
  ],
  lastMessage: String,       // Pesan terakhir
  lastMessageTime: Date,     // Waktu pesan terakhir
  unreadCount: {             // Jumlah pesan belum dibaca per user
    [userId]: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `participants`
- `orderId`
- `lastMessageTime` (descending)

---

### 5. Collection: OrderHistory

**Deskripsi**: Menyimpan riwayat perubahan status order untuk tracking

```javascript
{
  _id: ObjectId,
  orderId: ObjectId,         // Ref: Orders
  userId: ObjectId,          // Ref: Users (yang melakukan aksi)
  action: String,            // "created", "accepted", "started", "completed", "cancelled"
  previousStatus: String,    // Status sebelumnya
  newStatus: String,         // Status baru
  notes: String,             // Catatan perubahan
  timestamp: Date
}
```

**Indexes**:
- `orderId`
- `timestamp` (descending)

---

### 6. Collection: OrderHistoryStuker

**Deskripsi**: History order dari perspektif stuker (penyedia jasa)

```javascript
{
  _id: ObjectId,
  stukerId: ObjectId,        // Ref: Users
  orderId: ObjectId,         // Ref: Orders
  totalEarnings: Number,     // Total pendapatan dari order
  completionRate: Number,    // Persentase penyelesaian
  averageRating: Number,     // Rating rata-rata
  timestamp: Date
}
```

**Indexes**:
- `stukerId`
- `timestamp` (descending)

---

### 7. Collection: OrderHistoryUser

**Deskripsi**: History order dari perspektif user (pembuat order)

```javascript
{
  _id: ObjectId,
  userId: ObjectId,          // Ref: Users
  orderId: ObjectId,         // Ref: Orders
  totalSpent: Number,        // Total pengeluaran
  satisfactionRate: Number,  // Tingkat kepuasan
  timestamp: Date
}
```

**Indexes**:
- `userId`
- `timestamp` (descending)

---

### 8. Collection: RatingStuker

**Deskripsi**: Agregasi rating untuk stuker

```javascript
{
  _id: ObjectId,
  stukerId: ObjectId,        // Ref: Users
  totalRatings: Number,      // Total jumlah rating
  averageRating: Number,     // Rating rata-rata
  ratingDistribution: {      // Distribusi rating
    5: Number,
    4: Number,
    3: Number,
    2: Number,
    1: Number
  },
  lastUpdated: Date
}
```

**Indexes**:
- `stukerId` (unique)
- `averageRating` (descending)

---

### 9. Collection: RatingUser

**Deskripsi**: Agregasi rating untuk user (sebagai pemberi order)

```javascript
{
  _id: ObjectId,
  userId: ObjectId,          // Ref: Users
  totalRatings: Number,      // Total jumlah rating
  averageRating: Number,     // Rating rata-rata
  lastUpdated: Date
}
```

**Indexes**:
- `userId` (unique)

---

## Relasi Antar Collection

```
Users (1) ----< (N) Orders
  |                   |
  |                   |
  |                   v
  |              OrderHistory (N)
  |                   |
  |                   |
  v                   v
Ratings (N)      OrderHistoryStuker (N)
  |                   |
  |                   |
  v                   v
RatingStuker (1) OrderHistoryUser (N)
  |
  v
RatingUser (1)

Users (N) ----< (N) Chats
```

## Diagram ER (Entity Relationship)

```
┌─────────────────┐
│     USERS       │
├─────────────────┤
│ _id (PK)        │
│ name            │
│ email (UK)      │
│ password        │
│ role            │
│ profileImage    │
│ skills          │
│ rating          │
└────────┬────────┘
         │
         │ 1:N
         │
    ┌────┴─────────────────┐
    │                      │
┌───▼──────────┐    ┌──────▼──────────┐
│   ORDERS     │    │     CHATS       │
├──────────────┤    ├─────────────────┤
│ _id (PK)     │    │ _id (PK)        │
│ userId (FK)  │    │ participants[]  │
│ stukerId(FK) │    │ messages[]      │
│ title        │    │ lastMessage     │
│ status       │    └─────────────────┘
│ budget       │
└──────┬───────┘
       │
       │ 1:N
       │
┌──────▼──────────┐
│  ORDER_HISTORY  │
├─────────────────┤
│ _id (PK)        │
│ orderId (FK)    │
│ action          │
│ timestamp       │
└─────────────────┘
       │
       │ 1:1
       │
┌──────▼──────────┐
│    RATINGS      │
├─────────────────┤
│ _id (PK)        │
│ orderId (FK)    │
│ fromUserId (FK) │
│ toUserId (FK)   │
│ rating          │
│ review          │
└─────────────────┘
```

## Optimasi Database

### 1. Indexing Strategy
- **Compound Indexes**: Untuk query yang sering menggunakan multiple fields
- **Text Indexes**: Untuk search functionality pada title dan description
- **Geospatial Indexes**: Untuk location-based queries

### 2. Data Partitioning
- Partisi OrderHistory berdasarkan timestamp untuk performa query historical data
- Archive old completed orders ke collection terpisah

### 3. Caching Strategy
- Cache user profiles yang sering diakses
- Cache rating aggregations
- Cache active chats untuk real-time messaging

### 4. Backup & Recovery
- Daily automated backups
- Point-in-time recovery capability
- Replica sets untuk high availability

## Security Considerations

1. **Data Encryption**
   - Encrypt sensitive fields (password, payment info)
   - Use TLS/SSL untuk data in transit

2. **Access Control**
   - Role-based access control (RBAC)
   - Field-level security untuk sensitive data

3. **Audit Logging**
   - Log semua perubahan data penting
   - Track user activities

4. **Data Validation**
   - Schema validation di application level
   - Input sanitization untuk prevent injection attacks

## Skalabilitas

### Horizontal Scaling
- Sharding berdasarkan userId untuk distribusi data
- Read replicas untuk load balancing read operations

### Vertical Scaling
- Upgrade server resources sesuai kebutuhan
- Optimize query performance dengan proper indexing

## Monitoring & Maintenance

1. **Performance Monitoring**
   - Track query performance
   - Monitor index usage
   - Alert untuk slow queries

2. **Regular Maintenance**
   - Index optimization
   - Data cleanup untuk old records
   - Database statistics update

3. **Capacity Planning**
   - Monitor storage growth
   - Plan untuk scaling needs
   - Regular performance audits
