package br.com.nossocantinho.app;

import androidx.annotation.NonNull;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import java.util.Map;

/** Recebe os avisos do servidor: mostra a notificação com o som do tipo e atualiza os widgets. */
public class Mensageiro extends FirebaseMessagingService {

    @Override
    public void onMessageReceived(@NonNull RemoteMessage msg) {
        Map<String, String> d = msg.getData();
        String tipo = d.get("tipo");
        if (tipo != null && !"widget".equals(tipo)) Canais.notificar(this, tipo, d.get("titulo"), d.get("corpo"));
        Dados.buscar(this);
        Widgets.atualizarTodos(this);
    }

    @Override
    public void onNewToken(@NonNull String token) {
        Avisos.enviar(this, token);
    }
}
