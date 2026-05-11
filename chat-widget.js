(function() {
  const SERVICIOS = {
    "Manicure Clásico": { cat: "Uñas", precio: 35000, dur: "45 min" },
    "Manicure Semipermanente": { cat: "Uñas", precio: 55000, dur: "60 min" },
    "Pedicure Spa": { cat: "Uñas", precio: 65000, dur: "75 min" },
    "Uñas Acrílicas": { cat: "Uñas", precio: 95000, dur: "90 min" },
    "Diseño de Cejas": { cat: "Cejas y Pestañas", precio: 30000, dur: "30 min" },
    "Lifting de Pestañas": { cat: "Cejas y Pestañas", precio: 85000, dur: "60 min" },
    "Extensiones de Pestañas": { cat: "Cejas y Pestañas", precio: 150000, dur: "120 min" },
    "Corte de Cabello": { cat: "Cabello", precio: 75000, dur: "60 min" },
    "Tinte de Cabello": { cat: "Cabello", precio: 180000, dur: "150 min" },
    "Mechas o Balayage": { cat: "Cabello", precio: 280000, dur: "240 min" },
    "Keratina Brasileña": { cat: "Cabello", precio: 350000, dur: "180 min" },
    "Peinado Eventos": { cat: "Cabello", precio: 120000, dur: "90 min" },
    "Maquillaje Social": { cat: "Maquillaje", precio: 90000, dur: "60 min" },
    "Maquillaje Novia": { cat: "Maquillaje", precio: 250000, dur: "90 min" },
    "Limpieza Facial Profunda": { cat: "Facial", precio: 110000, dur: "75 min" }
  };

  const clientData = { nombre: "", servicio: "", fecha: "", hora: "", valor: 0, estado: "inicio" };
  let isOpen = false;
  let chatHistory = [];

  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Jost:wght@300;400;500&display=swap');
    #elite-fab {
      position: fixed; bottom: 28px; right: 28px; z-index: 9999;
      width: 58px; height: 58px; border-radius: 50%;
      background: linear-gradient(135deg, #C9A961, #8B6914);
      border: none; cursor: pointer; box-shadow: 0 4px 20px #C9A96155;
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    #elite-fab:hover { transform: scale(1.08); box-shadow: 0 6px 28px #C9A96177; }
    #elite-fab svg { width: 26px; height: 26px; fill: #0a0a0a; }
    #elite-fab .notif {
      position: absolute; top: 4px; right: 4px;
      width: 14px; height: 14px; background: #e74c3c;
      border-radius: 50%; border: 2px solid #fff;
      animation: pulse 2s infinite;
    }
    @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }

    #elite-chatbox {
      position: fixed; bottom: 100px; right: 28px; z-index: 9998;
      width: 360px; height: 520px;
      background: #0a0a0a; border-radius: 20px;
      border: 0.5px solid #2a2a2a;
      display: flex; flex-direction: column;
      box-shadow: 0 20px 60px #00000088;
      transform: scale(0.8) translateY(20px);
      opacity: 0; pointer-events: none;
      transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
      font-family: 'Jost', sans-serif;
    }
    #elite-chatbox.open {
      transform: scale(1) translateY(0);
      opacity: 1; pointer-events: all;
    }
    #elite-chatbox .ec-header {
      background: #0a0a0a; border-bottom: 0.5px solid #1e1e1e;
      padding: 14px 16px; border-radius: 20px 20px 0 0;
      display: flex; align-items: center; gap: 10px;
    }
    #elite-chatbox .ec-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: linear-gradient(135deg, #C9A961, #8B6914);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Cormorant Garamond', serif;
      font-size: 15px; color: #0a0a0a; font-weight: 600; flex-shrink: 0;
    }
    #elite-chatbox .ec-title { font-family: 'Cormorant Garamond', serif; font-size: 15px; font-weight: 600; color: #C9A961; }
    #elite-chatbox .ec-sub { font-size: 10px; color: #555; letter-spacing: 0.08em; text-transform: uppercase; }
    #elite-chatbox .ec-close {
      margin-left: auto; background: none; border: none;
      color: #555; cursor: pointer; font-size: 20px; line-height: 1;
      padding: 2px 6px; border-radius: 6px;
    }
    #elite-chatbox .ec-close:hover { color: #C9A961; }
    #elite-chatbox .ec-online {
      width: 7px; height: 7px; background: #4caf7d;
      border-radius: 50%; box-shadow: 0 0 5px #4caf7d88;
    }
    #elite-msgs {
      flex: 1; overflow-y: auto; padding: 16px 12px;
      display: flex; flex-direction: column; gap: 10px;
      scrollbar-width: thin; scrollbar-color: #222 transparent;
    }
    .ec-msg { display: flex; gap: 6px; max-width: 88%; animation: ecIn 0.25s ease; }
    @keyframes ecIn { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
    .ec-msg.bot { align-self: flex-start; }
    .ec-msg.user { align-self: flex-end; flex-direction: row-reverse; }
    .ec-msg .ec-av {
      width: 24px; height: 24px; border-radius: 50%;
      background: linear-gradient(135deg, #C9A961, #8B6914);
      display: flex; align-items: center; justify-content: center;
      font-size: 10px; color: #0a0a0a; font-weight: 600; flex-shrink: 0; margin-top: 2px;
    }
    .ec-bubble {
      padding: 9px 12px; border-radius: 14px;
      font-size: 13px; line-height: 1.6; font-weight: 300;
    }
    .ec-msg.bot .ec-bubble {
      background: #141414; color: #d4d0c8;
      border: 0.5px solid #222; border-radius: 4px 14px 14px 14px;
    }
    .ec-msg.user .ec-bubble {
      background: #C9A961; color: #0a0a0a;
      border-radius: 14px 4px 14px 14px; font-weight: 400;
    }
    .ec-msg.bot .ec-bubble strong { color: #C9A961; font-weight: 500; }
    .ec-typing {
      display: flex; gap: 3px; padding: 9px 12px;
      background: #141414; border: 0.5px solid #222;
      border-radius: 4px 14px 14px 14px; width: fit-content;
    }
    .ec-typing span {
      width: 5px; height: 5px; background: #C9A961;
      border-radius: 50%; animation: ecBounce 1.2s infinite; opacity: 0.6;
    }
    .ec-typing span:nth-child(2){animation-delay:.2s}
    .ec-typing span:nth-child(3){animation-delay:.4s}
    @keyframes ecBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-4px)} }
    #elite-chatbox .ec-input-area {
      padding: 10px 12px; border-top: 0.5px solid #1a1a1a;
      display: flex; gap: 8px; background: #0a0a0a;
      border-radius: 0 0 20px 20px;
    }
    #ec-input {
      flex: 1; background: #141414; border: 0.5px solid #282828;
      color: #d4d0c8; padding: 9px 12px; border-radius: 20px;
      font-size: 12.5px; font-family: 'Jost', sans-serif; font-weight: 300; outline: none;
    }
    #ec-input::placeholder { color: #444; }
    #ec-input:focus { border-color: #C9A96155; }
    #ec-send {
      width: 34px; height: 34px; background: #C9A961;
      border: none; border-radius: 50%; cursor: pointer;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      transition: opacity 0.2s;
    }
    #ec-send:hover { opacity: 0.85; }
    #ec-send svg { width: 14px; height: 14px; fill: #0a0a0a; }
  `;
  document.head.appendChild(style);

  const fab = document.createElement('button');
  fab.id = 'elite-fab';
  fab.innerHTML = `<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg><div class="notif"></div>`;
  document.body.appendChild(fab);

  const box = document.createElement('div');
  box.id = 'elite-chatbox';
  box.innerHTML = `
    <div class="ec-header">
      <div class="ec-avatar">E</div>
      <div>
        <div class="ec-title">ÉLITE STUDIO</div>
        <div class="ec-sub">Asesora virtual · Belleza de autor</div>
      </div>
      <div class="ec-online"></div>
      <button class="ec-close" id="ec-close-btn">&times;</button>
    </div>
    <div id="elite-msgs"></div>
    <div class="ec-input-area">
      <input id="ec-input" type="text" placeholder="Escribe aquí..." />
      <button id="ec-send"><svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg></button>
    </div>
  `;
  document.body.appendChild(box);

  function toggleChat() {
    isOpen = !isOpen;
    box.classList.toggle('open', isOpen);
    const notif = fab.querySelector('.notif');
    if (notif) notif.style.display = isOpen ? 'none' : '';
    if (isOpen && document.getElementById('elite-msgs').children.length === 0) {
      setTimeout(() => addMsg('bot', '¡Bienvenida a <strong>ÉLITE STUDIO</strong> ✨<br><br>Soy Valentina, tu asesora personal de belleza. Estoy aquí para ayudarte a encontrar el servicio perfecto para ti.<br><br>¿Con quién tengo el gusto de hablar?'), 300);
    }
  }

  fab.addEventListener('click', toggleChat);
  document.getElementById('ec-close-btn').addEventListener('click', toggleChat);

  function addMsg(role, html) {
    const msgs = document.getElementById('elite-msgs');
    const wrap = document.createElement('div');
    wrap.className = 'ec-msg ' + role;
    if (role === 'bot') {
      wrap.innerHTML = `<div class="ec-av">E</div><div class="ec-bubble">${html}</div>`;
    } else {
      wrap.innerHTML = `<div class="ec-bubble">${html}</div>`;
      chatHistory.push({ role: 'user', content: html });
    }
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
    if (role === 'bot') chatHistory.push({ role: 'assistant', content: wrap.querySelector('.ec-bubble').innerText });
  }

  function showTyping() {
    const msgs = document.getElementById('elite-msgs');
    const t = document.createElement('div');
    t.className = 'ec-msg bot'; t.id = 'ec-typing';
    t.innerHTML = `<div class="ec-av">E</div><div class="ec-typing"><span></span><span></span><span></span></div>`;
    msgs.appendChild(t); msgs.scrollTop = msgs.scrollHeight;
  }

  function removeTyping() {
    const t = document.getElementById('ec-typing');
    if (t) t.remove();
  }

  async function callClaude(userMsg) {
    const svcList = Object.entries(SERVICIOS).map(([n,d]) => `- ${n} (${d.cat}): $${d.precio.toLocaleString('es-CO')} · ${d.dur}`).join('\n');
    const system = `Eres la asesora virtual de ÉLITE STUDIO, salón premium en Cali, Colombia. Nombre: Valentina.
