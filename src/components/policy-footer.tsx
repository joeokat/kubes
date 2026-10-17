import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

const POLICY_LINKS: { label: string; slug: string }[] = [
  { label: "Terms", slug: "terms" },
  { label: "Privacy", slug: "privacy" },
  { label: "Risk Disclaimer", slug: "risk-disclaimer" },
  { label: "Refund Policy", slug: "refund-policy" },
  { label: "Guidelines", slug: "community-guidelines" },
];

interface PolicyFooterProps {
  /**
   * Whether to show the compliance disclaimer text above the links.
   * Set to false on screens that already render their own disclaimer.
   */
  showDisclaimer?: boolean;
}

/**
 * Shared policy footer – renders on every screen per SOP §7.
 * Policy pages are publicly accessible at /policies/[slug]
 * (outside the (app) auth-guard group).
 */
export function PolicyFooter({ showDisclaimer = true }: PolicyFooterProps) {
  const router = useRouter();

  return (
    <View className="pt-4 pb-6 px-6 items-center">
      {showDisclaimer && (
        <Text className="text-xs text-slate-500 text-center leading-relaxed mb-3">
          This platform is for education only. Nothing here is financial,
          investment, or trading advice, and no outcome is promised. Kubes is
          not a registered investment advisor or broker-dealer.
        </Text>
      )}

      {/* Policy links row — wraps gracefully on narrow screens */}
      <View className="flex-row flex-wrap justify-center gap-x-3 gap-y-1">
        {POLICY_LINKS.map((link, index) => (
          <TouchableOpacity
            key={link.slug}
            onPress={() => router.push(`/policies/${link.slug}` as any)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Text className="text-[11px] text-slate-400 underline">
              {link.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

