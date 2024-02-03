import { customAlphabet } from "nanoid";
const nanoid = customAlphabet("123456789ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz");
const RESOURCES = {
  session: "sess",
  user: "user",
};

type Resource = keyof typeof RESOURCES;
export function generateId(resource: Resource) {
  return `${RESOURCES[resource]}_${nanoid(16)}`;
}
