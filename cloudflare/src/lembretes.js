/* Worker agendado (Cron Triggers da Cloudflare): manda os lembretes diários */
import { rodarLembretes } from '../lib/lembretes.js';

export default {
  async scheduled(evento, env, ctx) {
    ctx.waitUntil(rodarLembretes(env, evento.cron));
  },
};
