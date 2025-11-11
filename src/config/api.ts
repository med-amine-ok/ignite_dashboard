// API Configuration
// Behavior:
// - If VITE_API_BASE_URL is set to an absolute URL (e.g. "http://127.0.0.1:8000"),
//   endpoints will be absolute and the frontend will contact the backend directly.
// - If VITE_API_BASE_URL is NOT set, or set to the literal "proxy",
//   endpoints will be relative ("/api/...") so the Vite dev server proxy forwards
//   requests to the backend and avoids CORS during development.

import { Currency } from "lucide-react";

const VITE_API_BASE = import.meta.env.VITE_API_BASE_URL as string | undefined;
const USE_PROXY = !VITE_API_BASE || VITE_API_BASE === 'proxy';
const API_BASE = USE_PROXY ? '' : VITE_API_BASE || 'http://127.0.0.1:8000';

function build(path: string) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return USE_PROXY ? p : `${API_BASE}${p}`;
}

export const API_ENDPOINTS = {
  // Authentication
  login: build('/api/accounts/login/'),
  logout: build('/api/accounts/logout/'),
  currentUser: build('/api/accounts/current_user/'),
  // Statistics
  statsOverview: build('/api/stats/overview'),
  statsRatings: build('/api/stats/ratings'),

  // Participants
  participants: build('/api/participants'),
  approvedParticipants: build('/api/participants?status=APPROVED'),

  // Ratings
  ratings: build('/api/ratings'),
};

export const API_BASE_URL = API_BASE;
