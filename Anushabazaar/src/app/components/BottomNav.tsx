import { useLocation, Link } from "react-router";
import { Home, LayoutGrid, ShoppingBag, FileText, UserRound } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { motion } from "motion/react";

export function BottomNav() {
  const routerLocation = useLocation();
  const productCount = useCartStore((state) => state.getProductCount());

  const isActive = (path: string, searchParams?: string) => {
    if (searchParams) {
      return routerLocation.pathname === path && routerLocation.search.includes(searchParams);
    }
    return routerLocation.pathname === path;
  };

  const navItems = [
    {
      label: "Home",
      to: "/",
      icon: (active: boolean) => <Home className={`h-6 w-6 transition-transform duration-300 ${active ? "scale-110 drop-shadow-sm" : "scale-100"}`} />,
      active: isActive("/"),
    },
    {
      label: "Categories",
      to: "/shop",
      icon: (active: boolean) => <LayoutGrid className={`h-6 w-6 transition-transform duration-300 ${active ? "scale-110 drop-shadow-sm" : "scale-100"}`} />,
      active: isActive("/shop") && !routerLocation.search.includes("trending"),
    },
    {
      label: "Cart",
      to: "/cart",
      icon: (active: boolean) => (
        <div className="relative">
          <ShoppingBag className={`h-6 w-6 transition-transform duration-300 ${active ? "scale-110 drop-shadow-sm" : "scale-100"}`} />
          {productCount > 0 ? (
            <span className="absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#10b981] px-1 text-[10px] font-bold text-white shadow-sm border-[1.5px] border-white/90 dark:border-gray-800">
              {productCount}
            </span>
          ) : null}
        </div>
      ),
      active: isActive("/cart"),
    },
    {
      label: "Orders",
      to: "/account?tab=orders",
      icon: (active: boolean) => <FileText className={`h-6 w-6 transition-transform duration-300 ${active ? "scale-110 drop-shadow-sm" : "scale-100"}`} />,
      active: isActive("/account", "tab=orders"),
    },
    {
      label: "Account",
      to: "/account",
      icon: (active: boolean) => <UserRound className={`h-6 w-6 transition-transform duration-300 ${active ? "scale-110 drop-shadow-sm" : "scale-100"}`} />,
      active: isActive("/account") && !routerLocation.search.includes("tab=orders"),
    },
  ];

  return (
    <nav className="fixed inset-x-4 bottom-4 z-50 lg:hidden">
      <div className="flex items-center justify-around rounded-[1.75rem] border border-white/60 bg-white/90 px-2 py-3 backdrop-blur-2xl shadow-[0_16px_40px_rgba(23,49,29,0.12)] dark:bg-[#0c1810]/90 dark:border-[#223d29] dark:shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className={`group relative flex w-[4.5rem] flex-col items-center justify-center gap-1.5 transition-all duration-300 ${
              item.active ? "text-[#176a34] dark:text-[#34d399]" : "text-[#708271] hover:text-[#2d5233] dark:text-[#88a289] dark:hover:text-[#b4d6b6]"
            }`}
          >
            {item.icon(item.active)}
            <span className={`text-[10px] transition-all duration-300 ${item.active ? "font-bold opacity-100 tracking-wide" : "font-medium opacity-80"}`}>
              {item.label}
            </span>
            {item.active && (
              <motion.div
                layoutId="bottomNavIndicator"
                className="absolute -bottom-1.5 h-1 w-1 rounded-full bg-[#176a34] dark:bg-[#34d399]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: "spring", stiffness: 450, damping: 25 }}
              />
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}
