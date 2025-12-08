# StukerApp

Aplikasi marketplace jasa mahasiswa yang menghubungkan mahasiswa penyedia jasa (Stuker) dengan pengguna yang membutuhkan jasa. Platform ini memudahkan transaksi, komunikasi, dan manajemen order dengan sistem rating dan review yang transparan.

## 📋 Deskripsi

StukerApp adalah platform marketplace berbasis web yang dirancang khusus untuk ekosistem kampus. Aplikasi ini memungkinkan mahasiswa untuk menawarkan berbagai jasa (seperti joki tugas, design, coding, dll) dan memudahkan pengguna lain untuk menemukan dan memesan jasa tersebut dengan sistem yang aman dan terstruktur.

## ✨ Fitur Utama

### Untuk Pengguna (User)
- 🔍 **Pencarian & Filter Stuker**: Cari stuker berdasarkan kategori, rating, lokasi, dan harga
- 📝 **Pembuatan Order**: Buat order dengan detail lengkap (deskripsi, budget, deadline, lampiran)
- 💬 **Real-time Chat**: Komunikasi langsung dengan stuker via chat real-time
- 💳 **Sistem Pembayaran**: Multiple payment methods dengan sistem escrow
- ⭐ **Rating & Review**: Berikan rating dan review setelah order selesai
- 📊 **Order History**: Tracking semua order yang pernah dibuat

### Untuk Stuker (Penyedia Jasa)
- 👤 **Profile Management**: Kelola profil, skills, portfolio, dan pricing
- 📋 **Order Management**: Terima dan kelola order yang masuk
- 💰 **Earnings Dashboard**: Monitor pendapatan dan statistik
- 🌟 **Reputation System**: Build reputation melalui rating dan completed orders
- 📱 **Notifikasi Real-time**: Dapatkan notifikasi untuk order baru dan messages

### Fitur Umum
- 🔐 **Autentikasi Aman**: JWT-based authentication dengan role-based access
- 📱 **Responsive Design**: Optimal di desktop, tablet, dan mobile
- 🔔 **Push Notifications**: Email dan in-app notifications
- 📸 **Image Upload**: Upload gambar profil dan lampiran order ke Cloudinary
- 🌐 **Real-time Updates**: Socket.io untuk chat dan notifications

## 🛠️ Teknologi yang Digunakan

### Frontend
- **Framework**: Next.js 14 (React)
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Real-time**: Socket.io Client
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.io
- **File Upload**: Cloudinary
- **Password Hashing**: bcrypt

### DevOps & Tools
- **Version Control**: Git & GitHub
- **Package Manager**: npm
- **Deployment**: Vercel (Frontend), Railway/Heroku (Backend)
- **API Testing**: Postman
- **Code Quality**: ESLint

## 📦 Instalasi

### Prasyarat

Pastikan Anda telah menginstall:
- Node.js (v18 atau lebih tinggi)
- npm atau yarn
- MongoDB (local atau MongoDB Atlas)
- Git

### Langkah-langkah Instalasi

1. **Clone repository**
```bash
git clone https://github.com/yazidzky/stukerApp.git
cd stukerApp
```

2. **Install dependencies untuk root project**
```bash
npm install
```

3. **Setup Backend**

```bash
cd backend
npm install
```

Buat file `.env` di folder backend:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/stukerapp
# atau gunakan MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stukerapp

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

4. **Setup Frontend**

```bash
cd ../frontend
npm install
```

Buat file `.env.local` di folder frontend:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

5. **Jalankan aplikasi**

