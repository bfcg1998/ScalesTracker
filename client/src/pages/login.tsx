import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Scale } from "lucide-react";

export default function LoginPage() {
  const [dodId, setDodId] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(dodId, password);
    
    if (!result.success) {
      toast({
        title: "Login Failed",
        description: result.error || "Invalid credentials",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-military-blue to-blue-800 p-4">
      <Card className="w-full max-w-md elevation-3">
        <CardContent className="pt-8 p-8">
          <div className="text-center mb-8">
            <div className="military-blue w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Scale className="text-2xl text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-charcoal mb-2">ScaleOps</h1>
            <p className="text-gray-600">Precision Scale Lifecycle Tracker</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="dodId" className="block text-sm font-medium text-charcoal mb-2">
                DoD ID
              </Label>
              <Input
                id="dodId"
                type="text"
                placeholder="Enter your DoD ID"
                value={dodId}
                onChange={(e) => setDodId(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-military-blue focus:border-transparent transition-all"
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-charcoal mb-2">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-military-blue focus:border-transparent transition-all"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={setRemember}
              />
              <Label htmlFor="remember" className="text-sm text-gray-600">
                Remember me
              </Label>
            </div>
            
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full military-blue py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
            
            <div className="text-center">
              <a href="#" className="text-sm text-military-blue hover:underline">
                CAC/PIV Login (Coming Soon)
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
