package br.com.nossocantinho.app;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;

/** Widget médio: ofensiva, último recadinho e prioridades pendentes. */
public class WidgetMedio extends AppWidgetProvider {
    @Override
    public void onUpdate(Context c, AppWidgetManager m, int[] ids) {
        for (int id : ids) m.updateAppWidget(id, Widgets.montar(c, true));
        AtualizaWidget.agora(c);
    }
}
