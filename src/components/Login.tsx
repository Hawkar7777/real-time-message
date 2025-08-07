import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { IoChatbubbleSharp } from "react-icons/io5";
import { useMutation } from "@tanstack/react-query";
import { signinUser } from "../services/authService";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import Spinner from "../ui/Spinner";
import type { FormValuesLogin } from "../types";

export default function Login() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValuesLogin>();

  const { setUser } = useAuth();

  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: signinUser,
    onSuccess: (data) => {
      const user = data.user;
      setUser({ id: user.id, email: user.email ?? "" });

      toast.success("Logges Successfully");
      reset();
      navigate("/home");
    },
    onError: (error) => {
      toast.error(error?.message ?? "Unknown error");
    },
  });

  const onSubmit = (data: FormValuesLogin) => {
    mutation.mutate({ email: data.email, password: data.password });
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
          <h1 className="text-center">Real-time chat </h1>
        </div>
        <div className="flex flex-col gap-3">
          <label htmlFor="email" className="block font-extrabold mb-6 text-2xl">
            Email:
          </label>
          <input
            type="email"
            placeholder="email"
            id="email"
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
            <p className="text-red-700 mt-4 text-lg font-semibold">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <label
            htmlFor="password"
            className="block font-extrabold mb-6 text-2xl"
          >
            Password:
          </label>
          <input
            type="password"
            placeholder="password"
            id="password"
            className="!px-4 !py-2 rounded-lg border-2 border-purple-500 w-full text-2xl focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-offset-2"
            {...register("password", {
              required: "Password is required",
            })}
          />
          {errors.password && (
            <p className="text-red-700 mt-4 text-lg font-semibold">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex  items-center justify-center gap-4">
          <button
            type="submit"
            className="bg-purple-800 text-white !px-4 !py-2 rounded-lg hover:bg-purple-950 transition duration-300 font-extrabold text-2xl disabled:bg-purple-950 cursor-pointer disabled:cursor-not-allowed"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <div className="flex items-center justify-center gap-3">
                Login <Spinner />
              </div>
            ) : (
              "Login"
            )}
          </button>

          <Link
            to="/signup"
            className=" rounded-lg !px-4 !py-2 bg-purple-600/50 border-none text-2xl text-white hover:bg-purple-600 transition-all duration-300"
          >
            Signup
          </Link>
        </div>
      </div>
    </form>
  );
}
