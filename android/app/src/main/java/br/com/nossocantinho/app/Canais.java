package br.com.nossocantinho.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.media.AudioAttributes;
import android.net.Uri;

/** Um canal por tipo de aviso, cada um com seu som (o Android guarda o som no canal). */
public class Canais {
    // [id do tipo, nome no Android, som em res/raw]
    static final String[][] TIPOS = {
            {"recado", "💌 Recadinhos", "som_recado"},
            {"beijo", "💋 Beijinhos", "som_beijo"},
            {"prioridade", "🚨 Prioridades", "som_prioridade"},
            {"conta", "💸 Contas vencendo", "som_conta"},
            {"agenda", "📅 Agenda do dia", "som_agenda"},
            {"ofensiva", "❤️‍🔥 Ofensiva em risco", "som_ofensiva"},
    };
    private static final String VERSAO = "_v1"; // mude para trocar os sons dos canais

    static void criar(Context c) {
        NotificationManager nm = c.getSystemService(NotificationManager.class);
        AudioAttributes audio = new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build();
        for (String[] t : TIPOS) {
            NotificationChannel ch = new NotificationChannel(t[0] + VERSAO, t[1], NotificationManager.IMPORTANCE_HIGH);
            ch.setSound(som(c, t[2]), audio);
            ch.enableLights(true);
            ch.setLightColor(Color.parseColor("#2E9E5B"));
            nm.createNotificationChannel(ch);
        }
    }

    static Uri som(Context c, String nome) {
        return Uri.parse("android.resource://" + c.getPackageName() + "/raw/" + nome);
    }

    static void notificar(Context c, String tipo, String titulo, String corpo) {
        boolean conhecido = false;
        for (String[] t : TIPOS) if (t[0].equals(tipo)) conhecido = true;
        if (!conhecido) tipo = "recado";
        Intent abrir = new Intent(c, MainActivity.class).setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pi = PendingIntent.getActivity(c, 0, abrir, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        Notification n = new Notification.Builder(c, tipo + VERSAO)
                .setSmallIcon(R.drawable.ic_notificacao)
                .setColor(Color.parseColor("#2E9E5B"))
                .setContentTitle(titulo)
                .setContentText(corpo)
                .setStyle(new Notification.BigTextStyle().bigText(corpo))
                .setAutoCancel(true)
                .setContentIntent(pi)
                .build();
        c.getSystemService(NotificationManager.class).notify((int) (System.currentTimeMillis() % 100000), n);
    }
}