Tono cálido, elegante, profesional. Máx 1 emoji por mensaje. Español colombiano, tuteas al cliente.

SERVICIOS:
${svcList}

DATOS DEL CLIENTE:
- Nombre: ${clientData.nombre || 'no capturado'}
- Servicio: ${clientData.servicio || 'no elegido'}
- Fecha: ${clientData.fecha || 'no definida'}
- Hora: ${clientData.hora || 'no definida'}
- Estado: ${clientData.estado}

FLUJO: 1)Saluda y pide nombre 2)Pregunta qué servicio quiere 3)Recomienda con precios 4)Confirma elección 5)Pide fecha y hora 6)Confirma y da instrucciones de pago (Bancolombia 310-555-0001 Élite Studio SAS o pago en caja).

Al final incluye si detectas datos nuevos:
DATA:nombre=X|servicio=X|fecha=X|hora=X|estado=X
Estados válidos: inicio, nombre, servicio, fecha, confirmado`;

    const history = [...chatHistory, { role: 'user', content: userMsg }];
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, system, messages: history })
    });
    const data = await res.json();
    const full = data.content.map(c => c.text || '').join('');
    const lines = full.split('\n');
    const dataLine = lines.find(l => l.startsWith('DATA:'));
    const reply = lines.filter(l => !l.startsWith('DATA:')).join('\n').trim();
    if (dataLine) {
      dataLine.replace('DATA:', '').split('|').forEach(pair => {
        const [k, v] = pair.split('=');
        if (k && v) {
          if (k === 'nombre') clientData.nombre = v;
          if (k === 'servicio') { clientData.servicio = v; if (SERVICIOS[v]) clientData.valor = SERVICIOS[v].precio; }
          if (k === 'fecha') clientData.fecha = v;
          if (k === 'hora') clientData.hora = v;
          if (k === 'estado') clientData.estado = v;
        }
      });
    }
    return reply;
  }

  async function handleSend() {
    const input = document.getElementById('ec-input');
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';
    addMsg('user', msg);
    showTyping();
    try {
      const reply = await callClaude(msg);
      removeTyping();
      addMsg('bot', reply.replace(/\n/g, '<br>'));
    } catch(e) {
      removeTyping();
      addMsg('bot', 'Lo siento, hubo un problema. Por favor intenta de nuevo.');
    }
  }

  document.getElementById('ec-send').addEventListener('click', handleSend);
  document.getElementById('ec-input').addEventListener('keydown', e => { if (e.key === 'Enter') handleSend(); });
})();
