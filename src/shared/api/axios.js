import axios from "axios";
import { ENV } from "@/shared/config";

export const api = axios.create({
  baseURL: ENV.API_BASE_URL_WITH_PREFIX,
  withCredentials: false,
});
