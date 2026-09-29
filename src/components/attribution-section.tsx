import { DetailRow, DetailSection } from "@/components/detail-rows";
import type { AttributionFields } from "@/types";

export function AttributionSection({ data }: { data: AttributionFields }) {
  const hasAny = [
    data.leadSource,
    data.utmSource,
    data.utmMedium,
    data.utmCampaign,
    data.utmTerm,
    data.utmContent,
    data.referrer,
    data.landingPage,
  ].some(Boolean);

  if (!hasAny) return null;

  return (
    <DetailSection title="Lead source">
      <DetailRow label="Source" value={data.leadSource} />
      <DetailRow label="UTM source" value={data.utmSource} />
      <DetailRow label="UTM medium" value={data.utmMedium} />
      <DetailRow label="UTM campaign" value={data.utmCampaign} />
      <DetailRow label="UTM term" value={data.utmTerm} />
      <DetailRow label="UTM content" value={data.utmContent} />
      <DetailRow label="Referrer" value={data.referrer} />
      <DetailRow label="Landing page" value={data.landingPage} />
    </DetailSection>
  );
}
