(function () {
  const TO = "ciubotarubogdaniulian@gmail.com";

  const style = document.createElement("style");
  style.textContent = `
    #fb-btn {
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      background: #000; color: #fff; border: none; border-radius: 4px;
      padding: 8px 14px; font-size: 12px; font-family: "DM Sans", sans-serif;
      font-weight: 500; cursor: pointer; letter-spacing: .04em;
      box-shadow: 0 2px 8px rgba(0,0,0,.25);
    }
    #fb-btn:hover { background: #222; }
    #fb-overlay {
      display: none; position: fixed; inset: 0; z-index: 10000;
      background: rgba(0,0,0,.4); align-items: center; justify-content: center;
    }
    #fb-overlay.open { display: flex; }
    #fb-modal {
      background: #fafafa; border: 1px solid #e0e0e0; border-radius: 6px;
      padding: 28px 28px 24px; width: 100%; max-width: 380px;
      font-family: "DM Sans", sans-serif; box-shadow: 0 8px 32px rgba(0,0,0,.18);
    }
    #fb-modal h3 { margin: 0 0 18px; font-size: 15px; font-weight: 600; color: #000; }
    #fb-modal label { display: block; font-size: 11px; font-weight: 500;
      letter-spacing: .06em; text-transform: uppercase; color: #555; margin-bottom: 4px; }
    #fb-modal input, #fb-modal textarea {
      width: 100%; box-sizing: border-box; border: 1px solid #ccc;
      border-radius: 3px; padding: 8px 10px; font-size: 13px;
      font-family: "DM Sans", sans-serif; background: #fff; color: #000;
      margin-bottom: 14px; outline: none;
    }
    #fb-modal input:focus, #fb-modal textarea:focus { border-color: #000; }
    #fb-modal textarea { resize: vertical; min-height: 90px; }
    #fb-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px; }
    #fb-cancel {
      background: none; border: 1px solid #ccc; border-radius: 3px;
      padding: 7px 16px; font-size: 12px; cursor: pointer; font-family: "DM Sans", sans-serif;
    }
    #fb-cancel:hover { border-color: #000; }
    #fb-submit {
      background: #000; color: #fff; border: none; border-radius: 3px;
      padding: 7px 16px; font-size: 12px; cursor: pointer; font-family: "DM Sans", sans-serif;
      font-weight: 500;
    }
    #fb-submit:hover { background: #222; }
  `;
  document.head.appendChild(style);

  document.body.insertAdjacentHTML("beforeend", `
    <button id="fb-btn">Feedback</button>
    <div id="fb-overlay">
      <div id="fb-modal">
        <h3>Send feedback</h3>
        <label for="fb-name">Name</label>
        <input id="fb-name" type="text" placeholder="Your name" />
        <label for="fb-email">Email</label>
        <input id="fb-email" type="email" placeholder="your@email.com" />
        <label for="fb-msg">Message</label>
        <textarea id="fb-msg" placeholder="Your feedback…"></textarea>
        <div id="fb-actions">
          <button id="fb-cancel">Cancel</button>
          <button id="fb-submit">Send</button>
        </div>
      </div>
    </div>
  `);

  const overlay = document.getElementById("fb-overlay");
  const open  = () => overlay.classList.add("open");
  const close = () => overlay.classList.remove("open");

  document.getElementById("fb-btn").addEventListener("click", open);
  document.getElementById("fb-cancel").addEventListener("click", close);
  overlay.addEventListener("click", e => { if (e.target === overlay) close(); });

  document.getElementById("fb-submit").addEventListener("click", function () {
    const name  = document.getElementById("fb-name").value.trim();
    const email = document.getElementById("fb-email").value.trim();
    const msg   = document.getElementById("fb-msg").value.trim();
    if (!name || !email || !msg) { alert("Please fill in all fields."); return; }

    const subject = encodeURIComponent("EDF Explorer feedback from " + name);
    const body    = encodeURIComponent("Name: " + name + "\nEmail: " + email + "\n\n" + msg);
    window.location.href = `mailto:${TO}?subject=${subject}&body=${body}`;
    close();
  });
})();
