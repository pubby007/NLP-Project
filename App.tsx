import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
const queryClient = new QueryClient();
function Home() {
import { useMemo, useState } from "react";
import { analyzeSentiment } from "@/lib/sentiment";
const SAMPLE_REVIEWS = [
  "Absolutely love this product! The quality is amazing and it arrived very fast. Highly recommended.",
  "Terrible experience. The item arrived broken and customer service was useless. Total waste of money.",
  "It's okay. Does what it says but nothing special. Average product for the price.",
  "Best purchase I've made all year! Beautiful design, sturdy build, and works perfectly.",
  "Disappointed. The battery dies after an hour and the buttons are already broken. Returning it.",
];
function App() {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const result = useMemo(
    () => (submitted ? analyzeSentiment(submitted) : null),
    [submitted]
  );
  const handleAnalyze = () => {
    if (text.trim().length === 0) return;
    setSubmitted(text);
  };
  const handleSample = (s: string) => {
    setText(s);
    setSubmitted(s);
  };
  const handleClear = () => {
    setText("");
    setSubmitted(null);
  };
  const labelColor =
    result?.label === "Positive"
      ? "bg-emerald-500"
      : result?.label === "Negative"
      ? "bg-rose-500"
      : "bg-slate-400";
  const labelEmoji =
    result?.label === "Positive" ? "😊" : result?.label === "Negative" ? "😞" : "😐";
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Replit Agent is building...</h1>
        <p className="mt-2 text-sm text-gray-600">Your app will appear here once it's ready.</p>
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-indigo-50 text-slate-900">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <header className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium mb-4">
            NLP Project Demo
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">
            Amazon Review Sentiment Analyzer
          </h1>
          <p className="mt-3 text-slate-600 max-w-xl mx-auto">
            Paste any product review and find out instantly whether the sentiment
            is <span className="font-semibold text-emerald-600">Positive</span>,{" "}
            <span className="font-semibold text-rose-600">Negative</span>, or
            Neutral.
          </p>
        </header>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <label
            htmlFor="review"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Your review
          </label>
          <textarea
            id="review"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            placeholder="e.g. Great product, arrived quickly and works perfectly..."
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={handleAnalyze}
              disabled={text.trim().length === 0}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
            >
              Analyze Sentiment
            </button>
            <button
              onClick={handleClear}
              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition"
            >
              Clear
            </button>
          </div>
          <div className="mt-6">
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">
              Try a sample
            </p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_REVIEWS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSample(s)}
                  className="text-xs px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 transition"
                >
                  Sample {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
        {result && (
          <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 animate-in fade-in duration-300">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Prediction</p>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-semibold text-lg ${labelColor}`}
                  >
                    <span className="text-2xl">{labelEmoji}</span>
                    {result.label}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Polarity score</p>
                <p className="text-2xl font-bold text-slate-900">
                  {result.score.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Confidence</span>
                <span>{Math.round(result.confidence * 100)}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${labelColor} transition-all duration-500`}
                  style={{ width: `${Math.round(result.confidence * 100)}%` }}
                />
              </div>
            </div>
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold mb-2">
                  Positive cues ({result.positiveHits.length})
                </p>
                {result.positiveHits.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {result.positiveHits.map((w, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 rounded-md bg-white text-emerald-700 border border-emerald-200"
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-emerald-700/70">None detected</p>
                )}
              </div>
              <div className="rounded-xl border border-rose-100 bg-rose-50 p-4">
                <p className="text-xs uppercase tracking-wide text-rose-700 font-semibold mb-2">
                  Negative cues ({result.negativeHits.length})
                </p>
                {result.negativeHits.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {result.negativeHits.map((w, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 rounded-md bg-white text-rose-700 border border-rose-200"
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-rose-700/70">None detected</p>
                )}
              </div>
            </div>
            <p className="mt-6 text-xs text-slate-500">
              This live demo uses a lightweight lexicon classifier so it runs
              instantly in your browser. The downloadable Python project uses a
              proper TF-IDF + Logistic Regression / Naive Bayes model trained on
              labeled review data.
            </p>
          </div>
        )}
        <footer className="mt-12 text-center text-sm text-slate-500">
          Built as a beginner-friendly NLP project. Full Python source code,
          slides, viva Q&amp;A and deployment guide are included in the
          downloadable project folder.
        </footer>
      </div>
    </div>
  );
}
function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
export default App;