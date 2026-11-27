package br.com.nossocantinho.app;

import android.content.Context;
import android.webkit.JavascriptInterface;

/** Ponte entre o app (JavaScript) e o Android: dados da casa, widgets e notificações. */
public class Ponte {
    private final Context ctx;

    Ponte(Context ctx) { this.ctx = ctx.getApplicationContext(); }

    @JavascriptInterface
    public String versao() { return BuildConfig.VERSION_NAME; }

    @JavascriptInterface
    public boolean notificacoes() { return !BuildConfig.FB_APP_ID.isEmpty(); }

    /** {casa, eu, apiKey, projectId, api}: guarda e registra o aparelho para receber avisos. */
    @JavascriptInterface
    public void configurar(String json) {
        if (Dados.salvarConfig(ctx, json)) Avisos.registrar(ctx);
    }

    /** Números do widget calculados pelo app (ofensiva, último recado, prioridades). */
    @JavascriptInterface
    public void widget(String json) {
        Dados.salvarWidget(ctx, json);
        Widgets.atualizarTodos(ctx);
    }

    /** 10 animações x 4 quadros (PNG em base64) desenhadas com o visual escolhido do casal. */
    @JavascriptInterface
    public void quadros(String json) {
        Dados.salvarQuadros(ctx, json);
        Widgets.atualizarTodos(ctx);
    }
}
