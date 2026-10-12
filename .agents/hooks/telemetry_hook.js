var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// third_party/golang/esbuild/import_meta_url.js
var importMetaUrl = require("url").pathToFileURL(__filename);

// cloud/developer_experience/datacloud_vscode/common/exthost/inject/types.ts
var InjectionKey = class {
  constructor(id) {
    this.id = id;
  }
  id;
  /**
   * exists solely to ensure TypeScript properly type-checks the type T.
   *
   * Inspired by http://cl/729088494 .
   */
  doNothing(arg) {
  }
};
function getMapKey(token) {
  if (token instanceof InjectionKey || token && typeof token === "object" && "id" in token) {
    return token.id;
  }
  return token;
}

// cloud/developer_experience/datacloud_vscode/common/exthost/inject/injector.ts
function getTokenDisplayName(token) {
  if (token instanceof InjectionKey || token && typeof token === "object" && "id" in token) {
    return token.id;
  }
  return token.name || "UnknownConstructor";
}
var Injector = class {
  singletons = /* @__PURE__ */ new Map();
  providers = /* @__PURE__ */ new Map();
  currentlyExecutingGetOperations = [];
  constructor(providers) {
    for (const provider of providers) {
      const key = getMapKey(provider.key);
      if (this.providers.has(key)) {
        throw new Error(
          `Two providers registered for key: ${getTokenDisplayName(
            provider.key
          )}`
        );
      }
      this.providers.set(key, provider);
    }
  }
  hasProvider(k) {
    return this.providers.has(getMapKey(k));
  }
  addProvider(provider) {
    const key = getMapKey(provider.key);
    if (this.providers.has(key)) {
      throw new Error(
        `Two providers registered for key: ${getTokenDisplayName(
          provider.key
        )}`
      );
    }
    this.providers.set(key, provider);
  }
  get(k) {
    const key = getMapKey(k);
    if (this.currentlyExecutingGetOperations.includes(key)) {
      const dependencyChain = [...this.currentlyExecutingGetOperations, key];
      const chainNames = dependencyChain.map(
        (item) => typeof item === "function" ? item.name || "UnknownConstructor" : String(item)
      );
      throw new Error(
        `Circular dependency detected: ${chainNames.join(" -> ")}`
      );
    }
    this.currentlyExecutingGetOperations.push(key);
    try {
      return this.getInternal(k);
    } finally {
      this.currentlyExecutingGetOperations.pop();
    }
  }
  getInternal(token) {
    const key = getMapKey(token);
    const cachedInstance = this.singletons.get(key);
    if (cachedInstance) {
      return cachedInstance;
    }
    const providerConfig = this.providers.get(key);
    if (!providerConfig) {
      throw new Error(
        `Provider not found for key: ${getTokenDisplayName(token)}`
      );
    }
    const instance = providerConfig.factory();
    this.singletons.set(key, instance);
    return instance;
  }
};

// cloud/developer_experience/datacloud_vscode/common/exthost/inject/internal.ts
var globalInjector = new Injector([]);
var globalInjectorForTesting = null;
function getGlobalInjector() {
  return globalInjectorForTesting ?? globalInjector;
}
var addedProvidersInDebug = [];
function addProviders(providers) {
  const currGlobalInjector = getGlobalInjector();
  if (providers.length > 0) {
    for (const provider of providers) {
      currGlobalInjector.addProvider(provider);
      if (typeof goog !== "undefined" && goog.DEBUG) {
        addedProvidersInDebug.push(provider);
      }
    }
  }
}
function inject(injectionKey) {
  return getGlobalInjector().get(injectionKey);
}

// cloud/developer_experience/datacloud_vscode/agents/hooks/common_providers.ts
var import_child_process = require("child_process");
var fs = __toESM(require("fs"));
var os = __toESM(require("os"));
var IS_LOCAL_TELEMETRY = new InjectionKey(
  "cloud/developer_experience/datacloud_vscode/agents/hooks/common_providers.ts:is-local-telemetry"
);
var SPAWN_FN = new InjectionKey(
  "cloud/developer_experience/datacloud_vscode/agents/hooks/common_providers.ts:spawn-fn"
);
var PROCESS_ENV = new InjectionKey(
  "cloud/developer_experience/datacloud_vscode/agents/hooks/common_providers.ts:process-env"
);
var EXEC_SYNC_FN = new InjectionKey(
  "cloud/developer_experience/datacloud_vscode/agents/hooks/common_providers.ts:exec-sync-fn"
);
var OS_DEPS = new InjectionKey(
  "cloud/developer_experience/datacloud_vscode/agents/hooks/common_providers.ts:os-deps"
);
var FS_DEPS = new InjectionKey(
  "cloud/developer_experience/datacloud_vscode/agents/hooks/common_providers.ts:fs-deps"
);
function setupCommonProviders(config) {
  addProviders([
    { key: IS_LOCAL_TELEMETRY, factory: () => config.isLocalTelemetry },
    { key: SPAWN_FN, factory: () => import_child_process.spawn },
    { key: PROCESS_ENV, factory: () => process },
    { key: FS_DEPS, factory: () => fs },
    { key: EXEC_SYNC_FN, factory: () => import_child_process.execSync },
    { key: OS_DEPS, factory: () => os }
  ]);
}

// cloud/developer_experience/datacloud_vscode/agents/hooks/logging.ts
function debugLog(message, err) {
  if (process.env["DATACLOUD_HOOK_DEBUG"] === "true") {
    if (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`[TelemetryHook] ${message}: ${errMsg}`);
      return;
    }
    console.error(`[TelemetryHook] ${message}`);
  }
}

