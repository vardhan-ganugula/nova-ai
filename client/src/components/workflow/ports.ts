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
const mediaIn   = (y = 180): PortDef => ({ id: "MEDIA_IN",      label: "Media In",      yOffset: y, dataType: "image",         color: "#06b6d4" });
const imageOut  = (y = 180): PortDef => ({ id: "IMAGE_OUT",     label: "Image Out",     yOffset: y, dataType: "image",         color: "#06b6d4" });
const respOut   = (y = 180): PortDef => ({ id: "RESPONSE_OUT",  label: "Response Out",  yOffset: y, dataType: "http-response",  color: "#f97316" });
const payloadIn = (y = 180): PortDef => ({ id: "PAYLOAD_IN",    label: "Payload In",    yOffset: y, dataType: "any",            color: "#a855f7" });
const payloadOut= (y = 180): PortDef => ({ id: "PAYLOAD_OUT",   label: "Payload Out",   yOffset: y, dataType: "any",            color: "#a855f7" });
const published = (y = 220): PortDef => ({ id: "PUBLISHED",     label: "Published",     yOffset: y, dataType: "any",            color: "#10b981" });

// ── Node → Port mapping ───────────────────────────────────────────────────────
export const NODE_PORTS: Record<NodeType, NodePorts> = {
  "image-asset":        { inputs: [],              outputs: [imageOut(180)]  },
  "http-request":       { inputs: [],              outputs: [respOut(180)]   },
  "webhook":            { inputs: [payloadIn(180)],outputs: [payloadOut(180)]},
  "socials-aggregator": { inputs: [mediaIn(200)],  outputs: [published(220)] },
  "social-instagram":   { inputs: [mediaIn(200)],  outputs: [published(220)] },
  "social-x":           { inputs: [mediaIn(200)],  outputs: [published(220)] },
  "social-facebook":    { inputs: [mediaIn(200)],  outputs: [published(220)] },
  "social-linkedin":    { inputs: [mediaIn(200)],  outputs: [published(220)] },
  "social-youtube":     { inputs: [mediaIn(200)],  outputs: [published(220)] },
  "social-tiktok":      { inputs: [mediaIn(200)],  outputs: [published(220)] },
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
