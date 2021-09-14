import axios from "axios";

axios.defaults.headers.post["Content-Type"] =
  "application/x-www-form-urlencoded;charset=UTF-8";

let instance;

const createConnect = (domain) => {
  instance = axios.create({
    baseURL: "http://" + domain,
    timeout: 1000,
  });

  instance.interceptors.response.use(
    (res) =>
      res.status === 200 ? Promise.resolve(res.data) : Promise.reject(res),
    (error) => {
      return Promise.reject(error);
    }
  );
};

const getVideoUrl = () => {
  return instance.get("/video/url", {});
};

const putVideoUrl = (url) => {
  return instance.put("/video/url", { url });
};

export { createConnect, getVideoUrl, putVideoUrl };
