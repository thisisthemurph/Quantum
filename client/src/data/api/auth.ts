import {User} from "@/data/models/user.ts";
import {LogInFormValues} from "@/pages/auth/LogInForm.tsx";

type SignUpRequest = {
  name: string;
  username: string;
  password: string;
}

export function useAuthApi() {
  const signup = async (request: SignUpRequest) => {
    const response = await fetch("http://localhost:42069/api/v1/auth/signup", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (response.ok) {
      return await response.json() as User;
    }

    throw new Error("Failed to sign up");
  }

  const login = async (request: LogInFormValues) => {
    const response = await fetch("http://localhost:42069/api/v1/auth/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (response.ok) {
      return await response.json() as User;
    }

    throw new Error("Failed to log in");
  };

  const logout = async () => {
    const response = await fetch("http://localhost:42069/api/v1/auth/logout", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to log out");
    }
  };

  return {
    signup,
    login,
    logout,
  };
}