import type { AxiosError, AxiosInstance, CreateAxiosDefaults } from "axios";
import axios from "axios";

export abstract class BaseRequestInstance {
  protected axiosInstance: AxiosInstance;
  protected instanceName: string;

  constructor(axiosInstanceOptions: CreateAxiosDefaults, instanceName: string) {
    this.instanceName = instanceName;
    this.axiosInstance = axios.create(axiosInstanceOptions);
    this.setInterceptors();
  }

  private setInterceptors() {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log(
          `[${this.instanceName}] Request: ${config.method?.toUpperCase()} ${config.url}`,
          config.data,
        );
        return config;
      },
      (error) => {
        console.error(`[${this.instanceName}] Request error:`, error);
        return Promise.reject(error);
      },
    );

    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log(`[${this.instanceName}] Response: ${response.status}`, response.data);
        return response;
      },
      (error: AxiosError) => {
        console.error(
          `[${this.instanceName}] Response error: ${error.response?.status}`,
          error.response?.data,
        );
        return Promise.reject(error);
      },
    );
  }
}
