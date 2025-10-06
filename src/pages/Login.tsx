import useAuth from '../auth/useAuth';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Image } from '@/components/ui/image';

const LoginPage = () => {

  const { loginWithOAuth, error } = useAuth();

  const handleOAuthLogin = () => {
    loginWithOAuth();
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center justify-center">
          <Image src="/Evanam Logo.png" alt="Evanam-logo" className='h-auto w-auto mb-10' />
        </a>
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">

              <CardTitle className="text-xl">Welcome back</CardTitle>
              <CardDescription>
                Login with your Frappe Account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="flex flex-col gap-4">
                  <Button variant="outline" className="w-full" onClick={handleOAuthLogin}>
                    Login with OAuth
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default LoginPage;