Dari root directory, jalankan kedua server sekaligus:
```bash
# Development mode (both frontend & backend)
npm run dev:all

# Atau jalankan secara terpisah:

# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Aplikasi akan berjalan di:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

## 🚀 Cara Penggunaan

### Registrasi & Login

1. **Registrasi Akun**
   - Kunjungi halaman registrasi
   - Pilih role: **Stuker** (penyedia jasa) atau **User** (pembuat order)
   - Isi form registrasi (nama, email, password, phone)
   - Klik "Register"

2. **Login**
   - Masukkan email dan password
   - Klik "Login"
   - Anda akan diarahkan ke dashboard

### Untuk User (Pembuat Order)

1. **Browse Stukers**
   - Lihat daftar stuker yang tersedia
   - Filter berdasarkan kategori, rating, atau lokasi
   - Klik profil stuker untuk melihat detail

2. **Buat Order**
   - Klik "Create New Order"
   - Isi detail order:
     - Title: Judul pekerjaan
     - Description: Deskripsi lengkap
     - Category: Pilih kategori jasa
     - Budget: Tentukan budget
     - Deadline: Set deadline pengerjaan
     - Location: Lokasi (jika diperlukan)
     - Attachments: Upload file pendukung
   - Klik "Submit Order"

3. **Komunikasi dengan Stuker**
   - Setelah stuker menerima order, chat room otomatis dibuat
   - Klik "Chat" untuk berkomunikasi
   - Diskusikan detail pekerjaan

4. **Konfirmasi & Pembayaran**
   - Setelah pekerjaan selesai, review hasil kerja
   - Konfirmasi completion
   - Lakukan pembayaran
   - Berikan rating dan review

### Untuk Stuker (Penyedia Jasa)

1. **Setup Profile**
   - Lengkapi profil Anda
   - Tambahkan skills dan keahlian
   - Upload portfolio (jika ada)
   - Set pricing range

2. **Terima Order**
   - Lihat available orders di dashboard
   - Filter sesuai skills Anda
   - Klik order untuk melihat detail
   - Klik "Accept" jika tertarik

3. **Kerjakan Order**
   - Komunikasi dengan user via chat
   - Update progress secara berkala
   - Upload hasil kerja

4. **Complete Order**
   - Setelah selesai, mark order as completed
   - Tunggu konfirmasi dari user
   - Terima pembayaran setelah user approve

## 📁 Struktur Folder

```
stukerApp/
├── backend/                    # Backend application
│   ├── src/
│   │   ├── Controllers/       # Route controllers
│   │   │   ├── authController.js
│   │   │   ├── orderController.js
│   │   │   ├── profileController.js
│   │   │   └── ratingController.js
│   │   ├── Middleware/        # Custom middleware
│   │   │   └── auth.js
│   │   ├── models/            # Mongoose models
│   │   │   ├── User.js
│   │   │   ├── Order.js
│   │   │   ├── Chat.js
│   │   │   ├── Rating.js
│   │   │   └── OrderHistory.js
│   │   ├── routes/            # API routes
│   │   │   ├── auth.js
│   │   │   ├── orders.js
│   │   │   ├── profile.js
│   │   │   └── ratings.js
│   │   ├── config/            # Configuration files
│   │   │   ├── db.js
│   │   │   └── cloudinary.js
│   │   └── server.js          # Entry point
│   ├── package.json
│   └── .env
│
├── frontend/                   # Frontend application
│   ├── src/
│   │   ├── app/               # Next.js app directory
│   │   │   ├── (auth)/        # Auth pages
│   │   │   ├── (dashboard)/   # Dashboard pages
│   │   │   ├── orders/        # Order pages
│   │   │   └── layout.tsx
│   │   ├── components/        # React components
│   │   │   ├── ui/            # UI components
│   │   │   ├── forms/         # Form components
│   │   │   └── layout/        # Layout components
│   │   ├── lib/               # Utilities
│   │   │   ├── api.ts         # API client
│   │   │   └── socket.ts      # Socket.io client
│   │   ├── store/             # Redux store
│   │   │   ├── slices/
│   │   │   └── store.ts
│   │   └── types/             # TypeScript types
│   ├── public/                # Static assets
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── .env.local
│
├── docs/                       # Documentation
│   ├── DATABASE_ARCHITECTURE.md
│   ├── FLOWCHART.md
│   └── API.md
│
├── package.json               # Root package.json
├── vercel.json                # Vercel deployment config
└── README.md                  # This file
```

## 📱 API Documentation

### Authentication Endpoints

```
POST   /api/auth/register      # Register new user
POST   /api/auth/login         # Login user
GET    /api/auth/me            # Get current user
POST   /api/auth/logout        # Logout user
```

### User/Profile Endpoints

```
GET    /api/profile/:id        # Get user profile
PUT    /api/profile            # Update profile
POST   /api/profile/image      # Upload profile image
GET    /api/stukers            # Get all stukers (with filters)
```

### Order Endpoints

```
GET    /api/orders             # Get all orders
POST   /api/orders             # Create new order
GET    /api/orders/:id         # Get order details
PUT    /api/orders/:id         # Update order
DELETE /api/orders/:id         # Delete order
POST   /api/orders/:id/accept  # Accept order (stuker)
POST   /api/orders/:id/complete # Mark as complete
```

### Rating Endpoints

```
POST   /api/ratings            # Create rating
GET    /api/ratings/user/:id   # Get user ratings
GET    /api/ratings/stuker/:id # Get stuker ratings
```

### Chat Endpoints

```
GET    /api/chats              # Get user chats
GET    /api/chats/:orderId     # Get chat by order
POST   /api/chats/message      # Send message
```

Untuk dokumentasi API lengkap, lihat [API Documentation](docs/API.md)

## 🗄️ Database Architecture

Aplikasi ini menggunakan MongoDB dengan struktur collection sebagai berikut:

- **Users**: Data pengguna (user & stuker)
- **Orders**: Data order/pesanan
- **Chats**: Data percakapan
- **Ratings**: Data rating dan review
- **OrderHistory**: Riwayat perubahan order
- **OrderHistoryStuker**: History dari sisi stuker
- **OrderHistoryUser**: History dari sisi user
- **RatingStuker**: Agregasi rating stuker
- **RatingUser**: Agregasi rating user

Untuk detail lengkap arsitektur database, lihat [Database Architecture](docs/DATABASE_ARCHITECTURE.md)

## 📊 Flowchart

Aplikasi ini memiliki beberapa alur kerja utama:

1. **User Registration & Authentication Flow**
2. **Login Flow**
3. **Order Creation Flow**
4. **Order Acceptance Flow**
5. **Order Completion & Rating Flow**
6. **Real-time Chat Flow**
7. **Search & Filter Stukers Flow**
8. **Payment Processing Flow**
9. **Profile Management Flow**
10. **Notification System Flow**

Untuk melihat flowchart lengkap, lihat [Flowchart Documentation](docs/FLOWCHART.md)

## 🧪 Testing

Jalankan test suite:

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Run tests with coverage
npm run test:coverage
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
MONGODB_URI=           # MongoDB connection string
JWT_SECRET=            # JWT secret key
JWT_EXPIRE=            # JWT expiration time
PORT=                  # Server port
CLOUDINARY_CLOUD_NAME= # Cloudinary cloud name
CLOUDINARY_API_KEY=    # Cloudinary API key
CLOUDINARY_API_SECRET= # Cloudinary API secret
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=   # Backend API URL
NEXT_PUBLIC_SOCKET_URL=# Socket.io server URL
```

