export default [
    {
      url: '/api/user',
      method: 'get',
      response: () => {
        return {
          code: 0,
          data: { name: 'admin', role: 'admin' }
        }
      }
    }
  ]