import axios from 'axios'
import { getAccessToken, setAccessToken, clearAccessToken } from '@/utils/token'; 
import camelcaseKeys from 'camelcase-keys'
import snakecaseKeys from 'snakecase-keys'
import { errors } from '@/constants/errors'
import { refreshToken } from "@/services/api/authApi";
import { getAuthStore } from '@/stores/authStore';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
})

axiosInstance.interceptors.request.use(function(config){
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Transform outgoing data to snake_case
    if (config.data) {
        config.data = snakecaseKeys(config.data, { deep: true })
    }
    return config;
}, function(error){
    return Promise.reject(error);
})

axiosInstance.interceptors.response.use(function (response) {
    
    if (response.data && typeof response.data === 'object') {
        response.data = camelcaseKeys(response.data, { deep: true })
      }
    return response;
}, function (error) {
    if (error.response?.data && typeof error.response.data === 'object') {
        error.response.data = camelcaseKeys(error.response.data, { deep: true })
      }
    return Promise.reject(error);
});

type FailedRequest = {
    resolve: (token: string | null) => void;
    reject: (err: any) => void;
};

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(p => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  response => response, // pass through
  async error => {
    const originalRequest = error.config;
    const message = error?.response?.data?.message;

    const shouldRefresh =
    message === errors.TOKEN_EXPIRED ||
    message === errors.INVALID_TOKEN ||
    message === errors.MISSING_TOKEN;

    if (shouldRefresh && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: token => {
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
              resolve(axiosInstance(originalRequest));
            },
            reject: err => reject(err),
          });
        });
      }

      isRefreshing = true;

      try {
        const res = await refreshToken();
        if (res.status !== "success") {
            throw new Error("Refresh failed.");
        }

        if (!res.data?.accessToken) {
            throw new Error("No access token returned from refresh.");
          }
          const accessToken = res.data.accessToken; 

        setAccessToken(accessToken);

        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        processQueue(null, accessToken);

        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        console.error(err)
        processQueue(err, null);
        clearAccessToken();
        getAuthStore().unauthenticate();
        window.location.href = "/auth/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;