// cloud/developer_experience/datacloud_vscode/agents/hooks/telemetry_hook.ts
var crypto2 = __toESM(require("crypto"));
var path2 = __toESM(require("path"));

// third_party/cloudcode/vscode/common/packages/metrics/concord_client.ts
var https = __toESM(require("https"));
var USE_FIRELOG = true;
var KEY = [
  "I",
  "H",
  "A",
  "z",
  "h",
  "U",
  "h",
  "T",
  "l",
  "G",
  "X",
  "1",
  "S",
  "S",
  "C",
  "N",
  "l",
  "a",
  "w",
  "_",
  "Y",
  "N",
  "O",
  "h",
  "v",
  "h",
  "f",
  "Y",
  "m",
  "v",
  "5",
  "v",
  "C",
  "y",
  "S",
  "a",
  "z",
  "I",
  "A"
];
var IDENTIFIER = [...KEY].reverse().join("");
function decodeLogResponse(buf) {
  if (buf.length < 1) {
    return void 0;
  }
  if (USE_FIRELOG) {
    try {
      const responseString = buf.toString("utf8");
      const json = JSON.parse(responseString);
      if (json && typeof json === "object") {
        const msString = json["nextRequestWaitMillis"];
        if (msString !== void 0) {
          const ms2 = Number(msString);
          if (!isNaN(ms2)) {
            return { nextRequestWaitMs: ms2 };
          }
        }
      }
    } catch {
    }
  }
  if (buf.readUInt8(0) !== 8) {
    return void 0;
  }
  let ms = BigInt(0);
  let cont = true;
  for (let i = 1; cont && i < buf.length; i++) {
    const byte = buf.readUInt8(i);
    ms |= BigInt(byte & 127) << BigInt(7 * (i - 1));
    cont = (byte & 128) !== 0;
  }
  if (cont) {
    return void 0;
  }
  return { nextRequestWaitMs: Number(ms) };
}
function postMetricsToConcordServer(body, onError) {
  return new Promise((resolve, reject) => {
    const optionsForFirelog = {
      hostname: "firebaselogging-pa.googleapis.com",
      path: `/v1/firelog/legacy/log?key=${IDENTIFIER}`,
      method: "POST",
      headers: {
        "Content-Length": Buffer.byteLength(body),
        "Content-Type": "application/json"
      }
    };
    const optionsForClearcut = {
      hostname: "play.googleapis.com",
      path: "/log",
      method: "POST",
      headers: { "Content-Length": Buffer.byteLength(body) }
    };
    const bufs = [];
    const req = https.request(
      USE_FIRELOG ? optionsForFirelog : optionsForClearcut,
      (res) => {
        res.on("data", (buf) => bufs.push(buf));
        res.on("end", () => {
          resolve(Buffer.concat(bufs));
        });
      }
    );
    req.on("error", (e) => {
      if (onError) {
        onError(e);
      }
      reject(e);
    });
    req.end(body);
  }).then((buf) => {
    try {
      return decodeLogResponse(buf) || {};
    } catch {
      return {};
    }
  });
}

// cloud/developer_experience/datacloud_vscode/agents/hooks/build_info.ts
var BUILD_CHANGELIST = "460000000";
var BUILD_TIMESTAMP = 1596240000;
var EXT_NAME = "googlecloudtools.datacloud";
var EXT_VERSION = "1.0.0";
var ALLOWED_DATA_AGENT_SKILLS = /* @__PURE__ */ new Set([
  "accidental_data_loss_prevention", "accidental-data-loss-prevention", "bigquery_ai_ml", "bigquery-ai-ml", "bigquery_bigframes", "bigquery-bigframes", "bigquery_data_transfer_service", "bigquery-data-transfer-service", "bigquery_graph_author", "bigquery-graph-author", "bigquery_graph_query", "bigquery-graph-query", "bigquery_sql", "bigquery-sql", "bigtable_basics", "bigtable-basics", "building_data_apps", "building-data-apps", "data_autocleaning", "data-autocleaning", "dataform_bigquery", "dataform-bigquery", "dbt_bigquery", "dbt-bigquery", "discovering_gcp_data_assets", "discovering-gcp-data-assets", "enforcing_resource_attribution", "enforcing-resource-attribution", "federate_lakehouse_catalog", "federate-lakehouse-catalog", "gcp_composer_troubleshooting", "gcp-composer-troubleshooting", "gcp_dataflow", "gcp-dataflow", "gcp_data_pipelines", "gcp-data-pipelines", "gcp_managed_airflow_dag_authoring", "gcp-managed-airflow-dag-authoring", "gcp_managed_airflow_migrations", "gcp-managed-airflow-migrations", "gcp_managed_airflow_recommendations", "gcp-managed-airflow-recommendations", "gcp_managed_spark_upgrades", "gcp-managed-spark-upgrades", "gcp_pipeline_orchestration", "gcp-pipeline-orchestration", "gcp_pipeline_resource_provisioning", "gcp-pipeline-resource-provisioning", "gcp_spark", "gcp-spark", "gcp_spark_troubleshooting", "gcp-spark-troubleshooting", "gcs_security_assessment", "gcs-security-assessment", "google_cloud_auth_verification", "google-cloud-auth-verification", "google_cloud_storage_basics", "google-cloud-storage-basics", "google_cloud_storage_bucket_architect", "google-cloud-storage-bucket-architect", "google_cloud_storage_fuse", "google-cloud-storage-fuse", "managing_python_dependencies", "managing-python-dependencies", "ml_best_practices", "ml-best-practices", "notebook_guidance", "notebook-guidance", "schema_mapping", "schema-mapping"
]);

