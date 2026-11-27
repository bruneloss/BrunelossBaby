package br.com.nossocantinho.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.widget.RemoteViews;

import org.json.JSONObject;

import java.io.File;

/** Desenha os dois widgets: pequeno (ofensiva + animação da semana) e médio (+ recado e prioridades). */
public class Widgets {
    static final int ANIMACOES = 10, QUADROS = 4;
    private static final int[] IDS_QUADROS = {R.id.q0, R.id.q1, R.id.q2, R.id.q3};

    static void atualizarTodos(Context c) {
        AppWidgetManager m = AppWidgetManager.getInstance(c);
        for (int id : m.getAppWidgetIds(new ComponentName(c, WidgetPequeno.class))) m.updateAppWidget(id, montar(c, false));
        for (int id : m.getAppWidgetIds(new ComponentName(c, WidgetMedio.class))) m.updateAppWidget(id, montar(c, true));
    }

    static RemoteViews montar(Context c, boolean medio) {
        JSONObject w = Dados.widget(c);
        int ofensiva = w.optInt("ofensiva", 0);
        boolean ativo = w.optBoolean("ativoHoje", false);
        RemoteViews v = new RemoteViews(c.getPackageName(), medio ? R.layout.widget_medio : R.layout.widget_pequeno);

        // uma animação diferente a cada semana de ofensiva (10 em rodízio)
        int anim = (ofensiva / 7) % ANIMACOES;
        for (int f = 0; f < QUADROS; f++) {
            Bitmap b = carregar(Dados.quadro(c, anim, f));
            if (b != null) v.setImageViewBitmap(IDS_QUADROS[f], b);
            else v.setImageViewResource(IDS_QUADROS[f], R.mipmap.ic_launcher);
        }

        v.setTextViewText(R.id.dias, String.valueOf(ofensiva));
        v.setTextViewText(R.id.rotulo, ofensiva == 1 ? "dia" : "dias");
        v.setTextColor(R.id.dias, ativo ? Color.parseColor("#FF8A00") : Color.parseColor("#9AA0A6"));
        v.setTextViewText(R.id.fogo, ativo ? "❤️‍🔥" : "🤍");

        if (medio) {
            String recado = w.optString("recado", "");
            String autor = w.optString("recadoAutor", "");
            v.setTextViewText(R.id.recado, recado.isEmpty() ? "Nenhum recadinho ainda. Toque para escrever 💌" : "“" + recado + "”");
            v.setTextViewText(R.id.recado_autor, autor.isEmpty() ? "" : "— " + autor);
            int p = w.optInt("prioridades", 0);
            v.setTextViewText(R.id.prioridades, p == 0 ? "✅ Nenhuma prioridade pendente" : "🚨 " + p + (p == 1 ? " prioridade pendente" : " prioridades pendentes"));
        }

        Intent abrir = new Intent(c, MainActivity.class).setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        v.setOnClickPendingIntent(R.id.raiz, PendingIntent.getActivity(c, medio ? 2 : 1, abrir, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT));
        return v;
    }

    /** Amplia o pixel art sem borrar (vizinho mais próximo). */
    private static Bitmap carregar(File f) {
        if (!f.exists()) return null;
        Bitmap b = BitmapFactory.decodeFile(f.getAbsolutePath());
        if (b == null) return null;
        return Bitmap.createScaledBitmap(b, b.getWidth() * 4, b.getHeight() * 4, false);
    }
}
