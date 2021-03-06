var Express = require('express');
var Webtask = require('webtask-tools');
var app = Express();

// TODO: set message size limit

app.get("/", (req, res) => {
  res.end(`
    <html>
      <body>
        <script>
          var href = window.location.href;
          if (href[href.length-1] == "/") {
            window.location = href.slice(0, href.length-1);
          }
          function gen() {
            let text = "";
            let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for (var i = 0; i < 5; i++)
              text += possible.charAt(Math.floor(Math.random() * possible.length));

            el = document.getElementById("key");
            el.value = text;
          }

          function go() {
            let key = document.getElementById("key").value
            let body = document.getElementById("value").value
            url = window.location + "/" + key;
            fetch(url, {method: "POST", body: body}).then((response) => {
              el = document.getElementById("result");
              link = (window.location + "/").replace(/\\/\\/$/, "/") + key;
              el.innerHTML = 'Created your one-time message at <a href="' + link + '">' + link + '</a><br />Once the message has been viewed a single time it will be destroyed.';
            });
          }
        </script>

        <div>
          <label>one time key</label><br />
          <input id="key" type="text" /><button onclick="gen()">Generate</button><br />
          <label>message</label><br />
          <textarea id="value"></textarea><br />
          <button onclick="go()">Create</button>
        </div>
        <div>
          <span id="result"></span>
        </div>
      </body>
    </html>
  `);
});

app.get("/:key", (req, res) => {
  if (!checkReq(req)) {
    res.status(422).end("unprocessible entity");
  } else {
    sGet(req.params.key, req.webtaskContext.storage).then((result) => {
      res.set("Cache-Control", "no-store").end(result);
    }, (reason) => {
      res.status(404).end("not found");
    }).catch(function(err) {
      console.log(err);
    });
  }
});

app.post("/:key", (req, res) => {
  if (!checkReq(req, "POST")) {
    res.status(422).end("unprocessible entity");
  } else {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString(); // convert Buffer to string
    });
    req.on('end', () => {
      sSet(req.params.key, body, req.webtaskContext.storage).then((result) => {
        res.end("ok");
      }, (reason) => {
        res.status(422).end("unprocessible entity");
      });
    });
  }
});

function checkReq(req, method = "GET") {
  if (req.params.key == "service-worker.js") return false;

  return true;
}

function sGet(key, store) {
  return new Promise((resolve, reject) => {
    store.get((err, data) => {
      if (data[key]) {
        val = data[key];
        delete data[key];
        store.set(data, (err) => {
          if (err) {
            reject();
          } else {
            resolve(val);
          }
        });
      } else {
        reject();
      }
    });
  });
}

function sSet(key, val, store) {
  return new Promise((resolve, reject) => {
    store.get((err, data) => {
      data = data || {};
      data[key] = val;
      store.set(data, (err) => {
        if (err) {
          reject();
        } else {
          resolve();
        }
      });
    });
  });
}

module.exports = Webtask.fromExpress(app);
