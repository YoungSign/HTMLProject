import axios, { AxiosInstance } from "axios";

export class HttpConnection {
  instance: any

  constructor(ins: any) {
    this.instance = ins;
  }
}

export class Http {
  public static getConnection(options: {
    baseURL: string,
    timeout: number,
    withCredentials: boolean
  }): HttpConnection {
    const instance = axios.create({
      baseURL: options.baseURL || "",
      timeout: options.timeout || 30000,
      withCredentials: false // 跨域cookie
    });

    return new HttpConnection(instance);
  }
}