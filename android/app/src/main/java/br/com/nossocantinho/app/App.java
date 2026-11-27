package br.com.nossocantinho.app;

import android.app.Application;

import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

/** Inicia o Firebase (só para as notificações) e cria os canais de aviso com sons próprios. */
public class App extends Application {

    @Override
    public void onCreate() {
        super.onCreate();
        Canais.criar(this);
        iniciarFirebase(this);
        AtualizaWidget.agendar(this);
    }

    /** O app Android do Firebase é configurado no código (sem google-services.json). */
    static boolean iniciarFirebase(android.content.Context ctx) {
        if (BuildConfig.FB_APP_ID.isEmpty() || BuildConfig.FB_API_KEY.isEmpty()) return false;
        if (!FirebaseApp.getApps(ctx).isEmpty()) return true;
        FirebaseOptions op = new FirebaseOptions.Builder()
                .setApplicationId(BuildConfig.FB_APP_ID)
                .setApiKey(BuildConfig.FB_API_KEY)
                .setProjectId(BuildConfig.FB_PROJECT_ID)
                .setGcmSenderId(BuildConfig.FB_SENDER_ID)
                .build();
        FirebaseApp.initializeApp(ctx, op);
        return true;
    }
}
