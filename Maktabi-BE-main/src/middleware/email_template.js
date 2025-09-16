const HTML_TEMPLATE = (text) => {
  return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Maktabi Email</title>
          <style>
            .container {
              width: 100%;
              height: 100%;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .email {
              width: 80%;
              margin: 0 auto;
              background-color: #fff;
              padding: 20px;
            }
            .email-header {
              padding: 20px;
              text-align: center;
            }
            .email-body {
              padding: 20px;
            }
            p {
              font-size: 18px;
            }
            .logo {
              width: 450px;
              height: 120px;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email">
              <div class="email-header">
               <img src='cid:logo' class="logo">
              </div>
              <div class="email-body">
                <p>${text}</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
}

module.exports = HTML_TEMPLATE;