// cloud/developer_experience/datacloud_vscode/agents/hooks/utils.ts
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// cloud/developer_experience/datacloud_vscode/agents/hooks/mcp_parser.ts
var GOOGLE_MCP_SERVERS = [
  // Built-in:
  "notebook",
  "notebooks",
  "visualization",
  // Remote Databases:
  "alloydb",
  "alloydb-postgres",
  "alloydb-postgres-admin",
  "bigquery",
  "bigtable",
  "spanner",
  "cloud-sql",
  "cloud-sql-postgresql",
  "cloud-sql-postgresql-admin",
  "cloud-sql-mysql",
  "cloud-sql-mysql-admin",
  "cloud-sql-sqlserver",
  "cloud-sql-sqlserver-admin",
  "dataproc",
  "serverless-spark",
  "knowledge_catalog",
  "gcs",
  "cloud-storage"
];
var GOOGLE_MCP_SERVERS_REGEX = new RegExp(
  `(^|[_-])(${GOOGLE_MCP_SERVERS.join("|")})(_(remote|toolbox))?$`
);
var DAK_MCP_SERVER_REGEX = /(^|[_-])dak-/;
var KNOWN_GOOGLE_SERVERS = [
  // VS Code extension remote servers (from constants.ts MCP_SERVICES)
  "datacloud_knowledge_catalog_remote",
  "datacloud_bigtable-admin_remote",
  "datacloud_bigtable-data_remote",
  "datacloud_bigquery_remote",
  "datacloud_dataproc_remote",
  "datacloud_cloud-sql_remote",
  "datacloud_spanner_remote",
  "datacloud_alloydb_remote",
  "datacloud_gcs_remote",
  // VS Code built-in servers
  "visualization",
  "notebooks",
  "notebook",
  // DAK plugin servers (from dak.ts / mcp.json)
  "dak-bigtable-data",
  "dak-notebook",
  "dak-bigquery",
  "dak-bigtable",
  "dak-cloudsql",
  "dak-alloydb",
  "dak-spanner",
  "dak-spark",
  "dak-viz",
  "dak-gcs",
  "dak-kc"
].sort((a, b) => b.length - a.length);
var VSCODE_MCP_SERVER_PREFIX_MAP = {
  // Notebooks & Visualization:
  "mcp_notebooks_": "notebooks",
  "mcp_visualization_": "visualization",
  // Databases (Official VS Code Extension):
  "mcp_datacloud_all_": "datacloud_alloydb",
  "mcp_datacloud_big_": "datacloud_bigquery",
  "mcp_datacloud_spa_": "datacloud_spanner",
  "mcp_datacloud_clo_": "datacloud_cloud-sql",
  "mcp_datacloud_dat_": "datacloud_dataproc",
  "mcp_datacloud_ser_": "datacloud_serverless-spark",
  "mcp_datacloud_kno_": "datacloud_knowledge_catalog",
  "mcp_datacloud_gcs_": "datacloud_gcs"
};
var McpParser = class {
  parseMcpInfo(payload) {
    if (isCursorPreToolUseMcpName(payload["tool_name"])) {
      return void 0;
    }
    return parsePayloadCursorMcp(payload) || parsePayloadGemini(payload) || parsePayloadVscodeChat(payload) || parsePayloadClaudeOrCodex(payload) || parsePayloadCopilotAgent(payload);
  }
};
function isCursorPreToolUseMcpName(toolName) {
  return typeof toolName === "string" && toolName.startsWith("MCP:");
}
function isGoogleMcpServer(serverName) {
  return DAK_MCP_SERVER_REGEX.test(serverName) || GOOGLE_MCP_SERVERS_REGEX.test(serverName);
}
function parsePayloadGemini(payload) {
  if (payload["toolCall"] && isRecord(payload["toolCall"])) {
    const toolCall = payload["toolCall"];
    if (toolCall["name"] === "call_mcp_tool") {
      if (toolCall["args"] && isRecord(toolCall["args"])) {
        const args = toolCall["args"];
        const serverName = args["ServerName"];
        const toolName = args["ToolName"];
        if (typeof serverName === "string" && serverName && typeof toolName === "string" && toolName) {
          return {
            serverName,
            toolName,
            isGoogleTool: isGoogleMcpServer(serverName)
          };
        }
      }
    }
  }
  return void 0;
}
function parsePayloadCursorMcp(payload) {
  const serverName = payload["mcp_server_name"];
  const toolName = payload["tool_name"];
  if (typeof serverName !== "string" || !serverName || typeof toolName !== "string" || !toolName) {
    return void 0;
  }
  return {
    serverName,
    toolName,
    isGoogleTool: isGoogleMcpServer(serverName)
  };
}
function parsePayloadVscodeChat(payload) {
  if (!("tool_name" in payload)) return void 0;
  const rawName = payload["tool_name"];
  if (typeof rawName !== "string" || !rawName.startsWith("mcp_")) {
    return void 0;
  }
  for (const [prefix, serverName] of Object.entries(
    VSCODE_MCP_SERVER_PREFIX_MAP
  )) {
    if (rawName.startsWith(prefix)) {
      const toolName = rawName.substring(prefix.length);
      if (toolName) {
        return {
          serverName,
          toolName,
          isGoogleTool: true
        };
      }
    }
  }
  return void 0;
}
function parsePayloadClaudeOrCodex(payload) {
  if ("tool_name" in payload) {
    const rawName = payload["tool_name"];
    if (typeof rawName === "string") {
      const parts = rawName.split("__");
      if (parts.length >= 2) {
        const serverName = parts[parts.length - 2];
        const toolName = parts[parts.length - 1];
        if (serverName && toolName) {
          return {
            serverName,
            toolName,
            isGoogleTool: isGoogleMcpServer(serverName)
          };
        }
      }
    }
  }
  return void 0;
}
function parsePayloadCopilotAgent(payload) {
  const rawName = payload["toolName"];
  if (typeof rawName !== "string") return void 0;
  for (const server of KNOWN_GOOGLE_SERVERS) {
    const token = `${server}-`;
    const idx = rawName.indexOf(token);
    if (idx === 0 || idx > 0 && (rawName[idx - 1] === "_" || rawName[idx - 1] === "-")) {
      const toolName = rawName.substring(idx + token.length);
      if (toolName) {
        return {
          serverName: server,
          toolName,
          isGoogleTool: true
        };
      }
    }
  }
  const sep = rawName.lastIndexOf("-");
  if (sep <= 0 || sep === rawName.length - 1) return void 0;
  const serverName = rawName.substring(0, sep);
  return {
    serverName,
    toolName: rawName.substring(sep + 1),
    isGoogleTool: isGoogleMcpServer(serverName)
  };
}
addProviders([{ key: McpParser, factory: () => new McpParser() }]);

