import { useForm, SubmitHandler } from "react-hook-form";
import { loginSchema, loginZodObject } from "../../util/zodLogin";
import { zodResolver } from "@hookform/resolvers/zod";
import { authorizeUser } from "../../util/authorizeUser";
import { useState } from "react";
import { useNavigate } from "react-router";

interface LoginProps {
  setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
}

const Login = ({ setIsLogin }: LoginProps) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<loginSchema>({ resolver: zodResolver(loginZodObject) });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const navigate = useNavigate();

  const onSubmit: SubmitHandler<loginSchema> = (data) => {
    setIsLoading(true);
    authorizeUser({
      email: data.email,
      password: data.password,
    })
      .then((result) => {
        console.log("Login success:", result.account);
        localStorage.setItem("token", result.token);
        setIsLoading(false);
        navigate("/");
      })
      .catch((err) => {
        setErrorMessage(err);
        setIsLoading(false);
      });
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <form
        className="flex flex-col justify-center items-center bg-white w-full max-w-[480px] h-full max-h-[280px] rounded-md drop-shadow-md"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex items-center text-xl font-bold">
          <img
            src="./TiMagLogo.svg"
            alt="Logo"
            className={"h-[56px] w-[56px]"}
          />{" "}
          TiMag
        </div>
        <div className="flex flex-col p-1">
          <label htmlFor="email">Email</label>
          <input
            className="shadow-inner bg-[rgba(246,246,246,1)] p-2"
            id="email"
            type="text"
            {...register("email")}
          />
        </div>
        {errors.email && (
          <span className="text-red-500 text-sm">{errors.email.message}</span>
        )}
        <div className="flex flex-col p-1">
          <label htmlFor="password">Password</label>
          <input
            className="shadow-inner bg-[rgba(246,246,246,1)] p-2"
            id="password"
            type="password"
            {...register("password")}
          />
        </div>
        {errors.password && (
          <span className="text-red-500 text-sm">
            {errors.password.message}
          </span>
        )}
        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-blue-400 drop-shadow rounded-md mt-2 p-2 disabled:bg-slate-500"
            disabled={
              !watch("email") || Object.keys(errors).length > 0 || isLoading
            }
          >
            Login
          </button>
          <button
            type="button"
            className="bg-green-400 drop-shadow rounded-md mt-2 p-2"
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      </form>
    </div>
  );
};

export default Login;
