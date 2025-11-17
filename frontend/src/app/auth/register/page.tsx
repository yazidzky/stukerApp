"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { register } from "@/store/slices/authSlice";
import ButtonPrimary from "@/components/ButtonPrimary";
import InputAuth from "@/components/InputAuth";

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    nim: "",
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [localError, setLocalError] = useState("");

  // 👉 Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (localError) setLocalError("");
  };

  // 👉 Handle submit (Enter / Button)
  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    try {
      const resultAction = await dispatch(register(formData));

      if (register.fulfilled.match(resultAction)) {
        router.push("/auth");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Registration failed";
      setLocalError(errorMessage);
    }
  };

  // 👉 Switch to Login page
  const handleSwitchPage = () => {
    router.push("/auth");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="h-[80dvh] flex flex-col justify-between py-5 px-6 border-t border-gray-300"
    >
      {/* ================= Header & Form Fields ================= */}
      <div>
        <h1 className="font-sans text-4xl font-semibold mb-5">Daftar</h1>

        {(localError || error) && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {localError || error}
          </div>
        )}

        <InputAuth
          label="NIM"
          name="nim"
          type="text"
          placeholder="Masukan Nim"
          value={formData.nim}
          onChange={handleChange}
        />

        <InputAuth
          label="Nama Pengguna"
          name="name"
          type="text"
          placeholder="Masukan nama pengguna"
          value={formData.name}
          onChange={handleChange}
        />

        <InputAuth
          label="Nomor Telepon"
          name="phone"
          type="text"
          placeholder="Masukan nomor telepon"
          value={formData.phone}
          onChange={handleChange}
        />

        <InputAuth
          label="Kata Sandi"
          name="password"
          type="password"
          placeholder="Masukan kata sandi"
          value={formData.password}
          onChange={handleChange}
        />

        <InputAuth
          label="Konfirmasi Kata Sandi"
          name="confirmPassword"
          type="password"
          placeholder="Masukan ulang kata sandi"
          value={formData.confirmPassword}
          onChange={handleChange}
        />
      </div>

      {/* ================= Button & Page Switch ================= */}
      <div>
        <ButtonPrimary
          label={loading ? "Loading..." : "Daftar"}
          type="submit"
          onClick={handleSubmit}
          disabled={loading}
        />

        <div className="flex justify-center mt-2 gap-x-2">
          <p>Sudah Punya Akun?</p>
          <p
            onClick={handleSwitchPage}
            className="font-medium text-primary cursor-pointer active:opacity-20"
          >
            Login
          </p>
        </div>
      </div>
    </form>
  );
}
