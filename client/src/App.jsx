import { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Footer from './components/Footer';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black">
      <Navbar
        isChatOpen={isChatOpen}
        onOpenChat={() => setIsChatOpen(true)}
        onCloseChat={() => setIsChatOpen(false)}
      />
      <main className="pt-20">
        <Home onOpenChat={() => setIsChatOpen(true)} />
      </main>
      <Footer />
    </div>
  );
}

export default App;