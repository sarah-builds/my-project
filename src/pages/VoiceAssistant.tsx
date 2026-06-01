import { useState } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  MessageCircle
} from 'lucide-react';

const exampleCommands = [
  { icon: 'pill', command: 'When is my medicine?', category: 'Medicine' },
  { icon: 'calendar', command: 'What is today\'s schedule?', category: 'Schedule' },
  { icon: 'phone', command: 'Call my daughter', category: 'Contact' },
  { icon: 'image', command: 'Show my memories', category: 'Memories' },
  { icon: 'heart', command: 'How am I feeling today?', category: 'Health' },
  { icon: 'clock', command: 'What time is it?', category: 'Time' }
];

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');

  function startListening() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser. Please try Chrome or Edge.');
      return;
    }

    setIsListening(true);
    setResponse('');

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      processCommand(text);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setResponse('Sorry, I couldn\'t hear that. Please try again.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }
 
  function processCommand(text: string) {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('medicine') || lowerText.includes('medication')) {
      respond('Your next medicine is Metformin at 8:00 AM. I\'ll remind you when it\'s time.');
    } else if (lowerText.includes('schedule') || lowerText.includes('today')) {
      respond('Today you have a morning walk at 9 AM, a doctor appointment at 2 PM, and dinner at 6 PM.');
    } else if (lowerText.includes('call') || lowerText.includes('daughter')) {
      respond('Calling Sarah, your daughter. One moment please.');
    } else if (lowerText.includes('memory') || lowerText.includes('remember')) {
      respond('I can show you your favorite memories. Would you like to see your family reunion photos from last summer?');
    } else if (lowerText.includes('time')) {
      const now = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      respond(`The current time is ${now}.`);
    } else if (lowerText.includes('feel') || lowerText.includes('health')) {
      respond('I\'m checking your health data. Your blood pressure looks good today. Remember to take your medicines on time.');
    } else {
      respond('I\'m here to help. You can ask me about your medicines, schedule, contacts, or memories.');
    }
  }

  function respond(text: string) {
    setResponse(text);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">Voice Assistant</h1>
        <p className="text-2xl text-gray-600">
          Tap the microphone and speak naturally
        </p>
      </div>

      {/* Microphone Button */}
      <button
        onClick={startListening}
        disabled={isListening}
        className={`relative w-64 h-64 rounded-full flex items-center justify-center transition-all duration-300 ${
          isListening
            ? 'bg-gradient-to-br from-red-500 to-rose-500 animate-pulse'
            : 'bg-gradient-to-br from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600'
        } shadow-2xl`}
      >
        {isListening ? (
          <MicOff size={80} className="text-white animate-pulse" />
        ) : (
          <Mic size={80} className="text-white" />
        )}
        {/* Animated rings when listening */}
        {isListening && (
          <>
            <div className="absolute inset-0 rounded-full border-4 border-white animate-ping opacity-20" />
            <div className="absolute inset-4 rounded-full border-4 border-white animate-ping opacity-20" style={{ animationDelay: '0.5s' }} />
          </>
        )}
      </button>

      <p className="text-2xl text-gray-600">
        {isListening ? 'Listening...' : 'Tap to speak'}
      </p>

      {/* Conversation */}
      {(transcript || response) && (
        <div className="w-full max-w-2xl space-y-4">
          {transcript && (
            <div className="bg-blue-50 rounded-2xl p-6 flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle size={24} className="text-white" />
              </div>
              <p className="text-2xl text-gray-800">"{transcript}"</p>
            </div>
          )}
          {response && (
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-6 flex items-start gap-4 border-2 border-teal-200">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Volume2 size={24} className="text-white" />
              </div>
              <p className="text-2xl text-gray-800">{response}</p>
            </div>
          )}
        </div>
      )}

      {/* Example Commands */}
      <div className="w-full max-w-4xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Try saying...
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exampleCommands.map((cmd, index) => (
            <button
              key={index}
              onClick={() => {
                setTranscript(cmd.command);
                processCommand(cmd.command);
              }}
              className="bg-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-all text-left border-2 border-transparent hover:border-teal-300"
            >
              <span className="inline-block px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-lg mb-2">
                {cmd.category}
              </span>
              <p className="text-xl text-gray-800 font-medium">"{cmd.command}"</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
