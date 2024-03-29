"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sqlifier_1 = require("sqlifier");
exports.default = new (class Department extends sqlifier_1.SQLifier {
    constructor() {
        super();
        this.schema('department', {
            id: { type: 'int', isAutoIncrement: true, isPrimary: true },
            name: { type: 'varchar', length: 15 }
        });
    }
});
//# sourceMappingURL=Departments.js.map
