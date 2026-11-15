"use client";

import { useEffect, useRef, useState } from "react";
import {
  Accessibility, ArrowUp, BadgeCheck, Bus, CircleAlert, CircleHelp, ExternalLink, Footprints, Headphones,
  RefreshCw, ShieldCheck, Trash2, TriangleAlert, UserRound,
} from "lucide-react";
import { getProfile, useLocal, DEFAULT_PROFILE } from "@/lib/local";
import { needLabel } from "@/lib/labels";
import Button from "./ui/Button";
import Card from "./ui/Card";
import AllyMascot from "./AllyMascot";
import { Switch } from "./ui/Pickers";

const SUGGESTIONS = [
  { text: "Can I take the bus to CVS in a wheelchair?", icon: Bus },
  { text: "Which buildings near me have step-free entrances?", icon: Footprints },
  { text: "Is there an elevator in the Student Union?", icon: Accessibility },
  { text: "Where can I find a quiet place to study on campus?", icon: Headphones },
];
const HELP_SUGGESTIONS = [
  { text: "Who can see my requests?", icon: ShieldCheck },
  { text: "How do I delete my data?", icon: Trash2 },
  { text: "Do I need an account?", icon: UserRound },
];

function AnswerCard({ item, onRetry }) {
  if (item.error) {
    return (
      <Card as="article" className="ally-answer" aria-label="Ally couldn't answer">
        <p className="error-text">
          <CircleAlert aria-hidden="true" focusable="false" />
          {item.error}
        </p>
        <Button variant="secondary" icon={RefreshCw} onClick={onRetry}>
          Try again
        </Button>
      </Card>
    );
  }
  const r = item.result;
  return (
    <Card as="article" className="ally-answer" aria-label="Ally's answer">
      <div className="ally-badges">
        {r.usedSpaces && (
          <span className="badge badge-in-progress">
            <BadgeCheck aria-hidden="true" focusable="false" />
            Accessly data
          </span>
        )}
        {!r.sure && (
          <span className="badge badge-awaiting">
            <CircleHelp aria-hidden="true" focusable="false" />
            Not fully verified
          </span>
        )}
      </div>
      {r.method === "accessly-only" && (
        <p className="tag ally-offline">
          <CircleHelp aria-hidden="true" focusable="false" />
          I couldn&apos;t check the web for this, so I only used Accessly&apos;s campus data.
        </p>
      )}
      {r.method === "official-pages" && (
        <p className="ally-method muted">Answered from official PVTA and UMass pages{r.usedSpaces ? " and Accessly data" : ""}.</p>
      )}
      {r.answer.split(/\n{2,}/).map((para, i) => (
        <p key={i} className="ally-text">
          {para}
        </p>
      ))}
      {r.caution && (
        <div className="notice notice-warning">
          <TriangleAlert aria-hidden="true" focusable="false" />
          <div className="notice-body">
            <p className="notice-title">Confirm before you go</p>
            <p>{r.caution}</p>
          </div>
        </div>
      )}
      {r.sources?.length > 0 && (
        <section aria-label={r.sure ? "Sources" : "Pages checked"} className="mt-md">
          {/* If the answer isn't verified, these are pages Ally checked, not proof of the answer. */}
          <h2 className="h3 ally-sources-heading">{r.sure ? "Sources" : "Pages checked"}</h2>
          <ul className="ally-sources">
            {r.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.title}
                  <ExternalLink aria-hidden="true" focusable="false" />
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
      {r.searchSuggestionsHtml && (
        // Google Search Suggestions (required when using Search grounding), isolated in a sandbox.
        <iframe
          className="search-suggestions"
          title="Related Google searches"
          sandbox="allow-popups allow-popups-to-escape-sandbox"
          srcDoc={r.searchSuggestionsHtml}
        />
      )}
    </Card>
  );
}

/**
 * Ally: describe where you want to go or what you want to know; answers come from Accessly's
 * Spaces data + Google Search, always with sources. `initialQuestion` (from ?q=) is asked right away
 * because the person already pressed a button to get here. mode "help" = questions about Accessly.
 */
export default function AllyChat({ initialQuestion = "", mode = "" }) {
  const help = mode === "help";
  const [profile, profileLoaded] = useLocal(getProfile, DEFAULT_PROFILE);
  const [useNeeds, setUseNeeds] = useState(false);
  const [input, setInput] = useState("");
  const [items, setItems] = useState([]); // { question, result?, error? }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const asked = useRef(false);
  const inputRef = useRef(null);

  const needs = profile.needs ?? [];

  async function ask(q, { replaceIndex } = {}) {
    const question = q.trim();
    if (!question) {
      setError("Type a question first.");
      inputRef.current?.focus();
      return;
    }
    if (loading) return;
    setError("");
    setLoading(true);
    const history = items
      .filter((it) => it.result)
      .slice(-2)
      .flatMap((it) => [
        { role: "user", text: it.question },
        { role: "ally", text: it.result.answer },
      ]);
    if (replaceIndex === undefined) {
      setItems((list) => [...list, { question }]);
      setInput("");
    }
    try {
      const res = await fetch("/api/ally", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Only the needs the person chose to share; never the profile itself.
        body: JSON.stringify({ question, needs: useNeeds ? needs : [], mode: help ? "help" : undefined, history }),
      });
      const data = await res.json();
      const entry = res.ok ? { question, result: data } : { question, error: data.error || "Ally couldn't answer." };
      setItems((list) => {
        const copy = [...list];
        copy[replaceIndex ?? copy.length - 1] = entry;
        return copy;
      });
    } catch {
      setItems((list) => {
        const copy = [...list];
        copy[replaceIndex ?? copy.length - 1] = { question, error: "Couldn't reach Ally. Check your connection and try again." };
        return copy;
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialQuestion && !asked.current) {
      asked.current = true;
      ask(initialQuestion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion]);

  const suggestions = help ? HELP_SUGGESTIONS : SUGGESTIONS;
  const started = items.length > 0;

  function onKeyDown(e) {
    // Enter sends, Shift+Enter adds a new line (explained in the hint below the box).
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      ask(input);
    }
  }

  return (
    <div className={`ally-chat${started ? " is-started" : ""}`}>
      {started ? (
        <header className="ally-topbar">
          <AllyMascot size={48} />
          <div>
            <h1 id="ally-heading">Ally</h1>
            <p className="no-margin muted">Your AI guide · shows sources, says when unsure</p>
          </div>
        </header>
      ) : (
        <section className="ally-hero" aria-labelledby="ally-heading">
          <div className="ally-hero-art">
            <span className="ally-hello" aria-hidden="true">Hello!</span>
            <AllyMascot size={168} animated />
            <span className="ally-hero-shadow" aria-hidden="true" />
          </div>
          <h1 id="ally-heading">
            I&apos;m <span className="ally-name">Ally</span>, your AI guide.
          </h1>
          <p className="ally-hero-sub">
            {help
              ? "Ask me how Accessly works and how it protects your privacy."
              : "How can I help you today? I check campus data and official pages, show my sources, and tell you when I'm not sure."}
          </p>
        </section>
      )}

      {!started && (
        <section className="ally-starters" aria-labelledby="ally-suggestions-heading">
          <h2 id="ally-suggestions-heading" className="visually-hidden">
            Try asking
          </h2>
          <ul className="ally-tiles">
            {suggestions.map(({ text, icon: Icon }) => (
              <li key={text}>
                <button type="button" className="ally-tile" onClick={() => ask(text)} disabled={loading}>
                  <span className="ally-tile-icon">
                    <Icon aria-hidden="true" focusable="false" />
                  </span>
                  {text}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ol className="ally-log" aria-live="polite" aria-relevant="additions" aria-label="Conversation with Ally">
        {items.map((it, i) => (
          <li key={i}>
            <div className="ally-turn ally-turn-user">
              <p className="ally-who">You</p>
              <p className="msg msg-user ally-question">
                <span className="visually-hidden">You asked: </span>
                {it.question}
              </p>
            </div>
            <div className="ally-turn">
              <p className="ally-who">
                <AllyMascot size={28} />
                Ally
              </p>
              {it.result || it.error ? (
                <AnswerCard item={it} onRetry={() => ask(it.question, { replaceIndex: i })} />
              ) : (
                <p className="ally-typing" aria-busy="true">
                  <span className="dots" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                  Thinking…
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>

      <form className="ally-composer" onSubmit={(e) => { e.preventDefault(); ask(input); }} noValidate>
        <label htmlFor="ally-q" className="ally-composer-label">
          {help
            ? "What would you like to know about Accessly or your privacy?"
            : "Describe what you want to do or where you want to go, and I'll give you responsible info."}
        </label>
        <div className="ally-input-pill">
          <textarea
            id="ally-q"
            ref={inputRef}
            rows={1}
            maxLength={1000}
            value={input}
            placeholder={started ? "Ask a follow-up…" : "Ask Ally…"}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
            }}
            onKeyDown={onKeyDown}
            aria-invalid={!!error}
            aria-describedby={error ? "ally-error ally-privacy" : "ally-privacy"}
          />
          <button type="submit" className="ally-send" disabled={loading} aria-label={loading ? "Ally is thinking" : "Send to Ally"}>
            {loading ? <span className="spinner" aria-hidden="true" /> : <ArrowUp aria-hidden="true" focusable="false" />}
          </button>
        </div>
        {error && (
          <p id="ally-error" role="alert" className="error-text">
            <CircleAlert aria-hidden="true" focusable="false" />
            {error}
          </p>
        )}
        <p id="ally-privacy" className="hint">
          Enter to send, Shift+Enter for a new line. Your questions aren&apos;t saved.
          {help ? "" : " Always double-check anything time-sensitive with the official source."}
        </p>
        {!help && profileLoaded && needs.length > 0 && (
          <Switch
            id="ally-use-needs"
            title="Use my profile needs"
            description={`Shares only: ${needs.map(needLabel).join(", ")}.`}
            checked={useNeeds}
            onChange={setUseNeeds}
          />
        )}
      </form>

      {started && (
        <section className="ally-more" aria-labelledby="ally-more-heading">
          <h2 id="ally-more-heading" className="h3">
            Try asking
          </h2>
          <div className="suggestions">
            {suggestions.map(({ text, icon: Icon }) => (
              <button key={text} type="button" className="chip-button" onClick={() => ask(text)} disabled={loading}>
                <Icon aria-hidden="true" focusable="false" className="chip-icon" />
                {text}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