// cloud/developer_experience/datacloud_vscode/agents/hooks/skill_parser.ts
var SKILL_FILE_REGEX = /[/\\]skills[/\\]([^/\\]+)[/\\]SKILL\.md$/i;
var ALLOWED_SKILLS = new InjectionKey(
  "cloud/developer_experience/datacloud_vscode/agents/hooks/skill_parser.ts:allowed-skills"
);
var SkillParser = class {
  fileSystem = inject(FS_DEPS);
  allowedSkills = inject(ALLOWED_SKILLS);
  /**
   * Parses the tool name and input to retrieve skill info if it is a skill file view.
   */
  parseSkillInfo(payload) {
    try {
      const toolArgs = extractToolArgs(payload);
      if (!toolArgs) {
        return void 0;
      }
      return this.parseSkillToolArgs(toolArgs) || this.parseCommandToolArgs(toolArgs) || this.parseFileToolArgs(toolArgs);
    } catch (e) {
      debugLog("Failed to parse skill info", e);
    }
    return void 0;
  }
  /**
   * Parses direct skill calls (e.g. from Claude Code Skill tool).
   *
   * Example payload from Claude Code (Skill tool):
   * {
   *   "tool_name": "Skill",
   *   "tool_input": {
   *     "skill": "dak:notebook_guidance"
   *   }
   * }
   *
   * Example payload from the Copilot agent runtime (bare skill id):
   * {
   *   "toolName": "skill",
   *   "toolArgs": {
   *     "skill": "bigquery-sql"
   *   }
   * }
   */
  parseSkillToolArgs(toolArgs) {
    const skillId = toolArgs["skill"] || toolArgs["command"];
    if (typeof skillId !== "string" || !skillId) {
      return void 0;
    }
    let rawSkillName;
    if (skillId.startsWith("dak:")) {
      rawSkillName = skillId.substring("dak:".length);
    } else if (typeof toolArgs["skill"] === "string" && !skillId.includes(":")) {
      rawSkillName = skillId;
    }
    if (!rawSkillName) {
      return void 0;
    }
    const skillName = rawSkillName.toLowerCase();
    return {
      skillName,
      isGooglePublisher: this.allowedSkills.has(skillName)
    };
  }
  /**
   * Parses commands that might contain skill file paths (e.g. from Bash tool).
   *
   * Example payload from Codex (Bash tool):
   * {
   *   "tool_name": "Bash",
   *   "tool_input": {
   *     "command": "cat /workspace/skills/analog/SKILL.md"
   *   }
   * }
   */
  parseCommandToolArgs(toolArgs) {
    if (typeof toolArgs["command"] === "string" && toolArgs["command"]) {
      const command = toolArgs["command"];
      const commandArgs = splitCommandArgs(command);
      const filePath = commandArgs.find((arg) => isSkillFile(arg));
      if (filePath) {
        return this.parseSkillFilePath(filePath);
      }
    }
    return void 0;
  }
  /**
   * Parses file access tools with filePath or AbsolutePath arguments.
   *
   * Example payload from Antigravity / Agy (CLI):
   * {
   *   "toolCall": {
   *     "name": "view_file",
   *     "args": {
   *       "AbsolutePath": "/workspace/skills/analog/SKILL.md"
   *     }
   *   }
   * }
   *
   * Example payload from IDE hosts:
   * {
   *   "tool_name": "read_file",
   *   "tool_input": {
   *     "filePath": "/workspace/skills/analog/SKILL.md"
   *   }
   * }
   *
   * Example payload from the Cursor agent (Read tool, snake_case key):
   * {
   *   "tool_name": "Read",
   *   "tool_input": {
   *     "file_path": "/Users/me/.cursor/skills/analog/SKILL.md"
   *   }
   * }
   */
  parseFileToolArgs(toolArgs) {
    const filePath = toolArgs["filePath"] || toolArgs["AbsolutePath"] || toolArgs["file_path"];
    if (typeof filePath === "string" && filePath) {
      return this.parseSkillFilePath(filePath);
    }
    return void 0;
  }
  /** Helper to verify a resolved skill file path and extract skill info. */
  parseSkillFilePath(filePath) {
    const skillName = getSkillName(filePath);
    if (skillName) {
      const isGooglePublisher = this.isGoogleSkillFile(filePath);
      return {
        skillName,
        isGooglePublisher
      };
    }
    return void 0;
  }
  /**
   * Checks if the skill file YAML frontmatter indicates a Google-published skill.
   * Specifically, it parses the YAML frontmatter block (enclosed in --- separators)
   * at the top of the markdown file and searches for a 'publisher' or 'producer'
   * key mapped to the case-insensitive value 'google' (optionally quoted).
   *
   * Example matching frontmatter:
   * ---
   * name: my_skill
   * publisher: google
   * ---
   */
  isGoogleSkillFile(filePath) {
    try {
      const skillName = getSkillName(filePath);
      if (!skillName || !this.allowedSkills.has(skillName)) {
        return false;
      }
      if (!this.fileSystem.existsSync(filePath)) {
        return false;
      }
      const content = this.fileSystem.readFileSync(filePath, "utf8");
      const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!match) {
        return false;
      }
      const frontmatter = match[1];
      return /^[ \t]*(publisher|producer)[ \t]*:[ \t]*['"]?google['"]?[ \t]*$/im.test(
        frontmatter
      );
    } catch (e) {
      debugLog("Failed to check if Google skill file", e);
      return false;
    }
  }
};
function isSkillFile(filePath) {
  return SKILL_FILE_REGEX.test(filePath);
}
function getSkillName(filePath) {
  const match = filePath.match(SKILL_FILE_REGEX);
  return match ? match[1].toLowerCase() : void 0;
}
function extractToolArgs(payload) {
  if (payload["toolCall"] && isRecord(payload["toolCall"])) {
    const toolCall = payload["toolCall"];
    if ("args" in toolCall) {
      return parseRecord(toolCall["args"]);
    }
  }
  if ("tool_input" in payload) {
    return parseRecord(payload["tool_input"]);
  }
  if ("toolArgs" in payload) {
    return parseRecord(payload["toolArgs"]);
  }
  return void 0;
}
function parseRecord(value) {
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (isRecord(parsed)) {
        return parsed;
      }
    } catch {
    }
  } else if (isRecord(value)) {
    return value;
  }
  return void 0;
}
function splitCommandArgs(command) {
  const args = [];
  let current = "";
  let inDoubleQuotes = false;
  let inSingleQuotes = false;
  for (let i = 0; i < command.length; i++) {
    const char = command[i];
    if (char === '"' && !inSingleQuotes) {
      inDoubleQuotes = !inDoubleQuotes;
    } else if (char === "'" && !inDoubleQuotes) {
      inSingleQuotes = !inSingleQuotes;
    } else if (char === " " && !inDoubleQuotes && !inSingleQuotes) {
      if (current) {
        args.push(current);
        current = "";
      }
    } else {
      current += char;
    }
  }
  if (current) {
    args.push(current);
  }
  return args;
}
addProviders([
  { key: ALLOWED_SKILLS, factory: () => ALLOWED_DATA_AGENT_SKILLS },
  { key: SkillParser, factory: () => new SkillParser() }
]);

