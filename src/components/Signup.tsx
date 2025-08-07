import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { IoChatbubbleSharp } from "react-icons/io5";
import { useMutation } from "@tanstack/react-query";
import { signupUser, checkUserExists } from "../services/authService";
import { useState } from "react";
import { toast } from "react-toastify";
import Spinner from "../ui/Spinner";
import type { FormValues } from "../types";

export default function Signup() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  const [formError, setFormError] = useState("");
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: signupUser,
    onSuccess: () => {
      toast.success("check email confirmation!");
      reset();
      navigate("/");
    },
    onError: (error: Error) => {
      setFormError(error.message);
    },
  });

  const onSubmit = async (data: FormValues) => {
    setFormError("");

    if (data.password !== data.confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    const exists = await checkUserExists(data.email, data.username);
    if (exists) {
      setFormError("Email or username already exists");
      return;
    }

    mutation.mutate({
      email: data.email,
      password: data.password,
      username: data.username,
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="min-h-screen flex items-center justify-center"
      noValidate
    >
      <div className="bg-purple-200/95 text-purple-800 !p-20 max-w-xl mx-auto rounded-lg flex flex-col gap-6 shadow-lg">
        <div className="flex items-center justify-center gap-3">
          <IoChatbubbleSharp />
          <h1 className="text-center">Create Account</h1>
        </div>

        {formError && (
          <p className="text-red-700 text-lg font-semibold">{formError}</p>
        )}

        <div className="flex flex-col gap-3">
          <label htmlFor="username" className="block font-extrabold text-2xl">
            Username:
          </label>
          <input
            id="username"
            placeholder="username"
            className="!px-4 !py-2 rounded-lg border-2 border-purple-500 w-full text-2xl focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-offset-2"
            {...register("username", {
              required: "Username is required",
            })}
          />
          {errors.username && (
            <p className="text-red-700 text-lg font-semibold">
              {errors.username.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <label htmlFor="email" className="block font-extrabold text-2xl">
            Email:
          </label>
          <input
            id="email"
            type="email"
            placeholder="email"
            className="!px-4 !py-2 rounded-lg border-2 border-purple-500 w-full text-2xl focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-offset-2"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email address",
              },
            })}
          />
          {errors.email && (
            <p className="text-red-700 text-lg font-semibold">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <label htmlFor="password" className="block font-extrabold text-2xl">
            Password:
          </label>
          <input
            type="password"
            id="password"
            placeholder="password"
            className="!px-4 !py-2 rounded-lg border-2 border-purple-500 w-full text-2xl focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-offset-2"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
          />
          {errors.password && (
            <p className="text-red-700 text-lg font-semibold">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <label
            htmlFor="confirmPassword"
            className="block font-extrabold text-2xl"
          >
            Confirm Password:
          </label>
          <input
            type="password"
            id="confirmPassword"
            placeholder="confirm password"
            className="!px-4 !py-2 rounded-lg border-2 border-purple-500 w-full text-2xl focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-offset-2"
            {...register("confirmPassword", {
              required: "Please confirm your password",
            })}
          />
          {errors.confirmPassword && (
            <p className="text-red-700 text-lg font-semibold">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-purple-800 text-white !px-4 !py-2 rounded-lg hover:bg-purple-950 transition duration-300 font-extrabold text-2xl disabled:bg-purple-950 disabled:cursor-not-allowed cursor-pointer"
          >
            {mutation.isPending ? (
              <span className="flex items-center gap-2">
                Creating <Spinner />
              </span>
            ) : (
              "Signup"
            )}
          </button>

          <Link
            to="/"
            className=" rounded-lg !px-4 !py-2 bg-purple-600/50 border-none text-2xl text-white hover:bg-purple-600 transition-all duration-300"
          >
            Login
          </Link>
        </div>
      </div>
    </form>
  );
}
