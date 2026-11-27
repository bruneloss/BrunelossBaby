package br.com.nossocantinho.app;

import android.content.Context;
import android.provider.Settings;

import com.google.firebase.messaging.FirebaseMessaging;

import org.json.JSONObject;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

/** Registra este celular no servidor de avisos (Cloudflare) para receber as notificações da casa. */
public class Avisos {

    static void registrar(Context c) {
        if (!App.iniciarFirebase(c)) return;
        FirebaseMessaging.getInstance().getToken().addOnSuccessListener(token -> enviar(c, token));
    }

    static void enviar(Context c, String token) {
        JSONObject cfg = Dados.config(c);
        String api = cfg.optString("api"), casa = cfg.optString("casa"), eu = cfg.optString("eu");
        if (api.isEmpty() || casa.isEmpty() || eu.isEmpty() || token == null) return;
        new Thread(() -> {
            try {
                JSONObject corpo = new JSONObject()
                        .put("casa", casa).put("pessoa", eu).put("token", token)
                        .put("aparelho", Settings.Secure.getString(c.getContentResolver(), Settings.Secure.ANDROID_ID));
                HttpURLConnection con = (HttpURLConnection) new URL(api + "/registrar").openConnection();
                con.setRequestMethod("POST");
                con.setDoOutput(true);
                con.setConnectTimeout(10000);
                con.setRequestProperty("Content-Type", "text/plain; charset=utf-8");
                try (OutputStream o = con.getOutputStream()) { o.write(corpo.toString().getBytes(StandardCharsets.UTF_8)); }
                con.getResponseCode();
                con.disconnect();
            } catch (Exception ignorado) { }
        }).start();
    }
}
