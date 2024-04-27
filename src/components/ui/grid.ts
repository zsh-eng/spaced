// Base grid styles
// This project uses a 12-column grid system.

import { cn } from "@/utils/ui";

export const grid = "grid grid-cols-12 gap-x-6 items-start";
export const baseGrid = cn(grid);
export const gridChild = "col-start-1 col-end-13";

/**
 * A grid child that takes up the full width of the grid
 * This is used for the containers of a page.
 */
export const gridChildGrid = cn(gridChild, grid);

/**
 * A grid child that covers the main content area of the page.
 * On laptop screens, the main content takes up 8 columns.
 * On smaller screens, the main content takes up 12 columns.
 */
export const gridChildContentGrid = cn(
  gridChildGrid,
  "xl:col-start-3 xl:col-end-11 xl:grid-cols-8",
);