// cloud/developer_experience/datacloud_vscode/agents/hooks/user_identity.ts
var crypto = __toESM(require("crypto"));
var path = __toESM(require("path"));
var UserIdentityResolver = class {
  execSync = inject(EXEC_SYNC_FN);
  fs = inject(FS_DEPS);
  os = inject(OS_DEPS);
  processEnv = inject(PROCESS_ENV);
  /**
   * Resolves the email address of the authenticated active Google Cloud account.
   *
   * Attempts to read Cloud Code's cached credentials.json file first.
   * Falls back to invoking the gcloud CLI if the cached file is unavailable.
   *
   * @return The active user email, or undefined if it cannot be resolved.
   */
  getGcloudEmail() {
    try {
      const authFolder = this.getGoogleCloudToolsAuthFolder();
      const credentialsPath = path.join(authFolder, "credentials.json");
      if (this.fs.existsSync(credentialsPath)) {
        const content = this.fs.readFileSync(credentialsPath, "utf8");
        const creds = JSON.parse(content);
        if (creds && typeof creds === "object" && typeof creds["email"] === "string" && creds["email"].trim()) {
          return creds["email"].trim();
        }
      }
    } catch (err) {
      debugLog("Failed to read cached credentials", err);
    }
    try {
      const gcloudAccount = this.execSync("gcloud config get-value account", {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"]
      }).trim();
      if (gcloudAccount) {
        return gcloudAccount;
      }
    } catch (err) {
      debugLog("Failed to get active account from gcloud", err);
    }
    return void 0;
  }
  /**
   * Resolves the persistent unique installation/device ID for the client.
   *
   * Reads the existing install_id.txt from the platform's standard AppData path,
   * or auto-generates a new UUID and persists it atomically if missing or empty.
   *
   * @return The unique installation ID.
   */
  getInstallId() {
    try {
      const appDataDir = this.getCloudCodeAppDataDir();
      const installIdPath = path.join(appDataDir, "install_id.txt");
      if (this.fs.existsSync(installIdPath)) {
        const id = this.fs.readFileSync(installIdPath, "utf8").trim();
        if (id) {
          return id;
        }
      }
      return this.generateAndPersistInstallId(appDataDir, installIdPath);
    } catch (err) {
      debugLog("Failed to read or create install ID", err);
    }
    return void 0;
  }
  /**
   * Generates a new install ID and persists it to install_id.txt atomically.
   *
   * This is a clean-room implementation of the lockless/atomic file creation pattern
   * used in the VS Code extension metrics client:
   * third_party/cloudcode/vscode/common/packages/metrics/install_session_id.ts
   *
   * We duplicate this logic rather than importing InstallSessionId directly to prevent
   * bundling third-party dependencies (like fs-extra and uuid) and avoid runtime crashes
   * in the raw Node.js background telemetry process.
   */
  generateAndPersistInstallId(appDataDir, installIdPath) {
    try {
      this.fs.mkdirSync(appDataDir, { recursive: true });
      const candidateInstall = crypto.randomUUID();
      const tmpFile = `${installIdPath}.${candidateInstall}.deleteme`;
      this.fs.writeFileSync(tmpFile, candidateInstall, { encoding: "utf8" });
      try {
        this.fs.linkSync(tmpFile, installIdPath);
        return candidateInstall;
      } catch (err) {
        const errCode = err?.["code"];
        if (errCode === "EEXIST") {
          if (this.fs.existsSync(installIdPath)) {
            const id = this.fs.readFileSync(installIdPath, "utf8").trim();
            if (id) {
              return id;
            }
          }
        }
        throw err;
      } finally {
        try {
          this.fs.unlinkSync(tmpFile);
        } catch (e) {
        }
      }
    } catch (err) {
      debugLog("Failed to generate or persist install ID", err);
    }
    return void 0;
  }
  /**
   * Resolves the user identity, returning the authenticated email address if
   * available, or falling back to the installation/device ID.
   *
   * @return An object containing resolved email or installId, or undefined if
   * neither is available.
   */
  resolveIdentity() {
    const email = this.getGcloudEmail();
    if (email) {
      return { email };
    }
    const installId = this.getInstallId();
    if (installId) {
      return { installId };
    }
    return void 0;
  }
  /**
   * Checks if telemetry is enabled by verifying the DO_NOT_TRACK environment
   * variable or ~/.data_agent_kit/config.json configuration.
   *
   * @return true if telemetry is enabled (default), false if opted-out.
   */
  isTelemetryEnabled() {
    try {
      const dnt = this.processEnv.env["DO_NOT_TRACK"];
      if (dnt === "1" || dnt === "true") {
        return false;
      }
      const home = this.os.homedir();
      const configPath = path.join(home, ".data_agent_kit", "config.json");
      const config = this.loadConfig(configPath);
      if (config["enableTelemetry"] === false) {
        return false;
      }
      return true;
    } catch (err) {
      debugLog(
        "Failed to check if telemetry is enabled. Defaulting to enabled",
        err
      );
      return true;
    }
  }
  loadConfig(configPath) {
    try {
      if (this.fs.existsSync(configPath)) {
        const content = this.fs.readFileSync(configPath, "utf8").trim();
        if (content) {
          const parsed = JSON.parse(content);
          if (isRecord(parsed)) {
            return parsed;
          }
        }
      }
    } catch (err) {
      debugLog(`Failed to read or parse config file at ${configPath}`, err);
    }
    return {};
  }
  /**
   * Resolves the base application data directory path based on operating system env.
   */
  getBaseAppDataDir(appFolderName) {
    const home = this.processEnv.env["HOME"] || this.os.homedir();
    switch (this.processEnv.platform) {
      case "linux":
        return path.join(home, ".cache", appFolderName);
      case "win32":
        return path.join(
          this.processEnv.env["LOCALAPPDATA"] || path.join(home, "AppData", "Local"),
          appFolderName
        );
      case "darwin":
        return path.join(home, "Library", "Application Support", appFolderName);
      default:
        return path.join(this.os.tmpdir(), appFolderName);
    }
  }
  /** Resolves the Google Cloud tools authentication storage directory name. */
  getGoogleCloudToolsAuthFolder() {
    return path.join(this.getBaseAppDataDir("google-cloud-tools"), "auth");
  }
  /** Resolves the Cloud Code AppData directory name. */
  getCloudCodeAppDataDir() {
    return this.getBaseAppDataDir("cloud-code");
  }
};
addProviders([
  { key: UserIdentityResolver, factory: () => new UserIdentityResolver() }
]);

