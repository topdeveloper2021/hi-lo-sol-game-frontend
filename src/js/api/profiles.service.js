


import { get, post } from "../utils/http.util";

// const BASE_URL = 'http://localhost:3000';
const BASE_URL = 'https://pol355ivn9.execute-api.us-east-1.amazonaws.com/prod';

export const getProfile = async (walletId: any) => {
  const url = `${BASE_URL}/profiles/${walletId}`
  const response = await get(url);
  return response?.payload;
}

export const editProfile = async (walletId: any, profileImageUrl = null, nickname = null, signature = '') => {
  const url = `${BASE_URL}/profiles/${walletId}`
  const response = await post(url, { signature, profileImageUrl, nickname });
  return response?.data?.payload;
}