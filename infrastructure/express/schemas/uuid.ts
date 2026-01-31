import { z } from "zod";

const LOOSE_UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function uuid(message = "Invalid UUID format") {
  return z.string().regex(LOOSE_UUID_REGEX, message);
}

