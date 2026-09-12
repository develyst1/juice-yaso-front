import { createTheme } from "@mantine/core";
import { brand } from "./colors";

export const theme = createTheme({
  primaryColor: "brand",
  colors: { brand },
  defaultRadius: "lg",
  fontFamily: "var(--font-thai), sans-serif",
  headings: { fontFamily: "var(--font-thai), sans-serif", fontWeight: "700" },
  shadows: { sm: "0 8px 24px rgba(234, 88, 12, 0.08)" },
});
