import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { AlertCircle, ArrowLeft, CheckCircle2, LoaderCircle, RefreshCw, ShieldCheck, Smartphone, UserRound } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { HAS_FIREBASE_CONFIG } from "../lib/config";
import { formatPhoneForDisplay, withCountryCode } from "../lib/storefrontUtils";
import { confirmPhoneOtp, resetPhoneOtpChallenge, sendPhoneOtp } from "../services/firebaseAuth";
import { checkPhoneExists, loginWithFirebaseToken, signupWithFirebaseToken } from "../services/storefrontApi";
import { useAuthStore } from "../store/authStore";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "../components/ui/input-otp";

const recaptchaContainerId = "customer-signup-recaptcha";
const RESEND_SECONDS = 30;

const resetState = {
  phone: "",
  fullName: "",
  email: "",
  otpCode: "",
  verificationId: "",
  isExistingCustomer: null as boolean | null,
};

const normalizePhone = (value: string) => value.replace(/\D/g, "").slice(-10);

const resolveRedirectTarget = (value: string | null) => {
  if (!value || !value.startsWith("/") || value.startsWith("/customer-access/new")) {
    return "/checkout";
  }

  return value;
};

export function CustomerSignup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setSession = useAuthStore((state) => state.setSession);
  const session = useAuthStore((state) => state.session);

  const redirectTarget = useMemo(() => resolveRedirectTarget(searchParams.get("redirect")), [searchParams]);
  const [form, setForm] = useState(() => ({
    ...resetState,
    phone: normalizePhone(searchParams.get("phone") || ""),
  }));
  const [error, setError] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [phoneExists, setPhoneExists] = useState<boolean | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const isOtpStep = Boolean(form.verificationId);
  const formattedPhone = useMemo(() => formatPhoneForDisplay(form.phone), [form.phone]);
  const isLocalDevelopmentHost =
    typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname);

  useEffect(() => {
    if (session?.accessToken) {
      navigate(redirectTarget, { replace: true });
    }
  }, [navigate, redirectTarget, session?.accessToken]);

  useEffect(() => {
    return () => {
      resetPhoneOtpChallenge(recaptchaContainerId);
    };
  }, []);

  useEffect(() => {
    if (resendCountdown <= 0) return;

    const timer = window.setInterval(() => {
      setResendCountdown((current) => (current <= 1 ? 0 : current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendCountdown]);

  useEffect(() => {
    if (isOtpStep) return;

    const normalized = normalizePhone(form.phone);
    if (normalized.length !== 10) {
      setPhoneExists(null);
      setIsCheckingPhone(false);
      return;
    }

    let isMounted = true;
    setIsCheckingPhone(true);

    const timer = window.setTimeout(() => {
      checkPhoneExists(withCountryCode(normalized))
        .then((exists) => {
          if (isMounted) {
            setPhoneExists(exists);
          }
        })
        .catch(() => {
          if (isMounted) {
            setPhoneExists(null);
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsCheckingPhone(false);
          }
        });
    }, 260);

    return () => {
      isMounted = false;
      window.clearTimeout(timer);
    };
  }, [form.phone, isOtpStep]);

  const setField = (name: keyof typeof form, value: string | boolean | null) => {
    if (error) {
      setError("");
    }

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSendOtp = async (options?: { resend?: boolean }) => {
    const isResend = options?.resend ?? false;
    const normalized = normalizePhone(form.phone);

    if (normalized.length !== 10) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    setError("");
    setIsSendingOtp(true);

    try {
      const exists = await checkPhoneExists(withCountryCode(normalized));

      if (!exists && !form.fullName.trim()) {
        setError("Enter your full name to create the account.");
        setIsSendingOtp(false);
        return;
      }

      if (!exists && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        setError("Enter a valid email address to create the account.");
        setIsSendingOtp(false);
        return;
      }

      const otpResult = await sendPhoneOtp({
        phoneNumber: normalized,
        recaptchaContainerId,
      });

      setForm((current) => ({
        ...current,
        phone: normalized,
        otpCode: "",
        verificationId: otpResult.verificationId,
        isExistingCustomer: exists,
      }));
      setPhoneExists(exists);
      setResendCountdown(RESEND_SECONDS);
      toast.success(`${isResend ? "Fresh OTP" : "OTP"} sent to ${formatPhoneForDisplay(normalized)}`);
    } catch (requestError: any) {
      setError(requestError?.message || "Unable to send OTP right now.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!form.verificationId || form.otpCode.trim().length < 6) {
      setError("Enter the 6-digit OTP.");
      return;
    }

    setError("");
    setIsVerifyingOtp(true);

    try {
      const firebaseIdToken = await confirmPhoneOtp(form.verificationId, form.otpCode.trim());
      const customerSession = form.isExistingCustomer
        ? await loginWithFirebaseToken(firebaseIdToken)
        : await signupWithFirebaseToken(firebaseIdToken, form.fullName.trim(), form.email.trim());

      setSession(customerSession);
      toast.success(form.isExistingCustomer ? "Welcome back." : "Account created successfully.");
      navigate(redirectTarget, { replace: true });
    } catch (verifyError: any) {
      setError(verifyError?.message || "OTP verification failed.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const resetOtpStep = () => {
    resetPhoneOtpChallenge(recaptchaContainerId);
    setResendCountdown(0);
    setForm((current) => ({
      ...current,
      otpCode: "",
      verificationId: "",
      isExistingCustomer: null,
    }));
    setError("");
  };

  return (
    <div className="app-shell">
      <div className="mx-auto max-w-5xl">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[2.4rem] border border-white/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(246,244,236,0.98))] shadow-[0_32px_90px_rgba(24,44,28,0.16)]"
        >
          <div className="flex flex-col items-center p-8 sm:p-12 w-full max-w-md mx-auto">
            <Link
              to={redirectTarget}
              className="self-start mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>

            <div className="flex flex-col items-center text-center mb-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#10b981] to-[#047857] text-white shadow-lg mb-6">
                {isOtpStep ? <ShieldCheck className="h-8 w-8" /> : <Smartphone className="h-8 w-8" />}
              </div>
              <h1 className="font-['Fraunces'] text-3xl font-bold text-[#17311d]">
                {isOtpStep ? "Verify OTP" : "Welcome"}
              </h1>
              <p className="mt-2 text-sm text-[#607361]">
                {isOtpStep ? "Enter the code sent to your phone" : "Enter your mobile number to continue"}
              </p>
            </div>
            
            <div className="w-full">

              {!HAS_FIREBASE_CONFIG ? (
                <div className="mt-6 rounded-3xl border border-[#e7d1c0] bg-[#fff7f0] p-5 text-sm text-[#7c4b2c]">
                  Firebase web configuration is missing. Add the `VITE_FIREBASE_*` values to enable OTP sign-in on the website.
                </div>
              ) : null}

              {isLocalDevelopmentHost ? (
                <div className="mt-6 rounded-3xl border border-[#d8e2cd] bg-[#f8fbf4] p-5 text-sm text-[#416246]">
                  Real Firebase phone OTPs should be tested from a live website domain, not localhost.
                </div>
              ) : null}

              <div className="mt-6 space-y-5">
                {!isOtpStep ? (
                  <>
                    <label>
                      <span className="mb-2 block text-sm font-semibold text-[#18381f]">Phone number</span>
                      <div className="flex items-center rounded-2xl border border-[#d7e3cf] bg-white px-4 py-3 shadow-[0_8px_20px_rgba(28,45,31,0.05)]">
                        <span className="pr-3 text-sm font-semibold text-[#3f6745]">+91</span>
                        <input
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          value={form.phone}
                          onChange={(event) => setField("phone", normalizePhone(event.target.value))}
                          className="w-full bg-transparent text-sm text-[#0d2415] outline-none placeholder:text-[#88a289]"
                          placeholder="98765 43210"
                        />
                      </div>
                    </label>



                    {phoneExists !== true ? (
                      <>
                        <label>
                          <span className="mb-2 block text-sm font-semibold text-[#18381f]">Full name</span>
                          <div className="flex items-center rounded-2xl border border-[#d7e3cf] bg-white px-4 py-3 shadow-[0_8px_20px_rgba(28,45,31,0.05)]">
                            <UserRound className="mr-3 h-4 w-4 text-[#5b815f]" />
                            <input
                              type="text"
                              value={form.fullName}
                              onChange={(event) => setField("fullName", event.target.value)}
                              className="w-full bg-transparent text-sm text-[#0d2415] outline-none placeholder:text-[#88a289]"
                              placeholder="Your full name"
                            />
                          </div>
                        </label>

                        <label>
                          <span className="mb-2 block text-sm font-semibold text-[#18381f]">Email address</span>
                          <input
                            type="email"
                            value={form.email}
                            onChange={(event) => setField("email", event.target.value)}
                            className="w-full rounded-2xl border border-[#d7e3cf] bg-white px-4 py-3 text-sm text-[#0d2415] shadow-[0_8px_20px_rgba(28,45,31,0.05)] outline-none placeholder:text-[#88a289]"
                            placeholder="name@example.com"
                          />
                        </label>
                      </>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => void handleSendOtp()}
                      disabled={!HAS_FIREBASE_CONFIG || isSendingOtp}
                      className="inline-flex min-w-[220px] items-center justify-center rounded-2xl bg-[#1d7c3f] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_28px_rgba(29,124,63,0.26)] transition hover:bg-[#176a34] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSendingOtp ? (
                        <>
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                          Sending OTP
                        </>
                      ) : phoneExists === true ? (
                        "Send sign-in OTP"
                      ) : (
                        "Send OTP and continue"
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="rounded-3xl border border-[#d7e3cf] bg-[#f4f7ef] p-4 text-sm text-[#315037]">
                      OTP sent to <span className="font-semibold">{formattedPhone}</span>. Enter the 6-digit code below to continue.
                    </div>

                    <label>
                      <span className="mb-2 block text-sm font-semibold text-[#18381f]">Enter OTP</span>
                      <div className="flex justify-center sm:justify-start">
                        <InputOTP
                          maxLength={6}
                          value={form.otpCode}
                          onChange={(value) => setField("otpCode", value.replace(/\D/g, "").slice(0, 6))}
                          containerClassName="items-center"
                          className="justify-center"
                        >
                          <InputOTPGroup className="gap-2">
                            {[0, 1, 2].map((index) => (
                              <InputOTPSlot
                                key={index}
                                index={index}
                                className="h-12 w-10 rounded-2xl border-[#d7e3cf] bg-white text-lg font-semibold text-[#17311d] shadow-[0_10px_24px_rgba(23,42,28,0.05)] first:rounded-2xl first:border last:rounded-2xl sm:h-14 sm:w-12"
                              />
                            ))}
                          </InputOTPGroup>
                          <InputOTPSeparator className="mx-1 text-[#9bad9a]" />
                          <InputOTPGroup className="gap-2">
                            {[3, 4, 5].map((index) => (
                              <InputOTPSlot
                                key={index}
                                index={index}
                                className="h-12 w-10 rounded-2xl border-[#d7e3cf] bg-white text-lg font-semibold text-[#17311d] shadow-[0_10px_24px_rgba(23,42,28,0.05)] first:rounded-2xl first:border last:rounded-2xl sm:h-14 sm:w-12"
                              />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </label>

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.4rem] border border-[#d7e3cf] bg-[#f8fbf4] px-4 py-3">
                      <div className="text-sm text-[#5c725f]">
                        {resendCountdown > 0
                          ? `Resend available in 00:${String(resendCountdown).padStart(2, "0")}`
                          : "Did not receive the OTP yet?"}
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleSendOtp({ resend: true })}
                        disabled={isSendingOtp || resendCountdown > 0}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#2e6d3b] transition hover:text-[#163a1f] disabled:cursor-not-allowed disabled:text-[#8aa08b]"
                      >
                        {isSendingOtp ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        Resend OTP
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={resetOtpStep}
                      className="text-sm font-semibold text-[#2e6d3b] transition hover:text-[#163a1f]"
                    >
                      Change mobile number
                    </button>

                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={isVerifyingOtp || form.otpCode.trim().length < 6}
                      className="inline-flex min-w-[220px] items-center justify-center rounded-2xl bg-[#1d7c3f] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_28px_rgba(29,124,63,0.26)] transition hover:bg-[#176a34] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isVerifyingOtp ? (
                        <>
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                          Verifying
                        </>
                      ) : form.isExistingCustomer ? (
                        "Verify and sign in"
                      ) : (
                        "Verify and create account"
                      )}
                    </button>
                  </>
                )}

                {error ? (
                  <div className="rounded-2xl border border-[#e8cbc7] bg-[#fff4f2] px-4 py-3 text-sm text-[#a44f45]">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <p>{error}</p>
                    </div>
                  </div>
                ) : null}

                <div
                  id={recaptchaContainerId}
                  className="pointer-events-none fixed left-[-9999px] top-auto h-px w-px overflow-hidden opacity-0"
                />
              </div>
            </div>
          </div>
        </motion.section>
      </div>
      <div id={recaptchaContainerId} className="invisible"></div>
    </div>);
}
