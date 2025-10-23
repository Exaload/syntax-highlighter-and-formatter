const SyntaxFormatter = (() => {
    const defaultConfig = {
        languages: {
            js: {
                indentSize: 4,
                theme: {
                    keyword: { color: "#ff6188", fontWeight: "600" },
                    string: { color: "#ffd866" },
                    comment: { color: "#727072", fontStyle: "italic" },
                    number: { color: "#ab9df2" },
                    function: { color: "#78dce8" },
                    operator: { color: "#fc9867" },
                    punctuation: { color: "#fcfcfa" },
                    plain: { color: "#fcfcfa" }
                }
            },
            css: {
                indentSize: 4,
                theme: {
                    keyword: { color: "#78dce8", fontWeight: "600" },
                    selector: { color: "#ff6188", fontWeight: "600" },
                    string: { color: "#ffd866" },
                    comment: { color: "#727072", fontStyle: "italic" },
                    number: { color: "#ab9df2" },
                    punctuation: { color: "#fcfcfa" },
                    property: { color: "#a9dc76" },
                    plain: { color: "#fcfcfa" }
                }
            },
            html: {
                indentSize: 2,
                theme: {
                    tag: { color: "#78dce8", fontWeight: "600" },
                    attribute: { color: "#a9dc76" },
                    string: { color: "#ffd866" },
                    comment: { color: "#727072", fontStyle: "italic" },
                    punctuation: { color: "#ff6188" },
                    plain: { color: "#fcfcfa" }
                }
            },
            python: {
                indentSize: 4,
                theme: {
                    keyword: { color: "#ff6188", fontWeight: "600" },
                    builtin: { color: "#78dce8" },
                    string: { color: "#ffd866" },
                    comment: { color: "#727072", fontStyle: "italic" },
                    number: { color: "#ab9df2" },
                    operator: { color: "#fc9867" },
                    plain: { color: "#fcfcfa" }
                }
            }
        }
    };

    const tokenRules = {
        js: [
            { type: "comment", regex: /\/\/.*?(?=\n|$)|\/\*[\s\S]*?\*\//g },
            { type: "string", regex: /(["'`])(?:\\.|(?!\1)[^\\])*\1/g },
            { type: "number", regex: /\b(?:0x[\da-f]+|\d*\.\d+|\d+)\b/gi },
            { type: "keyword", regex: /\b(?:const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|try|catch|finally|throw|class|extends|super|import|from|export|default|async|await|yield|in|of|instanceof|typeof|void|delete|this)\b/g },
            { type: "function", regex: /\b[a-z_$][\w$]*(?=\s*\()/gi },
            { type: "operator", regex: /[+\-*\/%=<>!|&^~?:]+/g },
            { type: "punctuation", regex: /[{}()[\].,;]/g }
        ],
        css: [
            { type: "comment", regex: /\/\*[\s\S]*?\*\//g },
            { type: "string", regex: /(["'])(?:\\.|(?!\1)[^\\])*\1/g },
            { type: "number", regex: /\b(?:\d*\.\d+|\d+)(?:px|em|rem|vh|vw|%)?\b/gi },
            { type: "keyword", regex: /\b(?:@media|@supports|@keyframes|from|to|and|not|only)\b/g },
            { type: "selector", regex: /(?<=^|\}|\s)([#.]?[a-z0-9_-]+)(?=\s*[,{])/gi },
            { type: "property", regex: /[a-z-]+(?=\s*:)/gi },
            { type: "punctuation", regex: /[{}()[\].,;]/g }
        ],
        html: [
            { type: "comment", regex: /<!--[\s\S]*?-->/g },
            { type: "string", regex: /"[^"]*"|'[^']*'/g },
            { type: "attribute", regex: /\b[a-zA-Z:-]+(?==)/g },
            { type: "tag", regex: /<\/?\b[a-zA-Z][\w:-]*/g },
            { type: "punctuation", regex: /[\/<>=]/g }
        ],
        python: [
            { type: "comment", regex: /#.*/g },
            { type: "string", regex: /(?:[bru]|br|rb)?("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/gi },
            { type: "number", regex: /\b(?:0x[\da-f]+|\d*\.\d+|\d+)(?:j)?\b/gi },
            { type: "keyword", regex: /\b(?:def|class|return|if|elif|else|for|while|try|except|finally|with|as|lambda|import|from|pass|break|continue|and|or|not|in|is|True|False|None|yield|async|await|global|nonlocal|raise|del)\b/g },
            { type: "builtin", regex: /\b(?:print|len|range|dict|list|set|tuple|int|float|str|bool|enumerate|zip|map|filter|any|all|sum|open)\b/g },
            { type: "operator", regex: /[+\-*\/%=<>!|&^~?:]+/g }
        ]
    };

    const baseCss = `
.sf-block {
    position: relative;
    display: flex;
    margin: 1rem 0;
    padding: 1.5rem;
    border-radius: 0.75rem;
    background: #1d1f27;
    color: #fcfcfa;
    overflow: auto;
    font-family: "Fira Code", "JetBrains Mono", Consolas, monospace;
    font-size: 0.95rem;
    line-height: 1.6;
    box-shadow: 0 22px 45px rgba(8, 13, 32, 0.22);
    animation: sf-slide-in 240ms ease-out;
    transition: transform 220ms ease, box-shadow 220ms ease;
}

.sf-block:hover {
    transform: translateY(-4px);
    box-shadow: 0 28px 55px rgba(8, 13, 32, 0.28);
}

.sf-token {
    transition: color 180ms ease, font-weight 180ms ease, font-style 180ms ease;
}

.sf-lineno {
    flex-shrink: 0;
    width: 3rem;
    text-align: right;
    color: rgba(252, 252, 250, 0.32);
    user-select: none;
    padding-right: 1rem;
    border-right: 1px solid rgba(252, 252, 250, 0.1);
}

.sf-lineno div {
    line-height: 1.6;
}

.sf-code {
    flex: 1;
    padding-left: 1rem;
    overflow-x: auto;
}

.sf-line {
    line-height: 1.6;
    white-space: pre;
    min-height: 1.6em;
}

@keyframes sf-slide-in {
    from {
        opacity: 0;
        transform: translateY(12px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
`;

    class SyntaxFormatterCore {
        constructor(userConfig = {}) {
            this.config = deepMerge(defaultConfig, userConfig);
            this.styleElement = null;
            this.ensureStyle();
        }

        ensureStyle() {
            if (this.styleElement) {
                this.styleElement.remove();
            }
            const style = document.createElement("style");
            style.setAttribute("data-syntax-formatter", "true");
            style.textContent = baseCss + buildThemeCss(this.config.languages);
            document.head.appendChild(style);
            this.styleElement = style;
        }

        updateConfig(userConfig = {}) {
            this.config = deepMerge(this.config, userConfig);
            this.ensureStyle();
        }

        format(code, language) {
            const lang = normalizeLang(language);
            const indentSize = this.getIndentSize(lang);
            const clean = normalizeNewlines(code);
            if (lang === "html") {
                return formatHtml(clean, indentSize);
            }
            if (lang === "css") {
                return formatBraces(clean, indentSize, { colonSplit: true });
            }
            if (lang === "js" || lang === "javascript") {
                return formatBraces(clean, indentSize, { colonSplit: false });
            }
            if (lang === "python") {
                return formatPython(clean, indentSize);
            }
            return formatBraces(clean, indentSize, { colonSplit: false });
        }

        highlight(code, language) {
            const lang = normalizeLang(language);
            const rules = tokenRules[lang] || [];
            const tokens = buildTokens(normalizeNewlines(code), rules);
            const fragment = document.createDocumentFragment();
            tokens.forEach(token => {
                const elem = buildSpanElement(token, lang);
                fragment.appendChild(elem);
            });
            return fragment;
        }

        formatAndHighlight(code, language) {
            const formatted = this.format(code, language);
            const fragment = this.highlight(formatted, language);
            const temp = document.createElement("div");
            temp.appendChild(fragment);
            return temp.innerHTML;
        }

        render(target, code, language) {
            if (!target) {
                throw new Error("render target required");
            }
            const lang = normalizeLang(language);
            const formatted = this.format(code, lang);
            const lines = formatted.split("\n");
            
            const wrapper = document.createElement("div");
            wrapper.className = "sf-block";
            wrapper.dataset.lang = lang;

            const lineNumbers = document.createElement("div");
            lineNumbers.className = "sf-lineno";
            lines.forEach((_, idx) => {
                const num = document.createElement("div");
                num.textContent = (idx + 1).toString();
                lineNumbers.appendChild(num);
            });

            const codeContainer = document.createElement("div");
            codeContainer.className = "sf-code";
            
            lines.forEach(line => {
                const lineDiv = document.createElement("div");
                lineDiv.className = "sf-line";
                const rules = tokenRules[lang] || [];
                const tokens = buildTokens(line, rules);
                tokens.forEach(token => {
                    const elem = buildSpanElement(token, lang);
                    lineDiv.appendChild(elem);
                });
                codeContainer.appendChild(lineDiv);
            });

            wrapper.appendChild(lineNumbers);
            wrapper.appendChild(codeContainer);
            target.innerHTML = "";
            target.appendChild(wrapper);
        }

        getIndentSize(lang) {
            const langCfg = this.config.languages[lang];
            return langCfg && langCfg.indentSize ? langCfg.indentSize : 4;
        }
    }



    function buildSpanElement(token, lang) {
        if (token.type === "plain") {
            return document.createTextNode(token.value);
        }
        const span = document.createElement("span");
        span.className = `sf-token sf-token-${token.type}`;
        span.dataset.lang = lang;
        span.textContent = token.value;
        return span;
    }

    function buildTokens(source, rules) {
        if (!rules.length) {
            return [{ type: "plain", value: source }];
        }
        const matches = [];
        rules.forEach((rule, idx) => {
            const regex = cloneRegex(rule.regex);
            let hit;
            while ((hit = regex.exec(source)) !== null) {
                matches.push({
                    start: hit.index,
                    end: regex.lastIndex,
                    value: hit[0],
                    type: rule.type,
                    order: idx
                });
                if (hit.index === regex.lastIndex) {
                    regex.lastIndex += 1;
                }
            }
        });
        matches.sort((a, b) => {
            if (a.start !== b.start) {
                return a.start - b.start;
            }
            if (a.end !== b.end) {
                return b.end - a.end;
            }
            return a.order - b.order;
        });
        const merged = [];
        let cursor = 0;
        matches.forEach(match => {
            if (match.start < cursor) {
                return;
            }
            if (match.start > cursor) {
                merged.push({
                    type: "plain",
                    value: source.slice(cursor, match.start)
                });
            }
            merged.push({ type: match.type, value: match.value });
            cursor = match.end;
        });
        if (cursor < source.length) {
            merged.push({ type: "plain", value: source.slice(cursor) });
        }
        return merged;
    }

    function buildThemeCss(languages) {
        let css = "";
        Object.keys(languages).forEach(lang => {
            const theme = languages[lang].theme || {};
            Object.keys(theme).forEach(tokenType => {
                const styleObj = theme[tokenType];
                const declarations = styleToCss(styleObj);
                if (!declarations) {
                    return;
                }
                css += `.sf-block[data-lang="${lang}"] .sf-token-${tokenType} { ${declarations} }\n`;
            });
        });
        return css;
    }

    function styleToCss(styleObj) {
        if (!styleObj) {
            return "";
        }
        const parts = [];
        Object.entries(styleObj).forEach(([key, value]) => {
            if (value === undefined || value === null || value === "") {
                return;
            }
            parts.push(`${camelToKebab(key)}: ${value}`);
        });
        return parts.join("; ");
    }

    function camelToKebab(input) {
        return input.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
    }

    function cloneRegex(regex) {
        const flags = (regex.flags || "").includes("g") ? regex.flags : `${regex.flags || ""}g`;
        return new RegExp(regex.source || regex, flags);
    }



    function normalizeLang(language) {
        if (!language) {
            return "js";
        }
        const lower = language.toLowerCase();
        if (lower === "javascript") {
            return "js";
        }
        return lower;
    }

    function normalizeNewlines(code) {
        return code.replace(/\r\n?/g, "\n");
    }



    function formatBraces(code, indentSize, opts) {
        const lines = normalizeNewlines(code).split("\n");
        const result = [];
        let level = 0;
        
        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) {
                result.push("");
                return;
            }
            
            const openCount = (trimmed.match(/[{[(]/g) || []).length;
            const closeCount = (trimmed.match(/[}\])]/g) || []).length;
            const startsWithClose = /^[}\])]/.test(trimmed);
            
            if (startsWithClose) {
                level = Math.max(0, level - 1);
            }
            
            const spaces = " ".repeat(level * indentSize);
            result.push(spaces + trimmed);
            
            level += openCount - closeCount;
            level = Math.max(0, level);
        });
        
        return result.join("\n");
    }



    function formatHtml(code, indentSize) {
        const normalized = code
            .replace(/>\s*</g, ">\n<")
            .replace(/\s+\n/g, "\n")
            .trim();
        const lines = normalized.split("\n");
        const result = [];
        let level = 0;
        
        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) {
                return;
            }
            
            const isClosing = /^<\//.test(trimmed);
            const isSelfClosing = /\/>$/.test(trimmed);
            const isOpening = /^<[^!?\/]/.test(trimmed) && !isSelfClosing;
            
            if (isClosing) {
                level = Math.max(0, level - 1);
            }
            
            const spaces = " ".repeat(level * indentSize);
            result.push(spaces + trimmed);
            
            if (isOpening) {
                level += 1;
            }
        });
        
        return result.join("\n");
    }

    function formatPython(code, indentSize) {
        const lines = normalizeNewlines(code).split("\n");
        const result = [];
        let level = 0;
        
        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) {
                result.push("");
                return;
            }
            
            const isDedent = /^(elif|else|except|finally|return|pass|break|continue)\b/.test(trimmed);
            const hasColon = /:$/.test(trimmed.replace(/#.*$/, "").trim());
            
            if (isDedent && level > 0) {
                level -= 1;
            }
            
            const spaces = " ".repeat(level * indentSize);
            result.push(spaces + trimmed);
            
            if (hasColon) {
                level += 1;
            }
        });
        
        return result.join("\n");
    }

    function deepMerge(base, override) {
        if (!isObject(base) || !isObject(override)) {
            return Array.isArray(override) ? override.slice() : override || base;
        }
        const output = Array.isArray(base) ? base.slice() : { ...base };
        Object.keys(override).forEach(key => {
            const baseValue = base[key];
            const overrideValue = override[key];
            if (isObject(baseValue) && isObject(overrideValue)) {
                output[key] = deepMerge(baseValue, overrideValue);
            } else {
                output[key] = Array.isArray(overrideValue)
                    ? overrideValue.slice()
                    : overrideValue;
            }
        });
        return output;
    }

    function isObject(value) {
        return value && typeof value === "object" && !Array.isArray(value);
    }

    return SyntaxFormatterCore;
})();

window.SyntaxFormatter = SyntaxFormatter;
