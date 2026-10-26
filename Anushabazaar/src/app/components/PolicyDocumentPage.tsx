import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { FileText, LoaderCircle, ShieldCheck } from "lucide-react";
import { getPolicy } from "../services/storefrontApi";
import type { PolicyContent } from "../types/storefront";

interface PolicyDocumentPageProps {
  type: string;
  title: string;
  subtitle: string;
  accent: "green" | "blue";
}

interface PolicyBlock {
  heading: string;
  paragraphs: string[];
}

const titleCase = (value: string) =>
  value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());

const normalizeHeading = (key: string) => {
  const normalizedKey = key.replace(/\d+$/g, "").trim().toLowerCase();
  if (!normalizedKey || normalizedKey === "section") return "Policy details";
  if (normalizedKey === "payments" || normalizedKey === "payment") return "Payments";
  return titleCase(normalizedKey);
};

const parsePolicyBlocks = (content: string): { blocks: PolicyBlock[] | null; html: string | null } => {
  const trimmed = content.trim();
  if (!trimmed) {
    return { blocks: [], html: null };
  }

  if (trimmed.startsWith("<")) {
    return { blocks: null, html: trimmed };
  }

  try {
    const parsed = JSON.parse(trimmed);

    if (typeof parsed === "string") {
      return {
        blocks: [{ heading: "Overview", paragraphs: [parsed] }],
        html: null,
      };
    }

    if (Array.isArray(parsed)) {
      return {
        blocks: parsed.map((value, index) => ({
          heading: `Section ${index + 1}`,
          paragraphs: [typeof value === "string" ? value : JSON.stringify(value)],
        })),
        html: null,
      };
    }

    if (parsed && typeof parsed === "object") {
      const groups = new Map<string, PolicyBlock>();

      Object.entries(parsed).forEach(([key, value]) => {
        const text =
          typeof value === "string"
            ? value
            : Array.isArray(value)
              ? value.join(" ")
              : JSON.stringify(value);

        if (!text) return;

        const groupKey = (key.match(/^[a-zA-Z_-]+/)?.[0] || key).toLowerCase();
        const existing = groups.get(groupKey) || {
          heading: normalizeHeading(groupKey),
          paragraphs: [],
        };

        existing.paragraphs.push(text);
        groups.set(groupKey, existing);
      });

      return {
        blocks: Array.from(groups.values()),
        html: null,
      };
    }
  } catch {
    return {
      blocks: trimmed.split(/\n\s*\n/).map((paragraph, index) => ({
        heading: index === 0 ? "Overview" : `Section ${index + 1}`,
        paragraphs: [paragraph.trim()],
      })),
      html: null,
    };
  }

  return { blocks: [{ heading: "Overview", paragraphs: [trimmed] }], html: null };
};

export function PolicyDocumentPage({ type, title, subtitle, accent }: PolicyDocumentPageProps) {
  const [policy, setPolicy] = useState<PolicyContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    setError("");

    getPolicy(type)
      .then((nextPolicy) => {
        if (!isMounted) return;
        setPolicy(nextPolicy);
      })
      .catch((fetchError: any) => {
        if (!isMounted) return;
        setError(fetchError?.message || "Unable to load this document right now.");
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [type]);

  const isGreen = accent === "green";
  const Icon = isGreen ? ShieldCheck : FileText;
  const renderedContent = useMemo(() => parsePolicyBlocks(policy?.content || ""), [policy?.content]);
  const updatedDate = policy?.updatedAt ? new Date(policy.updatedAt).toLocaleDateString("en-IN") : "";

  return (
    <div className="app-shell-narrow">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className={`overflow-hidden rounded-[3rem] border shadow-[0_30px_70px_rgba(21,43,28,0.08)] backdrop-blur-xl ${
          isGreen ? "border-[#10b981]/30 bg-white/60 dark:bg-black/30 dark:border-white/10" : "border-blue-500/30 bg-white/60 dark:bg-black/30 dark:border-white/10"
        }`}
      >
        <div
          className={`border-b px-8 py-10 sm:px-12 ${
            isGreen
              ? "border-[#10b981]/30 bg-gradient-to-br from-[#10b981] to-[#047857] text-white"
              : "border-blue-500/30 bg-gradient-to-br from-blue-500 to-blue-700 text-white"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-white/20 backdrop-blur-md shadow-[0_8px_16px_rgba(0,0,0,0.1)]">
              <Icon className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/80">{subtitle}</p>
              <h1 className="mt-3 font-['Fraunces'] text-[clamp(2.5rem,5vw,3.5rem)] font-black leading-none tracking-tight text-white">{title}</h1>
              {updatedDate ? <p className="mt-4 text-sm font-semibold text-white/90">Last updated on {updatedDate}</p> : null}
            </div>
          </div>
        </div>

        <div className="px-8 py-10 sm:px-12">
          {isLoading ? (
            <div className="flex min-h-[240px] items-center justify-center gap-3 text-[1.1rem] font-bold text-[#10b981]">
              <LoaderCircle className="h-6 w-6 animate-spin" />
              Loading document...
            </div>
          ) : error ? (
            <div className="rounded-[2rem] border border-rose-500/20 bg-gradient-to-br from-rose-500/10 to-transparent p-6 text-[1.1rem] font-bold text-rose-500">
              {error}
            </div>
          ) : renderedContent.html ? (
            <article
              className="policy-document max-w-none prose prose-lg dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: renderedContent.html }}
            />
          ) : renderedContent.blocks && renderedContent.blocks.length > 0 ? (
            <div className="space-y-6">
              {renderedContent.blocks.map((block) => (
                <section
                  key={`${block.heading}-${block.paragraphs[0]}`}
                  className="rounded-[2rem] border border-white/40 bg-white/50 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] backdrop-blur-md dark:bg-black/20 dark:border-white/10"
                >
                  <h2 className="font-['Fraunces'] text-[2rem] font-bold tracking-tight text-[#061109] dark:text-white">{block.heading}</h2>
                  <div className="mt-4 space-y-4">
                    {block.paragraphs.map((paragraph) => (
                      <p key={paragraph} className="text-[1.1rem] leading-relaxed text-[#4d5e50] dark:text-white/70">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-white/40 bg-white/50 p-6 text-[1.1rem] font-bold text-[#4d5e50] backdrop-blur-md dark:bg-black/20 dark:border-white/10 dark:text-white/70">
              No document content available.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
