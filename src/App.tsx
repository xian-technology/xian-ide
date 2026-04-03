import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import {
  Play, Upload, Search, Plus, X, Trash2, Terminal, Code2,
  Wallet, Eye, FileCode, Plug, Braces
} from "lucide-react";
import { useIDE } from "./hooks/useIDE";
import { TEMPLATES } from "./lib/contract-templates";
import "./styles/ide.css";

export default function App() {
  const ide = useIDE();
  const [bottomTab, setBottomTab] = useState<"console" | "interact">("console");
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [networkInput, setNetworkInput] = useState(ide.networkUrl);
  const [contractInput, setContractInput] = useState("");
  const [deployName, setDeployName] = useState("");
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll console
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ide.console]);

  // ── Sidebar ─────────────────────────────────────────────────

  const sidebar = (
    <div className="ide-sidebar">
      {/* Files */}
      <div className="sidebar-section" style={{ flex: 1, overflow: "auto" }}>
        <div className="sidebar-header">
          <span>Files</span>
          <div className="btn-row">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                className="ide-btn ide-btn-ghost ide-btn-icon"
                title={`New ${t.name}`}
                onClick={() => ide.createFile(`${t.id}.py`, t.code)}
              >
                <Plus size={14} />
              </button>
            ))}
          </div>
        </div>
        <div className="sidebar-content">
          {ide.files.length === 0 && (
            <div style={{ color: "var(--muted)", fontSize: 12, padding: "8px 4px" }}>
              No files open. Create one or load from chain.
            </div>
          )}
          {ide.files.map((f) => (
            <div
              key={f.id}
              className={`file-item ${ide.activeFileId === f.id ? "active" : ""}`}
              onClick={() => ide.setActiveFileId(f.id)}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <FileCode size={14} />
                {f.name}
                {f.dirty && <span className="dirty-dot" />}
              </span>
              <span className="file-item-close" onClick={(e) => { e.stopPropagation(); ide.closeFile(f.id); }}>
                <X size={12} />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Load from chain */}
      <div className="sidebar-section">
        <div className="sidebar-header">Load from Chain</div>
        <div className="sidebar-content">
          <div className="field-group">
            <input
              className="ide-input ide-input-mono"
              placeholder="contract_name"
              value={contractInput}
              onChange={(e) => setContractInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && contractInput.trim()) {
                  ide.loadContractFromChain(contractInput.trim());
                  setContractInput("");
                }
              }}
            />
            <div className="btn-row">
              <button
                className="ide-btn ide-btn-secondary ide-btn-sm"
                style={{ flex: 1 }}
                disabled={!contractInput.trim()}
                onClick={() => {
                  ide.loadContractFromChain(contractInput.trim());
                  setContractInput("");
                }}
              >
                <Code2 size={12} /> Source
              </button>
              <button
                className="ide-btn ide-btn-secondary ide-btn-sm"
                style={{ flex: 1 }}
                disabled={!contractInput.trim()}
                onClick={() => ide.loadContractMethods(contractInput.trim())}
              >
                <Braces size={12} /> Methods
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Deploy */}
      <div className="sidebar-section">
        <div className="sidebar-header">Deploy</div>
        <div className="sidebar-content">
          <div className="field-group">
            <input
              className="ide-input ide-input-mono"
              placeholder="contract_name"
              value={deployName}
              onChange={(e) => setDeployName(e.target.value)}
            />
            <button
              className="ide-btn ide-btn-primary ide-btn-sm"
              disabled={!ide.activeFile || !deployName.trim() || ide.deploying || !ide.walletConnected}
              onClick={() => {
                if (ide.activeFile) {
                  ide.deployContract(deployName.trim(), ide.activeFile.code);
                }
              }}
            >
              <Upload size={12} />
              {ide.deploying ? "Deploying..." : "Deploy Contract"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Editor area ─────────────────────────────────────────────

  const editorArea = (
    <div className="ide-main">
      {/* Tabs */}
      <div className="editor-tabs">
        {ide.files.map((f) => (
          <div
            key={f.id}
            className={`editor-tab ${ide.activeFileId === f.id ? "active" : ""}`}
            onClick={() => ide.setActiveFileId(f.id)}
          >
            {f.dirty && <span className="dirty-dot" />}
            {f.name}
            <span
              style={{ cursor: "pointer", opacity: 0.5, marginLeft: 4 }}
              onClick={(e) => { e.stopPropagation(); ide.closeFile(f.id); }}
            >
              <X size={11} />
            </span>
          </div>
        ))}
      </div>

      {/* Editor */}
      <div className="editor-area">
        {ide.activeFile ? (
          <Editor
            theme="vs-dark"
            language="python"
            value={ide.activeFile.code}
            onChange={(val) => {
              if (val !== undefined && ide.activeFileId) {
                ide.updateFileCode(ide.activeFileId, val);
              }
            }}
            options={{
              fontSize: 14,
              fontFamily: "var(--font-mono)",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              padding: { top: 12 },
              lineNumbers: "on",
              renderLineHighlight: "line",
              bracketPairColorization: { enabled: true },
              tabSize: 4,
              insertSpaces: true,
              wordWrap: "on",
            }}
          />
        ) : (
          <div className="empty-state">
            <Code2 size={48} strokeWidth={1.2} />
            <h2>Xian Contract IDE</h2>
            <p>Create a new contract from a template, or load an existing contract from the chain.</p>
            <div className="template-grid">
              {TEMPLATES.map((t) => (
                <div
                  key={t.id}
                  className="template-card"
                  onClick={() => ide.createFile(`${t.id}.py`, t.code)}
                >
                  {t.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ── Right panel ─────────────────────────────────────────────

  const rightPanel = (
    <div className="ide-right">
      {/* Contract interaction */}
      {ide.explorerContract && ide.loadedMethods.length > 0 && (
        <div className="right-section">
          <div className="right-section-title">
            {ide.explorerContract} — Functions
          </div>
          {ide.loadedMethods.map((method) => (
            <MethodCard
              key={method.name}
              contract={ide.explorerContract}
              method={method}
              onSimulate={ide.simulateCall}
              onExecute={ide.executeFunction}
              simulating={ide.simulating}
              walletConnected={ide.walletConnected}
            />
          ))}
        </div>
      )}

      {/* State query */}
      <div className="right-section">
        <div className="right-section-title">Query State</div>
        <StateQuery onQuery={ide.queryState} />
      </div>

      {/* Variables */}
      {ide.loadedVars.length > 0 && (
        <div className="right-section">
          <div className="right-section-title">Variables</div>
          {ide.loadedVars.map((v) => (
            <div
              key={v}
              style={{
                fontSize: 12,
                fontFamily: "var(--font-mono)",
                color: "var(--muted)",
                padding: "3px 0",
                cursor: "pointer",
              }}
              onClick={() => ide.queryState(`${ide.explorerContract}.${v}`)}
            >
              {v}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── Bottom panel ────────────────────────────────────────────

  const bottomPanel = (
    <div className="ide-bottom">
      <div className="bottom-tabs">
        <div
          className={`bottom-tab ${bottomTab === "console" ? "active" : ""}`}
          onClick={() => setBottomTab("console")}
        >
          <Terminal size={12} style={{ display: "inline", marginRight: 4, verticalAlign: -1 }} />
          Console
        </div>
        <div style={{ flex: 1 }} />
        <button className="ide-btn ide-btn-ghost ide-btn-sm" onClick={ide.clearConsole}>
          <Trash2 size={11} /> Clear
        </button>
      </div>
      <div className="bottom-content">
        {ide.console.map((entry) => (
          <div key={entry.id} className="console-entry">
            <span className="console-time">
              {new Date(entry.timestamp).toLocaleTimeString()}
            </span>
            <span className={`console-msg ${entry.type}`}>{entry.message}</span>
          </div>
        ))}
        <div ref={consoleEndRef} />
      </div>
    </div>
  );

  // ── Header ──────────────────────────────────────────────────

  return (
    <div className="ide-root">
      <header className="ide-header">
        <div className="ide-header-left">
          <span className="ide-brand">Xian IDE</span>
        </div>
        <div className="ide-header-right">
          {/* Network */}
          <div
            className="status-badge"
            style={{ cursor: "pointer" }}
            onClick={() => setShowNetworkModal(!showNetworkModal)}
          >
            <span className={`status-dot ${ide.networkOnline ? "online" : "offline"}`} />
            {ide.networkUrl.replace(/^https?:\/\//, "").replace(/:\d+$/, "")}
          </div>

          {/* Wallet */}
          {ide.walletConnected ? (
            <div className="status-badge" style={{ cursor: "pointer" }} onClick={ide.disconnectWallet}>
              <Wallet size={12} />
              {ide.walletAccount?.slice(0, 6)}...{ide.walletAccount?.slice(-4)}
            </div>
          ) : (
            <button className="ide-btn ide-btn-primary ide-btn-sm" onClick={ide.connectWallet}>
              <Plug size={12} /> Connect Wallet
            </button>
          )}
        </div>
      </header>

      {/* Network modal */}
      {showNetworkModal && (
        <div style={{
          position: "absolute", top: 48, right: 16, zIndex: 100,
          background: "var(--bg-2)", border: "1px solid var(--line)",
          borderRadius: 8, padding: 12, width: 300, boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        }}>
          <div className="field-group">
            <div className="field-label">RPC URL</div>
            <input
              className="ide-input ide-input-mono"
              value={networkInput}
              onChange={(e) => setNetworkInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  ide.changeNetwork(networkInput);
                  setShowNetworkModal(false);
                }
              }}
            />
            <button
              className="ide-btn ide-btn-primary ide-btn-sm"
              onClick={() => { ide.changeNetwork(networkInput); setShowNetworkModal(false); }}
            >
              Connect
            </button>
          </div>
        </div>
      )}

      <div className="ide-body">
        {sidebar}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            {editorArea}
            {rightPanel}
          </div>
          {bottomPanel}
        </div>
      </div>
    </div>
  );
}

// ── Method Card Component ─────────────────────────────────────

function MethodCard({
  contract,
  method,
  onSimulate,
  onExecute,
  simulating,
  walletConnected,
}: {
  contract: string;
  method: { name: string; arguments: Array<{ name: string; type: string }> };
  onSimulate: (c: string, f: string, kw: Record<string, unknown>) => Promise<unknown>;
  onExecute: (c: string, f: string, kw: Record<string, unknown>) => Promise<void>;
  simulating: boolean;
  walletConnected: boolean;
}) {
  const [args, setArgs] = useState<Record<string, string>>({});

  const buildKwargs = (): Record<string, unknown> => {
    const kw: Record<string, unknown> = {};
    for (const arg of method.arguments) {
      const val = args[arg.name] ?? "";
      if (!val) continue;
      switch (arg.type) {
        case "int": kw[arg.name] = parseInt(val, 10); break;
        case "float": kw[arg.name] = parseFloat(val); break;
        case "bool": kw[arg.name] = val === "true"; break;
        case "dict": case "list":
          try { kw[arg.name] = JSON.parse(val); } catch { kw[arg.name] = val; }
          break;
        default: kw[arg.name] = val;
      }
    }
    return kw;
  };

  return (
    <div className="method-card">
      <div className="method-name">{method.name}</div>
      <div className="method-args">
        {method.arguments.map((arg) => (
          <div key={arg.name} className="method-arg-row">
            <span className="method-arg-label">{arg.name}:</span>
            <input
              className="method-arg-input"
              placeholder={arg.type}
              value={args[arg.name] ?? ""}
              onChange={(e) => setArgs({ ...args, [arg.name]: e.target.value })}
            />
          </div>
        ))}
      </div>
      <div className="btn-row" style={{ marginTop: 8 }}>
        <button
          className="ide-btn ide-btn-secondary ide-btn-sm"
          disabled={simulating || !walletConnected}
          onClick={() => onSimulate(contract, method.name, buildKwargs())}
        >
          <Eye size={11} /> Simulate
        </button>
        <button
          className="ide-btn ide-btn-primary ide-btn-sm"
          disabled={!walletConnected}
          onClick={() => onExecute(contract, method.name, buildKwargs())}
        >
          <Play size={11} /> Execute
        </button>
      </div>
    </div>
  );
}

// ── State Query Component ─────────────────────────────────────

function StateQuery({ onQuery }: { onQuery: (key: string) => Promise<unknown> }) {
  const [key, setKey] = useState("");

  return (
    <div className="field-group">
      <input
        className="ide-input ide-input-mono"
        placeholder="contract.variable:key"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && key.trim()) {
            onQuery(key.trim());
          }
        }}
      />
      <button
        className="ide-btn ide-btn-secondary ide-btn-sm"
        disabled={!key.trim()}
        onClick={() => onQuery(key.trim())}
      >
        <Search size={11} /> Query
      </button>
    </div>
  );
}
