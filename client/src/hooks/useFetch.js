import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Generic data fetching hook with loading, error, and refetch support
 *
 * @param {Function} fetchFn   - Async function that fetches data
 * @param {Array}    deps      - Dependencies that trigger refetch
 * @param {Object}   options   - Options: { immediate, initialData }
 */
const useFetch = (fetchFn, deps = [], options = {}) => {
  const { immediate = true, initialData = null } = options

  const [data, setData]       = useState(initialData)
  const [loading, setLoading] = useState(immediate)
  const [error, setError]     = useState(null)
  const mountedRef            = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const execute = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchFn(...args)
      if (mountedRef.current) {
        setData(result?.data || result)
        setLoading(false)
      }
      return { success: true, data: result?.data || result }
    } catch (err) {
      if (mountedRef.current) {
        const message = err?.response?.data?.message || err?.message || 'An error occurred.'
        setError(message)
        setLoading(false)
      }
      return { success: false, error: err }
    }
  }, [fetchFn])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, deps)

  const refetch = useCallback(() => execute(), [execute])

  return { data, loading, error, refetch, execute }
}

export default useFetch