import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export const ACCESS_TOKEN_KEY = 'bookhive-access-token';
export const ROLE_KEY = 'bookhive-role';

type AuthState = {
  accessToken: string | null;
  role: string | null;
};

type Credentials = {
  accessToken: string;
  role: string | null;
};

function getInitialState(): AuthState {
  if (typeof window === 'undefined') {
    return { accessToken: null, role: null };
  }

  const accessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);
  if (accessToken === 'admin-demo-token') {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(ROLE_KEY);
    return { accessToken: null, role: null };
  }

  const role = window.localStorage.getItem(ROLE_KEY);
  return {
    accessToken,
    role,
  };
}

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    setCredentials(state, action: PayloadAction<Credentials>) {
      state.accessToken = action.payload.accessToken;
      state.role = action.payload.role;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(ACCESS_TOKEN_KEY, action.payload.accessToken);
        if (action.payload.role) {
          window.localStorage.setItem(ROLE_KEY, action.payload.role);
        } else {
          window.localStorage.removeItem(ROLE_KEY);
        }
      }
    },
    clearCredentials(state) {
      state.accessToken = null;
      state.role = null;
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(ACCESS_TOKEN_KEY);
        window.localStorage.removeItem(ROLE_KEY);
      }
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
