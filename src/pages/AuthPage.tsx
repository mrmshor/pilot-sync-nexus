import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateEmail, validatePassword } from '@/utils/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string[]}>({});
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkUser();
  }, [navigate]);

  // Handle email verification on page load
  useEffect(() => {
    const handleEmailVerification = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const type = urlParams.get('type');
      
      if (token && type === 'signup') {
        setSuccess('החשבון אומת בהצלחה! אתה יכול להתחבר כעת.');
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };
    
    handleEmailVerification();
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setValidationErrors({});

    // Enhanced validation
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    const errors: {[key: string]: string[]} = {};

    if (!emailValidation.isValid) {
      errors.email = emailValidation.errors;
    }
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors;
    }
    if (!displayName.trim()) {
      errors.displayName = ['שם מלא נדרש'];
    } else if (displayName.trim().length < 2) {
      errors.displayName = ['שם מלא חייב להיות באורך של לפחות 2 תווים'];
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setIsLoading(false);
      return;
    }

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: displayName
          }
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          setError('משתמש עם המייל הזה כבר קיים. נסה להתחבר במקום.');
        } else if (error.message.includes('Password should be at least')) {
          setError('הסיסמה חייבת להיות לפחות 6 תווים.');
        } else {
          setError(error.message);
        }
        return;
      }

      toast.success('נשלח מייל אימות לכתובת שלך. בדוק את התיבה והקלק על הקישור לאימות החשבון.');
    } catch (err) {
      setError('שגיאה בהרשמה. נסה שוב.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setValidationErrors({});

    // Enhanced validation
    const emailValidation = validateEmail(email);
    const errors: {[key: string]: string[]} = {};

    if (!emailValidation.isValid) {
      errors.email = emailValidation.errors;
    }
    if (!password.trim()) {
      errors.password = ['סיסמה נדרשת'];
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('מייל או סיסמה שגויים.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('החשבון טרם אומת. בדוק את המייל לקישור האימות.');
        } else {
          setError(error.message);
        }
        return;
      }

      toast.success('התחברת בהצלחה!');
      navigate('/');
    } catch (err) {
      setError('שגיאה בהתחברות. נסה שוב.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetError = () => {
    setError('');
    setSuccess('');
    setValidationErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/30 flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-md shadow-xl border-border/50 backdrop-blur-sm">
        <CardHeader className="space-y-2 text-center pb-4">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
            <User className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">מנהל משימות</CardTitle>
          <CardDescription>ברוכים הבאים למערכת ניהול הפרויקטים</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin" onClick={resetError}>התחברות</TabsTrigger>
              <TabsTrigger value="signup" onClick={resetError}>הרשמה</TabsTrigger>
            </TabsList>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">כתובת מייל</Label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pr-10"
                        required
                        disabled={isLoading}
                        error={validationErrors.email?.[0]}
                      />
                    </div>
                    {validationErrors.email && (
                      <div className="text-sm text-red-600 space-y-1">
                        {validationErrors.email.map((error, index) => (
                          <div key={index}>• {error}</div>
                        ))}
                      </div>
                    )}
                  </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password">סיסמה</Label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                      required
                      disabled={isLoading}
                      error={validationErrors.password?.[0]}
                    />
                  </div>
                  {validationErrors.password && (
                    <div className="text-sm text-red-600 space-y-1">
                      {validationErrors.password.map((error, index) => (
                        <div key={index}>• {error}</div>
                      ))}
                    </div>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="ml-2 h-4 w-4" />
                  )}
                  {isLoading ? 'מתחבר...' : 'התחבר'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">שם מלא</Label>
                  <div className="relative">
                    <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="השם המלא שלך"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="pr-10"
                      required
                      disabled={isLoading}
                      error={validationErrors.displayName?.[0]}
                    />
                  </div>
                  {validationErrors.displayName && (
                    <div className="text-sm text-red-600 space-y-1">
                      {validationErrors.displayName.map((error, index) => (
                        <div key={index}>• {error}</div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">כתובת מייל</Label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pr-10"
                      required
                      disabled={isLoading}
                      error={validationErrors.email?.[0]}
                    />
                  </div>
                  {validationErrors.email && (
                    <div className="text-sm text-red-600 space-y-1">
                      {validationErrors.email.map((error, index) => (
                        <div key={index}>• {error}</div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">סיסמה</Label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="לפחות 8 תווים עם אותיות גדולות, מספרים ותווים מיוחדים"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                      required
                      disabled={isLoading}
                      minLength={8}
                      error={validationErrors.password?.[0]}
                    />
                  </div>
                  {validationErrors.password && (
                    <div className="text-sm text-red-600 space-y-1">
                      {validationErrors.password.map((error, index) => (
                        <div key={index}>• {error}</div>
                      ))}
                    </div>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="ml-2 h-4 w-4" />
                  )}
                  {isLoading ? 'נרשם...' : 'הרשם'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground">
              בהרשמה אני מסכים לתנאי השימוש ולמדיניות הפרטיות
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}