// src/services/contactService.js
import { api } from "../lib/api";
export async function sendContact(payload) {
  const { data } = await api.post("/contact", payload /* , { withCredentials: true } */);
  return data;
}
