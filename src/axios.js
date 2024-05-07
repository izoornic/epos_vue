import axios from "axios";
import { apiUrl } from "@/state/helpers";
// import store from "@/state/store.js";
axios.defaults.baseURL = `${apiUrl}`;
axios.defaults.headers.common = {
  Authorization: ``,
};
export default axios;
