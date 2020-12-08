#!/usr/bin/env node
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var yargs = require("yargs");
var fs = require('fs');
var UnitOfWork = "UnitOfWork.ts";
var options = yargs
    .usage("Usage: -m <model>")
    .usage("Usage: -r <repository>")
    .usage("Usage: -s <subdir>")
    .option("m", {
    alias: "model", describe: "Your model", type: "string",
    demandOption: true
})
    .option("r", {
    alias: "repository", describe: "Base Repository", type: "string",
    demandOption: true
})
    .option("s", {
    alias: "subdir", describe: "Sub Direcotry", type: "string",
    demandOption: false
}).argv;
var OptionsInit = /** @class */ (function () {
    function OptionsInit() {
    }
    OptionsInit.prototype.init = function () {
        var subDir = options.subdir ? options.subdir + "/" : "";
        var result = new Options(options.model, options.repository, subDir);
        return result;
    };
    return OptionsInit;
}());
var ConfigInit = /** @class */ (function () {
    function ConfigInit() {
    }
    ConfigInit.prototype.init = function () {
        var configPath = process.cwd() + "/repocgcnf.json";
        if (!fs.existsSync(configPath)) {
            throw Error("Config file is not exist, Please create file with name of repocgcnf.json");
        }
        var rawdata = fs.readFileSync(configPath);
        var config = JSON.parse(rawdata);
        return config;
    };
    return ConfigInit;
}());
var Options = /** @class */ (function () {
    function Options(model, repository, subDir) {
        if (subDir === void 0) { subDir = ""; }
        this.modelSubFolder = "";
        this.model = model;
        this.repository = repository;
        this.subdir = subDir;
        var modelSubFolder = [];
        if (model.indexOf("/") > -1) {
            modelSubFolder = model.split('/');
            if (modelSubFolder.length > 2) {
                throw Error("Just one sub folder is allow for models");
            }
            this.model = modelSubFolder[1];
            this.modelSubFolder = modelSubFolder[0] + "/";
        }
    }
    return Options;
}());
var Context = /** @class */ (function () {
    function Context(options, config) {
        this.baseUrl = process.cwd();
        this.options = options;
        this.config = config;
    }
    return Context;
}());
var ValidateConfig = /** @class */ (function () {
    function ValidateConfig() {
    }
    ValidateConfig.prototype.validate = function (context) {
        var directoryValid = true;
        Object.keys(context.config.paths).forEach(function (key) {
            var path = "" + context.baseUrl + context.config.paths[key];
            if (!fs.existsSync(path)) {
                console.log("no such file or directory, " + path);
                directoryValid = false;
            }
        });
        if (!fs.existsSync("" + process.cwd() + context.config.paths.serviceURI + UnitOfWork)) {
            console.log("UnitOfWork.ts file is not exists");
            directoryValid = false;
        }
        if (!directoryValid)
            throw Error("Bad config!");
    };
    return ValidateConfig;
}());
var SubDir = /** @class */ (function () {
    function SubDir() {
    }
    SubDir.prototype.create = function (context) {
        if (context.options.subdir.length > 0) {
            Object.keys(context.config.paths).forEach(function (key) {
                var path = "" + context.baseUrl + context.config.paths[key] + context.options.subdir;
                if (!fs.existsSync(path)) {
                    fs.mkdirSync(path);
                }
            });
        }
    };
    return SubDir;
}());
var CodeGenStrategy = /** @class */ (function () {
    function CodeGenStrategy() {
    }
    CodeGenStrategy.prototype.write = function () {
        var path = this.path();
        var content = this.content();
        var logMsg = this.logMsg();
        fs.writeFile(path, content, { flag: 'wx' }, function (err) {
            if (err) {
                console.log(err);
            }
            else {
                console.log(logMsg);
            }
        });
    };
    return CodeGenStrategy;
}());
var IRepositoryStrategy = /** @class */ (function (_super) {
    __extends(IRepositoryStrategy, _super);
    function IRepositoryStrategy(context) {
        var _this = _super.call(this) || this;
        _this.context = context;
        return _this;
    }
    IRepositoryStrategy.prototype.path = function () {
        return "" + this.context.baseUrl + this.context.config.paths.iRepositoryURI + this.context.options.subdir + "I" + this.context.options.model + "Repository.ts";
    };
    IRepositoryStrategy.prototype.content = function () {
        return "\nimport {IRepository} from 'js-frontend-repository/interfaces/IRepository'\nimport { " + this.context.options.model + " } from '" + this.context.config.modelPath + this.context.options.modelSubFolder + this.context.options.model + "'\nexport interface I" + this.context.options.model + "Repository extends IRepository<" + this.context.options.model + "> {\n}\n";
    };
    IRepositoryStrategy.prototype.logMsg = function () {
        return "I" + this.context.options.model + "Repository is created successfully.";
    };
    return IRepositoryStrategy;
}(CodeGenStrategy));
var RepositoryStrategy = /** @class */ (function (_super) {
    __extends(RepositoryStrategy, _super);
    function RepositoryStrategy(context) {
        var _this = _super.call(this) || this;
        _this.context = context;
        return _this;
    }
    RepositoryStrategy.prototype.path = function () {
        return "" + this.context.baseUrl + this.context.config.paths.repositoryURI + this.context.options.subdir + this.context.options.model + "Repository.ts";
    };
    RepositoryStrategy.prototype.content = function () {
        var baseRepository = this.context.config.baseRepositories.find(function (t) { return t.alias == options.repository; });
        if (!baseRepository) {
            throw Error(this.context.options.repository + " Base repository is not exists\non config file");
        }
        return "\nimport { " + baseRepository.name + " } from '" + baseRepository.path + "'\nimport { " + this.context.options.model + " } from '" + this.context.config.modelPath + this.context.options.modelSubFolder + this.context.options.model + "'\nexport class " + this.context.options.model + "Repository extends " + baseRepository.name + "<" + this.context.options.model + "> {\nconstructor() { super(" + this.context.options.model + ", null);\n} }\n";
    };
    RepositoryStrategy.prototype.logMsg = function () {
        return this.context.options.model + "Repository is created successfully.";
    };
    return RepositoryStrategy;
}(CodeGenStrategy));
var ServiceStrategy = /** @class */ (function (_super) {
    __extends(ServiceStrategy, _super);
    function ServiceStrategy(context) {
        var _this = _super.call(this) || this;
        _this.context = context;
        return _this;
    }
    ServiceStrategy.prototype.path = function () {
        return "" + this.context.baseUrl + this.context.config.paths.serviceURI + this.context.options.subdir + this.context.options.model + "Service.ts";
    };
    ServiceStrategy.prototype.content = function () {
        var baseService = this.context.config.baseSeviceType === "base" ? "import { BaseService } from 'js-frontend-repository/BaseSerivce'" : "import { BaseService } from 'js-frontend-repository/BaseSerivce'";
        return "\nimport { I" + this.context.options.model + "Repository } from '@" + this.context.config.paths.iRepositoryURI + this.context.options.subdir + "I" + this.context.options.model + "Repository'\nimport { " + this.context.options.model + " } from '" + this.context.config.modelPath + this.context.options.modelSubFolder + this.context.options.model + "'\n" + baseService + "\nexport class " + this.context.options.model + "Service extends BaseService<" + this.context.options.model + ",I" + this.context.options.model + "Repository> {\n} ";
    };
    ServiceStrategy.prototype.logMsg = function () {
        return this.context.options.model + "Service is created successfully.";
    };
    return ServiceStrategy;
}(CodeGenStrategy));
var UnitOfWorkStrategy = /** @class */ (function (_super) {
    __extends(UnitOfWorkStrategy, _super);
    function UnitOfWorkStrategy(context) {
        var _this = _super.call(this) || this;
        _this.context = context;
        return _this;
    }
    UnitOfWorkStrategy.prototype.path = function () {
        return "";
    };
    UnitOfWorkStrategy.prototype.content = function () {
        return "";
    };
    UnitOfWorkStrategy.prototype.logMsg = function () {
        return this.context.options.model + "Service is created successfully.";
    };
    UnitOfWorkStrategy.prototype.toLower = function (val) {
        return val.charAt(0).toLowerCase() + val.slice(1);
    };
    UnitOfWorkStrategy.prototype.write = function () {
        var self = this;
        fs.readFile("" + this.context.baseUrl + this.context.config.paths.serviceURI + UnitOfWork, 'utf8', function (err, data) {
            if (err) {
                console.log(err);
            }
            else if (data.indexOf(self.context.options.model + "Repository") > -1) {
                console.log("This model exists on UnitOfWork");
            }
            else {
                var imported = data.replace("//new service import placeholder", "//new service import placeholder\nimport { " + self.context.options.model + "Repository} from '@" + self.context.config.paths.repositoryURI + self.context.options.subdir + self.context.options.model + "Repository'\nimport { " + self.context.options.model + "Service } from '@" + self.context.config.paths.serviceURI + self.context.options.subdir + self.context.options.model + "Service'");
                var properties = imported.replace("//new service placeholder", "//new service placeholder\n" + self.toLower(self.context.options.model) + "Service: " + self.context.options.model + "Service");
                var constractors = properties.replace("//new service init placeholder", "//new service init placeholder \n    this." + self.toLower(self.context.options.model) + "Service = new " + self.context.options.model + "Service(" + self.context.options.model + "Repository)");
                fs.writeFile("" + self.context.baseUrl + self.context.config.paths.serviceURI + UnitOfWork, constractors, function (err) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        console.log('UnitOFWork is created successfully.');
                    }
                });
            }
        });
    };
    return UnitOfWorkStrategy;
}(CodeGenStrategy));
var Facad = /** @class */ (function () {
    function Facad() {
        this.options = new OptionsInit();
        this.config = new ConfigInit();
    }
    Facad.prototype.generate = function () {
        var options = this.options.init();
        var config = this.config.init();
        var context = new Context(options, config);
        (new ValidateConfig()).validate(context);
        (new SubDir()).create(context);
        (new IRepositoryStrategy(context)).write();
        (new RepositoryStrategy(context)).write();
        (new ServiceStrategy(context)).write();
        (new UnitOfWorkStrategy(context)).write();
    };
    return Facad;
}());
(new Facad()).generate();
