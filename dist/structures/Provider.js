"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Datastore = void 0;
Array.prototype.last = function () {
    return this[this.length - 1];
};
const noop = () => { };
const methods = ["delete", "set", "get", "exists", "push", "first", "last", "random"];
const reflectors = [
    "toString",
    "valueOf",
    "inspect",
    "constructor",
    Symbol.toPrimitive,
    Symbol.for("nodejs.util.inspect.custom"),
];
function Datastore(client, path = []) {
    var method;
    const handler = {
        get(target, name) {
            if (reflectors.includes(name))
                return () => path.join("."); // debugger is requesting prop -> don't add to path
            if (methods.includes(name)) {
                // check if method is called e.g. get()
                method = name;
            }
            else {
                path.push({ name, filter: null }); // add to the path -> name of the prop, unique id to add it mongo arrayFilters
            }
            return new Proxy(noop, handler);
        },
        apply(_, self, args) {
            var arg = args[0];
            // @ts-ignore
            if (method === "__getProvider")
                return new client.db.provider(client, path);
            if (methods.includes(method)) {
                // @ts-ignore
                return new client.db.provider(client, path)[method](arg); // actually run the query
            }
            path[path.length - 1].filter = arg;
            return new Proxy(noop, handler);
        },
    };
    return new Proxy(noop, handler);
}
exports.Datastore = Datastore;
//# sourceMappingURL=Provider.js.map