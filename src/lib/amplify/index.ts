import { Amplify } from "aws-amplify";
import { generateClient } from "@aws-amplify/api";
import { config } from "./config";

Amplify.configure(config);
export const client = generateClient();

export { config } from "./config";
