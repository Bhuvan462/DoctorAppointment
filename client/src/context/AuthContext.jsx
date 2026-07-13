import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { STORAGE_KEYS, ROLES } from '../utils/constants'
import * as authService from '../services/authServices'

// ─── Initial State ─────────────────────────────────────────────────────────────

const initialState = {
  user:          null,
  token:         null,
  isAuthenticated: false,
  isLoading:     true,   // true on app boot while checking localStorage
  isInitialized: false,
}

// ─── Action Types ─────────────────────────────────────────────────────────────

const AUTH_ACTIONS = {
  INITIALIZE:   'INITIALIZE',
  LOGIN_START:  'LOGIN_START',
  LOGIN_SUCCESS:'LOGIN_SUCCESS',
  LOGIN_FAIL:   'LOGIN_FAIL',
  LOGOUT:       'LOGOUT',
  UPDATE_USER:  'UPDATE_USER',
  SET_LOADING:  'SET_LOADING',
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

const authReducer = (state, action) => {
  switch (action.type) {

    case AUTH_ACTIONS.INITIALIZE:
      return {
        ...state,
        isAuthenticated: !!action.payload.user,
        user:            action.payload.user,
        token:           action.payload.token,
        isLoading:       false,
        isInitialized:   true,
      }

    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
      }

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user:            action.payload.user,
        token:           action.payload.token,
        isLoading:       false,
      }

    case AUTH_ACTIONS.LOGIN_FAIL:
      return {
        ...state,
        isAuthenticated: false,
        user:            null,
        token:           null,
        isLoading:       false,
      }

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user:            null,
        token:           null,
        isLoading:       false,
      }

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
        },
      }

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      }

    default:
      return state
  }
}

// ─── Context Creation ─────────────────────────────────────────────────────────

const AuthContext = createContext(null)

// ─── Provider Component ───────────────────────────────────────────────────────

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // ── Initialize: Load user from localStorage on app boot ──
  useEffect(() => {
    const initialize = async () => {
      try {
        const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN)
        const storedUser  = localStorage.getItem(STORAGE_KEYS.USER)

        if (storedToken && storedUser) {
          const user = JSON.parse(storedUser)

          // Verify token is still valid by fetching current user
          try {
            const response = await authService.getMe()
            const freshUser = response.data

            // Update localStorage with fresh data
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(freshUser))

            dispatch({
              type: AUTH_ACTIONS.INITIALIZE,
              payload: { user: freshUser, token: storedToken },
            })
          } catch (error) {
            // Token is invalid or expired — clear storage
            localStorage.removeItem(STORAGE_KEYS.TOKEN)
            localStorage.removeItem(STORAGE_KEYS.USER)
            dispatch({
              type: AUTH_ACTIONS.INITIALIZE,
              payload: { user: null, token: null },
            })
          }
        } else {
          dispatch({
            type: AUTH_ACTIONS.INITIALIZE,
            payload: { user: null, token: null },
          })
        }
      } catch (error) {
        dispatch({
          type: AUTH_ACTIONS.INITIALIZE,
          payload: { user: null, token: null },
        })
      }
    }

    initialize()
  }, [])

  // ── Login ──────────────────────────────────────────────────────────────────

  const login = useCallback(async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START })
    try {
      const response = await authService.login(credentials)
      const { token, user } = response.data

      // Persist to localStorage
      localStorage.setItem(STORAGE_KEYS.TOKEN, token)
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      })

      return { success: true, user }
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAIL })
      const message = error?.response?.data?.message || 'Login failed. Please try again.'
      return { success: false, message }
    }
  }, [])

  // ── Register Patient ───────────────────────────────────────────────────────

  const registerPatient = useCallback(async (data) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })
    try {
      const response = await authService.registerPatient(data)
      const { token, user } = response.data

      localStorage.setItem(STORAGE_KEYS.TOKEN, token)
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      })

      return { success: true, user }
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
      const message = error?.response?.data?.message || 'Registration failed.'
      return { success: false, message }
    }
  }, [])

  // ── Register Doctor ────────────────────────────────────────────────────────

  const registerDoctor = useCallback(async (data) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })
    try {
      const response = await authService.registerDoctor(data)
      const { token, user } = response.data

      localStorage.setItem(STORAGE_KEYS.TOKEN, token)
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      })

      return { success: true, user }
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
      const message = error?.response?.data?.message || 'Registration failed.'
      return { success: false, message }
    }
  }, [])

  // ── Logout ─────────────────────────────────────────────────────────────────

  const logoutUser = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // Ignore logout API error — always clear local state
    } finally {
      localStorage.removeItem(STORAGE_KEYS.TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USER)
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
    }
  }, [])

  // ── Update User ────────────────────────────────────────────────────────────

  const updateUser = useCallback((updatedData) => {
    const updated = { ...state.user, ...updatedData }
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated))
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: updatedData,
    })
  }, [state.user])

  // ── Role Helpers ───────────────────────────────────────────────────────────

  const isPatient = state.user?.role === ROLES.PATIENT
  const isDoctor  = state.user?.role === ROLES.DOCTOR
  const isAdmin   = state.user?.role === ROLES.ADMIN

  // ─── Context Value ─────────────────────────────────────────────────────────

  const value = {
    // State
    user:            state.user,
    token:           state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading:       state.isLoading,
    isInitialized:   state.isInitialized,

    // Role flags
    isPatient,
    isDoctor,
    isAdmin,

    // Actions
    login,
    registerPatient,
    registerDoctor,
    logout: logoutUser,
    updateUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Custom Hook ──────────────────────────────────────────────────────────────

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext