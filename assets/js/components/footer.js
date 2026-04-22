document.addEventListener("DOMContentLoaded", () => {

  // ================= FOOTER STYLES =================
  // injects footer styles dynamically (no external CSS needed for this component)
  const style = document.createElement("style");

style.textContent = `
  .app-footer {
    margin-top: 40px;
    padding: 20px;

    font-size: 12px;

    max-width: 480px;
    margin-left: auto;
    margin-right: auto;

    text-align: center;

    /* LIGHT MODE DEFAULT */
    background: #f9f9f9;
    color: #777;
    border-top: 1px solid #ddd;

    transition: all 0.3s ease;
  }

  .app-footer a {
    color: #555;
    text-decoration: none;
    margin: 0 5px;
  }

  .app-footer a:hover {
    text-decoration: underline;
  }

  /* ================= DARK MODE ================= */
  body.dark-mode .app-footer {
    background: #1e1e1e;
    color: #bbb;
    border-top: 1px solid #333;
  }

  body.dark-mode .app-footer a {
    color: #ddd;
  }

  body.dark-mode .app-footer a:hover {
    color: #fff;
  }
`;

  document.head.appendChild(style);

  // ================= FOOTER TEMPLATE =================
  // static footer content for all pages
  const footer = `
    <footer class="app-footer">

      <p><strong>OJT Tracking System</strong> © 2026</p>

      <p>
        This is a student project only. For academic purposes only.
      </p>

      <p>
        Developed by: Grayson 
        (<a href="https://instagram.com/gianxxsz" target="_blank">@gianxxsz</a>)
      </p>

      <p>
        <a href="./terms.html">Terms & Conditions</a> |
        <a href="./privacy.html">Privacy Policy</a>
      </p>

    </footer>
  `;

  // IMPORTANT:
  // footer is appended once at the end of body
  // avoid calling this script multiple times or you'll duplicate footer
  document.body.insertAdjacentHTML("beforeend", footer);
});