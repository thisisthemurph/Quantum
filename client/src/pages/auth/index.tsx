import {LogInForm, LogInFormValues} from "@/pages/auth/LogInForm.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useEffect, useState} from "react";
import { SignUpForm, SignUpFormValues } from "./SignUpForm";
import { useAuthApi } from "@/data/api/auth.ts";
import {useUser} from "@/hooks/use-user.ts";
import {useUserStore} from "@/stores/UserStore.tsx";
import {useNavigate, useParams} from "react-router";
import {toast} from "sonner";

export function LogInPage() {
  const auth = useAuthApi();
  const [showSignInForm, setShowSignInForm] = useState(true);
  const user = useUser();
  const { setUser } = useUserStore.getState();
  const navigate = useNavigate();
  const { signedup } = useParams();

  async function handleSignUp(values: SignUpFormValues) {
    try {
      await auth.signup(values);
      navigate("/login?signedup=true");
    } catch (error) {
      console.error(error);
    }
  }

  async function handleLogIn(values: LogInFormValues) {
    try {
      const user = await auth.login(values);
      setUser(user);
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error("Failed to log in");
    }
  }

  useEffect(() => {
    console.log({ signedup });
    if (signedup) {
      toast.success("Thank you for signing up, please log in.");
      setShowSignInForm(true);
    }
  }, [signedup]);

  return (
    <div className="flex justify-between w-4/5 h-4/5 rounded-lg shadow-lg bg-card">
      <section className="flex flex-col items-center justify-center p-6 grow overflow-y-auto">
        <section className="flex flex-col justify-center items-center">
          <div className="flex flex-col">
            <span className="text-3xl italic">{showSignInForm ? "Experience the" : "Join the"}</span>
            <span className="text-5xl font-semibold"><span className="text-purple-500">Quantum</span> team...</span>
          </div>
          <p className="pb-12 py-8 text-center text-lg w-full italic text-muted-foreground">
            {showSignInForm
              ? "Sign in with your email address to get started"
              : "Create your account to get started with Quantum"}
          </p>
        </section>

        {showSignInForm
          ? <LogInForm onSubmit={handleLogIn}/>
          : <SignUpForm onSubmit={handleSignUp}/>}
        <span className="inline md:hidden mt-1">
          <Button variant="link" className="" onClick={() => setShowSignInForm(!showSignInForm)}>
            {showSignInForm ? "Sign up instead" : "Sign in instead"}
          </Button>
        </span>
      </section>

      <section className="relative p-6 bg-purple-400/80 hidden md:block w-2/3 rounded-r-lg">
        <div className="absolute top-4 right-4 flex items-center gap-4">
          <p className="text-slate-600 text-lg italic">{showSignInForm ? "Not signed up yet?" : "Already joined the team?"}</p>
          <Button size="lg" className="text-xl py-6" onClick={() => setShowSignInForm(!showSignInForm)}>
            {showSignInForm ? "Sign up" : "Sign in"}
          </Button>
        </div>
        <pre>{JSON.stringify(user ?? {}, null, 2)}</pre>
      </section>
    </div>
  )
}


