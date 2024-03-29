"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("../controllers/base"));
const Task_1 = __importDefault(require("../../services/Task"));
exports.default = (app) => {
    app.post('/task/add', base_1.default.wrap_with_store(Task_1.default.add));
    app.post('/task/start', base_1.default.wrap(Task_1.default.start));
    app.post('/task/finish', base_1.default.wrap(Task_1.default.finish));
    app.post('/task/remove', base_1.default.wrap(Task_1.default.remove));
    app.post('/task/get/by/farm', base_1.default.wrap_with_store(Task_1.default.getByFarm));
    app.post('/tasks/get/by/project', base_1.default.wrap_with_store(Task_1.default.getByProject));
};
//# sourceMappingURL=task.js.map
