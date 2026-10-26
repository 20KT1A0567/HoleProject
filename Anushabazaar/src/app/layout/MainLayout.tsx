import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { AuthModal } from "../components/AuthModal";
import { CartDrawer } from "../components/CartDrawer";
import { CartFlyToIcon } from "../components/CartFlyToIcon";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";

import { BottomNav } from "../components/BottomNav";
import { getCustomerProfile } from "../services/storefrontApi";
import { useAuthStore } from "../store/authStore";
import { useLocationStore } from "../store/locationStore";

export function MainLayout() {
  const routeLocation = useLocation();
  const session = useAuthStore((state) => state.session);
  const profile = useAuthStore((state) => state.profile);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const hydrateFromStorage = useAuthStore((state) => state.hydrateFromStorage);
  const hydrateLocation = useLocationStore((state) => state.hydrateFromStorage);
  const requestCurrentLocation = useLocationStore((state) => state.requestCurrentLocation);
  const location = useLocationStore((state) => state.location);
  const isLocationHydrated = useLocationStore((state) => state.isHydrated);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    hydrateLocation();
  }, [hydrateLocation]);

  useEffect(() => {
    if (!isLocationHydrated) return;
    if (location.source === "device") return;
    if (location.permission === "denied" || location.permission === "unsupported") return;
    void requestCurrentLocation();
  }, [isLocationHydrated, location.permission, location.source, requestCurrentLocation]);

  useEffect(() => {
    if (!session?.accessToken || profile?.id === session.customerId) return;

    let isMounted = true;

    getCustomerProfile()
      .then((nextProfile) => {
        if (isMounted) {
          updateProfile(nextProfile);
        }
      })
      .catch(() => {
        // Silent failure keeps public browsing available.
      });

    return () => {
      isMounted = false;
    };
  }, [profile?.id, session?.accessToken, session?.customerId, updateProfile]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [routeLocation.pathname, routeLocation.search]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#eef8d4_0,#f8f6ee_28%,#f6f2e8_100%)] text-[#132417]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(140,211,70,0.12),transparent_28%),radial-gradient(circle_at_80%_12%,rgba(244,178,86,0.12),transparent_20%)]" />
      <Navbar />
      <CartFlyToIcon />
      <CartDrawer />
      <main className="relative z-10 flex-1">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />

      <AuthModal />
    </div>
  );
}
