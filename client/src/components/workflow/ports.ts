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
const respOut   = (y = 32): PortDef => ({ id: "RESPONSE_OUT",  label: "Response Out",  yOffset: y, dataType: "http-response",  color: "#f97316" });
const payloadIn = (y = 32): PortDef => ({ id: "PAYLOAD_IN",    label: "Payload In",    yOffset: y, dataType: "any",            color: "#a855f7" });
const payloadOut= (y = 32): PortDef => ({ id: "PAYLOAD_OUT",   label: "Payload Out",   yOffset: y, dataType: "any",            color: "#a855f7" });
const published = (y = 32): PortDef => ({ id: "PUBLISHED",     label: "Published",     yOffset: y, dataType: "any",            color: "#10b981" });

// ── Node → Port mapping ───────────────────────────────────────────────────────
export const NODE_PORTS: Record<NodeType, NodePorts> = {
  "image-asset":        { inputs: [],              outputs: [imageOut(32)]  },
  "http-request":       { inputs: [],              outputs: [respOut(32)]   },
  "webhook":            { inputs: [payloadIn(32)], outputs: [payloadOut(32)]},
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
  "http-response":  ["any", "json"],
  "webhook-payload":["any", "json"],
  json:             ["json", "any"],
  text:             ["text", "any"],
  any:              ["image", "http-response", "webhook-payload", "json", "text", "any"],
};

export function arePortsCompatible(srcType: PortDataType, tgtType: PortDataType): boolean {
  return COMPATIBLE_TYPES[srcType]?.includes(tgtType) ?? false;
}
