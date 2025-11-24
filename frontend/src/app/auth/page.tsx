"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { login } from "@/store/slices/authSlice";
import ButtonPrimary from "@/components/ButtonPrimary";
import InputAuth from "@/components/InputAuth";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    nim: "",
    password: "",
  });

  const [localError, setLocalError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (localError) setLocalError("");
  };

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    try {
      const resultAction = await dispatch(
        login({ nim: formData.nim, password: formData.password })
      );

      if (login.fulfilled.match(resultAction)) {
        // Get user data from Redux state
        const userData = resultAction.payload.user;

        // Check user role and redirect accordingly
        if (userData.role && Array.isArray(userData.role)) {
          // If user has both roles, default to user dashboard
          if (
            userData.role.includes("user") &&
            userData.role.includes("stuker")
          ) {
            router.replace("/dashboard");
          } else if (userData.role.includes("stuker")) {
            router.replace("/stuker-dashboard");
          } else {
            router.replace("/dashboard");
          }
        } else {
          // Default to user dashboard if role is not an array
          router.replace("/dashboard");
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setLocalError(errorMessage);
    }
  };

  const handleSwitchPage = () => {
    router.push("/auth/register");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="h-[80dvh] flex flex-col justify-between py-8 px-6 border-t border-gray-300"
    >
      {/* Header + Input Fields */}
      <div>
        <h1 className="font-sans text-4xl font-semibold mb-5">Login</h1>

        {(localError || error) && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {localError || error}
          </div>
        )}

        <InputAuth
          label="NIM"
          name="nim"
          type="number"
          placeholder="Masukan Nim"
          value={formData.nim}
          onChange={handleChange}
        />

        <InputAuth
          label="Kata Sandi"
          name="password"
          type="password"
          placeholder="Masukan Kata Sandi"
          value={formData.password}
          onChange={handleChange}
        />
      </div>

      {/* Button + Switch Page */}
      <div>
        <ButtonPrimary
          label={loading ? "Loading..." : "Login"}
          type="submit"
          onClick={handleSubmit}
          disabled={loading}
        />

        <div className="flex justify-center mt-2 gap-x-2">
          <p>Belum Punya Akun?</p>
          <p
            onClick={handleSwitchPage}
            className="font-medium text-primary cursor-pointer active:opacity-20"
          >
            Daftar
          </p>
        </div>
      </div>
    </form>
  );
}
