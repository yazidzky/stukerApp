"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, IdCard, Phone } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { profileAPI } from "@/utils/function";

// 🔹 Komponen internal
import HeaderProfilePage from "./HeaderProfilePage";
import PhotoProfileSection from "./PhotoProfileSection";
import Rating from "./Rating";
import ProfileField from "./ProfileField";

// 🔹 Komponen global
import Button from "@/components/ButtonPrimary";
import ConfirmModalComponent from "@/components/ConfirmationModal";
import Alert from "@/components/Alert";

// 💡 Halaman Profil Stuker — menampilkan dan mengedit data akun pengguna.
export default function ProfilePage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  // =====================================================
  // 🔹 STATE MANAGEMENT
  // =====================================================
  const [showModal, setShowModal] = useState<boolean>(false);
  const [alert, setAlert] = useState<boolean>(false);
  const [image, setImage] = useState("/images/profilePhoto.png");
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [passwordLength, setPasswordLength] = useState<number>(8);

  // 🔹 Fungsi untuk generate asterisk berdasarkan panjang password
  const generatePasswordMask = (length: number) => {
    return "*".repeat(length);
  };

  // 🔹 Data profil & edit sementara
  const [profile, setProfile] = useState({
    name: "",
    nim: "",
    phone: "",
    password: generatePasswordMask(8),
  });
  const [editedData, setEditedData] = useState(profile);

  // =====================================================
  // 🔹 HANDLER FUNCTIONS
  // =====================================================

  // 👉 Fetch profile data on component mount
  useEffect(() => {
    // Load password asli dari localStorage jika tersedia
    const savedPassword = localStorage.getItem("userPassword");

    // Load password length from localStorage if available
    const savedPasswordLength = localStorage.getItem("passwordLength");
    if (savedPasswordLength) {
      const length = parseInt(savedPasswordLength, 10);
      if (length > 0) {
        setPasswordLength(length);
      }
    } else if (savedPassword) {
      // Jika ada password asli, gunakan panjangnya
      setPasswordLength(savedPassword.length);
    }

    const fetchProfile = async () => {
      try {
        const response = await profileAPI.getProfile();
        if (response.success) {
          const userData = response.user;
          // Selalu gunakan password asli jika tersedia di localStorage
          // Jika tidak ada, gunakan asterisk sesuai panjang yang tersimpan
          const passwordToDisplay =
            savedPassword ||
            generatePasswordMask(
              savedPasswordLength ? parseInt(savedPasswordLength, 10) : 8
            );

          const profileData = {
            name: userData.name || "",
            nim: userData.nim || "",
            phone: userData.phone || "",
            password: passwordToDisplay, // Password asli atau asterisk
          };
          setProfile(profileData);
          setEditedData(profileData);
          const profilePic =
            userData.profilePicture || "/images/profilePhoto.png";
          setImage(profilePic);
          setOriginalImage(profilePic);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        // Loading is no longer used
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  // 👉 Auto-refresh rating setiap 30 detik
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      try {
        await refreshUser();
      } catch (error) {
        console.error("Error auto-refreshing stuker rating:", error);
      }
    }, 30000); // 30 detik

    return () => clearInterval(interval);
  }, [user, refreshUser]);

  // 👉 Perubahan pada setiap field
  const handleFieldChange = (field: keyof typeof profile, value: string) => {
    setEditedData((prev) => {
      // Jika field yang diubah adalah password
      if (field === "password") {
        // Jika value bukan hanya asterisk (user sedang mengetik password baru)
        if (!value.match(/^\*+$/)) {
          const newLength = value.length;
          if (newLength > 0) {
            setPasswordLength(newLength);
            // Simpan panjang password ke localStorage
            localStorage.setItem("passwordLength", newLength.toString());
            // Ganti password dengan asterisk sesuai panjangnya setelah user selesai mengetik
            // Tapi untuk sementara, simpan password asli agar user bisa melihat saat mengetik
            // Kita akan ganti dengan asterisk di handleOverride atau ketika field kehilangan fokus
            return { ...prev, [field]: value };
          }
        }
        // Jika value adalah asterisk, tetap gunakan value tersebut
        return { ...prev, [field]: value };
      }

      return { ...prev, [field]: value };
    });
  };

  // 👉 Handler khusus untuk password ketika selesai diedit (onBlur)
  const handlePasswordBlur = (value: string) => {
    if (value && !value.match(/^\*+$/)) {
      const newLength = value.length;
      setPasswordLength(newLength);
      localStorage.setItem("passwordLength", newLength.toString());
      // Ganti dengan asterisk sesuai panjangnya
      setEditedData((prev) => ({
        ...prev,
        password: generatePasswordMask(newLength),
      }));
    }
  };

  // 👉 Tombol "Beralih ke Customer"
  const handleSwitch = () => {
    router.push("/dashboard");
  };

  // 👉 Simpan perubahan profil
  const handleOverride = async () => {
    try {
      // Convert image to base64 if it's a blob URL (newly selected image)
      let profilePicture: string | undefined = undefined;
      if (image && image.startsWith("blob:")) {
        try {
          const response = await fetch(image);
          if (!response.ok) {
            throw new Error(`Failed to fetch blob: ${response.statusText}`);
          }

          const blob = await response.blob();

          // Validate blob type
          if (!blob.type.startsWith("image/")) {
            throw new Error("File yang dipilih bukan gambar yang valid");
          }

          // Validate blob size (max 10MB for base64, but we already validate 5MB on file selection)
          if (blob.size > 10 * 1024 * 1024) {
            throw new Error("Ukuran file terlalu besar");
          }

          const reader = new FileReader();
          profilePicture = await new Promise<string>((resolve, reject) => {
            reader.onload = () => {
              const result = reader.result as string;
              // Validate base64 result
              if (!result || !result.startsWith("data:image/")) {
                reject(new Error("Format gambar tidak valid setelah konversi"));
                return;
              }
              // Check if base64 data is present
              const base64Data = result.split(",")[1];
              if (!base64Data || base64Data.trim().length === 0) {
                reject(new Error("Data gambar kosong"));
                return;
              }
              resolve(result);
            };
            reader.onerror = () =>
              reject(new Error("Gagal membaca file gambar"));
            reader.readAsDataURL(blob);
          });

          // Additional validation: ensure base64 string is valid
          if (profilePicture && profilePicture.length > 0) {
            console.log(
              "Base64 conversion successful, length:",
              profilePicture.length
            );
          }
        } catch (error: unknown) {
          console.error("Error converting image to base64:", error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Gagal memproses gambar yang dipilih. Silakan coba lagi.";
          window.alert(errorMessage);
          return;
        }
      } else if (
        image &&
        image !== originalImage &&
        !image.startsWith("blob:")
      ) {
        // If image has changed but is not a blob URL, it might be a different URL
        // In this case, we should still send it if it's different from original
        profilePicture = image;
      }

      const updateData: Record<string, unknown> = {};
      if (editedData.name !== profile.name) updateData.name = editedData.name;
      if (editedData.phone !== profile.phone)
        updateData.phone = editedData.phone;
      if (profilePicture) updateData.profilePicture = profilePicture;

      if (Object.keys(updateData).length > 0) {
        const response = await profileAPI.editProfile(updateData);
        // Refresh user data in context after successful update
        await refreshUser();

        // Update image state with the new URL from server
        if (profilePicture && response?.user?.profilePicture) {
          // Clean up blob URL if it exists
          if (image && image.startsWith("blob:")) {
            URL.revokeObjectURL(image);
          }
          const newImageUrl = response.user.profilePicture;
          setImage(newImageUrl);
          setOriginalImage(newImageUrl);
        }
      }

      // Pastikan password dalam format asterisk sebelum menyimpan
      const finalEditedData = { ...editedData };
      if (
        finalEditedData.password &&
        !finalEditedData.password.match(/^\*+$/)
      ) {
        // Jika password masih dalam format teks biasa, ganti dengan asterisk sesuai panjangnya
        const currentLength = finalEditedData.password.length;
        finalEditedData.password = generatePasswordMask(currentLength);
        setPasswordLength(currentLength);
        localStorage.setItem("passwordLength", currentLength.toString());
      }

      // Update profile dengan data yang sudah diedit
      setProfile(finalEditedData);

      setAlert(true);

      // Refresh halaman setelah berhasil menyimpan jika ada pembaruan
      if (Object.keys(updateData).length > 0) {
        setTimeout(() => {
          setAlert(false);
          localStorage.removeItem("saveProfileStuker");
          // Refresh halaman untuk memastikan data terbaru ditampilkan
          window.location.reload();
        }, 2000); // Refresh setelah 2 detik (setelah alert muncul)
      } else {
        // Jika tidak ada pembaruan, hanya tutup alert
        setTimeout(() => {
          setAlert(false);
          localStorage.removeItem("saveProfileStuker");
        }, 4000);
      }
    } catch (error: unknown) {
      console.error("Error updating profile:", error);

      // Provide more specific error messages
      let errorMessage = "Gagal menyimpan perubahan profil";
      if (error instanceof Error && error.message) {
        if (
          error.message.includes("Cloudinary") ||
          error.message.includes("koneksi internet") ||
          error.message.includes("terhubung ke server")
        ) {
          errorMessage = error.message;
        } else if (error.message.includes("Gagal upload gambar")) {
          errorMessage =
            "Gagal mengupload gambar profil. " +
            (error.message.includes("internet")
              ? "Periksa koneksi internet Anda."
              : "Silakan coba lagi atau hubungi administrator.");
        }
      }

      window.alert(errorMessage);
    }
  };

  // 👉 Upload foto profil
  const handleClick = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        window.alert("Silakan pilih file gambar yang valid.");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        window.alert("Ukuran file terlalu besar. Maksimal 5MB.");
        return;
      }

      // Resize image to 100x100 before preview (always resize for consistency)
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (context) {
        const img = new Image();
        img.onload = () => {
          try {
            // Clean up previous blob URL if exists
            if (image && image.startsWith("blob:")) {
              URL.revokeObjectURL(image);
            }

            canvas.width = 100;
            canvas.height = 100;
            context.drawImage(img, 0, 0, 100, 100);
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const resizedUrl = URL.createObjectURL(blob);
                  setImage(resizedUrl);
                } else {
                  window.alert("Gagal memproses gambar. Silakan coba lagi.");
                }
              },
              file.type,
              0.9
            ); // Use quality 0.9 for better compression
          } catch (error) {
            console.error("Error resizing image:", error);
            window.alert("Gagal memproses gambar. Silakan coba lagi.");
          }
        };
        img.onerror = () => {
          console.error("Error loading image");
          window.alert("Gagal memuat gambar. Silakan pilih file lain.");
        };
        const objectUrl = URL.createObjectURL(file);
        img.src = objectUrl;
      } else {
        window.alert("Browser tidak mendukung canvas.");
      }
    }
    // Reset input so the same file can be selected again
    e.target.value = "";
  };

  // =====================================================
  // 🔹 RENDER UI
  // =====================================================
  return (
    <div className="px-4 flex flex-col relative">
      {/* 🔸 Alert Notifikasi */}
      {alert && (
        <Alert
          message="Data profil berhasil disimpan!"
          localStorageName="saveProfileStuker"
        />
      )}

      {/* 🔸 Modal Konfirmasi */}
      <ConfirmModalComponent
        illustrationUrl="/illustrations/saveProfile.svg"
        message="apakah kamu yakin ingin menyimpan perubahan?"
        confirm={() => {
          handleOverride();
          setShowModal(false);
        }}
        showModal={showModal}
        setShowModal={setShowModal}
      />

      {/* 🔸 Header & Foto Profil */}
      <HeaderProfilePage />
      <PhotoProfileSection
        handleClick={handleClick}
        handleFileChange={handleFileChange}
        fileInputRef={fileInputRef}
        imageUrl={image}
      />

      {/* 🔸 Rating Stuker (sebagai stuker) */}
      <Rating
        rating={
          user?.avgRatingAsStuker ? Number(user.avgRatingAsStuker) * 10 : 0
        }
        reviews={
          user?.countRatingAsStuker ? Number(user.countRatingAsStuker) : 0
        }
      />

      {/* 🔸 Field Informasi Profil */}
      <ProfileField
        label="Nama pengguna"
        icon={<User size={20} />}
        value={editedData.name}
        editable
        onChange={(v) => handleFieldChange("name", v)}
      />
      <ProfileField
        label="NIM"
        icon={<IdCard size={20} />}
        value={editedData.nim}
      />
      <ProfileField
        label="Nomor telepon"
        icon={<Phone size={20} />}
        value={editedData.phone}
        editable
        onChange={(v) => handleFieldChange("phone", v)}
      />
      <ProfileField
        label="Kata sandi"
        icon={<Lock size={20} />}
        value={editedData.password}
        editable
        onChange={(v) => handleFieldChange("password", v)}
        onBlur={handlePasswordBlur}
      />

      {/* 🔸 Tombol Aksi */}
      <div className="flex gap-x-2 mt-2">
        <div className="flex-1">
          <Button
            label="Beralih ke Customer"
            className="text-md rounded-lg py-3"
            onClick={handleSwitch}
          />
        </div>
        <div className="flex-1">
          <Button
            label="Simpan Perubahan"
            onClick={() => setShowModal(true)}
            className="text-md rounded-lg py-3"
          />
        </div>
      </div>
    </div>
  );
}
