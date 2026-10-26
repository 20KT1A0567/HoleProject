import { createBrowserRouter } from "react-router";
import { MainLayout } from "./layout/MainLayout";
import { Account } from "./pages/Account";
import { About } from "./pages/About";
import { Cart } from "./pages/Cart";
import { Category } from "./pages/Category";
import { Checkout } from "./pages/Checkout";
import { Contact } from "./pages/Contact";
import { CustomerSignup } from "./pages/CustomerSignup";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { RefundPolicy } from "./pages/RefundPolicy";
import { Product } from "./pages/Product";
import { Shop } from "./pages/Shop";
import { TermsOfService } from "./pages/TermsOfService";
import { ReferralRedirect } from "./pages/ReferralRedirect";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: Home },
      { path: "shop", Component: Shop },
      { path: "category/:slug", Component: Category },
      { path: "product/:slug", Component: Product },
      { path: "cart", Component: Cart },
      { path: "checkout", Component: Checkout },
      { path: "customer-access/new", Component: CustomerSignup },
      { path: "account", Component: Account },
      { path: "about", Component: About },
      { path: "contact", Component: Contact },
      { path: "privacy-policy", Component: PrivacyPolicy },
      { path: "refund-policy", Component: RefundPolicy },
      { path: "terms-of-service", Component: TermsOfService },
      { path: "refer/:code", Component: ReferralRedirect },
      { path: "*", Component: NotFound },
    ],
  },
]);