// cloud/developer_experience/datacloud_vscode/agents/hooks/telemetry_hook.ts
var POST_METRICS_FN = new InjectionKey(
  "cloud/developer_experience/datacloud_vscode/agents/hooks/telemetry_hook.ts:post-metrics-fn"
);
var TelemetryHook = class {
  isLocalTelemetry = inject(IS_LOCAL_TELEMETRY);
  postMetrics = inject(POST_METRICS_FN);
  fileSystem = inject(FS_DEPS);
  identityResolver = inject(UserIdentityResolver);
  os = inject(OS_DEPS);
  processEnv = inject(PROCESS_ENV);
  skillParser = inject(SkillParser);
  mcpParser = inject(McpParser);
  /**
   * Performs the telemetry payload compilation and handles dispatch.
   */
  async executeTelemetry(rawPayload, agentName, installSource) {
    try {
      const payload = JSON.parse(rawPayload);
      let data = payload;
      if (payload["preToolHookArgs"] && isRecord(payload["preToolHookArgs"])) {
        data = payload["preToolHookArgs"];
      } else if (payload["toolHookArgs"] && isRecord(payload["toolHookArgs"])) {
        data = payload["toolHookArgs"];
      }
      if (this.shouldSkipTelemetryAndLock(rawPayload)) {
        return;
      }
      const skillInfo = this.skillParser.parseSkillInfo(data);
      const isGoogleSkill = skillInfo?.isGooglePublisher;
      const mcpInfo = this.mcpParser.parseMcpInfo(data);
      const isGoogleMcp = !!mcpInfo?.isGoogleTool;
      if (!isGoogleSkill && !isGoogleMcp) {
        debugLog(
          "Not a verified Google skill or Google MCP tool invocation. Telemetry skipped."
        );
        return;
      }
      const identity = this.identityResolver.resolveIdentity();
      if (!identity) {
        debugLog(
          "No user identity or installation ID detected. Telemetry skipped."
        );
        return;
      }
      const now = Date.now();
      const event = this.compileEvent(identity, now, {
        skill: isGoogleSkill ? skillInfo : void 0,
        mcp: isGoogleMcp ? mcpInfo : void 0,
        agentName,
        installSource
      });
      const firelogPayload = this.wrapInFirelogEnvelope(event, now);
      const postData = JSON.stringify(firelogPayload);
      debugLog(
        `Compiling payload: ${postData} (local: ${this.isLocalTelemetry})`
      );
      if (this.isLocalTelemetry) {
        this.writeToLocalLog(postData);
      } else {
        await this.postToConcord(postData);
      }
    } catch (err) {
      debugLog("Failed to compile telemetry payload", err);
    }
  }
  /** Compiles the inner Concord event payload. */
  compileEvent(identity, timestamp, info) {
    let eventName = "";
    const eventMetadata = [];
    if (info.skill) {
      eventName = "google.datacloud.skills.skill.invoke" /* SKILL_INVOKE */;
      eventMetadata.push({
        key: "skill_id" /* SKILL_ID */,
        value: info.skill.skillName
      });
    } else if (info.mcp) {
      eventName = "google.datacloud.mcp.tool.invoke" /* TOOL_INVOKE */;
      eventMetadata.push(
        { key: "mcpToolName" /* MCP_TOOL_NAME */, value: info.mcp.toolName },
        {
          key: "mcpServerName" /* MCP_SERVER_NAME */,
          value: info.mcp.serverName
        }
      );
    }
    if (info.agentName) {
      eventMetadata.push({
        key: "agent_runtime" /* AGENT_RUNTIME */,
        value: info.agentName
      });
    }
    if (info.installSource) {
      eventMetadata.push({
        key: "hook_install_source" /* HOOK_INSTALL_SOURCE */,
        value: info.installSource
      });
    }
    eventMetadata.push({
      key: "editor_name",
      value: this.getEditorName()
    });
    eventMetadata.push(
      { key: "ext_name", value: EXT_NAME },
      { key: "ext_version", value: EXT_VERSION },
      { key: "os_platform", value: this.processEnv.platform },
      { key: "arch_platform", value: this.processEnv.arch },
      { key: "os_release", value: this.os.release() }
    );
    const buildDate = new Date(BUILD_TIMESTAMP * 1e3);
    const builtOn = BUILD_TIMESTAMP > 0 ? buildDate.toISOString() : "UNKNOWN_BUILD_DATE";
    eventMetadata.push(
      { key: "change_list", value: BUILD_CHANGELIST },
      { key: "built_on", value: builtOn }
    );
    const isCloudWorkstations = !!this.processEnv.env["GOOGLE_CLOUD_WORKSTATIONS"];
    const isCloudShell = this.processEnv.env["EDITOR_IN_CLOUD_SHELL"] === "true";
    eventMetadata.push(
      {
        key: "is_cloud_workstations",
        value: isCloudWorkstations.toString()
      },
      {
        key: "is_cloud_shell",
        value: isCloudShell.toString()
      }
    );
    const event = {
      "console_type": "CLOUDCODE_VSCODE",
      "event_name": eventName,
      "environment": this.isLocalTelemetry ? "DEV" : "PROD",
      "event_metadata": eventMetadata
    };
    if (identity.email) {
      event["client_email"] = identity.email;
    } else {
      event["client_install_id"] = identity.installId;
    }
    return event;
  }
  ensureTelemetryDir() {
    const telemetryDir = path2.join(this.os.tmpdir(), "datacloud_telemetry");
    try {
      if (!this.fileSystem.existsSync(telemetryDir)) {
        this.fileSystem.mkdirSync(telemetryDir, { recursive: true });
      }
    } catch (e) {
      debugLog(`Failed to create telemetry directory: ${e}`);
    }
    return telemetryDir;
  }
  shouldSkipTelemetryAndLock(rawPayload) {
    const baseDir = this.ensureTelemetryDir();
    const payloadHash = crypto2.createHash("md5").update(rawPayload).digest("hex");
    const lockPath = path2.join(baseDir, `${payloadHash}.lock`);
    const now = Date.now();
    const thresholdMs = 5e3;
    if (this.fileSystem.existsSync(lockPath)) {
      try {
        const content = this.fileSystem.readFileSync(lockPath, "utf8").trim();
        const lastTime = Number(content);
        if (!isNaN(lastTime) && now - lastTime < thresholdMs) {
          debugLog(
            "Telemetry already executed recently for this payload. Skipping."
          );
          return true;
        }
      } catch (e) {
        debugLog(`Failed to read lock file: ${e}`);
      }
    }
    try {
      this.fileSystem.writeFileSync(lockPath, String(now), { encoding: "utf8" });
    } catch (e) {
      debugLog(`Failed to write lock file: ${e}`);
    }
    return false;
  }
  /** Wraps the event inside a Firelog envelope. */
  wrapInFirelogEnvelope(event, timestamp) {
    return {
      "client_info": {
        "client_type": "DESKTOP",
        "desktop_client_info": { "os": this.processEnv.platform }
      },
      "log_source_name": "CONCORD",
      "request_time_ms": timestamp,
      "log_event": [
        {
          "event_time_ms": timestamp,
          "source_extension_json": JSON.stringify(event)
        }
      ]
    };
  }
  /** Writes the compiled payload to the local file path. */
  writeToLocalLog(postData) {
    debugLog(
      "[LOCAL ONLY] Intercepted telemetry event. Writing to local log..."
    );
    const localLogPath = path2.join(this.ensureTelemetryDir(), "local_log.json");
    try {
      this.fileSystem.appendFileSync(localLogPath, postData + "\n", "utf8");
    } catch (err) {
      debugLog("Failed to write local log", err);
    }
  }
  /** Posts the compiled payload to the Concord server. */
  async postToConcord(postData) {
    try {
      const res = await this.postMetrics(postData);
      debugLog(`Post completed. Next request wait: ${res.nextRequestWaitMs}ms`);
    } catch (err) {
      debugLog("Post failed", err);
    }
  }
  getEditorName() {
    const currentIdeName = this.processEnv.env["DATA_CLOUD_CURR_IDE_NAME"];
    if (currentIdeName) {
      return currentIdeName;
    }
    if (this.processEnv.env["AI_AGENT"] === "github_copilot_vscode_agent") {
      return "visualstudiocode";
    }
    if (this.processEnv.env["ANTIGRAVITY_EDITOR_APP_ROOT"]) {
      return "antigravityide";
    }
    if (this.processEnv.env["CURSOR_VERSION"]) {
      return "cursor";
    }
    return "cli";
  }
};
addProviders([
  { key: POST_METRICS_FN, factory: () => postMetricsToConcordServer },
  { key: TelemetryHook, factory: () => new TelemetryHook() }
]);

