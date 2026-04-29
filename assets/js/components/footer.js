document.addEventListener("DOMContentLoaded", () => {

  const style = document.createElement("style");

style.textContent = `
  .app-footer {
    margin-top: 20px; /* reduced */
    padding: 12px 15px; /* tighter */

    font-size: 12px;
    line-height: 1.4;

    max-width: 480px;
    margin-left: auto;
    margin-right: auto;

    text-align: center;

    background: #f9f9f9;
    color: #777;
    border-top: 1px solid #ddd;

    transition: all 0.3s ease;
  }

  .app-footer p {
    margin: 2px 0; 
  }

  .app-footer a {
    color: #555;
    text-decoration: none;
    margin: 0 5px;
  }

  .app-footer a:hover {
    text-decoration: underline;
  }

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

  document.body.insertAdjacentHTML("beforeend", footer);
});