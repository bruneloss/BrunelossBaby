package br.com.nossocantinho.app;

import android.content.Context;

import androidx.annotation.NonNull;
import androidx.work.Constraints;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.NetworkType;
import androidx.work.OneTimeWorkRequest;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import java.util.concurrent.TimeUnit;

/** Busca a casa de tempos em tempos para o widget ficar certo mesmo com o app fechado (ex.: virada do dia). */
public class AtualizaWidget extends Worker {

    public AtualizaWidget(@NonNull Context c, @NonNull WorkerParameters p) { super(c, p); }

    @NonNull
    @Override
    public Result doWork() {
        Dados.buscar(getApplicationContext());
        Widgets.atualizarTodos(getApplicationContext());
        return Result.success();
    }

    private static Constraints comInternet() {
        return new Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build();
    }

    static void agendar(Context c) {
        PeriodicWorkRequest r = new PeriodicWorkRequest.Builder(AtualizaWidget.class, 1, TimeUnit.HOURS).setConstraints(comInternet()).build();
        WorkManager.getInstance(c).enqueueUniquePeriodicWork("widget", ExistingPeriodicWorkPolicy.KEEP, r);
    }

    static void agora(Context c) {
        WorkManager.getInstance(c).enqueue(new OneTimeWorkRequest.Builder(AtualizaWidget.class).setConstraints(comInternet()).build());
    }
}
