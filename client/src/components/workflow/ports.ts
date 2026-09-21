import type { NodeType, PortDataType } from "./types";

export interface PortDef {
  id: string;
  label: string;
  yOffset: number; // px from top of node card
  dataType: PortDataType;
  color: string;
}

export interface NodePorts {
  inputs: PortDef[];
  outputs: PortDef[];
}

// ── Reusable port templates ───────────────────────────────────────────────────
const mediaIn   = (y = 32): PortDef => ({ id: "MEDIA_IN",      label: "Media In",      yOffset: y, dataType: "image",         color: "#06b6d4" });
const imageOut  = (y = 32): PortDef => ({ id: "IMAGE_OUT",     label: "Image Out",     yOffset: y, dataType: "image",         color: "#06b6d4" });
const promptIn  = (y = 32): PortDef => ({ id: "PROMPT_IN",     label: "Prompt In",     yOffset: y, dataType: "text",          color: "#eab308" });
const textOut   = (y = 32): PortDef => ({ id: "TEXT_OUT",      label: "Text Out",      yOffset: y, dataType: "text",          color: "#a855f7" });
const respOut   = (y = 32): PortDef => ({ id: "RESPONSE_OUT",  label: "Response Out",  yOffset: y, dataType: "http-response",  color: "#f97316" });
const payloadIn = (y = 32): PortDef => ({ id: "PAYLOAD_IN",    label: "Payload In",    yOffset: y, dataType: "any",            color: "#a855f7" });
const payloadOut= (y = 32): PortDef => ({ id: "PAYLOAD_OUT",   label: "Payload Out",   yOffset: y, dataType: "any",            color: "#a855f7" });
const published = (y = 32): PortDef => ({ id: "PUBLISHED",     label: "Published",     yOffset: y, dataType: "any",            color: "#10b981" });
const outputTrue= (y = 20): PortDef => ({ id: "TRUE_OUT",      label: "True",          yOffset: y, dataType: "any",            color: "#10b981" });
const outputFalse=(y = 44): PortDef => ({ id: "FALSE_OUT",     label: "False",         yOffset: y, dataType: "any",            color: "#ef4444" });
const loopItemOut=(y = 20): PortDef => ({ id: "LOOP_ITEM",     label: "Loop Item",     yOffset: y, dataType: "any",            color: "#3b82f6" });
const doneOut   = (y = 44): PortDef => ({ id: "DONE_OUT",      label: "Done",          yOffset: y, dataType: "any",            color: "#10b981" });

// ── Node → Port mapping ───────────────────────────────────────────────────────
export const NODE_PORTS: Record<NodeType, NodePorts> = {
  "image-asset":        { inputs: [],              outputs: [imageOut(32)]  },
  "ai-image-generator": { inputs: [promptIn(32)],  outputs: [imageOut(32)]  },
  "ai-text-generator":  { inputs: [promptIn(32)],  outputs: [textOut(32)]   },
  "http-request":       { inputs: [],              outputs: [respOut(32)]   },
  "webhook":            { inputs: [payloadIn(32)], outputs: [payloadOut(32)]},
  "if-condition":       { inputs: [payloadIn(32)], outputs: [outputTrue(20), outputFalse(44)] },
  "for-loop":           { inputs: [payloadIn(32)], outputs: [loopItemOut(20), doneOut(44)] },
  "code-javascript":    { inputs: [payloadIn(32)], outputs: [payloadOut(32)]},
  "set-fields":         { inputs: [payloadIn(32)], outputs: [payloadOut(32)]},
  "delay-wait":         { inputs: [payloadIn(32)], outputs: [payloadOut(32)]},
  "debug-print":        { inputs: [payloadIn(32)], outputs: [payloadOut(32)]},
  "socials-aggregator": { inputs: [mediaIn(32)],   outputs: [published(32)] },
  "social-instagram":   { inputs: [mediaIn(32)],   outputs: [published(32)] },
  "social-x":           { inputs: [mediaIn(32)],   outputs: [published(32)] },
  "social-facebook":    { inputs: [mediaIn(32)],   outputs: [published(32)] },
  "social-linkedin":    { inputs: [mediaIn(32)],   outputs: [published(32)] },
  "social-youtube":     { inputs: [mediaIn(32)],   outputs: [published(32)] },
  "social-tiktok":      { inputs: [mediaIn(32)],   outputs: [published(32)] },
};

/** Valid dataType connections: source dataType → accepted target dataTypes */
export const COMPATIBLE_TYPES: Record<PortDataType, PortDataType[]> = {
  image:            ["image", "any"],
  "http-response":  ["any", "json", "text"],
  "webhook-payload":["any", "json", "text"],
  json:             ["json", "any", "text"],
  text:             ["text", "any", "image"],
  any:              ["image", "http-response", "webhook-payload", "json", "text", "any"],
};

export function arePortsCompatible(srcType: PortDataType, tgtType: PortDataType): boolean {
  return COMPATIBLE_TYPES[srcType]?.includes(tgtType) ?? false;
}
