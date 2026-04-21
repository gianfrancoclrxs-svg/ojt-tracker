document.addEventListener("DOMContentLoaded", () => {
  
  const style = document.createElement("style");
  style.textContent = `
    .app-footer {
      margin-top: 40px;
      padding: 20px;

      font-size: 12px;
      color: #777;

      border-top: 1px solid #ddd;
      background: #f9f9f9;

      max-width: 480px;  
      margin-left: auto;  
      margin-right: auto;

      text-align: center;
    }

    .app-footer a {
      color: #555;
      text-decoration: none;
      margin: 0 5px;
    }

    .app-footer a:hover {
      text-decoration: underline;
    }
  `;
  document.head.appendChild(style);

  const footer = `
    <footer class="app-footer">
      <p><strong>OJT Tracking System</strong> © 2026</p>
      <p>This is a student project only. For academic purposes only.</p>
      <p>Developed by: Grayson (<a href="https://instagram.com/gianxxsz" target="_blank">@gianxxsz</a>)</p>
      <p>
        <a href="./terms.html">Terms & Conditions</a> |
        <a href="./privacy.html">Privacy Policy</a>
      </p>
    </footer>
  `;

  document.body.insertAdjacentHTML("beforeend", footer);
});