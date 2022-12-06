import axios from "axios";
import { ConfigEnvs } from "./constants";

const networkFetch = axios.create({
  baseURL: ConfigEnvs.BACKEND_URL,
});

export default networkFetch;
