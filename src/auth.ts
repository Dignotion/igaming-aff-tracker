export function isAuthorized(request: Request, env: Env): boolean {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false;
  }

  const encodedCreds = authHeader.substring(6);
  const decodedCreds = atob(encodedCreds);
  const [username, password] = decodedCreds.split(':');

  return username === env.AUTH_USER && password === env.AUTH_PASS;
}
