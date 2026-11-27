"""Gera os 6 sons de notificação do Nosso Cantinho (chiptune original, 8-bit fofinho).

Uso: python3 gerar_sons.py <pasta de saída>   (ex.: android/app/src/main/res/raw)
Cada som é um WAV curto, mono, 22 kHz. Para mudar um som, ajuste as notas abaixo e rode de novo
(e troque a VERSAO em Canais.java, porque o Android guarda o som no canal).
"""
import math
import random
import struct
import sys
import wave

TAXA = 22050
NOTAS = {'C': -9, 'C#': -8, 'D': -7, 'D#': -6, 'E': -5, 'F': -4, 'F#': -3, 'G': -2, 'G#': -1, 'A': 0, 'A#': 1, 'B': 2}


def freq(n):
    nome, oit = n[:-1], int(n[-1])
    return 440 * 2 ** ((NOTAS[nome] + (oit - 4) * 12) / 12)


def onda(tipo, fase):
    x = fase % 1.0
    if tipo == 'quadrada':
        return 1.0 if x < 0.5 else -1.0
    if tipo == 'pulso':
        return 1.0 if x < 0.25 else -1.0
    if tipo == 'triangulo':
        return 4 * abs(x - 0.5) - 1
    return math.sin(2 * math.pi * x)


def tom(f0, dur, tipo='quadrada', vol=0.35, f1=None, vibrato=0.0, ataque=0.005, queda=None):
    """Uma nota com envelope; f1 faz glissando; vibrato em Hz de profundidade."""
    n = int(TAXA * dur)
    queda = queda if queda is not None else dur * 0.6
    out, fase = [], 0.0
    for i in range(n):
        t = i / TAXA
        f = f0 if f1 is None else f0 + (f1 - f0) * (i / n)
        if vibrato:
            f += vibrato * math.sin(2 * math.pi * 7 * t)
        fase += f / TAXA
        env = min(1.0, t / ataque) if ataque else 1.0
        if t > dur - queda:
            env *= max(0.0, (dur - t) / queda)
        out.append(onda(tipo, fase) * vol * env)
    return out


def ruido(dur, vol=0.25, f_ini=1.0, f_fim=0.1):
    """Ruído filtrado que vai abrindo/fechando (para o 'fogo')."""
    n, out, ant = int(TAXA * dur), [], 0.0
    for i in range(n):
        a = f_ini + (f_fim - f_ini) * i / n
        ant = ant + a * (random.uniform(-1, 1) - ant)
        env = math.sin(math.pi * i / n)
        out.append(ant * vol * env)
    return out


def pausa(dur):
    return [0.0] * int(TAXA * dur)


def mix(*faixas):
    n = max(len(f) for f in faixas)
    return [sum(f[i] for f in faixas if i < len(f)) for i in range(n)]


def junta(*partes):
    r = []
    for p in partes:
        r += p
    return r


def salvar(caminho, amostras):
    pico = max(0.001, max(abs(a) for a in amostras))
    k = 0.85 / pico if pico > 0.85 else 1.0
    with wave.open(caminho, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(TAXA)
        w.writeframes(b''.join(struct.pack('<h', int(max(-1, min(1, a * k)) * 32767)) for a in amostras))


def sons():
    random.seed(7)
    return {
        # 💌 recado: carta chegando — três notas subindo e um brilho no fim
        'som_recado': junta(tom(freq('E5'), .09), tom(freq('G5'), .09), tom(freq('C6'), .16, queda=.12),
                            mix(tom(freq('E7'), .12, 'seno', .18), tom(freq('G7'), .12, 'seno', .1))),
        # 💋 beijinho: "mwah" — deslize para cima com vibrato e um estalinho
        'som_beijo': junta(tom(freq('A4'), .22, 'triangulo', .45, f1=freq('E5'), vibrato=8, queda=.08),
                           pausa(.03), tom(freq('A6'), .05, 'pulso', .25, queda=.04),
                           tom(freq('C6'), .18, 'seno', .3, f1=freq('E6'), queda=.15)),
        # 🚨 prioridade: alerta fofinho, dois bipes duplos
        'som_prioridade': junta(tom(freq('A5'), .07, 'pulso'), pausa(.03), tom(freq('E6'), .07, 'pulso'), pausa(.08),
                                tom(freq('A5'), .07, 'pulso'), pausa(.03), tom(freq('E6'), .12, 'pulso', queda=.08)),
        # 💸 conta: caixa registradora — "tlim" descendo com sino
        'som_conta': junta(tom(freq('G6'), .07, 'quadrada', .25), tom(freq('E6'), .07, 'quadrada', .25),
                           mix(tom(freq('C6'), .35, 'seno', .4, queda=.3), tom(freq('C7'), .35, 'seno', .15, queda=.3))),
        # 📅 agenda: carrilhão de duas notas
        'som_agenda': junta(mix(tom(freq('E6'), .32, 'seno', .4, queda=.28), tom(freq('E5'), .32, 'triangulo', .15, queda=.28)),
                            mix(tom(freq('B5'), .45, 'seno', .4, queda=.4), tom(freq('B4'), .45, 'triangulo', .15, queda=.4))),
        # ❤️‍🔥 ofensiva: chama acendendo e coração subindo
        'som_ofensiva': mix(ruido(.55, .35, .05, .9),
                            junta(pausa(.1), tom(freq('C5'), .1, 'quadrada', .25), tom(freq('E5'), .1, 'quadrada', .25),
                                  tom(freq('G5'), .1, 'quadrada', .25), tom(freq('C6'), .22, 'quadrada', .28, vibrato=6, queda=.15))),
    }


if __name__ == '__main__':
    pasta = sys.argv[1] if len(sys.argv) > 1 else '.'
    for nome, amostras in sons().items():
        salvar(f'{pasta}/{nome}.wav', amostras)
        print(nome, f'{len(amostras) / TAXA:.2f}s')
