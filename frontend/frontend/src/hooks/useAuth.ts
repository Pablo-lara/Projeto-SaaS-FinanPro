import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContextValue';
import type { AuthContextData } from '../types/auth';

export function useAuth(): AuthContextData {
  return useContext(AuthContext);
}