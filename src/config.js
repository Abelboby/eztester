// src/config.js
import axios from 'axios';

const pinataApiKey = '158ffe6057044a8cb97d';
const pinataSecretApiKey = '51aaccd6121c8cff784bd7796b23e4850447af11964938a8263309518ba603ed';

const pinata = axios.create({
  baseURL: 'https://api.pinata.cloud',
  headers: {
    pinata_api_key: pinataApiKey,
    pinata_secret_api_key: pinataSecretApiKey
  }
});

export { pinata };