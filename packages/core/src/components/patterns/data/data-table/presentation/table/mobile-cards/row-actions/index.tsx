"use client";

import React, { useId, useRef, useState } from "react";
import type { DataTableRowActions } from "@/foundation/contracts/kernel/adaptation";
import { Box } from "@/components/primitives/layout/box";
import { Button } from "@/components/primitives/inputs/button";
import { Flex } from "@/components/primitives/layout/flex";
import { Popover } from "@/components/primitives/overlay/popover";
import { MoreHorizontalIcon } from "../../../../../../../../graphics/icons";

const SWIPE_DISTANCE_PX = 48;

export function RowActionsMenu({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <Popover
      trigger="click"
      placement="bottomRight"
      aria-label={label}
      content={
        <Flex direction="column" gap={4} data-part="row-actions-menu">
          {children}
        </Flex>
      }
    >
      <Button
        variant="ghost"
        size="sm"
        shape="circle"
        aria-label={label}
        icon={<MoreHorizontalIcon size={16} aria-hidden />}
        data-part="row-actions-trigger"
      />
    </Popover>
  );
}

/**
 * A record whose actions a touch swipe reveals. The disclosure button is the
 * same control for pointers and keyboards that cannot swipe.
 */
export function SwipeActionsRecord({
  label,
  actions,
  children,
}: {
  label: string;
  actions: React.ReactNode;
  children: React.ReactNode;
}): React.ReactElement {
  const [revealed, setRevealed] = useState(false);
  const regionId = useId();
  const startX = useRef<number | null>(null);
  const swiped = useRef(false);

  return (
    <Box
      data-part="swipe-record"
      data-revealed={revealed ? "true" : "false"}
      onPointerDown={(event: React.PointerEvent<HTMLElement>) => {
        if (event.pointerType === "mouse") return;
        startX.current = event.clientX;
        swiped.current = false;
      }}
      onPointerUp={(event: React.PointerEvent<HTMLElement>) => {
        if (startX.current === null) return;
        const distance = event.clientX - startX.current;
        startX.current = null;
        if (Math.abs(distance) < SWIPE_DISTANCE_PX) return;
        swiped.current = true;
        // Only the click that ends this gesture is swallowed.
        setTimeout(() => {
          swiped.current = false;
        }, 0);
        setRevealed(distance < 0);
      }}
      onClickCapture={(event: React.MouseEvent<HTMLElement>) => {
        if (!swiped.current) return;
        swiped.current = false;
        event.stopPropagation();
      }}
    >
      {children}
      <Flex data-part="swipe-actions-bar" justify="end" align="center" gap={8}>
        <Box id={regionId} data-part="swipe-actions" hidden={!revealed}>
          <Flex gap={8} wrap="wrap">
            {actions}
          </Flex>
        </Box>
        <Button
          variant="ghost"
          size="sm"
          shape="circle"
          aria-label={label}
          aria-expanded={revealed}
          aria-controls={regionId}
          icon={<MoreHorizontalIcon size={16} aria-hidden />}
          onClick={() => setRevealed((current) => !current)}
          data-part="swipe-actions-toggle"
        />
      </Flex>
    </Box>
  );
}

/** Row actions placed by the resolved `rowActions` of the adaptation. */
export function placeRowActions(
  mode: DataTableRowActions,
  actions: React.ReactNode,
  label: string,
): React.ReactNode {
  if (actions === null || actions === undefined || actions === false) return actions;
  return mode === "inline" ? actions : <RowActionsMenu label={label}>{actions}</RowActionsMenu>;
}
