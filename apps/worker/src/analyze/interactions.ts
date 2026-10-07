import type { InteractionInfo } from "@nn/shared";
import type { RawPageData } from "../extract/types";

export function analyzeInteractions(raw: RawPageData): InteractionInfo[] {
  const out: InteractionInfo[] = [];

  const buttons = raw.elements.filter((e) => e.tag === "button" || e.role === "button");
  if (buttons.length > 0) {
    out.push({
      type: "Button",
      selector: "button, [role=button]",
      states: ["default", "hover", "active", "focus", "disabled"],
    });
  }

  const links = raw.elements.filter((e) => e.tag === "a");
  if (links.length > 0) {
    out.push({
      type: "Link",
      selector: "a[href]",
      states: ["default", "hover", "focus", "visited"],
    });
  }

  if (raw.forms > 0) {
    out.push({ type: "Form", selector: "form", states: ["default", "focus", "invalid", "submitting"] });
    out.push({
      type: "Input",
      selector: "input, textarea, select",
      states: ["default", "focus", "disabled", "error"],
    });
  }

  const nav = raw.landmarks.find((l) => l.tag === "nav" || l.tag === "header");
  if (nav) {
    out.push({
      type: "Navigation menu",
      selector: "nav",
      states: ["default", "open", "collapsed"],
    });
  }

  if (raw.elements.some((e) => e.tag === "details")) {
    out.push({ type: "Accordion", selector: "details/summary", states: ["closed", "open"] });
  }

  if (raw.elements.some((e) => e.role === "tab")) {
    out.push({ type: "Tabs", selector: "[role=tab]", states: ["default", "selected", "focus"] });
  }

  if (raw.elements.some((e) => e.role === "dialog" || e.tag === "dialog")) {
    out.push({ type: "Modal", selector: "[role=dialog], dialog", states: ["closed", "open"] });
  }

  if (raw.elements.some((e) => e.tag === "input" && e.role === "search")) {
    out.push({ type: "Search", selector: "input[type=search]", states: ["default", "focus", "typing"] });
  }

  return out;
}
