/* /api/registrar e /api/avisar (Cloudflare Pages Functions) */
import { tratar } from '../../../lib/api.js';

export async function onRequest({ request, env, params }) {
  return tratar(request, env, params.rota);
}
