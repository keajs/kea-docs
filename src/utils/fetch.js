export const fetch =
  typeof window !== 'undefined'
    ? window.fetch
    : () => ({
        json: () => ({
          message: 'No fetch when server rendering',
        }),
      })
