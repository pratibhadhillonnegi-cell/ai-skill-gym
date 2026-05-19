import React, { useState, useEffect, useRef } from 'react';
import { puter } from '@heyputer/puter.js';
import './App.css';
import LevelSelector from './components/LevelSelector';
import ExerciseView from './components/ExerciseView';
import CritiqueDisplay from './components/CritiqueDisplay';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import AdminPanel from './components/AdminPanel';

function App() {
  // auth state
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(
    token ? JSON.parse(localStorage.getItem('user') || '{}') : null
  );
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'profile'

  // main app state
  const [currentStage, setCurrentStage] = useState('levels'); // levels, exercise, critique, profile, admin
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [critiqueResult, setCritiqueResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [puterLoaded, setPuterLoaded] = useState(false);
  const [aiMode, setAiMode] = useState('backend');
  const [puterModel, setPuterModel] = useState('claude-sonnet-4-6');
  const [puterImageModel, setPuterImageModel] = useState('gemini-3-pro-image-preview');
  const [imageError, setImageError] = useState(null);
  const [cloudStatus, setCloudStatus] = useState('');
  const [cloudFileContent, setCloudFileContent] = useState('');
  const [cloudError, setCloudError] = useState(null);
  const [kvStatus, setKvStatus] = useState('');
  const [kvStoredValue, setKvStoredValue] = useState('');
  const [kvError, setKvError] = useState(null);
  const [hostStatus, setHostStatus] = useState('');
  const [hostedUrl, setHostedUrl] = useState('');
  const [authStatus, setAuthStatus] = useState('');
  const [authError, setAuthError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [netStatus, setNetStatus] = useState('');
  const [netResponse, setNetResponse] = useState('');
  const [netError, setNetError] = useState(null);
  const [ocrStatus, setOcrStatus] = useState('');
  const [ocrText, setOcrText] = useState('');
  const [ocrError, setOcrError] = useState(null);
  const [ttsStatus, setTtsStatus] = useState('');
  const [ttsAudioUrl, setTtsAudioUrl] = useState('');
  const [ttsError, setTtsError] = useState(null);
  const [streamOutput, setStreamOutput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamError, setStreamError] = useState(null);
  const imageContainerRef = useRef(null);

  useEffect(() => {
    setPuterLoaded(true);
  }, []);

  const parsePuterResponse = (response, userPrompt) => {
    let content = '';

    if (typeof response === 'string') {
      content = response;
    } else if (response?.message?.content?.[0]?.text) {
      content = response.message.content[0].text;
    } else {
      content = JSON.stringify(response);
    }

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
          critique: result.critique || content,
          improvedPrompt: result.improvedPrompt || userPrompt,
          explanation: result.explanation || 'Puter.js returned valid JSON output.',
          score: result.score || 6,
        };
      }
    } catch (err) {
      console.warn('Puter response parse failed:', err);
    }

    return {
      critique: content,
      improvedPrompt: userPrompt,
      explanation: 'Puter.js returned a raw response that could not be parsed as JSON.',
      score: 5,
    };
  };

  const handlePuterSubmit = async (userPrompt) => {
    setLoading(true);
    try {
      const prompt = `You are an expert prompt engineering teacher. A student submitted the following prompt:\n\nExercise Context: ${currentExercise?.context || 'No additional context provided.'}\n\nStudent's Prompt:\n"${userPrompt}"\n\nProvide your critique in this exact JSON format:\n{\n  "critique": "2-3 sentence critique of what's working and what could improve",\n  "improvedPrompt": "Your improved version of the prompt",\n  "explanation": "Bullet-point explanation of why your version is better (2-3 points)",\n  "score": 7\n}\n\nReturn ONLY valid JSON.`;

      const response = await puter.ai.chat(prompt, {
        model: puterModel,
        stream: false,
      });

      const content = typeof response === 'string' ? response : JSON.stringify(response);
      const result = parsePuterResponse(content, userPrompt);
      setCritiqueResult(result);
      setCurrentStage('critique');
    } catch (error) {
      console.error('Puter submission failed:', error);
      alert('Puter.js evaluation failed. Check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  // if no token, show auth screen
  if (!token) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>🎓 AI Skill Gym</h1>
          <p>Train your prompt IQ</p>
        </header>
        <main className="app-main">
          {authMode === 'login' && (
            <Login
              onLoginSuccess={(t) => {
                setToken(t);
                localStorage.setItem('token', t);
              }}
              onSwitchToRegister={() => setAuthMode('register')}
            />
          )}
          {authMode === 'register' && (
            <Register
              onRegisterSuccess={(t) => {
                setToken(t);
                localStorage.setItem('token', t);
              }}
              onSwitchToLogin={() => setAuthMode('login')}
            />
          )}
        </main>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setAuthMode('login');
  };

  const handleLevelSelect = async (levelNumber) => {
    setSelectedLevel(levelNumber);
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/exercises/random/${levelNumber}`);
      const exercise = await response.json();
      setCurrentExercise(exercise);
      setCurrentStage('exercise');
    } catch (error) {
      console.error('Error loading exercise:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromptSubmit = async (userPrompt) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/submissions/critique', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          exerciseId: currentExercise._id,
          userPrompt: userPrompt,
        }),
      });
      const result = await response.json();
      setCritiqueResult(result);
      setCurrentStage('critique');
    } catch (error) {
      console.error('Error submitting prompt:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToExercise = () => {
    setCurrentStage('exercise');
    setCritiqueResult(null);
    setImageError(null);
    if (imageContainerRef.current) {
      imageContainerRef.current.innerHTML = '';
    }
  };

  const handleGenerateImage = async (userPrompt) => {
    setLoading(true);
    setImageError(null);
    if (imageContainerRef.current) {
      imageContainerRef.current.innerHTML = '';
    }

    try {
      const imageElement = await puter.ai.txt2img(userPrompt, {
        model: puterImageModel,
      });

      if (imageElement instanceof HTMLElement) {
        imageContainerRef.current?.appendChild(imageElement);
      } else if (imageElement?.src) {
        const img = document.createElement('img');
        img.src = imageElement.src;
        img.alt = 'Puter generated image';
        img.className = 'puter-generated-image';
        imageContainerRef.current?.appendChild(img);
      } else {
        setImageError('Puter returned an unsupported image type.');
      }
    } catch (error) {
      console.error('Puter image generation failed:', error);
      setImageError('Puter image generation failed. Check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handlePuterCloudWrite = async (fileName, fileContent) => {
    setLoading(true);
    setCloudError(null);
    setCloudStatus(`Writing ${fileName} to Puter cloud...`);

    try {
      const result = await puter.fs.write(fileName, fileContent);
      setCloudStatus(`Cloud write succeeded: ${fileName}`);
      console.log('Puter cloud write result:', result);
    } catch (error) {
      console.error('Puter cloud write failed:', error);
      setCloudError('Puter cloud write failed. See console for details.');
      setCloudStatus('');
    } finally {
      setLoading(false);
    }
  };

  const handlePuterCloudRead = async (fileName) => {
    setLoading(true);
    setCloudError(null);
    setCloudStatus(`Reading ${fileName} from Puter cloud...`);

    try {
      const result = await puter.fs.read(fileName);
      const content = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
      setCloudFileContent(content);
      setCloudStatus(`Cloud read succeeded: ${fileName}`);
      console.log('Puter cloud read result:', result);
    } catch (error) {
      console.error('Puter cloud read failed:', error);
      setCloudError('Puter cloud read failed. See console for details.');
      setCloudStatus('');
      setCloudFileContent('');
    } finally {
      setLoading(false);
    }
  };

  const handlePuterKVSet = async (key, value) => {
    setLoading(true);
    setKvError(null);
    setKvStatus(`Saving ${key} to Puter KV...`);

    try {
      await puter.kv.set(key, value);
      setKvStatus(`Saved ${key} successfully.`);
      setKvStoredValue(value);
    } catch (error) {
      console.error('Puter KV set failed:', error);
      setKvError('Puter KV save failed. See console for details.');
      setKvStatus('');
    } finally {
      setLoading(false);
    }
  };

  const handlePuterKVGet = async (key) => {
    setLoading(true);
    setKvError(null);
    setKvStatus(`Loading ${key} from Puter KV...`);

    try {
      const value = await puter.kv.get(key);
      setKvStoredValue(value || '');
      setKvStatus(`Loaded ${key} successfully.`);
    } catch (error) {
      console.error('Puter KV get failed:', error);
      setKvError('Puter KV read failed. See console for details.');
      setKvStatus('');
      setKvStoredValue('');
    } finally {
      setLoading(false);
    }
  };

  const handlePuterPublishWebsite = async (customSubdomain = 'ai-xpress') => {
    setLoading(true);
    setHostStatus(`Creating AI Skill Gym at ${customSubdomain}.puter.site...`);
    setHostedUrl('');
    setKvError(null);

    try {
      const dirName = customSubdomain;
      await puter.fs.mkdir(dirName);

      // Create a proper HTML page for the AI Skill Gym
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Skill Gym - ${customSubdomain}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        .container {
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        h1 {
            font-size: 3rem;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        p {
            font-size: 1.2rem;
            margin-bottom: 30px;
            opacity: 0.9;
        }
        .cta-button {
            background: #ff6b6b;
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 50px;
            font-size: 1.1rem;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
        }
        .cta-button:hover {
            background: #ff5252;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 107, 107, 0.6);
        }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 40px;
            max-width: 800px;
        }
        .feature {
            background: rgba(255, 255, 255, 0.1);
            padding: 20px;
            border-radius: 10px;
            backdrop-filter: blur(5px);
        }
        .feature h3 {
            margin-top: 0;
            color: #ffd93d;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎓 AI Skill Gym</h1>
        <p>Train your prompt IQ with interactive AI exercises</p>
        <a href="http://localhost:3000" class="cta-button">🚀 Start Training</a>

        <div class="features">
            <div class="feature">
                <h3>✨ Multiple AI Models</h3>
                <p>Access OpenAI, Claude, Gemini, Grok, and more - all in one place</p>
            </div>
            <div class="feature">
                <h3>🧠 Progressive Learning</h3>
                <p>4 levels of exercises from basics to advanced optimization</p>
            </div>
            <div class="feature">
                <h3>💰 Free to Use</h3>
                <p>No API keys required - powered by Puter.js</p>
            </div>
        </div>
    </div>
</body>
</html>`;

      await puter.fs.write(`${dirName}/index.html`, htmlContent);
      const site = await puter.hosting.create(customSubdomain, dirName);
      const url = `https://${site.subdomain}.puter.site`;
      setHostedUrl(url);
      setHostStatus(`🎉 AI Skill Gym deployed successfully at ${url}`);
    } catch (error) {
      console.error('Puter website publish failed:', error);
      setKvError('Puter website publish failed. See console for details.');
      setHostStatus('');
      setHostedUrl('');
    } finally {
      setLoading(false);
    }
  };

  const handlePuterSignIn = async () => {
    setLoading(true);
    setAuthStatus('Signing in with Puter...');
    setAuthError(null);

    try {
      const res = await puter.auth.signIn();
      setAuthStatus('Signed in successfully.');
      setUserInfo(res);
      console.log('Puter auth result:', res);
    } catch (error) {
      console.error('Puter auth sign-in failed:', error);
      setAuthStatus('');
      setAuthError('Puter auth sign-in failed. See console for details.');
      setUserInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePuterFetch = async (url) => {
    setLoading(true);
    setNetError(null);
    setNetStatus(`Fetching ${url}...`);
    setNetResponse('');

    try {
      const request = await puter.net.fetch(url);
      const body = await request.text();
      setNetResponse(body);
      setNetStatus(`Fetched ${url} successfully.`);
      console.log('Puter net.fetch result for', url);
    } catch (error) {
      console.error('Puter net.fetch failed:', error);
      setNetStatus('');
      setNetError('Puter net.fetch failed. See console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handlePuterOCR = async (file, provider = 'mistral') => {
    if (!file) return;
    setLoading(true);
    setOcrError(null);
    setOcrStatus('Recognizing text from image...');
    setOcrText('');

    try {
      const text = await puter.ai.img2txt({ source: file, provider });
      setOcrText(text || 'No text found.');
      setOcrStatus('OCR completed successfully.');
      console.log('Puter OCR result:', text);
    } catch (error) {
      console.error('Puter OCR failed:', error);
      setOcrError('Puter OCR failed. See console for details.');
      setOcrStatus('');
    } finally {
      setLoading(false);
    }
  };

  const handlePuterTTS = async (text, engine = 'gemini', voice = 'Kore') => {
    if (!text) return;
    setLoading(true);
    setTtsError(null);
    setTtsStatus('Generating speech...');
    setTtsAudioUrl('');

    try {
      const audioResult = await puter.ai.txt2speech(text, { engine, voice });
      let url = '';

      if (audioResult instanceof HTMLAudioElement) {
        url = audioResult.src;
      } else if (audioResult instanceof Blob) {
        url = URL.createObjectURL(audioResult);
      } else if (typeof audioResult === 'string') {
        url = audioResult;
      }

      setTtsAudioUrl(url);
      setTtsStatus('Text-to-speech generated successfully.');
      console.log('Puter TTS result:', audioResult);
    } catch (error) {
      console.error('Puter TTS failed:', error);
      setTtsError('Puter text-to-speech failed. See console for details.');
      setTtsStatus('');
    } finally {
      setLoading(false);
    }
  };

  const handleNewExercise = async () => {
    const response = await fetch(`http://localhost:4000/api/exercises/random/${selectedLevel}`);
    const exercise = await response.json();
    setCurrentExercise(exercise);
    setCurrentStage('exercise');
    setCritiqueResult(null);
  };

  const handlePuterStream = async (userPrompt) => {
    if (streaming) {
      return;
    }

    setStreaming(true);
    setStreamError(null);
    setStreamOutput('');
    setLoading(true);

    try {
      const response = await puter.ai.chat(userPrompt, {
        model: puterModel,
        stream: true,
      });

      for await (const part of response) {
        const text = part?.text || part?.message?.content?.[0]?.text || '';
        if (text) {
          setStreamOutput((prev) => prev + text);
        }
      }
    } catch (error) {
      console.error('Puter streaming failed:', error);
      setStreamError('Puter streaming failed. See console for details.');
    } finally {
      setStreaming(false);
      setLoading(false);
    }
  };

  const handleBackToLevels = () => {
    setCurrentStage('levels');
    setSelectedLevel(null);
    setCurrentExercise(null);
    setCritiqueResult(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>🎓 AI Skill Gym</h1>
          <p>Train your prompt IQ</p>
        </div>
        <div className="header-right">
          <button
            className={`nav-btn ${aiMode === 'puter' ? 'puter-btn' : ''}`}
            onClick={() => setAiMode((prev) => (prev === 'backend' ? 'puter' : 'backend'))}
          >
            {aiMode === 'puter' ? 'Puter Mode' : 'Backend Mode'}
          </button>
          {aiMode === 'puter' && (
            <div className="mode-label">Puter model: {puterModel}</div>
          )}
          <button
            className="nav-btn"
            onClick={() => setCurrentStage(currentStage === 'profile' ? 'levels' : 'profile')}
          >
            {currentStage === 'profile' ? '← Back' : '👤 ' + (user?.username || 'Profile')}
          </button>
          {user?.role === 'admin' && (
            <button
              className="nav-btn admin-btn"
              onClick={() => setCurrentStage(currentStage === 'admin' ? 'levels' : 'admin')}
            >
              {currentStage === 'admin' ? '← Back' : '🔧 Admin'}
            </button>
          )}
        </div>
      </header>

      <main className="app-main">
        {currentStage === 'profile' && (
          <Profile user={user} token={token} onLogout={handleLogout} />
        )}

        {currentStage === 'admin' && user?.role === 'admin' && (
          <AdminPanel
            token={token}
            user={user}
            onBack={() => setCurrentStage('levels')}
          />
        )}

        {currentStage !== 'profile' && currentStage !== 'admin' && (
          <>
            {currentStage === 'levels' && (
              <LevelSelector onSelectLevel={handleLevelSelect} loading={loading} />
            )}

            {currentStage === 'exercise' && currentExercise && (
              <ExerciseView
                exercise={currentExercise}
                onSubmit={handlePromptSubmit}
                onPuterSubmit={handlePuterSubmit}
                onPuterStream={handlePuterStream}
                onGenerateImage={handleGenerateImage}
                puterLoaded={puterLoaded}
                loading={loading}
                streaming={streaming}
                streamOutput={streamOutput}
                streamError={streamError}
                onBack={handleBackToLevels}
                aiMode={aiMode}
                puterModel={puterModel}
                setPuterModel={setPuterModel}
                puterImageModel={puterImageModel}
                setPuterImageModel={setPuterImageModel}
                imageContainerRef={imageContainerRef}
                imageError={imageError}
                onPuterCloudWrite={handlePuterCloudWrite}
                onPuterCloudRead={handlePuterCloudRead}
                cloudStatus={cloudStatus}
                cloudFileContent={cloudFileContent}
                cloudError={cloudError}
                onPuterKVSet={handlePuterKVSet}
                onPuterKVGet={handlePuterKVGet}
                kvStoredValue={kvStoredValue}
                kvStatus={kvStatus}
                kvError={kvError}
                onPuterPublishWebsite={handlePuterPublishWebsite}
                hostStatus={hostStatus}
                hostedUrl={hostedUrl}
                onPuterSignIn={handlePuterSignIn}
                onPuterFetch={handlePuterFetch}
                authStatus={authStatus}
                authError={authError}
                userInfo={userInfo}
                netStatus={netStatus}
                netResponse={netResponse}
                netError={netError}
                onPuterOCR={handlePuterOCR}
                onPuterTTS={handlePuterTTS}
                ocrStatus={ocrStatus}
                ocrText={ocrText}
                ocrError={ocrError}
                ttsStatus={ttsStatus}
                ttsAudioUrl={ttsAudioUrl}
                ttsError={ttsError}
              />
            )}

            {currentStage === 'critique' && critiqueResult && (
              <CritiqueDisplay
                critique={critiqueResult}
                onNewExercise={handleNewExercise}
                onBack={handleBackToExercise}
                loading={loading}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
