export const getApiErrorMessage = (error, fallback = 'Ocurrio un error') => {
  return (
    error.response?.data?.message ||
    error.response?.data?.msg ||
    error.response?.data?.error ||
    error.message ||
    fallback
  )
}
