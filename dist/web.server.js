"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bodyParser = require("body-parser");
var compression = require("compression");
var cors = require("cors");
var express = require("express");
var http = require("http");
var WebSocketServer = require("ws");
var cdn_1 = require("@rsi/cdn");
var core_1 = require("@rsi/core");
// create server and listen on provided port (on all network interfaces).
var WebServer = /** @class */ (function () {
    function WebServer(port, _BASEURI) {
        if (_BASEURI === void 0) { _BASEURI = "/"; }
        var _this = this;
        this._BASEURI = _BASEURI;
        /**
         * Event listener for HTTP server "listening" event.
         */
        this.onListening = function () {
            var addr = _this.server.address();
            var bind = typeof addr === "string"
                ? "pipe " + addr
                : "port " + addr.port;
            _this.logger.log("log", "Listening on " + bind);
        };
        /**
         * Shutdown the server
         */
        this.close = function () {
            _this.ws.close(function () {
                // console.log("Closed WS");
            });
            _this.server.close();
            _this.app = null;
        };
        this.logger = core_1.RsiLogger.getInstance().getLogger("general");
        this.app = express();
        var whitelist = ["127.0.0.1", "localhost"];
        var corsOpts = {
            exposedHeaders: "Location",
            origin: "*"
        };
        this.app.use(cors(corsOpts));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(function (req, res, next) {
            _this.logger.info("Query:", req.method, req.url);
            next();
        });
        this.app.use(compression());
        // serve static content for cdn
        this.app.use(this._BASEURI + "cdn/:resource/:filename?", cdn_1.Cdn.getInstance().requestHandler());
        // Get port from environment and store in Express.
        this.port = this.normalizePort(process.env.PORT || port || "3000");
        this.app.set("port", this.port);
        this.server = http.createServer(this.app);
        this.ws = new WebSocketServer.Server({ server: this.server });
    }
    WebServer.prototype.init = function () {
        this.server.listen(this.port);
        this.server.on("listening", this.onListening);
    };
    /**
     * Normalize a port into a number, string, or false.
     */
    WebServer.prototype.normalizePort = function (val) {
        var port = parseInt(val, 10);
        if (isNaN(port)) {
            // named pipe
            return val;
        }
        if (port >= 0) {
            // port number
            return port;
        }
        return false;
    };
    return WebServer;
}());
exports.WebServer = WebServer;
//# sourceMappingURL=web.server.js.map