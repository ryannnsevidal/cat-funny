import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Sparkles, Download, RotateCcw } from 'lucide-react';

// Cat images mapped to expressions (using placeholder URLs - in production, use actual cat images)
const CAT_IMAGES = {
  happy: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&q=80',
  sad: 'https://images.unsplash.com/photo-1577023311546-cdc07a8454d9?w=800&q=80',
  surprised: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&q=80',
  angry: 'https://images.unsplash.com/photo-1506755855567-92ff770e8d00?w=800&q=80',
  neutral: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80',
  fearful: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=800&q=80',
  disgusted: 'https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=800&q=80'
};

export default function CatMemeApp() {
  const [userImage, setUserImage] = useState(null);
  const [expression, setExpression] = useState(null);
  const [catImage, setCatImage] = useState(null);
  const [memeText, setMemeText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState('upload'); // upload, detecting, generating, complete
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  // Simulated face detection (in production, use face-api.js)
  const detectExpression = async (imageData) => {
    setIsProcessing(true);
    setStep('detecting');
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Randomly select an expression for demo purposes
    const expressions = ['happy', 'sad', 'surprised', 'angry', 'neutral', 'fearful', 'disgusted'];
    const randomExpression = expressions[Math.floor(Math.random() * expressions.length)];
    
    setExpression(randomExpression);
    setCatImage(CAT_IMAGES[randomExpression]);
    setStep('generating');
    
    // Generate meme text using AI
    await generateMemeText(randomExpression);
  };

  const generateMemeText = async (detectedExpression) => {
    // Get API key from environment variable
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    
    // If no API key, use default captions
    if (!apiKey) {
      console.log('No API key found, using default caption');
      setMemeText(getDefaultCaption(detectedExpression));
      setStep('complete');
      setIsProcessing(false);
      return;
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Generate a hilarious, short Instagram-style cat meme caption (max 10 words) for a cat that looks ${detectedExpression}. Make it funny, relatable, and meme-worthy. Only respond with the caption text, nothing else.`
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const caption = data.content[0].text.trim();
      setMemeText(caption);
      setStep('complete');
    } catch (error) {
      console.error('Error generating meme text:', error);
      setMemeText(getDefaultCaption(detectedExpression));
      setStep('complete');
    }
    
    setIsProcessing(false);
  };

  const getDefaultCaption = (expr) => {
    const captions = {
      happy: "WHEN THE TREAT JAR OPENS",
      sad: "no one came to my birthday party",
      surprised: "DID YOU JUST OPEN A CAN??",
      angry: "YOU'RE 5 MINUTES LATE WITH DINNER",
      neutral: "i have seen things you wouldn't believe",
      fearful: "THE VACUUM IS OUT",
      disgusted: "you call this... food?"
    };
    return captions[expr] || "I'M A CAT AND I'M JUDGING YOU";
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUserImage(event.target.result);
        detectExpression(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please use file upload instead.');
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg');
    setUserImage(imageData);
    
    // Stop camera stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    detectExpression(imageData);
  };

  const downloadMeme = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 800;
    canvas.height = 900;
    
    // Create image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Draw cat image
      ctx.drawImage(img, 0, 0, 800, 800);
      
      // Add white text box at bottom
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillRect(0, 750, 800, 150);
      
      // Add meme text
      ctx.fillStyle = '#000';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Word wrap
      const words = memeText.split(' ');
      let line = '';
      let y = 825;
      
      words.forEach(word => {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > 750 && line) {
          ctx.fillText(line, 400, y);
          line = word + ' ';
          y += 40;
        } else {
          line = testLine;
        }
      });
      ctx.fillText(line, 400, y);
      
      // Download
      const link = document.createElement('a');
      link.download = `cat-meme-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    };
    img.src = catImage;
  };

  const reset = () => {
    setUserImage(null);
    setExpression(null);
    setCatImage(null);
    setMemeText('');
    setStep('upload');
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '"Comic Sans MS", cursive, sans-serif',
      padding: '20px'
    }}>
      {/* Hidden canvas for meme generation */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '40px',
        animation: 'slideDown 0.6s ease-out'
      }}>
        <h1 style={{
          fontSize: '4rem',
          fontWeight: '900',
          color: '#fff',
          textShadow: '4px 4px 0px rgba(0,0,0,0.2)',
          margin: '0',
          letterSpacing: '-2px'
        }}>
          😺 CATEMOJI
        </h1>
        <p style={{
          fontSize: '1.4rem',
          color: 'rgba(255,255,255,0.9)',
          margin: '10px 0',
          fontWeight: '600'
        }}>
          Your face + AI cat memes = Pure internet gold
        </p>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        {step === 'upload' && !stream && (
          <div style={{
            background: 'white',
            borderRadius: '30px',
            padding: '60px 40px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.5s ease-out'
          }}>
            <h2 style={{
              textAlign: 'center',
              fontSize: '2rem',
              color: '#333',
              marginBottom: '40px',
              fontWeight: '800'
            }}>
              Show us your best face! 📸
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px'
            }}>
              <button
                onClick={() => fileInputRef.current.click()}
                style={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '40px 20px',
                  color: 'white',
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 10px 30px rgba(245,87,108,0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '15px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(245,87,108,0.5)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(245,87,108,0.4)';
                }}
              >
                <Upload size={48} />
                <span>Upload Photo</span>
              </button>
              
              <button
                onClick={startCamera}
                style={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '40px 20px',
                  color: 'white',
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 10px 30px rgba(0,242,254,0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '15px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,242,254,0.5)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,242,254,0.4)';
                }}
              >
                <Camera size={48} />
                <span>Use Camera</span>
              </button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>
        )}

        {stream && (
          <div style={{
            background: 'white',
            borderRadius: '30px',
            padding: '40px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            textAlign: 'center'
          }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{
                width: '100%',
                maxWidth: '500px',
                borderRadius: '20px',
                marginBottom: '20px'
              }}
            />
            <button
              onClick={capturePhoto}
              style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                border: 'none',
                borderRadius: '15px',
                padding: '20px 50px',
                color: 'white',
                fontSize: '1.3rem',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(245,87,108,0.4)'
              }}
            >
              📸 Capture
            </button>
          </div>
        )}

        {(step === 'detecting' || step === 'generating') && (
          <div style={{
            background: 'white',
            borderRadius: '30px',
            padding: '60px 40px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            textAlign: 'center',
            animation: 'fadeIn 0.5s ease-out'
          }}>
            <div style={{
              animation: 'spin 2s linear infinite',
              display: 'inline-block',
              marginBottom: '20px'
            }}>
              <Sparkles size={64} color="#667eea" />
            </div>
            <h2 style={{
              fontSize: '2rem',
              color: '#333',
              fontWeight: '800'
            }}>
              {step === 'detecting' ? '🔍 Reading your vibes...' : '✨ Generating meme magic...'}
            </h2>
          </div>
        )}

        {step === 'complete' && (
          <div style={{
            background: 'white',
            borderRadius: '30px',
            padding: '40px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.5s ease-out'
          }}>
            <div style={{
              background: `linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)`,
              borderRadius: '20px',
              padding: '20px',
              marginBottom: '30px'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '30px',
                marginBottom: '20px'
              }}>
                <div>
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#666',
                    marginBottom: '10px',
                    fontWeight: '600'
                  }}>
                    YOUR EXPRESSION
                  </p>
                  <img
                    src={userImage}
                    alt="Your face"
                    style={{
                      width: '100%',
                      borderRadius: '15px',
                      boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
                    }}
                  />
                </div>
                
                <div>
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#666',
                    marginBottom: '10px',
                    fontWeight: '600'
                  }}>
                    YOUR CAT TWIN
                  </p>
                  <div style={{ position: 'relative' }}>
                    <img
                      src={catImage}
                      alt="Cat meme"
                      style={{
                        width: '100%',
                        borderRadius: '15px',
                        boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(255,255,255,0.95)',
                      borderRadius: '10px',
                      padding: '8px 15px',
                      fontWeight: '800',
                      fontSize: '0.9rem',
                      color: '#667eea',
                      boxShadow: '0 3px 10px rgba(0,0,0,0.2)'
                    }}>
                      {expression?.toUpperCase()} 😸
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: '20px',
              padding: '30px',
              marginBottom: '30px',
              boxShadow: '0 10px 30px rgba(245,87,108,0.3)'
            }}>
              <p style={{
                fontSize: '1.8rem',
                color: 'white',
                fontWeight: '900',
                textAlign: 'center',
                margin: '0',
                textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                lineHeight: '1.3'
              }}>
                {memeText}
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '15px'
            }}>
              <button
                onClick={downloadMeme}
                style={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  border: 'none',
                  borderRadius: '15px',
                  padding: '20px',
                  color: 'white',
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 10px 30px rgba(0,242,254,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Download size={24} />
                Download Meme
              </button>
              
              <button
                onClick={reset}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '15px',
                  padding: '20px',
                  color: 'white',
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 10px 30px rgba(102,126,234,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <RotateCcw size={24} />
                Make Another
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