## 🚢 Deployment

### Deploy Backend (Railway/Heroku)

1. Create account di Railway atau Heroku
2. Connect repository
3. Set environment variables
4. Deploy

### Deploy Frontend (Vercel)

1. Push code ke GitHub
2. Import project di Vercel
3. Set environment variables
4. Deploy

Vercel akan otomatis deploy setiap kali ada push ke main branch.

## 🤝 Kontribusi

Kontribusi sangat diterima! Untuk berkontribusi:

1. Fork repository ini
2. Buat branch baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

### Guidelines Kontribusi

- Ikuti code style yang ada (ESLint configuration)
- Tulis test untuk fitur baru
- Update dokumentasi jika diperlukan
- Pastikan semua test passing sebelum submit PR
- Gunakan commit message yang descriptive

## 📈 Roadmap

### Phase 1 (Current)
- [x] Basic authentication system
- [x] Order creation and management
- [x] Real-time chat
- [x] Rating and review system
- [x] Profile management

### Phase 2 (In Progress)
- [ ] Payment gateway integration (Midtrans/Xendit)
- [ ] Advanced search and filtering
- [ ] Notification system enhancement
- [ ] Mobile responsive optimization

### Phase 3 (Planned)
- [ ] Mobile app (React Native)
- [ ] Video call integration
- [ ] Multi-language support (English, Indonesian)
- [ ] Advanced analytics dashboard
- [ ] Automated contract generation
- [ ] Dispute resolution system

### Phase 4 (Future)
- [ ] AI-powered stuker recommendation
- [ ] Skill verification system
- [ ] Subscription plans for premium features
- [ ] WhatsApp integration
- [ ] Portfolio showcase enhancement

## 🔄 Changelog

### Version 1.0.0 (Current - December 2024)
- ✅ Initial release
- ✅ User authentication (JWT)
- ✅ Order management system
- ✅ Real-time chat (Socket.io)
- ✅ Rating and review system
- ✅ Profile management
- ✅ Image upload (Cloudinary)
- ✅ Responsive design
- ✅ Basic notification system

---

**Note**: Aplikasi ini masih dalam tahap pengembangan aktif. Fitur dan dokumentasi akan terus diperbarui. Untuk pertanyaan atau bantuan, silakan buka issue di GitHub atau hubungi tim development.

**Status**: 🚀 Active Development | 📦 Version 1.0.0 
Secreenshot:
<img width="1023" height="517" alt="image" src="https://github.com/user-attachments/assets/18b96be3-9d58-417a-90a3-dcdde54f12a2" />


<img width="1040" height="350" alt="image" src="https://github.com/user-attachments/assets/41fb0461-0ac5-4ae7-aa02-f933860b5534" />


<img width="696" height="359" alt="image" src="https://github.com/user-attachments/assets/6bd3afff-c533-4651-af15-96522472b405" />\


<img width="695" height="346" alt="image" src="https://github.com/user-attachments/assets/66ed2a12-7b6e-4e1c-892f-4a9b9c6fecea" />


<img width="1046" height="359" alt="image" src="https://github.com/user-attachments/assets/4ad8a301-12fc-4287-aed9-93a3d24d8240" />




