package br.com.nossocantinho.app;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Base64;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Scanner;
import java.util.Set;

/** Guarda a configuração da casa e os dados do widget; sabe buscar a casa direto no Firebase. */
public class Dados {
    private static final String PREFS = "cantinho";

    static SharedPreferences prefs(Context c) { return c.getSharedPreferences(PREFS, Context.MODE_PRIVATE); }

    /** Devolve true quando algo mudou (casa ou pessoa), para registrar o aparelho de novo. */
    static boolean salvarConfig(Context c, String json) {
        String antes = prefs(c).getString("config", "");
        if (json.equals(antes)) return false;
        prefs(c).edit().putString("config", json).apply();
        return true;
    }

    static JSONObject config(Context c) {
        try { return new JSONObject(prefs(c).getString("config", "{}")); } catch (Exception e) { return new JSONObject(); }
    }

    static void salvarWidget(Context c, String json) { prefs(c).edit().putString("widget", json).apply(); }

    static JSONObject widget(Context c) {
        try { return new JSONObject(prefs(c).getString("widget", "{}")); } catch (Exception e) { return new JSONObject(); }
    }

    static File pastaQuadros(Context c) {
        File d = new File(c.getFilesDir(), "quadros");
        if (!d.exists()) d.mkdirs();
        return d;
    }

    static File quadro(Context c, int anim, int f) { return new File(pastaQuadros(c), "a" + anim + "_f" + f + ".png"); }

    /** json = [[png, png, png, png], ... 10 animações] */
    static void salvarQuadros(Context c, String json) {
        try {
            JSONArray anims = new JSONArray(json);
            for (int a = 0; a < anims.length(); a++) {
                JSONArray fr = anims.getJSONArray(a);
                for (int f = 0; f < fr.length(); f++) {
                    byte[] png = Base64.decode(fr.getString(f), Base64.DEFAULT);
                    try (FileOutputStream o = new FileOutputStream(quadro(c, a, f))) { o.write(png); }
                }
            }
        } catch (Exception ignorado) { }
    }

    /** Busca a casa no Firestore e recalcula ofensiva, último recado e prioridades (app fechado). */
    static void buscar(Context c) {
        JSONObject cfg = config(c);
        String casa = cfg.optString("casa"), chave = cfg.optString("apiKey"), projeto = cfg.optString("projectId");
        if (casa.isEmpty() || chave.isEmpty() || projeto.isEmpty()) return;
        try {
            String url = "https://firestore.googleapis.com/v1/projects/" + projeto + "/databases/(default)/documents/casais/"
                    + URLEncoder.encode(casa, "UTF-8") + "?key=" + URLEncoder.encode(chave, "UTF-8");
            HttpURLConnection con = (HttpURLConnection) new URL(url).openConnection();
            con.setConnectTimeout(10000);
            con.setReadTimeout(10000);
            if (con.getResponseCode() != 200) return;
            InputStream in = con.getInputStream();
            JSONObject doc = new JSONObject(new Scanner(in, "UTF-8").useDelimiter("\\A").next());
            String estadoTxt = doc.getJSONObject("fields").getJSONObject("estado").getString("stringValue");
            salvarWidget(c, calcular(new JSONObject(estadoTxt)).toString());
        } catch (Exception ignorado) { }
    }

    /** Mesmas contas que o app faz na tela inicial. */
    static JSONObject calcular(JSONObject e) throws Exception {
        Set<String> dias = new HashSet<>();
        JSONArray da = e.optJSONArray("diasAtivos");
        if (da != null) for (int i = 0; i < da.length(); i++) dias.add(da.getString(i));
        LocalDate hoje = LocalDate.now();
        LocalDate d = dias.contains(hoje.toString()) ? hoje : hoje.minusDays(1);
        int ofensiva = 0;
        while (dias.contains(d.toString())) { ofensiva++; d = d.minusDays(1); }

        JSONObject casal = e.optJSONObject("casal");
        String nomeA = casal != null ? casal.optString("A", "") : "", nomeB = casal != null ? casal.optString("B", "") : "";

        JSONObject w = new JSONObject();
        w.put("ofensiva", ofensiva);
        w.put("ativoHoje", dias.contains(hoje.toString()));
        JSONArray msgs = e.optJSONArray("mensagens");
        if (msgs != null && msgs.length() > 0) {
            JSONObject m = msgs.getJSONObject(msgs.length() - 1);
            w.put("recado", m.optString("texto"));
            w.put("recadoAutor", "A".equals(m.optString("autor")) ? nomeA : nomeB);
        }
        int pend = 0;
        JSONArray pr = e.optJSONArray("prioridades");
        if (pr != null) for (int i = 0; i < pr.length(); i++) if (!pr.getJSONObject(i).optBoolean("feito")) pend++;
        w.put("prioridades", pend);
        return w;
    }
}
