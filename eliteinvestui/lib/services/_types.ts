export type CountryCode = "in" | "us" | "uk";

export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};
