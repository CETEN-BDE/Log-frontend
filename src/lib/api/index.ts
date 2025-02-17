import createClient from "openapi-fetch";
import type { paths } from "./log.openapi";
import configuration from "$lib/config/config";

const client = createClient<paths>({ baseUrl: configuration.base_url });
export default client;