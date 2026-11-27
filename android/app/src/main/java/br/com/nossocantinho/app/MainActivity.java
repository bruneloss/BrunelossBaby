package br.com.nossocantinho.app;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONObject;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;

/** Tela do app: abre o Nosso Cantinho publicado (as mudanças chegam sozinhas). */
public class MainActivity extends Activity {

    private static final int ESCOLHER_ARQUIVO = 1;
    private WebView web;
    private ValueCallback<Uri[]> escolha;

    @Override
    protected void onCreate(Bundle salvo) {
        super.onCreate(salvo);
        getWindow().setStatusBarColor(Color.parseColor("#1E1E1E"));

        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false); // a música do toca-discos já começa tocando
        s.setAllowFileAccess(false);
        web.setBackgroundColor(Color.parseColor("#F8FCF6"));
        web.addJavascriptInterface(new Ponte(this), "AndroidPonte");

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest req) {
                Uri u = req.getUrl();
                if (u.toString().startsWith(BuildConfig.URL_APP)) return false;
                // WhatsApp, links de indicações etc. abrem fora do app
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignorado) { }
                return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
                if (escolha != null) escolha.onReceiveValue(null);
                escolha = cb;
                try {
                    startActivityForResult(p.createIntent(), ESCOLHER_ARQUIVO);
                } catch (Exception e) {
                    escolha = null;
                    return false;
                }
                return true;
            }
        });

        setContentView(web);
        web.loadUrl(enderecoInicial(getIntent()));

        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, 2);
        }
        verificarAtualizacao();
    }

    /** Link de convite aberto pelo WhatsApp entra direto na casa. */
    private String enderecoInicial(Intent i) {
        Uri d = i != null ? i.getData() : null;
        if (d != null && d.toString().startsWith(BuildConfig.URL_APP)) return d.toString();
        return BuildConfig.URL_APP;
    }

    @Override
    protected void onNewIntent(Intent i) {
        super.onNewIntent(i);
        Uri d = i.getData();
        if (d != null && d.toString().startsWith(BuildConfig.URL_APP)) web.loadUrl(d.toString());
    }

    @Override
    protected void onActivityResult(int pedido, int resultado, Intent dados) {
        if (pedido == ESCOLHER_ARQUIVO && escolha != null) {
            escolha.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultado, dados));
            escolha = null;
            return;
        }
        super.onActivityResult(pedido, resultado, dados);
    }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
    }

    @Override
    protected void onPause() {
        web.onPause();
        super.onPause();
    }

    /** Se houver um APK mais novo publicado, oferece atualizar (o Android pede para confirmar). */
    private void verificarAtualizacao() {
        new Thread(() -> {
            try {
                HttpURLConnection c = (HttpURLConnection) new URL(BuildConfig.URL_SITE + "/versao.json").openConnection();
                c.setConnectTimeout(8000);
                c.setReadTimeout(8000);
                if (c.getResponseCode() != 200) return;
                InputStream in = c.getInputStream();
                String txt = new Scanner(in, "UTF-8").useDelimiter("\\A").next();
                JSONObject j = new JSONObject(txt);
                int nova = j.optInt("versao", 0);
                if (nova <= BuildConfig.VERSION_CODE) return;
                String link = BuildConfig.URL_SITE + j.optString("apk", "/nosso-cantinho.apk");
                runOnUiThread(() -> new AlertDialog.Builder(this)
                        .setTitle("💚 Nova versão do app")
                        .setMessage("Tem uma atualização do Nosso Cantinho (widgets ou notificações). Toque em Atualizar, baixe e instale por cima. Seus dados continuam iguais.")
                        .setPositiveButton("Atualizar", (d, w) -> startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(link))))
                        .setNegativeButton("Depois", null)
                        .show());
            } catch (Exception ignorado) { }
        }).start();
    }
}
