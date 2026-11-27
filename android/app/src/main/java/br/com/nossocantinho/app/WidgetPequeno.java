package br.com.nossocantinho.app;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;

/** Widget pequeno: dias de ofensiva com a animação do casal da semana. */
public class WidgetPequeno extends AppWidgetProvider {
    @Override
    public void onUpdate(Context c, AppWidgetManager m, int[] ids) {
        for (int id : ids) m.updateAppWidget(id, Widgets.montar(c, false));
        AtualizaWidget.agora(c);
    }
}