// cloud/developer_experience/datacloud_vscode/agents/hooks/hook_spawner.ts
var HookSpawner = class {
  spawnFn = inject(SPAWN_FN);
  processEnv = inject(PROCESS_ENV);
  telemetryHook = inject(TelemetryHook);
  fsDeps = inject(FS_DEPS);
  identityResolver = inject(UserIdentityResolver);
  async spawnHook() {
    const args = this.processEnv.argv;
    const agentName = getArg(args, "--agent_name");
    const installSource = getArg(args, "--install_source");
    if (!this.identityResolver.isTelemetryEnabled()) {
      debugLog("Telemetry is disabled by user configuration. Exiting early.");
      this.writeAndExit(agentName);
      return;
    }
    const rawPayload = getArg(args, "--background");
    if (rawPayload !== void 0) {
      await this.runBackground(rawPayload, agentName, installSource);
      return;
    }
    this.runMain(args[1], agentName, installSource);
    this.writeAndExit(agentName);
  }
  writeAndExit(agentName) {
    const stdout = getAllowOutput(agentName);
    this.processEnv.stdout.write(stdout);
    this.processEnv.exit(0);
  }
  /** Runs the background telemetry compilation and post execution. */
  async runBackground(rawPayload, agentName, installSource) {
    if (!rawPayload) {
      debugLog("Missing background payload argument.");
      return;
    }
    try {
      debugLog(
        `Running in background child process (agent: ${agentName}, source: ${installSource})...`
      );
      await this.telemetryHook.executeTelemetry(
        rawPayload,
        agentName,
        installSource
      );
    } catch (err) {
      debugLog("Background execution error", err);
    }
  }
  /** Spawns the detached background telemetry process from the main process. */
  runMain(scriptPath, agentName, installSource) {
    try {
      debugLog("Running in main hook process...");
      const inputStr = this.fsDeps.readFileSync(0, "utf8").trim();
      if (inputStr) {
        debugLog("Spawning detached background process...");
        const spawnArgs = [scriptPath, "--background", inputStr];
        if (agentName) {
          spawnArgs.push("--agent_name", agentName);
        }
        if (installSource) {
          spawnArgs.push("--install_source", installSource);
        }
        const child = this.spawnFn(this.processEnv.execPath, spawnArgs, {
          detached: true,
          stdio: "ignore"
        });
        child.unref();
        debugLog("Background process spawned and unreferenced.");
      }
    } catch (err) {
      debugLog("Failed to spawn background process", err);
    }
  }
};
function getAllowOutput(agentName) {
  if (agentName === "cursor") {
    return JSON.stringify({ permission: "allow" });
  }
  if (agentName === "copilot" || agentName === "claude" || agentName === "codex") {
    return JSON.stringify({});
  }
  return JSON.stringify({ decision: "allow" });
}
function getArg(args, flag) {
  const index = args.indexOf(flag);
  if (index !== -1 && index + 1 < args.length) {
    return args[index + 1];
  }
  return void 0;
}
addProviders([{ key: HookSpawner, factory: () => new HookSpawner() }]);

// cloud/developer_experience/datacloud_vscode/agents/hooks/telemetry_hook_local.ts
setupCommonProviders({ isLocalTelemetry: true });
inject(HookSpawner).spawnHook();
