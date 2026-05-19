import React, { useState } from 'react';
import './ExerciseView.css';

function ExerciseView({ exercise, onSubmit, onPuterSubmit, onPuterStream, onGenerateImage, puterLoaded, loading, streaming, streamOutput, streamError, onBack, aiMode, puterModel, setPuterModel, puterImageModel, setPuterImageModel, imageContainerRef, imageError, onPuterCloudWrite, onPuterCloudRead, cloudStatus, cloudFileContent, cloudError, onPuterKVSet, onPuterKVGet, kvStoredValue, kvStatus, kvError, onPuterPublishWebsite, hostStatus, hostedUrl, onPuterSignIn, onPuterFetch, authStatus, authError, userInfo, netStatus, netResponse, netError, onPuterOCR, onPuterTTS, ocrStatus, ocrText, ocrError, ttsStatus, ttsAudioUrl, ttsError }) {
  const [userPrompt, setUserPrompt] = useState('');
  const [cloudFileName, setCloudFileName] = useState('puter-demo.txt');
  const [cloudFilePayload, setCloudFilePayload] = useState('This is a Puter cloud file written from the browser.');
  const [kvKey, setKvKey] = useState('userPreference');
  const [kvValue, setKvValue] = useState('darkMode');
  const [fetchUrl, setFetchUrl] = useState('https://example.com');
  const [ocrFile, setOcrFile] = useState(null);
  const [ocrProvider, setOcrProvider] = useState('mistral');
  const [ttsText, setTtsText] = useState('Hello from Puter Text-to-Speech!');
  const [ttsEngine, setTtsEngine] = useState('gemini');
  const [customSubdomain, setCustomSubdomain] = useState('ai-xpress');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userPrompt.trim()) {
      return;
    }

    if (aiMode === 'puter') {
      onPuterSubmit(userPrompt);
    } else {
      onSubmit(userPrompt);
    }
  };

  const handleSecondaryClick = () => {
    if (!userPrompt.trim()) {
      return;
    }

    if (aiMode === 'puter') {
      onSubmit(userPrompt);
    } else {
      onPuterSubmit(userPrompt);
    }
  };

  return (
    <div className="exercise-view">
      <button className="back-btn" onClick={onBack}>← Back to Levels</button>

      <div className="exercise-header">
        <h2>{exercise.title}</h2>
        <span className="topic-tag">{exercise.topic}</span>
      </div>

      <div className="exercise-content">
        <div className="challenge-section">
          <h3>📋 Challenge</h3>
          <p className="challenge-text">{exercise.challenge}</p>

          {exercise.context && (
            <div className="context-box">
              <h4>Context</h4>
              <p>{exercise.context}</p>
            </div>
          )}

          {exercise.expectedOutcomes && exercise.expectedOutcomes.length > 0 && (
            <div className="outcomes-box">
              <h4>✓ Expected Outcomes</h4>
              <ul>
                {exercise.expectedOutcomes.map((outcome, idx) => (
                  <li key={idx}>{outcome}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="prompt-form">
          <div className="form-group">
            <label htmlFor="prompt">Your Prompt</label>
            <textarea
              id="prompt"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Write your prompt here..."
              rows="6"
              disabled={loading}
            />
            <div className="char-count">{userPrompt.length} characters</div>
          </div>

          <div className="mode-panel">
            <div className="mode-label">Mode: {aiMode === 'puter' ? `Puter (${puterModel})` : 'Backend AI'}</div>
            {aiMode === 'puter' && (
              <>
                <p className="provider-note">
                  Puter supports OpenAI, Claude, Gemini, Grok, Kimi, Llama, DeepSeek and many more models.
                </p>
                <p className="provider-note">
                  Use Puter.js directly in the browser for AI, text/image generation, streaming, and cloud-powered features with no API keys.
                </p>
                <label className="model-select-label">
                  Text model:
                  <select
                    value={puterModel}
                    onChange={(e) => setPuterModel(e.target.value)}
                    disabled={loading}
                  >
                    <option value="gpt-5.4-nano">gpt-5.4-nano</option>
                    <option value="openai/gpt-4o">openai/gpt-4o</option>
                    <option value="openai/gpt-4o-mini">openai/gpt-4o-mini</option>
                    <option value="claude-sonnet-4-6">claude-sonnet-4-6</option>
                    <option value="claude-haiku-4-5">claude-haiku-4-5</option>
                    <option value="claude-opus-4-5">claude-opus-4-5</option>
                    <option value="claude-opus-4-7">claude-opus-4-7</option>
                    <option value="moonshotai/kimi-k2.6">moonshotai/kimi-k2.6</option>
                    <option value="moonshotai/kimi-k2.5">moonshotai/kimi-k2.5</option>
                    <option value="moonshotai/kimi-k2">moonshotai/kimi-k2</option>
                    <option value="moonshotai/kimi-k2-thinking">moonshotai/kimi-k2-thinking</option>
                    <option value="x-ai/grok-4.3">x-ai/grok-4.3</option>
                    <option value="x-ai/grok-4-1-fast">x-ai/grok-4-1-fast</option>
                    <option value="x-ai/grok-4-1-fast-non-reasoning">x-ai/grok-4-1-fast-non-reasoning</option>
                    <option value="x-ai/grok-4">x-ai/grok-4</option>
                    <option value="x-ai/grok-4-fast">x-ai/grok-4-fast</option>
                    <option value="meta/llama-2.5-chat">meta/llama-2.5-chat</option>
                    <option value="gemini-3.1-flash-lite-preview">gemini-3.1-flash-lite-preview</option>
                  </select>
                </label>
                <label className="model-select-label">
                  Image model:
                  <select
                    value={puterImageModel}
                    onChange={(e) => setPuterImageModel(e.target.value)}
                    disabled={loading}
                  >
                    <option value="gemini-3-pro-image-preview">gemini-3-pro-image-preview</option>
                    <option value="gemini-3.1-flash-image-preview">gemini-3.1-flash-image-preview</option>
                    <option value="gemini-2.5-flash-image-preview">gemini-2.5-flash-image-preview</option>
                  </select>
                </label>
              </>
            )}
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={loading || !userPrompt.trim()}
          >
            {loading
              ? aiMode === 'puter'
                ? 'Getting Puter Critique...'
                : 'Getting AI Critique...'
              : aiMode === 'puter'
                ? '✨ Get Puter Critique'
                : '✨ Get AI Critique'}
          </button>
          <button
            type="button"
            className="submit-btn secondary-btn"
            disabled={!puterLoaded || loading || !userPrompt.trim()}
            onClick={handleSecondaryClick}
          >
            {loading
              ? 'Getting alternate critique...'
              : aiMode === 'puter'
                ? '✨ Use Backend AI Instead'
                : '✨ Use Puter Directly'}
          </button>
          {aiMode === 'puter' && (
            <button
              type="button"
              className="submit-btn stream-btn"
              disabled={!puterLoaded || loading || streaming || !userPrompt.trim()}
              onClick={() => onPuterStream(userPrompt)}
            >
              {streaming ? 'Streaming Puter Output...' : '▶ Stream Puter Output'}
            </button>
          )}
          {aiMode === 'puter' && (
            <button
              type="button"
              className="submit-btn image-btn"
              disabled={loading || !userPrompt.trim()}
              onClick={() => onGenerateImage(userPrompt)}
            >
              {loading ? 'Generating Puter Image...' : '🖼️ Generate Puter Image'}
            </button>
          )}
          {aiMode === 'puter' && (
            <div className="cloud-panel">
              <h4>Puter Cloud Storage</h4>
              <label className="cloud-field">
                File name:
                <input
                  type="text"
                  value={cloudFileName}
                  onChange={(e) => setCloudFileName(e.target.value)}
                  disabled={loading}
                />
              </label>
              <label className="cloud-field">
                File content:
                <textarea
                  value={cloudFilePayload}
                  onChange={(e) => setCloudFilePayload(e.target.value)}
                  rows="4"
                  disabled={loading}
                />
              </label>
              <div className="cloud-actions">
                <button
                  type="button"
                  className="submit-btn"
                  disabled={loading || !cloudFileName.trim()}
                  onClick={() => onPuterCloudWrite(cloudFileName, cloudFilePayload)}
                >
                  Write to Puter Cloud
                </button>
                <button
                  type="button"
                  className="submit-btn secondary-btn"
                  disabled={loading || !cloudFileName.trim()}
                  onClick={() => onPuterCloudRead(cloudFileName)}
                >
                  Read from Puter Cloud
                </button>
              </div>
              {cloudStatus && <p className="cloud-status">{cloudStatus}</p>}
              {cloudError && <p className="error-text">{cloudError}</p>}
              {cloudFileContent && (
                <div className="cloud-content-box">
                  <h4>Cloud file content</h4>
                  <pre>{cloudFileContent}</pre>
                </div>
              )}
            </div>
          )}
          {aiMode === 'puter' && (
            <div className="cloud-panel">
              <h4>Puter Cloud Key-Value Store</h4>
              <label className="cloud-field">
                Key:
                <input
                  type="text"
                  value={kvKey}
                  onChange={(e) => setKvKey(e.target.value)}
                  disabled={loading}
                />
              </label>
              <label className="cloud-field">
                Value:
                <input
                  type="text"
                  value={kvValue}
                  onChange={(e) => setKvValue(e.target.value)}
                  disabled={loading}
                />
              </label>
              <div className="cloud-actions">
                <button
                  type="button"
                  className="submit-btn"
                  disabled={loading || !kvKey.trim()}
                  onClick={() => onPuterKVSet(kvKey, kvValue)}
                >
                  Save preference
                </button>
                <button
                  type="button"
                  className="submit-btn secondary-btn"
                  disabled={loading || !kvKey.trim()}
                  onClick={() => onPuterKVGet(kvKey)}
                >
                  Load preference
                </button>
              </div>
              {kvStatus && <p className="cloud-status">{kvStatus}</p>}
              {kvError && <p className="error-text">{kvError}</p>}
              {kvStoredValue && (
                <div className="cloud-content-box">
                  <h4>Stored KV value</h4>
                  <pre>{kvStoredValue}</pre>
                </div>
              )}
            </div>
          )}
          {aiMode === 'puter' && (
            <div className="cloud-panel">
              <h4>Puter Auth & Network</h4>
              <button
                type="button"
                className="submit-btn"
                disabled={loading}
                onClick={onPuterSignIn}
              >
                Sign in with Puter
              </button>
              {authStatus && <p className="cloud-status">{authStatus}</p>}
              {authError && <p className="error-text">{authError}</p>}
              {userInfo && (
                <div className="cloud-content-box">
                  <h4>Auth result</h4>
                  <pre>{JSON.stringify(userInfo, null, 2)}</pre>
                </div>
              )}
              <label className="cloud-field">
                Fetch URL:
                <input
                  type="text"
                  value={fetchUrl}
                  onChange={(e) => setFetchUrl(e.target.value)}
                  disabled={loading}
                />
              </label>
              <button
                type="button"
                className="submit-btn secondary-btn"
                disabled={loading || !fetchUrl.trim()}
                onClick={() => onPuterFetch(fetchUrl)}
              >
                Fetch resource
              </button>
              {netStatus && <p className="cloud-status">{netStatus}</p>}
              {netError && <p className="error-text">{netError}</p>}
              {netResponse && (
                <div className="cloud-content-box">
                  <h4>Fetch response</h4>
                  <pre>{netResponse}</pre>
                </div>
              )}
            </div>
          )}
          {aiMode === 'puter' && (
            <div className="cloud-panel">
              <h4>Puter OCR</h4>
              <label className="cloud-field">
                Image file:
                <input
                  type="file"
                  accept="image/*,.png,.jpg,.jpeg,.pdf"
                  onChange={(e) => setOcrFile(e.target.files?.[0] || null)}
                  disabled={loading}
                />
              </label>
              <label className="cloud-field">
                Provider:
                <select
                  value={ocrProvider}
                  onChange={(e) => setOcrProvider(e.target.value)}
                  disabled={loading}
                >
                  <option value="mistral">mistral</option>
                  <option value="aws-textract">aws-textract</option>
                </select>
              </label>
              <button
                type="button"
                className="submit-btn"
                disabled={loading || !ocrFile}
                onClick={() => onPuterOCR(ocrFile, ocrProvider)}
              >
                Run OCR
              </button>
              {ocrStatus && <p className="cloud-status">{ocrStatus}</p>}
              {ocrError && <p className="error-text">{ocrError}</p>}
              {ocrText && (
                <div className="cloud-content-box">
                  <h4>OCR text</h4>
                  <pre>{ocrText}</pre>
                </div>
              )}
            </div>
          )}
          {aiMode === 'puter' && (
            <div className="cloud-panel">
              <h4>Puter Text-to-Speech</h4>
              <label className="cloud-field">
                Text to speak:
                <textarea
                  value={ttsText}
                  onChange={(e) => setTtsText(e.target.value)}
                  rows="4"
                  disabled={loading}
                />
              </label>
              <label className="cloud-field">
                Engine:
                <select
                  value={ttsEngine}
                  onChange={(e) => setTtsEngine(e.target.value)}
                  disabled={loading}
                >
                  <option value="openai">openai</option>
                  <option value="gemini">gemini</option>
                  <option value="xai">xai</option>
                  <option value="elevenlabs">elevenlabs</option>
                </select>
              </label>
              <button
                type="button"
                className="submit-btn"
                disabled={loading || !ttsText.trim()}
                onClick={() => onPuterTTS(ttsText, ttsEngine)}
              >
                Generate speech
              </button>
              {ttsStatus && <p className="cloud-status">{ttsStatus}</p>}
              {ttsError && <p className="error-text">{ttsError}</p>}
              {ttsAudioUrl && (
                <div className="cloud-content-box audio-panel">
                  <h4>Speech Output</h4>
                  <audio controls src={ttsAudioUrl} />
                </div>
              )}
            </div>
          )}
          {aiMode === 'puter' && (
            <div className="cloud-panel">
              <h4>🚀 Deploy Your App</h4>
              <p>Create a public landing page for your AI Skill Gym at ai-xpress.puter.site</p>
              <div className="deploy-notice">
                <strong>Note:</strong> This creates a beautiful landing page that showcases your app and links users to your local development server.
              </div>
              <label className="cloud-field">
                Subdomain:
                <input
                  type="text"
                  value={customSubdomain}
                  onChange={(e) => setCustomSubdomain(e.target.value)}
                  placeholder="ai-xpress"
                  disabled={loading}
                />
              </label>
              <p className="subdomain-preview">Your landing page will be at: https://{customSubdomain}.puter.site</p>
              <button
                type="button"
                className="submit-btn deploy-btn"
                disabled={loading || !customSubdomain.trim()}
                onClick={() => onPuterPublishWebsite(customSubdomain)}
              >
                🚀 Deploy Landing Page
              </button>
              {hostStatus && <p className="cloud-status">{hostStatus}</p>}
              {hostedUrl && (
                <div className="cloud-content-box">
                  <h4>🎉 Your App is Live!</h4>
                  <a href={hostedUrl} target="_blank" rel="noreferrer" className="live-link">{hostedUrl}</a>
                  <p className="share-note">Share this link to let users discover your AI Skill Gym!</p>
                </div>
              )}
            </div>
          )}
          {!puterLoaded && (
            <p className="puter-note">Loading Puter.js for free Gemini access…</p>
          )}
          {streamError && <p className="error-text">{streamError}</p>}
          {aiMode === 'puter' && streamOutput && (
            <div className="stream-output-box">
              <h4>Live Stream Output</h4>
              <pre>{streamOutput}</pre>
            </div>
          )}
          {imageError && <p className="error-text">{imageError}</p>}
          <div ref={imageContainerRef} className="image-result-container" />
        </form>
      </div>
    </div>
  );
}

export default ExerciseView;
