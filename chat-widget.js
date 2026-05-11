(function() {
  const SERVICIOS = {
    "Manicure Clásico": { cat: "unas", precio: 35000, dur: "45 min", emoji: "💅" },
    "Manicure Semipermanente": { cat: "unas", precio: 55000, dur: "60 min", emoji: "💅" },
    "Pedicure Spa": { cat: "unas", precio: 65000, dur: "75 min", emoji: "💅" },
    "Uñas Acrílicas": { cat: "unas", precio: 95000, dur: "90 min", emoji: "💅" },
    "Diseño de Cejas": { cat: "cejas", precio: 30000, dur: "30 min", emoji: "✨" },
    "Lifting de Pestañas": { cat: "cejas", precio: 85000, dur: "60 min", emoji: "✨" },
    "Extensiones de Pestañas": { cat: "cejas", precio: 150000, dur: "120 min", emoji: "✨" },
    "Corte de Cabello": { cat: "cabello", precio: 75000, dur: "60 min", emoji: "💇" },
    "Tinte de Cabello": { cat: "cabello", precio: 180000, dur: "150 min", emoji: "💇" },
    "Mechas o Balayage": { cat: "cabello", precio: 280000, dur: "240 min", emoji: "💇" },
    "Keratina Brasileña": { cat: "cabello", precio: 350000, dur: "180 min", emoji: "💇" },
    "Peinado Eventos": { cat: "cabello", precio: 120000, dur: "90 min", emoji: "💇" },
    "Maquillaje Social": { cat: "maquillaje", precio: 90000, dur: "60 min", emoji: "💄" },
    "Maquillaje Novia": { cat: "maquillaje", precio: 250000, dur: "90 min", emoji: "💄" },
    "Limpieza Facial Profunda": { cat: "facial", precio: 110000, dur: "75 min", emoji: "🌿" }
  };

  const KEYWORDS = {
    unas: ["uña","una","manicure","pedicure","acrilica","semipermanente","gel","nail"],
    cejas: ["ceja","pestaña","lifting","extension","diseño"],
    cabello: ["cabello","pelo","cabello","tinte","mechas","corte","balayage","keratina","peinado","color"],
    maquillaje: ["maquillaje","maquilla","makeup","novia","social","fiesta","evento","grado"],
    facial: ["facial","limpieza","cara","piel","acne"]
  };

  const HORAS = ["9:00 AM","10:00 AM","11:00 AM","12:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM"];
  const DIAS = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];

  let state = { step: "bienvenida", nombre: "", cat: "", servicio: "", fecha: "", hora: "" };
  let isOpen = false;

  function detectCat(txt) {
    const t = txt.toLowerCase();
    for (const [cat, words] of Object.entries(KEYWORDS)) {
      if (words.some(w => t.includes(w))) return cat;
    }
    return null;
  }

  function fmt(n) { return "$" + n.toLocaleString("es-CO"); }

  function getResponse(userMsg) {
    const txt = userMsg.toLowerCase().trim();

    if (state.step === "bienvenida") {
      const nombre = userMsg.split(" ")[0];
      state.nombre = nombre.charAt(0).toUpperCase() + nombre.slice(1);
      state.step = "categoria";
      return {
        msg: `¡Qué gusto, ${state.nombre}! Bienvenida a Élite Studio ✨\n\nSoy Valentina, tu asesora personal. ¿En qué te puedo ayudar hoy?`,
        opciones: ["Uñas", "Maquillaje", "Cabello", "Cejas y Pestañas", "Facial"]
      };
    }

    if (state.step === "categoria") {
      const cat = detectCat(txt);
      if (!cat) {
        return { msg: `Cuéntame ${state.nombre}, ¿qué servicio te interesa?`, opciones: ["Uñas", "Maquillaje", "Cabello", "Cejas y Pestañas", "Facial"] };
      }
      state.cat = cat;
      state.step = "servicio";
      const svcs = Object.entries(SERVICIOS).filter(([,d]) => d.cat === cat);
      const lista = svcs.map(([n,d]) => `${d.emoji} *${n}* — ${fmt(d.precio)} · ${d.dur}`).join("\n");
      return {
        msg: `Perfecto ${state.nombre}, tenemos estas opciones para ti:\n\n${lista}\n\n¿Cuál te llama la atención?`,
        opciones: svcs.map(([n]) => n)
      };
    }

    if (state.step === "servicio") {
      const found = Object.keys(SERVICIOS).find(n => txt.includes(n.toLowerCase()) || n.toLowerCase().includes(txt));
      if (!found) {
        const svcs = Object.entries(SERVICIOS).filter(([,d]) => d.cat === state.cat);
        return { msg: "¿Cuál de estos servicios te interesa?", opciones: svcs.map(([n]) => n) };
      }
      state.servicio = found;
      state.step = "fecha";
      const svc = SERVICIOS[found];
      return {
        msg: `Excelente elección ✨\n\n*${found}*\nValor: ${fmt(svc.precio)}\nDuración: ${svc.dur}\n\n¿Para qué día te agendamos?`,
        opciones: DIAS
      };
    }

    if (state.step === "fecha") {
      state.fecha = userMsg;
      state.step = "hora";
      return {
        msg: `${state.fecha} perfecto. ¿A qué hora prefieres tu cita?`,
        opciones: HORAS
      };
    }

    if (state.step === "hora") {
      state.hora = userMsg;
      state.step = "confirmado";
      const svc = SERVICIOS[state.servicio];
      return {
        msg: `Todo listo ${state.nombre} 🎉\n\n📋 *Tu reserva:*\nServicio: ${state.servicio}\nFecha: ${state.fecha}\nHora: ${state.hora}\nValor: ${fmt(svc.precio)}\n\n💳 *Para confirmar tu cita:*\nTransferencia Bancolombia\nCuenta: 310-555-0001\nNombre: Élite Studio SAS\n\nEnvía el comprobante por WhatsApp y listo. ¡Te esperamos!`,
        opciones: ["Reservar otra cita", "Tengo una pregunta"]
      };
    }

    if (state.step === "confirmado") {
      if (txt.includes("otra") || txt.includes("reservar")) {
        state = { step: "categoria", nombre: state.nombre, cat: "", servicio: "", fecha: "", hora: "" };
        return { msg: `Claro ${state.nombre}, ¿qué otro servicio deseas?`, opciones: ["Uñas", "Maquillaje", "Cabello", "Cejas y Pestañas", "Facial"] };
      }
      return {
        msg: `Con gusto te ayudo ${state.nombre}. ¿Cuál es tu pregunta?`,
        opciones: ["¿Cuánto dura el servicio?", "¿Qué necesito llevar?", "¿Tienen parqueadero?"]
      };
    }

    if (txt.includes("dura")) {
      const svc = SERVICIOS[state.servicio];
      return { msg: svc ? `El ${state.servicio} tiene una duración de ${svc.dur}. ¿Algo más?` : "Depende del servicio. ¿Cuál te interesa?", opciones: ["Reservar cita", "Otra pregunta"] };
    }
    if (txt.includes("llevar") || txt.includes("necesito")) {
      return { msg: "No necesitas traer nada especial. Nosotros tenemos todos los productos premium. Ven cómoda y lista para mimarte ✨", opciones: ["Reservar cita", "Otra pregunta"] };
    }
    if (txt.includes("parquea")) {
      return { msg: "Sí contamos con parqueadero disponible para nuestras clientas. ¿Algo más?", opciones: ["Reservar cita", "Otra pregunta"] };
    }

    return { msg: `${state.nombre}, ¿en qué más te puedo ayudar?`, opciones: ["Reservar cita", "Ver servicios", "Hablar con un asesor"] };
  }

  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Jost:wght@300;400;500&display=swap');
    #elite-fab{position:fixed;bottom:28px;right:28px;z-index:9999;width:58px;height:58px;border-radius:50%;background:linear-gradient(135deg,#C9A961,#8B6914);border:none;cursor:pointer;box-shadow:0 4px 20px #C9A96155;display:flex;align-items:center;justify-content:center;transition:transform .2s,box-shadow .2s}
    #elite-fab:hover{transform:scale(1.08);box-shadow:0 6px 28px #C9A96177}
    #elite-fab svg{width:26px;height:26px;fill:#0a0a0a}
    #elite-fab .notif{position:absolute;top:4px;right:4px;width:14px;height:14px;background:#e74c3c;border-radius:50%;border:2px solid #fff;animation:pulse 2s infinite}
    @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}
    #elite-chatbox{position:fixed;bottom:100px;right:28px;z-index:9998;width:360px;max-height:540px;background:#0a0a0a;border-radius:20px;border:0.5px solid #2a2a2a;display:flex;flex-direction:column;box-shadow:0 20px 60px #00000088;transform:scale(0.8) translateY(20px);opacity:0;pointer-events:none;transition:all .25s cubic-bezier(0.34,1.56,0.64,1);font-family:'Jost',sans-serif}
    #elite-chatbox.open{transform:scale(1) translateY(0);opacity:1;pointer-events:all}
    .ec-header{background:#0a0a0a;border-bottom:0.5px solid #1e1e1e;padding:14px 16px;border-radius:20px 20px 0 0;display:flex;align-items:center;gap:10px}
    .ec-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#C9A961,#8B6914);display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;font-size:15px;color:#0a0a0a;font-weight:600;flex-shrink:0}
    .ec-title{font-family:'Cormorant Garamond',serif;font-size:15px;font-weight:600;color:#C9A961}
    .ec-sub{font-size:10px;color:#555;letter-spacing:.08em;text-transform:uppercase}
    .ec-close{margin-left:auto;background:none;border:none;color:#555;cursor:pointer;font-size:20px;line-height:1;padding:2px 6px;border-radius:6px}
    .ec-close:hover{color:#C9A961}
    .ec-online{width:7px;height:7px;background:#4caf7d;border-radius:50%;box-shadow:0 0 5px #4caf7d88}
    #elite-msgs{flex:1;overflow-y:auto;padding:16px 12px;display:flex;flex-direction:column;gap:10px;scrollbar-width:thin;scrollbar-color:#222 transparent}
    .ec-msg{display:flex;gap:6px;max-width:90%;animation:ecIn .25s ease}
    @keyframes ecIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
    .ec-msg.bot{align-self:flex-start}
    .ec-msg.user{align-self:flex-end;flex-direction:row-reverse}
    .ec-av{width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#C9A961,#8B6914);display:flex;align-items:center;justify-content:center;font-size:10px;color:#0a0a0a;font-weight:600;flex-shrink:0;margin-top:2px}
    .ec-bubble{padding:9px 12px;border-radius:14px;font-size:13px;line-height:1.65;font-weight:300}
    .ec-msg.bot .ec-bubble{background:#141414;color:#d4d0c8;border:0.5px solid #222;border-radius:4px 14px 14px 14px;white-space:pre-line}
    .ec-msg.user .ec-bubble{background:#C9A961;color:#0a0a0a;border-radius:14px 4px 14px 14px;font-weight:400}
    .ec-opts{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px;max-width:300px}
    .ec-opt{background:transparent;border:0.5px solid #C9A96155;color:#C9A961;padding:5px 11px;border-radius:20px;font-size:11.5px;font-family:'Jost',sans-serif;cursor:pointer;transition:all .2s;font-weight:400}
    .ec-opt:hover{background:#C9A96120;border-color:#C9A961}
    .ec-typing{display:flex;gap:3px;padding:9px 12px;background:#141414;border:0.5px solid #222;border-radius:4px 14px 14px 14px;width:fit-content}
    .ec-typing span{width:5px;height:5px;background:#C9A961;border-radius:50%;animation:ecB 1.2s infinite;opacity:.6}
    .ec-typing span:nth-child(2){animation-delay:.2s}
    .ec-typing span:nth-child(3){animation-delay:.4s}
    @keyframes ecB{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-4px)}}
    .ec-input-area{padding:10px 12px;border-top:0.5px solid #1a1a1a;display:flex;gap:8px;background:#0a0a0a;border-radius:0 0 20px 20px}
    #ec-input{flex:1;background:#141414;border:0.5px solid #282828;color:#d4d0c8;padding:9px 12px;border-radius:20px;font-size:12.5px;font-family:'Jost',sans-serif;font-weight:300;outline:none}
    #ec-input::placeholder{color:#444}
    #ec-input:focus{border-color:#C9A96155}
    #ec-send{width:34px;height:34px;background:#C9A961;border:none;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:opacity .2s}
    #ec-send:hover{opacity:.85}
    #ec-send svg{width:14px;height:14px;fill:#0a0a0a}
    @media(max-width:400px){#elite-chatbox{width:calc(100vw - 20px);right:10px;bottom:90px}}
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
      <div><div class="ec-title">ÉLITE STUDIO</div><div class="ec-sub">Asesora virtual · Belleza de autor</div></div>
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

  function addMsg(role, text, opciones) {
    const msgs = document.getElementById('elite-msgs');
    const wrap = document.createElement('div');
    wrap.className = 'ec-msg ' + role;
    const bold = text.replace(/\*(.*?)\*/g, '<strong style="color:#C9A961;font-weight:500">$1</strong>');
    if (role === 'bot') {
      wrap.innerHTML = `<div class="ec-av">E</div><div><div class="ec-bubble">${bold}</div>${opciones ? '<div class="ec-opts">' + opciones.map(o => `<button class="ec-opt">${o}</button>`).join('') + '</div>' : ''}</div>`;
      if (opciones) {
        wrap.querySelectorAll('.ec-opt').forEach(btn => {
          btn.addEventListener('click', () => handleSend(btn.textContent));
        });
      }
    } else {
      wrap.innerHTML = `<div class="ec-bubble">${text}</div>`;
    }
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
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

  function handleSend(text) {
    const input = document.getElementById('ec-input');
    const msg = text || input.value.trim();
    if (!msg) return;
    input.value = '';
    addMsg('user', msg);
    showTyping();
    setTimeout(() => {
      removeTyping();
      const resp = getResponse(msg);
      addMsg('bot', resp.msg, resp.opciones);
    }, 700);
  }

  function toggleChat() {
    isOpen = !isOpen;
    box.classList.toggle('open', isOpen);
    const notif = fab.querySelector('.notif');
    if (notif) notif.style.display = isOpen ? 'none' : '';
    if (isOpen && document.getElementById('elite-msgs').children.length === 0) {
      setTimeout(() => {
        addMsg('bot', '¡Bienvenida a ÉLITE STUDIO! ✨\n\nSoy Valentina, tu asesora personal de belleza.\n\n¿Con quién tengo el gusto de hablar?');
      }, 300);
    }
  }

  fab.addEventListener('click', toggleChat);
  document.getElementById('ec-close-btn').addEventListener('click', toggleChat);
  document.getElementById('ec-send').addEventListener('click', () => handleSend());
  document.getElementById('ec-input').addEventListener('keydown', e => { if (e.key === 'Enter') handleSend(); });
})();
