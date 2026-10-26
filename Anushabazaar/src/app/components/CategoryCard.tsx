import { motion } from "motion/react";
import { Link } from "react-router";
import { getCategoryHref } from "../lib/storefrontUtils";
import type { Category } from "../types/storefront";

interface CategoryCardProps {
  category: Category;
  compact?: boolean;
}

export function CategoryCard({ category, compact = false }: CategoryCardProps) {
  return (
    <Link to={getCategoryHref(category)} className="block">
      <motion.article
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
        className="group flex flex-col items-center gap-2 sm:overflow-hidden sm:rounded-[1.8rem] sm:border sm:border-white/60 sm:bg-white/70 sm:shadow-[0_15px_40px_rgba(0,0,0,0.06)] sm:backdrop-blur-xl sm:transition-all sm:hover:border-[#10b981]/50 sm:hover:shadow-[0_20px_50px_rgba(16,185,129,0.15)] sm:dark:border-white/10 sm:dark:bg-white/5"
      >
        <div className={`relative grid place-items-center overflow-hidden rounded-full bg-[#f8fbf4] sm:rounded-none sm:bg-gradient-to-br sm:from-white/40 sm:to-black/5 sm:dark:from-white/10 sm:dark:to-transparent ${compact ? "aspect-square w-16 sm:w-full sm:aspect-[16/9]" : "aspect-square w-20 sm:w-full sm:aspect-[4/3]"}`}>
          <img
            src={category.imageUrl}
            alt={category.name}
            className="h-full w-full object-contain p-2 transition-transform duration-500 ease-out group-hover:scale-110 sm:p-4"
          />
        </div>

        <div className="w-full text-center sm:border-t sm:border-white/40 sm:bg-white/40 sm:px-5 sm:py-4 sm:text-left sm:backdrop-blur-md sm:dark:border-white/10 sm:dark:bg-black/20">
          <h3 className={`font-semibold tracking-tight text-[#17311d] transition-colors group-hover:text-[#10b981] sm:font-['Fraunces'] sm:font-bold dark:text-white ${compact ? "text-[11px] sm:text-[clamp(1.15rem,2vw,1.45rem)]" : "text-xs sm:text-[clamp(1.35rem,4vw,1.8rem)]"}`}>
            {category.name}
          </h3>
        </div>
      </motion.article>
    </Link>
  );
}
