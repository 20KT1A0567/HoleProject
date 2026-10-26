import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, ArrowRight, CheckCircle2, LoaderCircle, RefreshCw, ShieldCheck, Smartphone, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { HAS_FIREBASE_CONFIG } from "../lib/config";
import { formatPhoneForDisplay, withCountryCode } from "../lib/storefrontUtils";
import { confirmPhoneOtp, resetPhoneOtpChallenge, sendPhoneOtp } from "../services/firebaseAuth";
import { checkPhoneExists, loginWithFirebaseToken } from "../services/storefrontApi";
import { useAuthStore } from "../store/authStore";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "./ui/input-otp";

const resetState = {
  phone: "",
  otpCode: "",
  verificationId: "",
  isExistingCustomer: null as boolean | null,
};

const RESEND_SECONDS = 30;

interface AuthActionStep {
  id: string;
  text: string;
}

export function AuthModal() {
  const recaptchaContainerId = "customer-auth-recaptcha";
  const navigate = useNavigate();
  const location = useLocation();
  const isOpen = useAuthStore((state) => state.isAuthModalOpen);
  const closeModal = useAuthStore((state) => state.closeAuthModal);
  const setSession = useAuthStore((state) => state.setSession);

  const [form, setForm] = useState(resetState);
  const [error, setError] = useState("");
  const [firebaseDebugCode, setFirebaseDebugCode] = useState("");
  const [firebaseDebugMessage, setFirebaseDebugMessage] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [phoneExists, setPhoneExists] = useState<boolean | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const currentHostname = typeof window !== "undefined" ? window.location.hostname : "";
  const isLocalDevelopmentHost = ["localhost", "127.0.0.1"].includes(currentHostname);
  const isOtpStep = Boolean(form.verificationId);
  const formattedPhone = useMemo(() => formatPhoneForDisplay(form.phone), [form.phone]);

  useEffect(() => {
    if (!isOpen) {
      resetPhoneOtpChallenge(recaptchaContainerId);
      setForm(resetState);
      setError("");
      setFirebaseDebugCode("");
      setFirebaseDebugMessage("");
      setIsSendingOtp(false);
      setIsVerifyingOtp(false);
      setIsCheckingPhone(false);
      setPhoneExists(null);
      setResendCountdown(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (resendCountdown <= 0) return;

    const timer = window.setInterval(() => {
      setResendCountdown((current) => (current <= 1 ? 0 : current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendCountdown]);

  useEffect(() => {
    if (!isOpen || isOtpStep) return;
    const normalized = form.phone.replace(/\D/g, "").slice(-10);
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
  }, [form.phone, isOpen, isOtpStep]);

  const authSetupHint = useMemo(() => {
    if (!error) return "";
    if (error.includes("website API key")) {
      return "Restart the Vite website after any .env change, then confirm this Firebase Web App config is the website one and not an old/deleted app.";
    }
    if (firebaseDebugCode === "auth/localhost-not-supported") {
      return "Firebase's current web phone-auth flow does not allow real SMS verification from localhost. Use your live site for real OTPs.";
    }
    if (error.includes("authorized in Firebase Authentication")) {
      return "Open Firebase Authentication settings and add localhost, 127.0.0.1, and your live website domain to Authorized domains.";
    }
    if (error.includes("Phone sign-in is not enabled")) {
      return "Open Firebase Authentication, enable the Phone provider, and save the sign-in method settings.";
    }
    if (firebaseDebugCode === "auth/invalid-app-credential") {
      return isLocalDevelopmentHost
        ? "Firebase rejected the local verification token. On localhost, switch to Firebase test phone numbers or move the test to a live website domain."
        : "Firebase rejected the invisible app verification token. This is usually caused by a stale verifier, blocked Google verification scripts, or browser privacy/ad-block extensions.";
    }
    if (firebaseDebugCode === "auth/recaptcha-timeout") {
      return "Firebase could not complete the reCAPTCHA check in time. This usually points to blocked Google verification scripts, a slow network, or an expired invisible verifier.";
    }
    if (error.toLowerCase().includes("security check")) {
      return "Refresh the page once so a fresh secure verification can run, then try sending the OTP again.";
    }
    return "";
  }, [error, firebaseDebugCode, isLocalDevelopmentHost]);
  const authActionChecklist = useMemo(() => {
    const normalizedHost =
      currentHostname && !isLocalDevelopmentHost
        ? currentHostname
        : "your website domain";

    const steps: AuthActionStep[] = [];

    if (!firebaseDebugCode && !error) {
      return steps;
    }

    if (firebaseDebugCode === "auth/localhost-not-supported") {
      steps.push(
        {
          id: "live-domain",
          text: "For real OTP delivery, open the live storefront on a real domain such as anushabazaar.com instead of localhost.",
        },
      );
      return steps;
    }

    if (firebaseDebugCode === "auth/invalid-app-credential" || firebaseDebugCode === "auth/captcha-check-failed") {
      steps.push(
        {
          id: "refresh",
          text: "Refresh the page once and try again so Firebase can create a fresh invisible verification token.",
        },
        {
          id: "extensions",
          text: "Turn off ad blockers, Brave shields, or strict privacy extensions for this site because they often block Google verification scripts.",
        },
        {
          id: "domains",
          text: `In Firebase Authentication authorized domains, add ${normalizedHost} and any other real website domains that should send OTPs.`,
        },
        {
          id: "config",
          text: "Confirm the VITE_FIREBASE_* values come from the same Firebase Web App and project where Phone sign-in is enabled, then restart the Vite dev server after any .env change.",
        },
      );

      if (isLocalDevelopmentHost) {
        steps.push({
          id: "testing",
          text: "On localhost, do not keep retrying real numbers. Firebase test phone numbers or a live website domain are the reliable options.",
        });
      }

      return steps;
    }

    if (firebaseDebugCode === "auth/recaptcha-timeout") {
      steps.push(
        {
          id: "reload",
          text: "Reload the page and send the OTP again so Firebase creates a fresh reCAPTCHA verifier.",
        },
        {
          id: "extensions",
          text: "Disable ad blockers, Brave shields, tracking protection, or VPN filtering for this site because they can block Google verification scripts.",
        },
        {
          id: "network",
          text: "Retry on a stable network and confirm that google.com and gstatic.com scripts are not blocked by the browser or firewall.",
        },
      );
      return steps;
    }

    if (firebaseDebugCode === "auth/unauthorized-domain") {
      steps.push({
        id: "domain-only",
        text: `Add ${normalizedHost} in Firebase Authentication authorized domains, save the settings, then reload the website.`,
      });
      return steps;
    }

    if (firebaseDebugCode === "auth/invalid-api-key") {
      steps.push(
        {
          id: "api-key",
          text: "Replace the VITE_FIREBASE_* values with the active website Firebase Web App config from the correct Firebase project.",
        },
        {
          id: "restart",
          text: "Restart the Vite website after updating .env so the new Firebase settings are actually loaded.",
        },
      );
      return steps;
    }

    if (firebaseDebugCode === "auth/operation-not-allowed") {
      steps.push({
        id: "enable-phone",
        text: "Open Firebase Authentication, enable the Phone provider, save the sign-in method, and retry the OTP flow.",
      });
      return steps;
    }

    if (firebaseDebugCode === "auth/too-many-requests") {
      steps.push(
        {
          id: "wait",
          text: "Wait a few minutes before retrying because Firebase has temporarily throttled OTP requests from this browser or device.",
        },
        {
          id: "alternate",
          text: "For development, switch to Firebase test phone numbers or another browser/device/network to continue testing safely.",
        },
      );
      return steps;
    }

    if (error.toLowerCase().includes("security check")) {
      steps.push({
        id: "generic-security",
        text: "Refresh the page and retry once. If it still fails, check browser extensions and your Firebase authorized domains.",
      });
    }

    return steps;
  }, [currentHostname, error, firebaseDebugCode, isLocalDevelopmentHost]);

  const setField = (name: keyof typeof form, value: string | boolean | null) => {
    if (error) {
      setError("");
      setFirebaseDebugCode("");
      setFirebaseDebugMessage("");
    }
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSendOtp = async (options?: { resend?: boolean }) => {
    const isResend = options?.resend ?? false;
    const normalized = form.phone.replace(/\D/g, "").slice(-10);
    if (normalized.length !== 10) {
      setError("Enter a valid 10-digit mobile number.");
      setFirebaseDebugCode("");
      setFirebaseDebugMessage("");
      return;
    }

    setError("");
    setFirebaseDebugCode("");
    setFirebaseDebugMessage("");
    setIsSendingOtp(true);

    try {
      const exists = await checkPhoneExists(withCountryCode(normalized));
      if (!exists) {
        const redirectTo = `${location.pathname}${location.search}` || "/checkout";
        resetPhoneOtpChallenge(recaptchaContainerId);
        closeModal();
        navigate(`/customer-access/new?phone=${encodeURIComponent(normalized)}&redirect=${encodeURIComponent(redirectTo)}`);
        toast.success("Continue on the next step to create your account.");
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
      setResendCountdown(RESEND_SECONDS);

      toast.success(`${isResend ? "Fresh OTP" : "OTP"} sent to ${formatPhoneForDisplay(normalized)}`);
    } catch (requestError: any) {
      setError(requestError?.message || "Unable to send OTP right now.");
      setFirebaseDebugCode(requestError?.rawCode || "");
      setFirebaseDebugMessage(requestError?.rawMessage || "");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (isSendingOtp || resendCountdown > 0) return;
    resetPhoneOtpChallenge(recaptchaContainerId);
    await handleSendOtp({ resend: true });
  };

  const handleVerifyOtp = async () => {
    if (!form.verificationId || form.otpCode.trim().length < 6) {
      setError("Enter the 6-digit OTP.");
      setFirebaseDebugCode("");
      setFirebaseDebugMessage("");
      return;
    }

    setError("");
    setFirebaseDebugCode("");
    setFirebaseDebugMessage("");
    setIsVerifyingOtp(true);

    try {
      const firebaseIdToken = await confirmPhoneOtp(form.verificationId, form.otpCode.trim());
      const session = await loginWithFirebaseToken(firebaseIdToken);

      setSession(session);
      toast.success("Welcome back.");
    } catch (verifyError: any) {
      setError(verifyError?.message || "OTP verification failed.");
      setFirebaseDebugCode(verifyError?.rawCode || "");
      setFirebaseDebugMessage(verifyError?.rawMessage || "");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleClose = () => {
    if (!isSendingOtp && !isVerifyingOtp) {
      resetPhoneOtpChallenge(recaptchaContainerId);
      closeModal();
    }
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0f2216]/55 p-4 backdrop-blur-md"
          onMouseDown={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.4, type: "spring", bounce: 0.25 }}
            className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[2.5rem] border border-white/40 bg-white/80 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.2)] dark:bg-black/60 dark:border-white/10"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close sign-in modal"
              onClick={handleClose}
              className="absolute right-4 top-4 z-20 rounded-full border border-white/15 bg-[#17331e] p-2 text-white transition hover:bg-[#214a2b]"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center p-8 sm:p-12 w-full max-w-md mx-auto">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#10b981] to-[#047857] text-white shadow-lg mb-6">
                  {isOtpStep ? <ShieldCheck className="h-8 w-8" /> : <Smartphone className="h-8 w-8" />}
                </div>
                <h2 className="font-['Fraunces'] text-3xl font-bold text-[#17311d] dark:text-white">
                  {isOtpStep ? "Verify OTP" : "Welcome back"}
                </h2>
                <p className="mt-2 text-sm text-[#607361] dark:text-gray-400">
                  {isOtpStep ? "Enter the code sent to your phone" : "Enter your mobile number to sign in"}
                </p>
              </div>

              <div className="w-full">
                <div className="mt-6 space-y-5">
                  {!HAS_FIREBASE_CONFIG ? (
                    <div className="rounded-3xl border border-[#e7d1c0] bg-[#fff7f0] p-5 text-sm text-[#7c4b2c]">
                      Firebase web configuration is missing. Add the `VITE_FIREBASE_*` values to enable OTP sign-in on the website.
                    </div>
                  ) : null}

                  {isLocalDevelopmentHost ? (
                    <div className="rounded-3xl border border-[#d8e2cd] bg-[#f8fbf4] p-5 text-sm text-[#416246]">
                      Real Firebase phone OTPs should be tested from a live website domain, not localhost.
                    </div>
                  ) : null}

                  {!isOtpStep ? (
                    <div className="grid gap-4">
                      <label className="sm:col-span-2">
                        <span className="mb-2 block text-sm font-bold tracking-wide text-[#18381f] dark:text-white/90">Phone number</span>
                        <div className="group flex items-center rounded-2xl border border-[#d7e3cf] bg-white/50 px-4 py-3 shadow-[0_8px_20px_rgba(0,0,0,0.04)] backdrop-blur transition-all focus-within:border-[#10b981] focus-within:ring-4 focus-within:ring-[#10b981]/20 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:focus-within:bg-white/10">
                          <span className="pr-3 text-sm font-bold text-[#10b981]">+91</span>
                          <input
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            value={form.phone}
                            onChange={(event) => setField("phone", event.target.value.replace(/\D/g, "").slice(-10))}
                            className="w-full bg-transparent text-lg font-bold tracking-wider text-[#0d2415] outline-none placeholder:text-[#88a289] dark:text-white"
                            placeholder="98765 43210"
                          />
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-3xl border border-[#d7e3cf] bg-[#f4f7ef] p-4 text-sm text-[#315037]">
                        OTP sent to <span className="font-semibold">{formattedPhone}</span>. Enter the 6-digit code below to continue securely.
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
                          onClick={() => void handleResendOtp()}
                          disabled={isSendingOtp || resendCountdown > 0}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-[#2e6d3b] transition hover:text-[#163a1f] disabled:cursor-not-allowed disabled:text-[#8aa08b]"
                        >
                          {isSendingOtp ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                          Resend OTP
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          resetPhoneOtpChallenge(recaptchaContainerId);
                          setResendCountdown(0);
                          setForm(resetState);
                          setError("");
                          setFirebaseDebugCode("");
                          setFirebaseDebugMessage("");
                        }}
                        className="text-sm font-semibold text-[#2e6d3b] transition hover:text-[#163a1f]"
                      >
                        Use a different mobile number
                      </button>
                    </div>
                  )}

                  {error ? (
                    <div className="rounded-2xl border border-[#e8cbc7] bg-[#fff4f2] px-4 py-3 text-sm text-[#a44f45]">
                      {error}
                    </div>
                  ) : null}

                  {authSetupHint ? (
                    <div className="rounded-2xl border border-[#d7e3cf] bg-[#f8fbf4] px-4 py-3 text-sm text-[#416246]">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#1d7c3f]" />
                        <p className="leading-6">{authSetupHint}</p>
                      </div>
                    </div>
                  ) : null}

                  {authActionChecklist.length > 0 ? (
                    <div className="rounded-2xl border border-[#d8e2cd] bg-[#fcfdf9] px-4 py-4 text-sm text-[#315037]">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#1d7c3f]" />
                        <div className="min-w-0">
                          <div className="font-semibold text-[#17311d]">What to check next</div>
                          <div className="mt-2 space-y-2.5 text-[#4d6550]">
                            {authActionChecklist.map((step, index) => (
                              <p key={step.id} className="leading-6">
                                <span className="font-semibold text-[#17311d]">{index + 1}.</span> {step.text}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {import.meta.env.DEV && (firebaseDebugCode || firebaseDebugMessage) ? (
                    <div className="rounded-2xl border border-dashed border-[#d9c9aa] bg-[#fff9ee] px-4 py-3 text-sm text-[#8b5c33]">
                      <div className="font-semibold text-[#6f4924]">Firebase debug</div>
                      {firebaseDebugCode ? <p className="mt-1 leading-6">Code: {firebaseDebugCode}</p> : null}
                      {firebaseDebugMessage ? <p className="mt-1 leading-6">Raw: {firebaseDebugMessage}</p> : null}
                    </div>
                  ) : null}

                  <div
                    id={recaptchaContainerId}
                    className="pointer-events-none fixed left-[-9999px] top-auto h-px w-px overflow-hidden opacity-0"
                  />

                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="inline-flex items-center justify-center rounded-2xl border border-[#ccd8c3] px-5 py-3 text-sm font-semibold text-[#2d5233] transition hover:bg-[#f6f8ef]"
                    >
                      Maybe later
                    </button>

                    {isOtpStep ? (
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={isVerifyingOtp || form.otpCode.trim().length < 6}
                        className="inline-flex min-w-[190px] items-center justify-center rounded-[1.2rem] bg-gradient-to-r from-[#10b981] to-[#047857] px-6 py-4 text-sm font-bold tracking-wide text-white shadow-[0_12px_24px_rgba(16,185,129,0.3)] transition-all hover:scale-105 hover:shadow-[0_16px_32px_rgba(16,185,129,0.4)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                      >
                        {isVerifyingOtp ? (
                          <>
                            <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                            Verifying
                          </>
                        ) : (
                          "Verify and continue"
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={!HAS_FIREBASE_CONFIG || isSendingOtp}
                        className="inline-flex min-w-[190px] items-center justify-center rounded-[1.2rem] bg-gradient-to-r from-[#10b981] to-[#047857] px-6 py-4 text-sm font-bold tracking-wide text-white shadow-[0_12px_24px_rgba(16,185,129,0.3)] transition-all hover:scale-105 hover:shadow-[0_16px_32px_rgba(16,185,129,0.4)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                      >
                        {isSendingOtp ? (
                          <>
                            <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                            Sending OTP
                          </>
                        ) : (
                          <>
                            {phoneExists === false ? "Continue to sign up" : "Send OTP"}
                            {phoneExists === false ? <ArrowRight className="ml-2 h-5 w-5" /> : null}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
