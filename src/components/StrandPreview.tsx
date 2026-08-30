import type { PlacedBead, ProductKind } from '../lib/types';
import { StrandCanvas } from './StrandCanvas';

export function StrandPreview({
  beads,
  cordColor,
  kind,
  onRemoveAt,
  emptyLabel = 'גררו חרוז מהמגש אל החוט — או הקישו להשחיל',
  closed = false,
}: {
  beads: PlacedBead[];
  cordColor: string;
  kind: ProductKind;
  onRemoveAt?: (index: number) => void;
  emptyLabel?: string;
  closed?: boolean;
}) {
  return (
    <StrandCanvas
      beads={beads}
      cordColor={cordColor}
      kind={kind}
      onRemoveAt={closed ? undefined : onRemoveAt}
      emptyLabel={emptyLabel}
      closed={closed}
    />
  );
}

export function StrandReadonly({
  beadIds,
  cordColor,
  kind,
  closed = false,
  hero = false,
}: {
  beadIds: string[];
  cordColor: string;
  kind: ProductKind;
  closed?: boolean;
  /** תצוגת גלריה גדולה — לא compact */
  hero?: boolean;
}) {
  const beads: PlacedBead[] = beadIds.map((beadId, i) => ({
    instanceId: `ro-${i}-${beadId}`,
    beadId,
  }));
  return (
    <StrandCanvas
      beads={beads}
      cordColor={cordColor}
      kind={kind}
      emptyLabel="—"
      compact={!hero}
      closed={closed}
    />
  );
}
